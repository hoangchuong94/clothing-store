# SECURITY_REVIEW.md — Clothing Store

**Loại review:** Review bảo mật source hiện tại sau Auth Hardening
**Nguồn sự thật:** Source code hiện tại trong `src/` và `prisma/`
**Cập nhật:** 2026-06-02

---

## 1. Tóm tắt

Các hạng mục security hardening quan trọng đã được implement:

- Login validation bằng `LoginSchema.safeParse`.
- Shared credential verification qua `verifyCredentialsLogin()`.
- Auth.js Credentials `authorize()` dùng chung credential verification flow.
- Rate limiting cho login, register và resend verification.
- PostgreSQL atomic rate limiting qua `INSERT ... ON CONFLICT ... DO UPDATE ... RETURNING`.
- HMAC hashing cho email/IP rate-limit keys.
- Session revocation cho `BANNED` và `INACTIVE` users.
- Dashboard authorization cho `ADMIN` và `SUPER_ADMIN`.
- Forbidden page có i18n.
- Metrics API protection bằng session role.
- Product soft delete filtering.
- Cart ownership enforcement trong merge flow.

Kết luận hiện tại: không còn HIGH finding đã biết trong auth hardening scope. Các finding còn lại là MEDIUM/LOW và được liệt kê bên dưới.

---

## 2. Implemented Controls

| Control | Source |
|---------|--------|
| Login server-side validation | `src/features/auth/actions/login.ts` |
| Shared credential verification | `src/features/auth/server/credentials-login.ts` |
| Auth.js credentials bypass fix | `src/features/auth/server/auth-config.ts` |
| Login rate limiting | `LOGIN_IP`, `LOGIN_EMAIL` |
| Register rate limiting | `REGISTER_IP`, `REGISTER_EMAIL` |
| Resend verification rate limiting | `RESEND_VERIFICATION_IP`, `RESEND_VERIFICATION_EMAIL` |
| Atomic PostgreSQL rate limit reservation | `src/features/auth/lib/rate-limit/service.ts` |
| HMAC key hashing | `src/features/auth/lib/rate-limit/keys.ts` |
| Session revocation | `auth-config.ts` JWT/session callbacks |
| Metrics API protection | `src/app/api/internal/runtime/product-repository/route.ts` |
| Product soft delete filtering | `PrismaProductRepository` public reads |
| Cart ownership enforcement | `mergeCart({ guestCart })` + session user ID |

---

## 3. Remaining Findings

### SEC-01 — OAuth email verification semantics

- **Severity:** Medium
- **File Path:** `src/features/auth/server/auth-config.ts`
- **Mô tả:** OAuth callback hiện có thể set `emailVerified` cho OAuth user mà chưa đọc provider verified claim một cách rõ ràng.
- **Bằng chứng:** `signIn` callback kiểm tra `user.emailVerified` hoặc `user.isEmailVerified`; Google provider có `profile.email_verified`, GitHub provider default map không đưa verified claim vào `user`.
- **Khuyến nghị:** Quyết định policy: chỉ auto-verify khi provider claim verified được xác nhận, hoặc document rõ OAuth trust policy hiện tại.

### SEC-02 — Register email enumeration

- **Severity:** Medium
- **File Path:** `src/features/auth/actions/register.ts`
- **Mô tả:** Registration trả `EMAIL_ALREADY_EXISTS` khi email đã tồn tại, bao gồm cả P2002 unique conflict.
- **Bằng chứng:** `existingUser` branch và P2002 branch đều map về `AUTH_ERROR_CODES.EMAIL_ALREADY_EXISTS`.
- **Khuyến nghị:** Nếu ưu tiên anti-enumeration, chuyển sang generic success/next-step UX; nếu ưu tiên UX hiện tại, giữ và document risk.

### SEC-03 — Internal error disclosure

- **Severity:** Low
- **File Path:** `src/features/auth/actions/login.ts`, `src/features/auth/actions/register.ts`
- **Mô tả:** Một số unexpected errors được trả về với `error.message`.
- **Bằng chứng:** Login/register tạo `UNKNOWN_ERROR` kèm `error.message`; resend verification hiện trả generic unknown error.
- **Khuyến nghị:** Trả generic message cho client và chỉ log chi tiết server-side.

### SEC-04 — `LOGIN_IP` double reservation on browser login

- **Severity:** Low
- **File Path:** `src/features/auth/hooks/useLogin.ts`, `src/features/auth/hooks/useCredentialsAuth.ts`, `src/features/auth/server/credentials-login.ts`
- **Mô tả:** Browser login thành công chạy `loginWithCredentials` rồi `signIn('credentials')`; cả hai path dùng shared verification, nên `LOGIN_IP` được reserve hai lần.
- **Bằng chứng:** `useLogin` gọi `loginWithCredentials`, sau đó `authenticate`; `authenticate` gọi `signIn('credentials')`.
- **Khuyến nghị:** Chấp nhận như tradeoff bảo vệ direct Auth.js credentials request, hoặc thiết kế preflight token nếu cần giảm false positive IP throttling.

---

## 4. Closed Findings

| Finding cũ | Trạng thái |
|------------|------------|
| Metrics API thiếu auth | Closed |
| Auth.js credentials bypass rate limit | Closed |
| Existing session survives BANNED/INACTIVE | Closed |
| Chưa có login/register/resend rate limiting | Closed |
| Login action thiếu `LoginSchema.safeParse` | Closed |
| Merge cart schema nhận `userId` | Closed |
| Prisma product reads thiếu soft-delete filter | Closed |

---

## 5. Notes

- `/api/*` vẫn bypass proxy theo thiết kế; API route mới phải tự có auth/authorization.
- `ROLE_SCOPES` có trong session nhưng chưa là access-control layer rộng cho future admin mutations.
- Cart JSON validation khi đọc DB vẫn là maintainability/data-shape follow-up, không thuộc Auth Hardening completed scope.
