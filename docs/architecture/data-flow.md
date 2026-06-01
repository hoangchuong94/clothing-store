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

1. Credentials flow validate ở server action rồi gọi Auth.js `signIn`.
2. Auth.js tạo JWT session.
3. Edge proxy dùng cấu hình edge-safe để redirect các route cần login hoặc cần verified email.
