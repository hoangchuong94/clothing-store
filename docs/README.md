# Tổng hợp tài liệu và đối chiếu source

Tài liệu này tổng hợp các file Markdown trong repository và đối chiếu với source hiện tại của project **clothing-store**.

---

## 1. Tài liệu gốc ở root

| File | Vai trò | Đối chiếu source |
|------|---------|------------------|
| `README.md` | Hướng dẫn cài đặt, lệnh chạy, build/deploy | Khớp `package.json` ở các lệnh chính; đã ghi chú `audit:products` và `smoke:products*` đang trỏ tới file chưa tồn tại |
| `AGENTS.md` | Hướng dẫn tổng quan cho AI/coder | Khớp route, provider tree, proxy, product repository, cart và các gap hiện tại |
| `AI_RULES.md` | Quy tắc kỹ thuật khi sửa code | Khớp kiến trúc server-first, Server Actions, Prisma boundary, i18n và auth/cart security |
| `PROJECT_CONTEXT.md` | Bối cảnh dự án dựa trên source | Khớp domain đã implement và các phần chưa implement như checkout/orders/admin CRUD |

---

## 2. Tài liệu planning

| File | Vai trò | Đối chiếu source |
|------|---------|------------------|
| `docs/planning/PROJECT_ANALYSIS.md` | Phân tích kiến trúc và luồng dữ liệu | Khớp `src/app`, `src/features`, repository mode, cart flow và auth flow |
| `docs/planning/REFACTOR_PLAN.md` | Kế hoạch refactor theo priority | Đã cập nhật RF-001 thành trạng thái đã xử lý vì auth server barrel hiện khớp source |
| `docs/planning/AGENTS.md` | Ghi chú trỏ về hướng dẫn agent chính | Đóng vai trò index nhỏ, không chứa claim kỹ thuật riêng |

---

## 3. Tài liệu review

| File | Vai trò | Đối chiếu source |
|------|---------|------------------|
| `docs/reviews/REVIEW_RULES.md` | Quy chuẩn review code | Khớp cách review cần dùng cho repo |
| `docs/reviews/AI_REVIEW_CHECKLIST.md` | Checklist review cho AI | Khớp các risk thực tế: API bypass proxy, Server/Client boundary, cart authority, repository layer |
| `docs/reviews/ARCHITECTURE_REVIEW.md` | Review kiến trúc | Khớp source hiện tại; AR-03 đã hạ còn regression risk |
| `docs/reviews/SECURITY_REVIEW.md` | Review bảo mật | Khớp các gap hiện tại: metrics API thiếu auth, `/api/*` tự chịu auth, thiếu rate limit login/register |
| `docs/reviews/PERFORMANCE_REVIEW.md` | Review hiệu năng | Khớp client-heavy `(home)/layout.tsx`, duplicate catalog reads và thiếu cache/Suspense |
| `docs/reviews/FULL_COVERAGE_AUDIT.md` | Ghi chú coverage đọc source của review | Là tài liệu audit quá trình review, không phải test coverage |
| `docs/reviews/AGENTS.md` | Ghi chú trỏ về hướng dẫn review | Index nhỏ |
| `docs/reviews/PROJECT_ANALYSIS.md` | Ghi chú trỏ về analysis trong planning | Index nhỏ |

---

## 4. Tài liệu architecture/domain/engineering

| File | Vai trò | Đối chiếu source |
|------|---------|------------------|
| `docs/architecture/system-overview.md` | Tổng quan hệ thống | Khớp cấu trúc Next.js monolith |
| `docs/architecture/data-flow.md` | Tóm tắt luồng dữ liệu | Khớp product/cart/auth flow hiện tại |
| `docs/architecture/auth-flow.md` | Tóm tắt auth flow | Khớp Auth.js, JWT, email verification và dashboard guard |
| `docs/domain/products.md` | Ghi chú domain products | Khớp slug ID, repository modes, static/Prisma source |
| `docs/domain/cart.md` | Ghi chú domain cart | Khớp drawer-only cart, guest localStorage và authenticated `UserServerCart` |
| `docs/engineering/conventions.md` | Quy ước kỹ thuật | Khớp `AI_RULES.md` và source conventions |
| `docs/engineering/deployment.md` | Ghi chú deploy/env | Khớp env vars và lệnh build/test hiện có |
| `docs/engineering/feature-flags.md` | Runtime mode/env flags | Khớp `PRODUCT_REPOSITORY_MODE`, `REPO_METRICS_ENABLED`, OAuth env behavior |

---

## 5. Kết quả đối chiếu source chính

### Routes

Source hiện có các page:

- `/[locale]/`
- `/[locale]/products`
- `/[locale]/signin`
- `/[locale]/signup`
- `/[locale]/verify-email`
- `/[locale]/verify-email/confirm`
- `/[locale]/verify-email/success`
- `/[locale]/verify-email/error`
- `/[locale]/dashboard`

Chưa có page cho `/cart`, `/account`, checkout, orders, legal pages hoặc admin CRUD.

### API routes

Source hiện có:

- `/api/auth/[...nextauth]`
- `/api/internal/runtime/product-repository`

`src/proxy.ts` skip `/api/*`, nên API route phải tự kiểm tra auth nếu không public. Metrics API hiện chỉ gate bằng `report.enabled`, chưa có session/secret auth.

### Auth

Khớp source:

- JWT session.
- PrismaAdapter trong full auth config.
- Edge-safe auth config cho proxy.
- Credentials login yêu cầu verified email.
- Email verification token được hash và single-use.
- Resend verification có rate limit.
- Dashboard guard nằm trong `(admin)/layout.tsx`.

Điểm đã cập nhật so với tài liệu cũ: `src/features/auth/server/index.ts` hiện không còn export helper thiếu; đây chỉ còn là regression risk khi thêm export mới.

### Products

Khớp source:

- Product app-level ID là slug (`prod-001`, ...).
- Repository modes là `STATIC`, `PRISMA`, `AUTO`.
- `AUTO` fallback chỉ xảy ra khi construct repository.
- Filter hiện chạy sau `getAllProducts()`.
- Featured/new arrivals gọi catalog read riêng.
- `PrismaProductRepository.mapProduct` set `id: slug`.

### Cart

Khớp source:

- Guest cart dùng Redux/localStorage.
- Authenticated cart persist vào `UserServerCart`.
- Server actions validate input bằng Zod.
- Product data trong cart được lấy lại từ server.
- Không có `/cart` page.

### i18n

Khớp source:

- Locale `vi`, `en`.
- Default locale `vi`.
- `localePrefix: 'always'`.
- Một số file vẫn dùng `next/link` hoặc `next/navigation`.
- Products page còn hardcoded `Results` và `items found`.

### Scripts

Khớp `package.json`:

- Lệnh chính tồn tại: `dev`, `build`, `start`, `lint`, `typecheck`, `format`, `test`, `generate`, `seed`.
- `audit:products` và `smoke:products*` có trong `package.json` nhưng thư mục/file `scripts/*.ts` chưa tồn tại.

---

## 6. Điểm lệch/risk còn lại

| Mức độ | Điểm cần chú ý |
|--------|----------------|
| Cao | Metrics API nội bộ chưa có auth thật |
| Cao | `/api/*` bypass proxy, API mới phải tự auth |
| Cao | Chưa có rate limit login/register |
| Trung bình | `/cart` protected route nhưng chưa có page |
| Trung bình | `PUBLIC_ROUTES` và `ADMIN_ROUTES` chưa được proxy dùng |
| Trung bình | Product filter chưa push xuống DB |
| Trung bình | `(home)/layout.tsx` là Client Component bọc toàn bộ children |
| Trung bình | `UserServerCart.items` JSON nên validate khi đọc |
| Thấp | Một số navigation chưa dùng `@/i18n/navigation` |
| Thấp | Products page còn hardcoded English strings |

---

## 7. Thứ tự đọc đề xuất

1. `README.md`
2. `PROJECT_CONTEXT.md`
3. `AGENTS.md`
4. `AI_RULES.md`
5. `docs/planning/PROJECT_ANALYSIS.md`
6. `docs/planning/REFACTOR_PLAN.md`
7. `docs/reviews/REVIEW_RULES.md`
8. `docs/reviews/AI_REVIEW_CHECKLIST.md`
