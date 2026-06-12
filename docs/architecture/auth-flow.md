# Luồng xác thực

Ứng dụng dùng Auth.js / NextAuth v5 với JWT session và PrismaAdapter cho OAuth/account linking.

## Đăng ký bằng email/password

1. Client submit form đăng ký.
2. Server Action `registerUser` validate bằng `RegisterSchema.safeParse`.
3. Reserve `REGISTER_IP`.
4. Reserve `REGISTER_EMAIL`.
5. Server kiểm tra email đã tồn tại.
6. Server hash password bằng bcrypt.
7. Server tạo user và phát hành email verification token dạng hash.
8. Email trỏ tới `/[locale]/verify-email/confirm?token=...`.

Registration attempts không reset rate-limit buckets sau success vì mục tiêu là chống mass registration.

## Xác minh email

Trang confirm không verify ngay khi GET. Người dùng phải thực hiện hành động xác nhận trên client, sau đó gọi server action để consume token.

## Đăng nhập credentials

Credentials verification dùng shared helper `verifyCredentialsLogin()` và được gọi bởi cả:

- `loginWithCredentials` server action.
- Auth.js Credentials provider `authorize()`.

Flow:

```text
Validate
→ LOGIN_IP reserve
→ LOGIN_EMAIL reserve
→ Prisma lookup
→ bcrypt compare
→ success reset LOGIN_EMAIL
```

Chi tiết:

- `LOGIN_IP` không reset khi login thành công.
- `LOGIN_EMAIL` reset khi login thành công.
- Nếu password đúng nhưng email chưa verified, behavior UX hiện tại được giữ và `LOGIN_EMAIL` được compensate/reset.
- Rate-limit exceeded trả generic `RATE_LIMIT_EXCEEDED`.
- Direct `POST /api/auth/[...nextauth]` qua credentials không bypass rate limit.

Browser login vẫn là two-step UX:

1. Client gọi `loginWithCredentials`.
2. Nếu success, client gọi `signIn('credentials', { redirect: false })` để thiết lập JWT session.

Do cả hai path đều dùng shared verification, successful browser login hiện reserve `LOGIN_IP` hai lần; đây là open LOW finding đã document.

## Resend verification

Flow:

```text
Validate
→ RESEND_VERIFICATION_IP reserve
→ RESEND_VERIFICATION_EMAIL reserve
→ cooldown
→ send email
```

Rate-limit chính dùng `AuthRateLimitBucket`. Cooldown 2 phút vẫn dùng `User.verificationResendAt`.

## OAuth

Google/GitHub chỉ được bật khi biến môi trường tương ứng tồn tại. Hành vi hiện tại có thể tự set `emailVerified` cho OAuth user theo policy trong `auth-config.ts`.

Open finding: OAuth callback hiện chưa kiểm tra rõ provider verified claim (`profile.email_verified` với Google hoặc verified email từ GitHub) trước khi set app `emailVerified`.

## Session lifecycle

Auth dùng JWT session. Full server `auth()` chạy JWT callback có database re-check:

1. Nếu token có `id`, query `User.status`, `emailVerified`, `role`.
2. Nếu user không tồn tại, không có role, hoặc `status !== ACTIVE`, token bị invalidated.
3. Session callback không populate `session.user` cho token inactive.

Kết quả: existing session của `BANNED` hoặc `INACTIVE` user không truy cập được protected/admin server paths.

## Authorization

- `src/proxy.ts` xử lý redirect cho route protected.
- `/dashboard` được guard trong `(admin)/layout.tsx`; chỉ `ADMIN` và `SUPER_ADMIN` được vào.
- Guest vào dashboard bị redirect sign-in; user thường bị redirect `/forbidden`.
- `/forbidden` page tồn tại trong auth route group và hỗ trợ i18n.
- API route dưới `/api/*` không được proxy bảo vệ, nên từng handler phải tự kiểm tra quyền.
- Metrics API `/api/internal/runtime/product-repository` yêu cầu session `ADMIN` hoặc `SUPER_ADMIN`.
