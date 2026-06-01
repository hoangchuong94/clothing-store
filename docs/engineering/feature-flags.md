# Feature flags và mode runtime

Project chưa có hệ thống feature flag tổng quát. Một số hành vi được điều khiển bằng biến môi trường.

## Product repository mode

`PRODUCT_REPOSITORY_MODE` hỗ trợ:

| Giá trị | Hành vi |
|---------|---------|
| `STATIC` | Dùng catalog tĩnh |
| `PRISMA` | Dùng Prisma, lỗi thì fail fast |
| `AUTO` | Thử Prisma lúc khởi tạo; fallback static nếu init lỗi |
| unset | Dev dùng `STATIC`; production server dùng `AUTO` |

## Repository metrics

`REPO_METRICS_ENABLED=true` bật endpoint metrics trong production. Ở non-production, metrics được bật mặc định.

## OAuth providers

Google/GitHub chỉ được register khi đủ biến môi trường `AUTH_GOOGLE_*` hoặc `AUTH_GITHUB_*`.

## Lưu ý

- Không coi route constant là feature đã đã implement.
- Không bật endpoint nội bộ ra production nếu chưa có auth hoặc secret header.
