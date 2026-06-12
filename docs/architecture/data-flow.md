# Luồng dữ liệu

Tài liệu này tóm tắt các luồng dữ liệu chính của ứng dụng.

## Đọc catalog sản phẩm

1. Page gọi `getProducts`, `getFeaturedProducts` hoặc `getNewArrivalsProducts`.
2. Server layer trong `src/features/products/server` gọi repository.
3. Repository chọn nguồn dữ liệu theo `PRODUCT_REPOSITORY_MODE`: `STATIC`, `PRISMA` hoặc `AUTO`.
4. App layer dùng slug dạng `prod-001` làm `Product.id`.

## Thêm sản phẩm vào cart

1. Client dispatch optimistic Redux update.
2. Server Action `addToCart` validate input bằng Zod.
3. Server đọc lại product/stock từ product server layer, không tin price/name từ client.
4. Guest cart lưu ở localStorage; authenticated cart lưu vào `UserServerCart`.

## Đồng bộ cart khi đăng nhập

1. `CartAuthSync` phát hiện chuyển trạng thái từ guest sang authenticated.
2. Hook `useCartAuthSync` gọi server action merge hoặc đọc cart server.
3. Server dùng user ID từ session hiện tại, không tin `userId` client gửi.

## Xác thực

1. Credentials flow validate bằng `LoginSchema.safeParse`.
2. Shared `verifyCredentialsLogin()` reserve `LOGIN_IP`, reserve `LOGIN_EMAIL`, rồi mới query user và chạy `bcrypt.compare`.
3. Login success reset `LOGIN_EMAIL`; `LOGIN_IP` không reset.
4. Browser client gọi Auth.js `signIn('credentials')` để tạo JWT session.
5. Auth.js Credentials `authorize()` cũng dùng `verifyCredentialsLogin()`, nên direct credentials POST không bypass rate limit.
6. Full server `auth()` re-check database `User.status` trong JWT callback; `BANNED`/`INACTIVE` sessions bị invalidated.
7. Edge proxy dùng cấu hình edge-safe để redirect các route cần login hoặc cần verified email; server guards/actions vẫn là enforcement cuối cùng cho trạng thái user.

## Rate limiting auth

Auth rate limit lưu trong `AuthRateLimitBucket`:

- Key email/IP được HMAC hash thành `keyHash`.
- Atomic reservation dùng PostgreSQL `INSERT ... ON CONFLICT ("action", "keyHash") DO UPDATE ... RETURNING`.
- Login dùng `LOGIN_IP` và `LOGIN_EMAIL`.
- Register dùng `REGISTER_IP` và `REGISTER_EMAIL`.
- Resend verification dùng `RESEND_VERIFICATION_IP` và `RESEND_VERIFICATION_EMAIL`.
