# FULL_COVERAGE_AUDIT.md

**Ngày:** 2026-06-01  
**Mục đích:** Ghi lại mức độ source đã được đọc trực tiếp khi tạo các review kiến trúc, bảo mật, hiệu năng và refactor plan.

---

## 1. Phương pháp

| Quy ước | Ý nghĩa |
|---------|--------|
| Đọc trực tiếp | File được mở đầy đủ hoặc mở đoạn đáng kể |
| Không đọc trực tiếp | Chỉ thấy qua grep/glob hoặc suy luận từ tài liệu khác |
| Phạm vi | `src/`, `prisma/`, `public/**/*.tsx`, `vitest.config.ts` |
| Loại trừ | `node_modules`, `.next`, `src/generated/**` |

Audit này không tạo finding mới và không sửa application code.

---

## 2. Tóm tắt coverage

| Metric | Giá trị gần đúng |
|--------|-----------------|
| Tổng file trong phạm vi | 190 |
| File đã đọc trực tiếp | khoảng 118 |
| File chưa đọc trực tiếp | khoảng 72 |
| Coverage | khoảng 62% |

Con số này là audit theo quá trình đọc source, không phải test coverage.

---

## 3. Nhóm file đã đọc trực tiếp

Các nhóm đã đọc đại diện:

- App/proxy: `src/proxy.ts`, root layout, locale layout, home/products pages, auth pages, admin layout, internal metrics route.
- Auth: `auth-config.ts`, `auth-edge*`, `session.ts`, auth actions, schemas, verification service/token/rate-limit.
- Cart: server actions, DB helpers, schemas, hooks, Redux slice.
- Products: server data/products, repository implementations, static source, product components.
- i18n/lib: routing, navigation, request config, Prisma singleton, email config/send, metrics.
- Prisma: schema một phần và seed-related files.

---

## 4. Nhóm rủi ro cao đã được đọc

| File/khu vực | Trạng thái |
|--------------|------------|
| Product repository factory và implementations | Đã đọc |
| Auth route/access config | Đã đọc |
| `src/proxy.ts` | Đã đọc |
| Internal metrics route | Đã đọc |
| Cart server actions/db/schemas | Đã đọc |
| Auth config/callback/session | Đã đọc |
| Provider tree | Đã đọc |
| Prisma client singleton | Đã đọc |

---

## 5. Nhóm đọc một phần hoặc chưa đọc hết

Các file sau có thể còn ảnh hưởng đến một số kết luận nếu được đọc sâu hơn:

- Email templates và nodemailer provider.
- Một số cart UI components.
- Một số product filter components.
- Một số home marketing components.
- Một số auth pages ngoài confirm flow.
- Header subcomponents.
- `src/components/ui/**`.
- Toàn bộ Prisma schema dài hơn phần đã đọc.
- Test files chưa được đọc line-by-line toàn bộ.

---

## 6. Các finding đã xác nhận mạnh

Các finding sau có bằng chứng trực tiếp tương đối mạnh:

- `/api/*` bypass proxy auth.
- Metrics API nội bộ chưa có auth check thực sự.
- `/cart` nằm trong protected routes nhưng không có page.
- Product ID app layer là slug.
- `AUTO` repository fallback chỉ ở init.
- Guest cart không lưu server-side.
- Auth verification token được hash và consume single-use.
- Product filtering hiện chạy sau full-list read.
- Một số docs/scripts từng bị lệch source.

---

## 7. Các finding cần giữ sắc thái

Một số finding là static-analysis risk, chưa phải lỗi production đã đo:

- Client boundary rộng ảnh hưởng bundle.
- `framer-motion` ảnh hưởng performance.
- Duplicate catalog reads ảnh hưởng khi catalog lớn.
- Prisma over-fetch cần benchmark khi DB-backed catalog tăng.
- Provider global tăng baseline JS.

---

## 8. Kết luận

Các review trước có coverage đủ tốt cho kiến trúc và hardening P0/P1, nhưng chưa phải audit source 100%. Khi sửa các khu vực chưa đọc sâu, reviewer nên đọc lại file cụ thể trước khi kết luận.
