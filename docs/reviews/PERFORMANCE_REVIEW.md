# PERFORMANCE_REVIEW.md — Clothing Store

**Loại review:** Review hiệu năng toàn codebase  
**Phương pháp:** Phân tích tĩnh source; không benchmark runtime.

---

## 1. Tóm tắt

Ứng dụng đã dùng một số pattern tốt của Next.js App Router như async Server Components cho home/products page và server-side product reads. Rủi ro hiệu năng chính nằm ở:

1. Client boundary rộng, đặc biệt `(home)/layout.tsx`.
2. Nhiều home section là Client Component có `framer-motion`.
3. Product catalog bị đọc full list nhiều lần.
4. Prisma list query over-fetch khi dùng mode Prisma.
5. Chưa có Suspense/loading strategy rõ ràng.
6. Global providers mount trên toàn bộ `[locale]` routes.

Với catalog nhỏ khoảng 13 SKU, các vấn đề này chủ yếu là latent risk. Khi catalog/traffic tăng, cần ưu tiên xử lý.

---

## 2. Điểm đang tốt

- Home page và products page là async Server Components.
- `ProductGrid` là async Server Component.
- `ProductsHero` là Server Component.
- Auth layout giữ server shell và chỉ bọc client shell khi cần.
- Cart actions chạy server-side validation/stock check.

---

## 3. Các finding

### PERF-01 — Shop layout tạo client boundary quá rộng

- **Severity:** High
- **File Path:** `src/app/[locale]/(home)/layout.tsx`
- **Mô tả:** Layout có `'use client'` và bọc header, main children, footer.
- **Khuyến nghị:** Tách server layout shell và client islands cho header/cart/menu.

### PERF-02 — Home page fetch server nhưng render nhiều Client Components

- **Severity:** High
- **File Path:** `src/features/home/components/*`
- **Mô tả:** Nhiều section dùng `framer-motion`, làm tăng JS client.
- **Khuyến nghị:** Chuyển section tĩnh về Server Component; lazy-load animation khi thật cần.

### PERF-03 — Product card tạo nhiều client subtree

- **Severity:** Medium
- **File Path:** `ProductGrid.tsx`, `ProductCard.tsx`
- **Mô tả:** Mỗi product card là Client Component có motion.
- **Khuyến nghị:** Giảm motion trong listing hoặc tách server-rendered card shell.

### PERF-04 — Locale root mount Redux + Session cho mọi route

- **Severity:** Medium
- **File Path:** `src/app/[locale]/layout.tsx`
- **Mô tả:** Auth-only pages cũng mount cart provider/persistence.
- **Khuyến nghị:** Lazy-init cart hoặc move cart providers xuống route group cần cart.

### PERF-05 — Header subscribe nhiều cart state

- **Severity:** Low
- **File Path:** `src/components/layout/header/Header.tsx`
- **Mô tả:** Header có thể rerender nhiều hơn cần thiết khi cart đổi.
- **Khuyến nghị:** Subscribe selector nhỏ như item count.

### PERF-06 — Cart selector nên memo nếu phức tạp

- **Severity:** Low
- **File Path:** `cartSlice.ts`
- **Mô tả:** Selector phức tạp nên memoize khi state lớn.
- **Khuyến nghị:** Dùng selector memoized nếu phát sinh cost.

### PERF-07 — localStorage cart sync có thể debounce

- **Severity:** Low
- **File Path:** `useCartPersistence.ts`
- **Mô tả:** Cart update liên tục có thể ghi localStorage nhiều lần.
- **Khuyến nghị:** Debounce hoặc batch persistence nếu cần.

### PERF-08 — Auth template motion cost

- **Severity:** Low
- **File Path:** `(auth)/template.tsx`
- **Mô tả:** Animation trên auth route có thể tạo JS không cần thiết.
- **Khuyến nghị:** Giữ animation nhẹ hoặc chỉ client island nhỏ.

### PERF-09 — `useAddToCart` callback deps

- **Severity:** Low
- **File Path:** `useAddToCart.ts`
- **Mô tả:** Dependency không ổn định có thể tạo callback mới.
- **Khuyến nghị:** Rà soát deps nếu thấy rerender.

### PERF-10 — Products page có duplicate full catalog reads

- **Severity:** High
- **File Path:** `products/page.tsx`, `products/server/products.ts`
- **Mô tả:** Page có thể gọi full catalog nhiều lần cho products và metadata.
- **Khuyến nghị:** Dùng một `getAllProducts()` per request hoặc React `cache()`.

### PERF-11 — Home page gọi featured/new arrivals riêng

- **Severity:** Medium
- **File Path:** `(home)/page.tsx`
- **Mô tả:** Có thể đọc catalog lặp lại cho featured/new arrivals.
- **Khuyến nghị:** Cache request-level hoặc batch read.

### PERF-12 — Prisma `list()` over-fetch

- **Severity:** Medium
- **File Path:** `prisma-product-repository.ts`
- **Mô tả:** Query list include nhiều relation cho mọi product.
- **Khuyến nghị:** Dùng select gọn cho listing; chỉ include chi tiết khi cần.

### PERF-13 — `getById` có thể tối ưu query

- **Severity:** Low
- **File Path:** `prisma-product-repository.ts`
- **Mô tả:** Lookup theo slug/id nên dùng query rõ ràng và index phù hợp.
- **Khuyến nghị:** Tối ưu khi catalog lớn.

### PERF-14 — Cart `addToCart` query product/stock theo request

- **Severity:** Low
- **File Path:** `cart/server/actions.ts`
- **Mô tả:** Mỗi add gọi server product read.
- **Khuyến nghị:** Chấp nhận để giữ authority; chỉ optimize khi có số liệu.

### PERF-15 — `mergeCart` batch behavior

- **Severity:** Medium
- **File Path:** `cart/server/actions.ts`
- **Mô tả:** Merge nhiều item có thể đọc nhiều product.
- **Khuyến nghị:** Dùng batch read nếu cart lớn.

### PERF-16 — `framer-motion` dùng rộng

- **Severity:** Medium
- **File Path:** `features/home/components/*`, product cards
- **Mô tả:** Motion tăng client bundle.
- **Khuyến nghị:** Giảm motion ở dense UI; lazy-load animation.

### PERF-17 — Redux + next-auth global bundle

- **Severity:** Medium
- **File Path:** `[locale]/layout.tsx`
- **Mô tả:** Global providers tăng baseline JS.
- **Khuyến nghị:** Scope provider theo route group hoặc lazy-init.

### PERF-18 — Icon import có thể consolidate

- **Severity:** Low
- **File Path:** UI components
- **Mô tả:** Import icon rải rác có thể tăng bundle.
- **Khuyến nghị:** Theo dõi bundle analyzer trước khi refactor.

### PERF-19 — Chưa có app caching strategy

- **Severity:** Medium
- **File Path:** `src/features/products/server/*`
- **Mô tả:** Chưa dùng `cache`, `unstable_cache` hoặc revalidation tags.
- **Khuyến nghị:** Thêm caching khi catalog DB-backed ổn định.

### PERF-20 — Filter chưa push xuống DB

- **Severity:** Medium
- **File Path:** `products/server/products.ts`
- **Mô tả:** In-memory filtering không scale tốt.
- **Khuyến nghị:** Đẩy filter/pagination xuống repository khi catalog tăng.

### PERF-21 — Static mode duplicate CPU

- **Severity:** Low
- **File Path:** `products/server/data.ts`
- **Mô tả:** Static catalog nhỏ nên không nghiêm trọng.
- **Khuyến nghị:** Giải quyết cùng request-level cache.

### PERF-22 — Chưa có Suspense/loading cho product grid

- **Severity:** Medium
- **File Path:** `src/app/[locale]/(home)/products`
- **Mô tả:** UX có thể chậm khi data source DB.
- **Khuyến nghị:** Thêm `loading.tsx` hoặc Suspense boundary khi cần.

### PERF-23 — Verify confirm dynamic rendering

- **Severity:** Low
- **File Path:** `verify-email/confirm/page.tsx`
- **Mô tả:** Dynamic behavior hợp lý cho token flow.
- **Khuyến nghị:** Giữ rõ ràng, không cache nhầm token page.

### PERF-24 — Thiếu đo lường bundle/runtime

- **Severity:** Low
- **File Path:** Project config
- **Mô tả:** Review hiện là static analysis, chưa có bundle/perf measurement.
- **Khuyến nghị:** Thêm bundle analyzer hoặc production metrics khi cần.

---

## 4. Ưu tiên cải thiện

1. Request-level cache cho product catalog.
2. Tách `(home)/layout.tsx` khỏi client boundary rộng.
3. Giảm `framer-motion` ở home/listing.
4. Tối ưu Prisma list select/include.
5. Scope hoặc lazy-init Redux/cart provider.
6. Thêm Suspense/loading khi dùng DB-backed catalog.
