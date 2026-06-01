# SECURITY_REVIEW.md — Clothing Store

**Loại review:** Review bảo mật toàn codebase  
**Phương pháp:** Phân tích tĩnh source, Prisma schema, env example và docs. Không penetration test.

---

## 1. Tóm tắt

Baseline bảo mật của project khá tốt cho MVP:

- Password hash bằng bcrypt.
- Email verification token được hash.
- Token verification single-use và có expiry.
- Credentials login yêu cầu verified email.
- Server actions cart re-derive product price/name/stock.
- JWT session và edge proxy đã có.

Các gap chính:

- Chưa có rate limit login/register.
- API nội bộ metrics chưa có auth thật.
- Proxy skip toàn bộ `/api/*`.
- OAuth auto-verification khác policy credentials.
- JSON cart từ DB nên được validate khi đọc.
- JWT scopes chưa được enforce rộng rãi.

Kết luận: có thể chấp nhận cho MVP nội bộ, nhưng trước production public nên xử lý tối thiểu metrics API, `/api/*` auth review và rate limit auth.

---

## 2. Điểm đã làm tốt

| Kiểm soát | Ghi chú |
|-----------|--------|
| Password hashing | `bcrypt.hash(password, 12)` |
| Credentials reject unverified email | `auth-config.ts` |
| OAuth provider conditional | Chỉ bật khi có env vars |
| Verification token random + hash | `verification/token.ts` |
| Constant-time hash compare | `timingSafeEqual` |
| Single-use verification token | Consume qua DB condition |
| Resend anti-enumeration | Không reveal user missing |
| Resend rate limit | `verification/rate-limit.ts` |
| Cart server-authoritative | Product data lấy lại từ server |

---

## 3. Các finding

### SEC-01 — Metrics API nội bộ thiếu auth

- **Severity:** High
- **File Path:** `src/app/api/internal/runtime/product-repository/route.ts`
- **Mô tả:** Endpoint có thể trả metrics/health nếu metrics enabled, chưa kiểm tra session hoặc secret.
- **Khuyến nghị:** Thêm secret header hoặc session/role check; mặc định tắt production nếu chưa bảo vệ.

### SEC-02 — `/api/*` bypass proxy auth

- **Severity:** High
- **File Path:** `src/proxy.ts`
- **Mô tả:** Proxy skip API path, nên API mới không được bảo vệ tự động.
- **Khuyến nghị:** Mỗi API route phải có auth/authorization riêng.

### SEC-03 — Scopes trong JWT chưa được enforce rộng

- **Severity:** High
- **File Path:** `src/features/auth/config/roles.ts`, server actions tương lai
- **Mô tả:** Scope được populate nhưng chưa là access-control layer thực tế.
- **Khuyến nghị:** Khi thêm admin/server mutation, enforce scope/role ở server.

### SEC-04 — OAuth auto-verifies email

- **Severity:** Medium
- **File Path:** `src/features/auth/server/auth-config.ts`
- **Mô tả:** OAuth policy có thể set `emailVerified` khác với credentials flow.
- **Khuyến nghị:** Document policy rõ hoặc chỉ auto-verify khi provider xác nhận email verified.

### SEC-05 — Chưa có rate limit login/register

- **Severity:** Medium
- **File Path:** `src/features/auth/actions/login.ts`, `register.ts`
- **Mô tả:** Brute force và registration flooding chưa được throttle ở app layer.
- **Khuyến nghị:** Thêm rate limit theo IP + email.

### SEC-06 — Login action nên dùng Zod server-side

- **Severity:** Low
- **File Path:** `src/features/auth/actions/login.ts`
- **Mô tả:** Action nên dùng `LoginSchema.safeParse` thay vì manual truthiness check.
- **Khuyến nghị:** Validate cùng pattern với register.

### SEC-07 — Auth logs có thể chứa email

- **Severity:** Low
- **File Path:** `src/features/auth/lib/auth-logger.ts`
- **Mô tả:** Log context có thể chứa email.
- **Khuyến nghị:** Redact email hoặc giới hạn info logs ở development.

### SEC-08 — Verification token nằm trong query string

- **Severity:** Low
- **File Path:** `src/lib/email/send.ts`
- **Mô tả:** Token trong URL có thể nằm trong history/log/referrer.
- **Khuyến nghị:** Chấp nhận nếu TTL ngắn và HTTPS; tránh log URL đầy đủ.

### SEC-09 — Session callback nên fail closed

- **Severity:** Low
- **File Path:** `src/features/auth/server/auth-config.ts`
- **Mô tả:** Khi DB refresh lỗi, cần đảm bảo không cấp quyền rộng hơn.
- **Khuyến nghị:** Giữ policy fail-closed cho role/scope nhạy cảm.

### SEC-10 — Dual login path tăng surface

- **Severity:** Low
- **File Path:** `src/features/auth/hooks/useLogin.ts`
- **Mô tả:** Flow login chạy server action rồi Auth.js signIn.
- **Khuyến nghị:** Giữ behavior đồng bộ giữa hai bước và test regression.

### SEC-11 — Guest cart update server response hạn chế

- **Severity:** Low
- **File Path:** `src/features/cart/server/actions.ts`
- **Mô tả:** Một số path guest không persist server-side nên response phải rõ ràng.
- **Khuyến nghị:** Document behavior và giữ client rollback đúng.

### SEC-12 — Merge cart schema còn nhận `userId`

- **Severity:** Medium
- **File Path:** `src/features/cart/server/schemas.ts`
- **Mô tả:** Server vẫn phải dùng session user ID thay vì tin `userId` từ payload.
- **Khuyến nghị:** Bỏ field hoặc assert session-derived ID.

### SEC-13 — Cart actions chưa có rate limit

- **Severity:** Medium
- **File Path:** `src/features/cart/server/actions.ts`
- **Mô tả:** Add/merge cart có thể bị abuse.
- **Khuyến nghị:** Thêm rate limit khi mở public traffic lớn.

### SEC-14 — `UserServerCart.items` JSON nên validate khi đọc

- **Severity:** Medium
- **File Path:** `src/features/cart/server/db.ts`
- **Mô tả:** JSON từ DB nên parse bằng schema trước khi dùng.
- **Khuyến nghị:** Dùng Zod để normalize/fallback an toàn.

### SEC-15 — Prisma product list chưa filter soft delete

- **Severity:** Medium
- **File Path:** `prisma-product-repository.ts`
- **Mô tả:** `Product.deletedAt` tồn tại nhưng list path chưa filter.
- **Khuyến nghị:** Thêm `deletedAt: null` nếu không đọc archived products.

---

## 4. Ưu tiên bảo mật

1. Bảo vệ metrics API.
2. Rà soát toàn bộ `/api/*`.
3. Thêm rate limit login/register.
4. Validate cart JSON khi đọc DB.
5. Chuẩn hóa OAuth verification policy.
6. Enforce role/scope cho mutation admin tương lai.
