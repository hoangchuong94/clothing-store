# OPEN_ISSUES.md — Clothing Store

**Single source of truth (SSOT)** cho mọi issue đang mở (`OI-*`). Không duplicate danh sách này ở `PROJECT_CONTEXT.md`, `docs/README.md` hoặc review snapshots — chỉ link tới file này.

Nguồn audit: [docs/reviews/FULL_PROJECT_REVIEW.md](../reviews/FULL_PROJECT_REVIEW.md) (2026-06-03). Chỉ gồm finding **VERIFIED**.

**Lộ trình:** [ROADMAP.md](./ROADMAP.md) · **Epic backlog:** [REFACTOR_PLAN.md](./REFACTOR_PLAN.md) · **Index AI:** [docs/INDEX.md](../INDEX.md)

---

## Quy ước

| Trường | Ý nghĩa |
|--------|---------|
| **ID** | `OI-###` |
| **Severity** | `Critical` \| `High` \| `Medium` \| `Low` |
| **Priority** | `P0` \| `P1` \| `P2` |
| **Status** | `Open` \| `In Progress` \| `Resolved` \| `Won't Fix` |

Tất cả issue dưới đây: **Status = Open**.

---

## P0 — Security / data integrity / CI blockers

### OI-001 — mergeCart không xác thực tồn kho sau merge

| | |
|--|--|
| **ID** | OI-001 |
| **Severity** | High |
| **Priority** | P0 |
| **Status** | Open |

**Description:** Luồng `mergeCart` re-resolve giá/tên/ảnh từ server nhưng không gọi `checkStock`. `mergeCartsLogic` giới hạn quantity bằng `userItem.stock` (snapshot JSON có thể lỗi thời) hoặc giữ nguyên `guestItem.quantity` cho item guest mới thêm — có thể persist cart vượt inventory thực tế.

**Affected Files:**

- `src/features/cart/server/actions.ts`
- `src/features/cart/server/utils.ts`

**Related References:**

- RF-201
- PERF-15

---

### OI-002 — UserServerCart.items đọc từ DB không qua Zod

| | |
|--|--|
| **ID** | OI-002 |
| **Severity** | Medium |
| **Priority** | P0 |
| **Status** | Open |

**Description:** `parseCartItems` cast `unknown` → `CartItem[]` mà không validate shape/type. JSON hỏng hoặc bị sửa có thể gây lỗi runtime hoặc logic cart sai trước checkout.

**Affected Files:**

- `src/features/cart/server/db.ts`

**Related References:**

- RF-201

---

### OI-003 — CI lint fail (`pnpm lint`)

| | |
|--|--|
| **ID** | OI-003 |
| **Severity** | Medium |
| **Priority** | P0 |
| **Status** | Open |

**Description:** Pipeline CI chạy `pnpm lint` sẽ fail: `@typescript-eslint/no-explicit-any` trong test auth config; warning `trigger` unused trong JWT callback. `pnpm typecheck` và `pnpm test` pass nhưng lint chặn merge.

**Affected Files:**

- `src/features/auth/server/auth-config.test.ts`
- `src/features/auth/server/auth-config.ts`

---

## P1 — Routing / consistency / operational guardrails

### OI-004 — Route `/cart` protected nhưng chưa có page

| | |
|--|--|
| **ID** | OI-004 |
| **Severity** | Medium |
| **Priority** | P1 |
| **Status** | Open |

**Description:** `PROTECTED_ROUTES` gồm `APP_ROUTES.CART` (`/cart`) nhưng không có `page.tsx` tương ứng dưới `src/app`. Proxy vẫn redirect user chưa login; user đã login có thể gặp 404. Cart hiện chỉ qua drawer.

**Affected Files:**

- `src/features/auth/config/access.ts`
- `src/features/auth/config/app-routes.ts`
- `src/app/**` (không có route `/cart`)

**Related References:**

- AR-04
- RF-206

---

### OI-005 — Redirect sau auth có thể mất locale prefix

| | |
|--|--|
| **ID** | OI-005 |
| **Severity** | Medium |
| **Priority** | P1 |
| **Status** | Open |

**Description:** `useAuthRedirect` dùng `useRouter` từ `next/navigation` thay vì `@/i18n/navigation`. `router.push(validatedUrl)` với path không locale (ví dụ `/dashboard`) có thể không khớp routing `prefix: 'always'` (`vi` / `en`).

**Affected Files:**

- `src/features/auth/hooks/useAuthRedirect.ts`

**Related References:**

- AR-08
- RF-207

---

### OI-006 — Mọi `/api/*` bypass proxy auth

| | |
|--|--|
| **ID** | OI-006 |
| **Severity** | Low |
| **Priority** | P1 |
| **Status** | Open |

**Description:** `src/proxy.ts` return `NextResponse.next()` cho mọi path `/api/*`. API route mới phải tự implement auth/authorization; rủi ro quên check khi thêm endpoint. Hiện chỉ có metrics route nội bộ (đã có session + role).

**Affected Files:**

- `src/proxy.ts`
- `src/app/api/**`

**Related References:**

- RF-004

---

### OI-007 — Link/navigation lệch chuẩn i18n (next/link, next/navigation)

| | |
|--|--|
| **ID** | OI-007 |
| **Severity** | Medium |
| **Priority** | P1 |
| **Status** | Open |

**Description:** Một số component/hook dùng `next/link` hoặc `next/navigation` thay vì `@/i18n/navigation`, dễ sinh URL thiếu locale hoặc không đồng bộ với next-intl routing.

**Affected Files:**

- `src/features/auth/components/LoginForm.tsx`
- `src/components/layout/footer/Footer.tsx`
- `src/features/products/hooks/useProductFilters.ts`
- `src/features/auth/hooks/useLogin.ts` (một phần: `useSearchParams` từ `next/navigation`)
- `src/features/auth/hooks/useAuthError.ts`
- `src/features/auth/lib/social-auth.ts`

**Related References:**

- AR-08
- RF-207

---

## P2 — Performance / DX / observability

### OI-008 — Catalog filter sau full-list read

| | |
|--|--|
| **ID** | OI-008 |
| **Severity** | Medium |
| **Priority** | P2 |
| **Status** | Open |

**Description:** `getProducts` gọi `getAllProducts()` rồi filter/sort in-memory. Không scale khi catalog lớn; tăng latency và RAM mỗi request.

**Affected Files:**

- `src/features/products/server/products.ts`
- `src/features/products/server/data.ts`
- `src/app/[locale]/(home)/products/page.tsx` (consumer)

**Related References:**

- AR-06
- RF-003
- RF-108
- RF-222
- PERF-10
- PERF-20

---

### OI-009 — package.json scripts trỏ file không tồn tại

| | |
|--|--|
| **ID** | OI-009 |
| **Severity** | Medium |
| **Priority** | P2 |
| **Status** | Open |

**Description:** Scripts `audit:products`, `smoke:products`, `smoke:products:static` trỏ `scripts/*.ts` nhưng thư mục `scripts/` không có file tương ứng. Gây docs/tooling drift với README và AGENTS.md.

**Affected Files:**

- `package.json`
- `README.md` (nếu tham chiếu scripts)
- `AGENTS.md` (đã ghi nhận drift)

**Related References:**

- AR-11
- RF-212

---

### OI-010 — AuthLogger ghi email (PII) ra console

| | |
|--|--|
| **ID** | OI-010 |
| **Severity** | Low |
| **Priority** | P2 |
| **Status** | Open |

**Description:** `AuthLogger.info` / login flow log context có `email`. Không phải secret nhưng là PII trong log production nếu log level không bị chặn.

**Affected Files:**

- `src/features/auth/lib/auth-logger.ts`
- `src/features/auth/hooks/useLogin.ts`

**Related References:**

- RF-306

---

## Tóm tắt theo priority

| Priority | Số issue | ID |
|----------|----------|-----|
| P0 | 3 | OI-001, OI-002, OI-003 |
| P1 | 4 | OI-004, OI-005, OI-006, OI-007 |
| P2 | 3 | OI-008, OI-009, OI-010 |

**Tổng:** 10 issue Open (VERIFIED).

---

## Issue khác (không nằm trong OI list)

Auth review follow-ups **SEC-01 … SEC-04** vẫn mở theo snapshot — xem [docs/reviews/SECURITY_REVIEW.md](../reviews/SECURITY_REVIEW.md) §3. Khi chuyển sang OI, thêm entry tại đây và đóng SEC trong review snapshot.

| Finding audit | Lý do không có OI |
|---------------|-------------------|
| `validateCallbackUrl` protocol-relative | **ASSUMPTION** |
| Checkout, orders, global API rate limit | Known gap / out of scope |
| `/api/*` bypass | Kiến trúc chấp nhận; OI-006 = guardrail quy trình |

---

## Cập nhật issue

1. Đổi **Status** → `Resolved` + ghi PR/commit.
2. Cập nhật [ROADMAP.md](./ROADMAP.md) bảng tiến độ.
3. Behavior đổi → `AGENTS.md`, `AI_RULES.md`, domain docs.
