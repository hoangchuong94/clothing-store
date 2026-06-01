# Tổng quan hệ thống

Ứng dụng là một monolith Next.js full-stack cho cửa hàng thời trang. Phần giao diện, Server Components, Server Actions và một số API route cùng nằm trong cùng repository.

## Thành phần chính

| Thành phần | Vai trò |
|------------|---------|
| `src/app` | App Router, layout, page và API routes |
| `src/features` | Module theo domain: auth, products, cart, home |
| `src/lib` | Hạ tầng dùng chung: Prisma, email, provider client, metrics |
| `src/i18n` | Routing và navigation có locale |
| `messages` | Bản dịch `vi` và `en` |
| `prisma` | Schema, migration và seed dữ liệu |

## Luồng request chính

1. Browser gọi route có prefix locale, ví dụ `/vi/products`.
2. `src/proxy.ts` xử lý next-intl và redirect auth ở edge.
3. Layout theo locale mount provider cần thiết.
4. Page Server Component đọc dữ liệu qua feature server layer.
5. Client component chỉ xử lý tương tác như filter, cart drawer, form auth.

## Nguyên tắc kiến trúc

- Ưu tiên Server Components.
- Mutation đi qua Server Actions và validate bằng Zod.
- Không import Prisma vào component UI.
- Product catalog đi qua repository layer.
- Route public-facing luôn có prefix locale.
