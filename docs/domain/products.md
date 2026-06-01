# Domain: Products

Domain products quản lý catalog, filter, featured products và repository abstraction.

## Product identity

Trong app layer, `Product.id` là slug dạng `prod-001`, không phải Prisma cuid. Cart cũng dùng slug này làm `productId`.

## Nguồn dữ liệu

| Mode | Mô tả |
|------|------|
| `STATIC` | Dùng catalog tĩnh trong `product-source.ts` |
| `PRISMA` | Đọc dữ liệu từ PostgreSQL qua Prisma |
| `AUTO` | Thử Prisma khi khởi tạo repository; fallback static nếu init lỗi |

## Entry points nên dùng

- `src/features/products/server/data.ts`
- `src/features/products/server/products.ts`

Không construct repository trực tiếp trong UI hoặc page nếu không cần thiết.

## Lưu ý hiện tại

- Filter đang chạy sau khi đã đọc full list.
- `PrismaProductRepository.list()` chưa filter `Product.deletedAt`.
- Featured/new arrivals dùng danh sách ID trong `src/features/products/data/ui.ts`.
