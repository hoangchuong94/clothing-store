# REFACTOR_PLAN.md — Clothing Store

Kế hoạch refactor tổng hợp từ phân tích kiến trúc, security review, performance review và context hiện tại của repository.

---

## 1. Quy ước đánh giá

| Impact | Ý nghĩa |
|--------|---------|
| 5 | Có thể gây incident production, breach hoặc blocker commerce |
| 4 | Rủi ro rõ khi traffic/catalog tăng hoặc khi public production |
| 3 | Ảnh hưởng maintainability, consistency hoặc vận hành |
| 2 | Cải thiện có giá trị nhưng chưa gấp |
| 1 | Polish, DX hoặc docs |

| Difficulty | Ý nghĩa |
|------------|---------|
| S | Vài giờ đến 1 ngày, ít file |
| M | 2-5 ngày, nhiều file hoặc cần thiết kế nhỏ |
| L | 1-2 tuần hoặc epic lớn |

Priority:

- **P0:** Làm trước.
- **P1:** Hardening/consistency quan trọng.
- **P2:** Cải thiện kiến trúc/performance hoặc feature boundary.
- **P3/P4:** Polish, DX, debt dài hạn.

---

## 2. P0 — Làm trước

| ID | Việc cần làm | Nguồn | Impact | Difficulty |
|----|--------------|-------|--------|------------|
| RF-001 | Đã xử lý: auth server barrel hiện không còn export helper thiếu; giữ rule kiểm tra barrel khi thêm export mới | AR-03, SEC-21 | 1 | S |
| RF-002 | Bảo vệ `GET /api/internal/runtime/product-repository` bằng auth hoặc secret header | SEC-01, AR-07 | 5 | S |
| RF-003 | Giảm duplicate full catalog reads bằng React `cache()` hoặc một lần `getAllProducts()` mỗi request | PERF-10, PERF-11 | 4 | S |
| RF-004 | Rà soát mọi handler dưới `/api/*` vì proxy bỏ qua API path | SEC-02 | 4 | S |
| RF-005 | Dùng `LoginSchema.safeParse` trong `loginWithCredentials` | SEC-06 | 3 | S |

---

## 3. High priority

| ID | Tiêu đề | Mô tả | Files chính | Difficulty | Priority |
|----|---------|-------|-------------|------------|----------|
| RF-101 | Quyết định biên commerce | Implement checkout MVP hoặc đóng băng/document schema Order/Payment/ReservedStock | `prisma/schema.prisma`, `src/app`, feature mới | L | P2 |
| RF-102 | Thống nhất access control | Wire hoặc xóa `ADMIN_ROUTES`, `PUBLIC_ROUTES`; implement helper access | `access.ts`, `proxy.ts`, `app-routes.ts` | M | P1 |
| RF-103 | Enforce scopes/roles server-side | Dùng role/scope trong admin/server mutations tương lai | `roles.ts`, `auth-config.ts`, actions | M | P1 |
| RF-105 | Rate limit login/register | Chống brute force credentials và registration flooding | `login.ts`, `register.ts` | M | P1 |
| RF-106 | Tách shop layout client boundary | Chuyển `(home)/layout.tsx` thành server shell + client islands | `(home)/layout.tsx`, `Header.tsx` | M | P2 |
| RF-107 | Giảm motion/client footprint home | Chuyển section tĩnh về RSC, lazy-load motion | `features/home/components/*` | M | P2 |
| RF-108 | Duplicate catalog fetch | Trùng hướng xử lý RF-003 | `products/page.tsx`, `data.ts` | S | P0 |

---

## 4. Medium priority

| ID | Tiêu đề | Mô tả | Priority |
|----|---------|-------|----------|
| RF-201 | Validate cart JSON từ DB | Zod-parse `UserServerCart.items` khi đọc | P1 |
| RF-202 | Prisma list: `deletedAt` + select gọn | Filter soft-delete và giảm over-fetch | P2 |
| RF-203 | Caching catalog | Dùng cache/tag khi có DB-backed catalog ổn định | P2 |
| RF-204 | Rate limit cart actions | Giảm abuse add/merge cart | P2 |
| RF-205 | Cart schema hygiene | Bỏ hoặc không tin `userId` trong merge payload | P1 |
| RF-206 | Route `/cart` vs drawer | Thêm page hoặc bỏ khỏi protected routes | P2 |
| RF-207 | Chuẩn hóa i18n navigation | Dùng `@/i18n/navigation` thay `next/link`/`next/navigation` | P2 |
| RF-208 | i18n products page strings | Đưa hardcoded strings vào messages | P3 |
| RF-209 | OAuth verification policy | Document hoặc align policy OAuth/credentials | P2 |
| RF-210 | Thu hẹp provider scope | Lazy-init hoặc move Redux/session/cart providers | P3 |
| RF-211 | Suspense/loading states | Thêm streaming/loading cho product grid/home | P3 |
| RF-212 | Scripts & docs drift | Thêm missing scripts hoặc cập nhật README/package docs | P2 |
| RF-213 | Dual cart model | Document/deprecate Prisma `CartItem` runtime gap | P3 |
| RF-214 | Thống nhất `getCurrentUser` | Cart actions dùng session helper hiện đại hơn | P2 |
| RF-215 | Integration tests | Auth/cart actions và repository tests | P2 |
| RF-216 | AUTO fallback observability | Alert/log rõ khi production fallback static | P2 |
| RF-217 | Header cart rerenders | Subscribe selector nhỏ hơn | P3 |
| RF-218 | Debounce localStorage cart | Giảm write localStorage liên tục | P3 |
| RF-219 | Admin surface | Implement CRUD hoặc ẩn/đóng scope rõ | P3 |
| RF-220 | Forbidden/error pages | Thêm page hoặc đổi redirect | P3 |
| RF-221 | Cache invalidation catalog writes | Thêm khi có admin catalog mutation | P3 |
| RF-222 | DB-side filter/pagination | Đẩy filter xuống repository khi catalog lớn | P3 |

---

## 5. Low priority

| ID | Việc cần làm |
|----|--------------|
| RF-301 | Memoize selector cart nếu cần |
| RF-302 | Rà soát deps trong `useAddToCart` |
| RF-303 | Giảm motion cost ở auth template |
| RF-304 | Tối ưu `getById` Prisma |
| RF-305 | Consolidate icon imports nếu bundle analyzer chỉ ra vấn đề |
| RF-306 | Redact auth logs |
| RF-307 | Session callback fail-closed |
| RF-308 | Giảm rủi ro token trong URL bằng TTL/HTTPS/log hygiene |
| RF-309 | Làm rõ response guest cart update |
| RF-310 | Bổ sung `REPO_METRICS_ENABLED` trong `.env.example` nếu thiếu |
| RF-311 | Xóa hoặc dùng `AppProviders.tsx` |
| RF-312 | Lưu IP/UA cho verification token nếu cần audit |
| RF-313 | Dọn reset password schemas nếu chưa có actions |
| RF-314 | Giữ verify confirm dynamic rõ ràng |
| RF-315 | Test dual login path |
| RF-316 | Rà soát callbackUrl proxy pathname |
| RF-317 | Giảm motion density ở ProductCard |
| RF-318 | Xử lý static duplicate CPU cùng RF-003 |

---

## 6. Lộ trình đề xuất

### Phase P0 — Hardening nhanh

- RF-001 đã xử lý; chỉ cần kiểm tra regression khi đổi barrel exports
- RF-002
- RF-003
- RF-004
- RF-005

### Phase P1 — Security và data consistency

- RF-102
- RF-103
- RF-105
- RF-201
- RF-205

### Phase P2 — Performance và maintainability

- RF-106
- RF-107
- RF-202
- RF-203
- RF-206
- RF-207
- RF-212
- RF-215
- RF-216

### Phase P3 — Product và polish

- Admin surface.
- Error/forbidden pages.
- i18n polish.
- Provider scope optimization.
- Long-term catalog filtering.

---

## 7. Phụ thuộc quan trọng

- Không build checkout/order nửa vời nếu chưa có transaction và inventory strategy.
- Không rely vào proxy để bảo vệ `/api/*`.
- Không dùng route constants làm bằng chứng page đã tồn tại.
- Không chuyển thêm layout sang Client Component nếu không cần.
- Không đổi product ID từ slug sang Prisma cuid ở app layer.

---

## 8. Theo dõi tiến độ

Khi thực hiện item:

1. Ghi ID RF trong PR/commit.
2. Cập nhật tài liệu nếu behavior đổi.
3. Thêm test phù hợp với mức rủi ro.
4. Nếu bỏ qua item, ghi rõ lý do và owner follow-up.

---

## 9. Tài liệu tham chiếu

- `AGENTS.md`
- `AI_RULES.md`
- `PROJECT_CONTEXT.md`
- `docs/planning/PROJECT_ANALYSIS.md`
- `docs/reviews/ARCHITECTURE_REVIEW.md`
- `docs/reviews/SECURITY_REVIEW.md`
- `docs/reviews/PERFORMANCE_REVIEW.md`
