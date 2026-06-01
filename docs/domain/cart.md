# Domain: Cart

Cart hiện là drawer trong header, chưa có page `/cart`.

## Guest cart

- Lưu trong Redux.
- Đồng bộ localStorage qua `useCartPersistence`.
- Server action vẫn validate stock/product nhưng không lưu guest cart vào DB.

## Authenticated cart

- UI vẫn dùng Redux để optimistic update.
- Durable store là `UserServerCart.items` dạng JSON.
- Server action lưu cart theo user ID lấy từ session.

## Login sync

Khi người dùng đăng nhập, `CartAuthSync` merge guest cart vào cart server hoặc hydrate cart đã có từ server.

## Nguyên tắc bảo mật

- Không tin price, name, image, stock từ client.
- Không tin `userId` client gửi cho mutation user-scoped.
- Product data phải được re-derive từ server product layer.
