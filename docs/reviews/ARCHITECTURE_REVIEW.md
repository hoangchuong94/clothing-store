# ARCHITECTURE_REVIEW.md — Clothing Store

**Loại review:** Review kiến trúc toàn project  
**Cơ sở:** `AGENTS.md`, `PROJECT_CONTEXT.md`, `AI_RULES.md`, `src/`, `prisma/`, `messages/`, CI config.  
**Phạm vi:** Phân tích tĩnh; không sửa code.

---

## 1. Tóm tắt

Project là **Next.js 16 monolith** theo cấu trúc feature-first. Các vertical slice đã chạy gồm auth, catalog browsing và cart. Schema Prisma mô hình hóa một cửa hàng đầy đủ hơn, nhưng nhiều phần như checkout, orders, payment, inventory reservation và admin CRUD chưa được nối vào app runtime.

| Khía cạnh | Đánh giá |
-----------|----------|
| Modularity | Tốt, code chia theo `src/features/*` |
| Server/client boundary | Tương đối tốt nhưng `(home)/layout.tsx` client-heavy |
| Auth/cart security pattern | Tốt ở baseline, còn gap ở API/internal surfaces |
| Catalog scalability | Hạn chế vì filter sau full-list read |
| Commerce completeness | Chưa đầy đủ |
| Docs/tooling alignment | Đã cải thiện nhưng vẫn có script/doc drift |

Kết luận: kiến trúc phù hợp cho MVP storefront, nhưng chưa đủ chặt cho nền tảng commerce production đầy đủ.

---

## 2. Topology hiện tại

```text
Browser
  -> src/proxy.ts
  -> src/app/[locale]/layout.tsx
  -> route group pages/layouts
  -> src/features/*
  -> src/lib/server hoặc product repository
  -> PostgreSQL / static catalog
```

Các layer chính:

- `src/app`: App Router, page, layout, API routes.
- `src/features`: auth, cart, products, home.
- `src/components`: shared UI và layout.
- `src/lib`: Prisma, email, providers, metrics.
- `src/i18n`: locale routing/navigation.
- `prisma`: schema, migration, seed.

---

## 3. Đánh giá theo domain

## Auth

Điểm tốt:

- Tách Node/server config và edge-safe config.
- Credentials login yêu cầu active user, password, role và verified email.
- Verification token được hash và single-use.
- `/dashboard` có guard role trong server layout.

Khoảng trống:

- `PUBLIC_ROUTES` và `ADMIN_ROUTES` chưa được proxy dùng.
- Có route constants chưa có page tương ứng.
- Auth server barrel hiện đã khớp source; vẫn cần kiểm tra regression khi thêm export mới.

## Products

Điểm tốt:

- Có repository interface và static/Prisma implementation.
- App-level product ID thống nhất là slug.
- Seed có cơ chế giữ canonical product slug.

Khoảng trống:

- Filter đang chạy sau khi đọc full catalog.
- Prisma `list()` over-fetch và chưa filter `deletedAt`.
- `AUTO` fallback chỉ ở init, cần quan sát rõ khi production.

## Cart

Điểm tốt:

- Server actions re-derive product data.
- Guest cart và authenticated cart được tách rõ.
- Login sync merge cart qua server.

Khoảng trống:

- Chưa có `/cart` page dù route protected có `/cart`.
- Runtime dùng `UserServerCart.items` JSON, còn `CartItem` model chưa dùng.
- Cần validate JSON cart khi đọc từ DB.

## i18n

Điểm tốt:

- Locale prefix bắt buộc.
- Có `@/i18n/navigation`.
- Messages chia theo namespace.

Khoảng trống:

- Một số file vẫn dùng `next/link` hoặc `next/navigation`.
- Products page có một số string hardcoded tiếng Anh.

---

## 4. Các finding kiến trúc

### AR-01 — Schema rộng hơn ứng dụng runtime

- **Severity:** High
- **File Path:** `prisma/schema.prisma`, `src/app/**`
- **Mô tả:** Schema có orders/payments/reservations nhưng app chưa có checkout/order flow.
- **Khuyến nghị:** Implement checkout MVP có transaction rõ ràng hoặc document đây là schema dự phòng.

### AR-02 — Access control model chưa thống nhất

- **Severity:** High
- **File Path:** `src/features/auth/config/access.ts`, `src/proxy.ts`
- **Mô tả:** Một số route list được định nghĩa nhưng không được enforcement dùng.
- **Khuyến nghị:** Wire các list vào proxy/server guard hoặc xóa nếu không dùng.

### AR-03 — Auth server barrel/export từng lệch source

- **Severity:** Low
- **File Path:** `src/features/auth/server/index.ts`
- **Mô tả:** Source hiện tại đã không còn export helper thiếu; đây là regression risk nếu thêm barrel export mới không kiểm tra target module.
- **Khuyến nghị:** Khi thêm export mới, verify symbol tồn tại và chạy typecheck.

### AR-04 — `/cart` protected nhưng không có page

- **Severity:** Medium
- **File Path:** `src/features/auth/config/access.ts`, `src/app/**`
- **Mô tả:** `/cart` được protect nhưng cart UX hiện chỉ là drawer.
- **Khuyến nghị:** Thêm cart page hoặc bỏ `/cart` khỏi protected routes.

### AR-05 — Hai mô hình cart persistence

- **Severity:** Medium
- **File Path:** `prisma/schema.prisma`, `src/features/cart/**`
- **Mô tả:** Schema có `CartItem`, runtime dùng `UserServerCart` JSON.
- **Khuyến nghị:** Document rõ hoặc migrate/deprecate một mô hình.

### AR-06 — Catalog scalability bị giới hạn

- **Severity:** Medium
- **File Path:** `src/features/products/server/products.ts`
- **Mô tả:** Filter sau full-list read chưa phù hợp khi catalog lớn.
- **Khuyến nghị:** Cache request-level trước, sau đó đẩy filter/pagination xuống repository.

### AR-07 — Metrics API nội bộ chưa có auth

- **Severity:** High
- **File Path:** `src/app/api/internal/runtime/product-repository/route.ts`
- **Mô tả:** Endpoint metrics dựa vào flag enabled/disabled.
- **Khuyến nghị:** Thêm session/role check hoặc secret header.

### AR-08 — Drift i18n navigation

- **Severity:** Medium
- **File Path:** `LoginForm.tsx`, `Footer.tsx`, `useProductFilters.ts`
- **Mô tả:** Một số code dùng Next navigation trực tiếp.
- **Khuyến nghị:** Ưu tiên `@/i18n/navigation`.

### AR-09 — Shop shell client-heavy

- **Severity:** High
- **File Path:** `src/app/[locale]/(home)/layout.tsx`
- **Mô tả:** Layout home là Client Component bao quanh toàn bộ children.
- **Khuyến nghị:** Tách server shell và client islands.

### AR-10 — Provider composition chết

- **Severity:** Low
- **File Path:** `src/lib/client/providers/AppProviders.tsx`
- **Mô tả:** Composition tồn tại nhưng app layout không dùng.
- **Khuyến nghị:** Xóa hoặc dùng thống nhất.

### AR-11 — Script/doc drift

- **Severity:** Medium
- **File Path:** `package.json`, `README.md`, `docs/`
- **Mô tả:** Một số script/doc được nhắc tới nhưng file chưa tồn tại.
- **Khuyến nghị:** Thêm file hoặc cập nhật tài liệu/script.

---

## 5. Thứ tự cải thiện đề xuất

1. Bảo vệ metrics API và giữ auth barrel không bị regression.
2. Rà soát mọi `/api/*` route.
3. Giảm duplicate catalog reads.
4. Thống nhất access control.
5. Tách client-heavy layout.
6. Quyết định biên checkout/orders/admin CRUD.
