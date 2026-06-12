# Clothing Store

Ứng dụng thương mại điện tử thời trang xây bằng Next.js, có đa ngôn ngữ, xác thực người dùng và giao diện responsive.

## Bắt đầu

### Yêu cầu

- Node.js 20
- pnpm

### Cài đặt

1. Clone repository.
2. Cài dependencies:

   ```bash
   pnpm install
   ```

3. Sinh Prisma client:

   ```bash
   pnpm generate
   ```

4. Sao chép biến môi trường:

   ```bash
   cp .env.example .env.local
   ```

   Điền các giá trị cần thiết. Tối thiểu cần `DATABASE_URL`, `AUTH_SECRET` và `NEXT_PUBLIC_BASE_URL`.

5. Chạy development server:

   ```bash
   pnpm dev
   ```

Mở [http://localhost:3000](http://localhost:3000) trong trình duyệt để xem ứng dụng.

## Scripts

- `pnpm dev` - Chạy development server.
- `pnpm build` - Build production.
- `pnpm start` - Chạy bản production.
- `pnpm lint` - Chạy ESLint.
- `pnpm test` - Chạy unit test.
- `pnpm generate` - Generate Prisma client.
- `pnpm format` - Kiểm tra định dạng bằng Prettier.

Lưu ý: `package.json` hiện có các script `audit:products` và `smoke:products*`, nhưng các file trong `scripts/` mà chúng trỏ tới chưa tồn tại trong repo.

## Database và Prisma

- Sao chép biến môi trường từ `.env.example` sang `.env.local`.
- Chạy `pnpm generate` sau khi đổi Prisma schema hoặc sau khi clone mới.
- Chạy migration local:

  ```bash
  pnpm prisma migrate dev
  ```

- Seed roles, seed user, categories và **13 sản phẩm canonical** (`prod-001` … `prod-013`):

  ```bash
  pnpm prisma db seed
  ```

## Build

Build ứng dụng cho production:

```bash
pnpm build
```

## Deploy

### Vercel

1. Kết nối repository với Vercel.
2. Cấu hình biến môi trường trong dashboard của Vercel.
3. Deploy.

### Docker

Build và chạy bằng Docker:

```bash
docker build -t clothing-store .
docker run -p 3000:3000 clothing-store
```

### Nền tảng khác

Đây là ứng dụng Next.js tiêu chuẩn, có thể deploy lên Netlify, Railway hoặc hạ tầng Node.js tương thích.

## Tính năng

- Đa ngôn ngữ Anh/Việt.
- Form xác thực người dùng, email verification và Auth.js session.
- Auth rate limiting cho login/register/resend verification.
- Session revocation cho user `BANNED` hoặc `INACTIVE`.
- Giao diện responsive với Tailwind CSS.
- Chuyển đổi dark/light mode.
- Animation bằng Framer Motion.
- Catalog sản phẩm và cart drawer.
- Metrics API nội bộ được bảo vệ bằng session role `ADMIN` hoặc `SUPER_ADMIN`.

## Công nghệ

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- Framer Motion
- next-intl
- Radix UI
- Zod
- Prisma
