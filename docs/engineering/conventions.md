# Quy ước kỹ thuật

## Routing

- Route người dùng nằm dưới `/[locale]/`.
- Locale hợp lệ hiện là `vi` và `en`.
- Ưu tiên navigation từ `@/i18n/navigation`.

## Component boundary

- Ưu tiên Server Components.
- Chỉ dùng `'use client'` khi cần hook, browser API, Redux, NextAuth client session, Radix interaction hoặc animation.
- Không import `@/lib/server/*` vào Client Component.

## Server Actions

- Nhận input dạng `unknown` khi gọi từ client.
- Validate bằng Zod trước khi đọc field.
- User-scoped mutation phải lấy user ID từ session.
- Return response có cấu trúc `{ success, data?, error? }`.

## Products

- App-level product ID là slug.
- Catalog read đi qua product server layer.
- Không dùng Prisma trực tiếp trong UI.

## Tài liệu

- Tài liệu phải mô tả trạng thái thật trong source.
- Nếu feature mới chỉ có schema hoặc constant, ghi rõ là chưa đã implement.
