# PROJECT_CONTEXT.md

Bối cảnh dự án **clothing-store** dựa trên source hiện tại. Tài liệu này ưu tiên mô tả thực tế trong code, không suy đoán.

---

# Tổng quan dự án

## Mục đích

`clothing-store` là ứng dụng storefront thời trang. README mô tả đây là e-commerce clothing store dùng Next.js, có internationalization, authentication forms và responsive design. Home metadata hiện dùng thương hiệu "Cyber Brand - Premium Streetwear x Cyber Fashion".

## Domain nghiệp vụ

Ứng dụng thuộc domain **fashion/apparel e-commerce**:

- Catalog sản phẩm.
- Product filters.
- Cart.
- User authentication.
- Email verification.
- Admin dashboard sơ khai.

Schema Prisma có nhiều model commerce như `Order`, `Payment`, `Coupon`, `Shipment`, `ReservedStock`, nhưng phần source runtime hiện chưa implement đầy đủ checkout/orders.

## Loại ứng dụng

Ứng dụng là **monolithic Next.js full-stack app**:

- App Router trong `src/app`.
- Server Components cho nhiều page.
- Client Components cho form, cart, filter, animation và provider.
- Server Actions cho mutations.
- PostgreSQL qua Prisma.
- Auth.js / NextAuth v5 cho authentication.

---

# Trạng thái hiện tại

## Đã hoàn thành

| Khu vực | Bằng chứng |
|---------|------------|
| Locale routing và messages | `src/i18n/*`, `messages/{vi,en}` |
| Edge proxy cho auth + i18n | `src/proxy.ts` |
| Auth credentials + optional OAuth | `src/features/auth/server/auth-config.ts` |
| Email verification flow | `src/features/auth/lib/verification/*`, pages verify-email |
| Product catalog browse/filter | `src/app/[locale]/(home)/products/page.tsx`, `src/features/products/server/products.ts` |
| Product repository abstraction | `src/features/products/server/repositories/*` |
| Cart guest/authenticated | `src/features/cart/server/actions.ts`, Redux cart |
| Home marketing page | `src/app/[locale]/(home)/page.tsx`, `src/features/home/components/*` |
| Admin dashboard shell | `(admin)/layout.tsx`, `(admin)/dashboard/page.tsx` |
| Seed dữ liệu | `prisma/seed.ts`, `prisma/seed/catalog-constants.ts` |
| Unit tests | Vitest config và các `*.test.ts` hiện có |
| Auth hardening | Login validation, auth rate limiting, session revocation, protected metrics |

## Đang triển khai / chưa hoàn chỉnh

| Khu vực | Ghi chú |
|---------|--------|
| Prisma-backed catalog rollout | Có `PRODUCT_REPOSITORY_MODE`, repository factory và metrics |
| Product repository metrics | Có endpoint nội bộ, metrics module và role protection |
| Production hardening | Auth hardening đã hoàn tất; còn các finding medium/low được ghi dưới đây |
| Admin | Chỉ có dashboard placeholder, chưa có CRUD |

## Chưa triển khai

| Khu vực | Ghi chú |
|---------|--------|
| Checkout flow | Không có feature/page checkout runtime |
| Orders UI | Schema có model order, app chưa dùng |
| Dedicated `/cart` page | Cart hiện là drawer |
| Account pages | Constant có, page chưa có |
| Legal pages | `/terms`, `/privacy` chưa có |
| Shop routes phụ | `/men`, `/women`, `/sale` chưa có |
| Product audit/smoke scripts | `package.json` trỏ tới `scripts/*.ts` nhưng file chưa tồn tại |

---

# Kiến trúc

## Stack frontend

- Next.js 16 App Router.
- React 19.
- TypeScript.
- Tailwind CSS 4.
- shadcn/ui và Radix.
- next-intl.
- Redux Toolkit cho cart.
- react-hook-form + Zod resolver.
- framer-motion cho animation.
- next-themes cho theme.

## Stack backend

- Server Actions trong `src/features/*/server` và `src/features/auth/actions`.
- Auth.js / NextAuth v5 beta.
- Prisma 7 + PostgreSQL.
- Nodemailer cho email verification.
- Zod cho validation.

## Database

- Prisma schema: `prisma/schema.prisma`.
- Prisma client output: `src/generated/prisma`.
- Runtime singleton: `src/lib/server/prisma/prisma.ts`.
- Seed: `prisma/seed.ts`.

Các model runtime đang dùng nhiều nhất: `User`, `Account`, `Session`, `EmailVerificationToken`, `Role`, catalog models và `UserServerCart`.

## Authentication

- Full server config: `src/features/auth/server/auth-config.ts`.
- Edge-safe config: `src/features/auth/server/auth-edge.config.ts`.
- Proxy wrapper: `src/features/auth/server/auth-edge.ts`.
- JWT session strategy.
- Credentials login yêu cầu user active, có password/role và email verified.
- Credentials verification đi qua `verifyCredentialsLogin()`, được dùng bởi cả `loginWithCredentials` và Auth.js Credentials `authorize()`.
- Auth rate limiting dùng `AuthRateLimitBucket` với HMAC key hash và PostgreSQL atomic upsert.
- Full server `auth()` re-check database `User.status`; `BANNED` và `INACTIVE` sessions bị invalidated.
- OAuth providers chỉ bật khi env vars tồn tại.

## Internationalization

- Locales: `vi`, `en`.
- Default locale: `vi`.
- Locale prefix: always.
- Navigation nên dùng `src/i18n/navigation.ts`.

---

# Cấu trúc source

## `src/app`

Chứa App Router entrypoints:

- Root layout.
- Locale layout.
- `(home)` routes.
- `(auth)` routes.
- `(admin)` routes.
- API routes.

Page hiện có: home, products, sign-in, sign-up, verify-email flow và dashboard.

## `src/features`

Feature-first modules:

| Feature | Vai trò |
|---------|--------|
| `auth` | Đăng ký, đăng nhập, verification, session, route config |
| `products` | Catalog, repository, filters, UI |
| `cart` | Server actions, Redux, hooks, cart drawer |
| `home` | Marketing sections |

Chưa có `checkout` hoặc `orders` feature.

## `src/components`

Shared UI và layout components, gồm header/footer và shadcn-style primitives.

## `src/lib`

Hạ tầng cross-cutting:

- `lib/server`: Prisma, server actions helpers, metrics.
- `lib/client/providers`: Redux/auth/cart providers.
- `lib/email`: cấu hình và gửi email.

## `src/i18n`

Routing, request config và locale-aware navigation.

## `src/proxy.ts`

Edge entrypoint cho next-intl middleware và auth redirects. File này skip `/api/*`.

---

# Trạng thái domain

## Auth

Đã có registration, credentials login, optional OAuth, JWT session và email verification. Verification token được hash và consume single-use.

Auth hardening hiện đã có:

- `LoginSchema.safeParse` trong login server action.
- Shared `verifyCredentialsLogin()` cho login action và Auth.js Credentials `authorize()`.
- Rate limiting cho login/register/resend verification theo IP và email.
- PostgreSQL atomic rate limiting qua `INSERT ... ON CONFLICT ... DO UPDATE ... RETURNING`.
- HMAC hash cho email/IP rate-limit key.
- Reset `LOGIN_EMAIL` khi login thành công; không reset `LOGIN_IP`.
- Compensate `LOGIN_EMAIL` khi password đúng nhưng email chưa verified.
- Session revocation cho `BANNED` và `INACTIVE` qua JWT callback DB re-check.

Khoảng trống auth review (SEC-*): xem [docs/reviews/SECURITY_REVIEW.md](./docs/reviews/SECURITY_REVIEW.md) §3. Issue tracked OI-*: [docs/planning/OPEN_ISSUES.md](./docs/planning/OPEN_ISSUES.md).

## Products

Đã có static catalog, Prisma repository, repository factory và filter server-side sau khi đọc full list. App-level ID là slug `prod-00x`.

Public reads trong `PrismaProductRepository` hiện filter `deletedAt: null` cho list/get/getByIds.

Khoảng trống: filter chưa push xuống DB; product audit/smoke scripts còn thiếu.

## Cart

Guest cart dùng Redux + localStorage. Authenticated cart dùng Redux optimistic UI và `UserServerCart` JSON. Login sync merge guest cart vào server cart.

`MergeCartSchema` chỉ nhận `{ guestCart }`; server lấy ownership từ authenticated session và không tin `userId` client.

Khoảng trống: chưa có `/cart` page; normalized `CartItem` model chưa dùng runtime; checkout chưa wired.

## Checkout / Orders / Inventory

Schema có nhiều model liên quan nhưng app chưa có flow hoàn chỉnh. Không coi các model này là feature đã implement.

## Admin

Có protected layout và dashboard placeholder. Chưa có CRUD users/products/orders.

---

# Product repository

Repository mode:

| Mode | Hành vi |
|------|---------|
| `STATIC` | Dùng catalog tĩnh |
| `PRISMA` | Dùng DB qua Prisma, fail fast khi lỗi |
| `AUTO` | Thử Prisma khi construct; fallback static nếu init lỗi |

`AUTO` không fallback theo từng query sau khi repository đã khởi tạo.

Metrics repository bật mặc định ở non-production hoặc khi `REPO_METRICS_ENABLED=true`.

---

# Môi trường

Biến quan trọng:

- `DATABASE_URL`
- `AUTH_SECRET`
- `NEXT_PUBLIC_BASE_URL`
- `APP_URL` / `NEXT_PUBLIC_APP_URL`
- `SMTP_*`
- `AUTH_GOOGLE_*` / `AUTH_GITHUB_*`
- `PRODUCT_REPOSITORY_MODE`
- `REPO_METRICS_ENABLED`

Không commit secret và không đưa secret server-only vào biến `NEXT_PUBLIC_*`.

---

# Auth Hardening Status

Completed:

- Login validation
- Auth rate limit infrastructure
- Login rate limit
- Register rate limit
- Resend verification rate limit
- Session revocation
- Metrics API protection
- Product soft delete filtering
- Cart ownership hardening

**Open work (SSOT):** [docs/planning/OPEN_ISSUES.md](./docs/planning/OPEN_ISSUES.md) — mọi issue `OI-*` đang mở.

**Auth review follow-ups (ngoài OI list):** [docs/reviews/SECURITY_REVIEW.md](./docs/reviews/SECURITY_REVIEW.md) §3 (`SEC-01` … `SEC-04`).

---

# Ưu tiên hiện tại

- **Issue đang mở:** [docs/planning/OPEN_ISSUES.md](./docs/planning/OPEN_ISSUES.md)
- **Lộ trình:** [docs/planning/ROADMAP.md](./docs/planning/ROADMAP.md)
- **Epic / backlog:** [docs/planning/REFACTOR_PLAN.md](./docs/planning/REFACTOR_PLAN.md)
- **AI reading paths:** [docs/INDEX.md](./docs/INDEX.md)

---

# Giới hạn đã biết

- Chưa có checkout/orders UI.
- Chưa có `/cart` page.
- Chưa có account/legal pages.
- Admin CRUD chưa có.
- Global/API rate limiting chưa có.
- Một số docs/scripts trong README/package.json từng bị lệch source.
- Một số component vẫn dùng `next/link` hoặc `next/navigation` thay vì `@/i18n/navigation`.

---

# Tài liệu liên quan

- [README.md](./README.md)
- [AGENTS.md](./AGENTS.md)
- [AI_RULES.md](./AI_RULES.md)
- [docs/INDEX.md](./docs/INDEX.md)
- [docs/planning/OPEN_ISSUES.md](./docs/planning/OPEN_ISSUES.md)
- [docs/planning/PROJECT_ANALYSIS.md](./docs/planning/PROJECT_ANALYSIS.md)
- [docs/planning/REFACTOR_PLAN.md](./docs/planning/REFACTOR_PLAN.md)
- [docs/reviews/REVIEW_RULES.md](./docs/reviews/REVIEW_RULES.md)
