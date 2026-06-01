# Luồng xác thực

Ứng dụng dùng Auth.js / NextAuth v5 với JWT session và PrismaAdapter cho OAuth/account linking.

## Đăng ký bằng email/password

1. Client submit form đăng ký.
2. Server Action `registerUser` validate bằng Zod.
3. Server hash password bằng bcrypt.
4. Server tạo user và phát hành email verification token dạng hash.
5. Email trỏ tới `/[locale]/verify-email/confirm?token=...`.

## Xác minh email

Trang confirm không verify ngay khi GET. Người dùng phải thực hiện hành động xác nhận trên client, sau đó gọi server action để consume token.

## Đăng nhập credentials

1. Client gọi `loginWithCredentials`.
2. Server kiểm tra email/password và trạng thái verified.
3. Client gọi `signIn('credentials', { redirect: false })` để thiết lập session.

## OAuth

Google/GitHub chỉ được bật khi biến môi trường tương ứng tồn tại. Hành vi hiện tại có thể tự set `emailVerified` cho OAuth user theo policy trong `auth-config.ts`.

## Authorization

- `src/proxy.ts` xử lý redirect cho route protected.
- `/dashboard` được guard trong `(admin)/layout.tsx`.
- API route dưới `/api/*` không được proxy bảo vệ, nên từng handler phải tự kiểm tra quyền.
