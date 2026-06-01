# Deploy

Ứng dụng là Next.js app tiêu chuẩn, có thể deploy lên Vercel, Docker hoặc hạ tầng Node.js tương thích.

## Biến môi trường bắt buộc

| Biến | Vai trò |
|------|---------|
| `DATABASE_URL` | Kết nối PostgreSQL |
| `AUTH_SECRET` | Secret cho Auth.js |
| `NEXT_PUBLIC_BASE_URL` | Base URL public |

## Biến môi trường thường dùng

- `APP_URL` / `NEXT_PUBLIC_APP_URL` cho email link.
- `SMTP_*` cho email verification.
- `AUTH_GOOGLE_*` / `AUTH_GITHUB_*` cho OAuth.
- `PRODUCT_REPOSITORY_MODE` để chọn static hoặc Prisma catalog.
- `REPO_METRICS_ENABLED` để bật metrics endpoint trong production.

## Checklist trước production

- Chạy `pnpm lint`.
- Chạy `pnpm typecheck`.
- Chạy `pnpm test`.
- Chạy `pnpm build`.
- Đảm bảo secret không nằm trong client bundle hoặc repository.
- Bảo vệ mọi API route nội bộ nếu bật ở production.
