# Domain: Cart

Cart hiện là drawer trong header, chưa có page `/cart`.

## Kiến trúc hiện tại

- Cart UI là `CartDrawer` trong `src/features/cart/components/CartDrawer.tsx`.
- Guest cart lưu trong Redux và đồng bộ với `localStorage` qua `src/features/cart/hooks/useCartPersistence.ts`.
- Authenticated cart vẫn dùng Redux cho optimistic updates, nhưng dữ liệu bền vững được lưu trong `UserServerCart.items` dưới dạng JSON.
- Đồng bộ khi người dùng đăng nhập được xử lý bởi `src/features/cart/hooks/useCartAuthSync.ts`.

## Các file quan trọng

- `src/features/cart/components/CartDrawer.tsx`
- `src/features/cart/components/CartItem.tsx`
- `src/features/cart/components/CartSummary.tsx`
- `src/features/cart/components/EmptyCart.tsx`
- `src/features/cart/components/CartError.tsx`
- `src/features/cart/components/AddToCartButton.tsx`
- `src/features/cart/hooks/useCart.ts`
- `src/features/cart/hooks/useAddToCart.ts`
- `src/features/cart/hooks/useUpdateCartItem.ts`
- `src/features/cart/hooks/useRemoveCartItem.ts`
- `src/features/cart/hooks/useCartDrawer.ts`
- `src/features/cart/hooks/useCartPersistence.ts`
- `src/features/cart/hooks/useCartAuthSync.ts`
- `src/features/cart/lib/redux/cartSlice.ts`
- `src/features/cart/lib/redux/store.ts`
- `src/features/cart/server/actions.ts`
- `src/features/cart/server/utils.ts`
- `src/features/cart/server/schemas.ts`
- `src/features/cart/server/db.ts`
- `src/features/cart/lib/client-utils.ts`
- `src/features/cart/types.ts`

## Hành vi guest cart

- `useCartPersistence` đọc/ghi `localStorage` với khoá `clothing-store-cart`.
- Guest cart được quản lý hoàn toàn trên client, bao gồm thêm, cập nhật và xoá item.
- Các server action như `addToCart` và `updateCartItem` vẫn được gọi để validate dữ liệu, nhưng nếu người dùng chưa xác thực thì thay đổi không được lưu vào DB.

## Hành vi authenticated cart

- Khi đã đăng nhập, `addToCart`, `updateCartItem`, `removeCartItem`, `clearCart`, `mergeCart`, `getUserServerCart` đều dùng `getCurrentUserSession()` để xác định `userId`.
- Cart của user được lưu vào `UserServerCart` qua `saveUserCart(session.userId, cart)`.
- Item được tạo bằng dữ liệu server-derived (product name, price, image, stock) để tránh tin dữ liệu client gửi lên.

## Login sync và merge

- `useCartAuthSync` kích hoạt khi session NextAuth chuyển sang `authenticated`.
- Nếu có guest cart trong Redux hoặc localStorage và đây là lần chuyển từ `unauthenticated` sang `authenticated`, nó gọi:

```ts
mergeCart({ guestCart });
```

- Server tự lấy user ID từ session hiện tại.
- Payload merge không còn nhận hoặc yêu cầu `userId` từ client.
- Nếu không cần merge, nó gọi `getUserServerCart()` để hydrate cart hiện tại.
- Đồng bộ có lock/tab check bằng `sessionStorage` để tránh chạy quá nhiều lần.

## Review thực tế

### Những điểm tốt

- Cấu trúc rõ ràng: client Redux giữ UI state, server action xác thực dữ liệu, và server cart bền lưu theo user.
- Có optimistic update cho add/update/remove, với rollback khi server trả lỗi.
- Merge cart khi đăng nhập có vẻ được xử lý đúng hướng và tái hiện lại giá trị server-derived.
- Không tin dữ liệu client cho price/name/image/stock trong server action.
- Không tin `userId` từ client trong merge flow; ownership lấy từ authenticated session.

### Những điểm cần chú ý

- `useCartAuthSync` sử dụng cả `useDispatch` và `store.getState()` trực tiếp. Đây không sai, nhưng cần đảm bảo không gây race khi nhiều component mount cùng lúc.
- `updateCartItem` với guest user trả về object `data` mà chỉ chứa `id` và `quantity`; các trường khác là default rỗng. Điều này ổn nếu client chỉ cần ID/quantity, nhưng dễ gây nhầm khi dùng response sai chỗ.
- `CartDrawer` tự tính toán totals thay vì dùng selector `selectCartTotals` đã khai báo trong `cartSlice`. Nên sử dụng lại calculation helper để tránh lệch logic.
- `AddToCartButton` dùng `setTimeout` để reset trạng thái `showSuccess`. Nếu component unmount nhanh, có thể gây memory leak nhỏ. Dùng `useEffect` cleanup sẽ an toàn hơn.
- Không có dedicated `/cart` page, nên UX hiện tại chỉ phù hợp với thiết kế drawer.
- `CartSummary` hardcode thuế 8%; nếu cần thay đổi sẽ phải sửa ở nhiều nơi hoặc trừ khi chia thành constant chung.

### Gợi ý cải tiến

- Tạo helper `calculateCartSummary` ở `src/features/cart/lib/client-utils.ts` và dùng lại trong `CartDrawer`/`CartSummary`.
- Làm rõ ràng contract response của các server action cho guest user; ví dụ `updateCartItem` có thể trả `success: true` nhưng không chứa đủ dữ liệu để render nếu client phụ thuộc vào các trường khác.
- Nếu muốn mở rộng `/cart` page sau này, nên tách `CartDrawer` UI logic ra component `CartList`/`CartActions` để reuse.
- Xem xét xoá `localStorage` sau khi merge cart thành công, nếu không muốn dùng guest cart cũ trong tab khác sau login.

## Kết luận

Cart hiện đã có bộ cơ bản hoạt động tốt: drawer UI, optimistic Redux state, server validation, và đồng bộ guest→authenticated. Những phần cần attention là tính nhất quán response của server action, tái sử dụng helper tính totals, và precautions với `useCartAuthSync`/`setTimeout` cleanup.
