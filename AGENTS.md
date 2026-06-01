# AGENTS.md — Clothing Store

Hướng dẫn cho AI coding agent làm việc trong repository này. Đọc file này trước khi thay đổi code.

**Tài liệu liên quan:** [PROJECT_CONTEXT.md](./PROJECT_CONTEXT.md), [AI_RULES.md](./AI_RULES.md), [README.md](./README.md), [docs/planning/PROJECT_ANALYSIS.md](./docs/planning/PROJECT_ANALYSIS.md), [docs/reviews/REVIEW_RULES.md](./docs/reviews/REVIEW_RULES.md).

---

## Dự án này là gì

Đây là web app thương mại điện tử thời trang, xây bằng **Next.js 16 App Router**, **React 19**, **TypeScript**, **PostgreSQL** qua Prisma và **next-intl** cho tiếng Việt/tiếng Anh.

| Khu vực | Trạng thái |
|---------|------------|
| Auth credentials, OAuth, email verification | Đã implement |
| i18n `vi`, `en` | Đã implement |
| Product catalog, list/filter/featured | Đã implement; filter đang chạy in-memory sau khi đọc full list |
| Cart | Đã implement; guest dùng Redux/localStorage, user đăng nhập dùng `UserServerCart`; chưa có `/cart` page |
| Admin dashboard | Một phần; có `(admin)/layout` và placeholder `dashboard/page.tsx` |
| Checkout, orders UI, inventory locking | Schema có, nhưng chưa build trong `src/app` |
| Product repository metrics | Đã implement |
| Global/API rate limiting | Chưa implement |
| Rate limit resend verification email | Đã implement |

---

## Stack kỹ thuật

| Layer | Công nghệ |
|-------|-----------|
| Framework | Next.js 16 App Router, React Server Components |
| UI | Tailwind CSS 4, shadcn/ui, Radix |
| UI extras | `next-themes`, `framer-motion`, `sonner` |
| Icons | `lucide-react`, `@hugeicons/react` |
| i18n | next-intl 4 |
| Auth | Auth.js / NextAuth v5 beta, JWT sessions, PrismaAdapter |
| DB | Prisma 7, PostgreSQL, `@prisma/adapter-pg` |
| Validation | Zod 4 |
| Cart client state | Redux Toolkit |
| Forms | react-hook-form, `@hookform/resolvers` |
| Email | nodemailer |
| Tests | Vitest |
| Package manager | pnpm |
| CI Node | 20 |

---

## Cấu trúc repository

```text
clothing-store/
├── prisma/                 # schema, migrations, seed.ts
├── prisma.config.ts        # Prisma 7 project config
├── messages/{vi,en}/       # next-intl JSON namespaces
├── docs/                   # tài liệu kiến trúc, domain, review, planning
├── src/
│   ├── app/                # App Router pages và API routes
│   ├── components/         # shared UI, layout, shadcn ui
│   ├── features/           # auth, cart, products, home
│   ├── i18n/               # routing, request, navigation
│   ├── lib/                # providers, email, prisma, metrics
│   ├── proxy.ts            # Next.js 16 proxy
│   └── types/
├── vitest.config.ts
├── PROJECT_CONTEXT.md
├── AI_RULES.md
└── README.md
```

Alias path: `@/*` trỏ tới `src/*`.

Lưu ý hiện tại: `package.json` có các script `audit:products` và `smoke:products*` nhưng các file `scripts/*.ts` tương ứng chưa tồn tại. Không dùng các script này làm bước verify cho đến khi được bổ sung.

---

## Nguyên tắc kiến trúc

Theo [AI_RULES.md](./AI_RULES.md):

1. Ưu tiên Server Components.
2. Mutation đi qua Server Actions và validate bằng Zod.
3. Không dùng Prisma trong UI component.
4. Product reads đi qua repository layer.
5. Route người dùng phải có locale prefix.
6. Session server là nguồn quyền chính.
7. Tài liệu phải mô tả trạng thái thật trong source.

Các lệch chuẩn đã biết:

- `src/features/auth/components/LoginForm.tsx` và `src/components/layout/footer/Footer.tsx` đang import `next/link`.
- `src/features/products/hooks/useProductFilters.ts` dùng `useRouter` / `usePathname` từ `next/navigation`.

---

## App Router và URL

Tất cả route người dùng nằm dưới `/${locale}/` với locale thuộc `{ vi, en }`. Default locale là `vi`, và prefix luôn bắt buộc.

Page hiện tồn tại:

| Route group | Paths |
|-------------|-------|
| `(home)` | `/`, `/products` |
| `(auth)` | `/signin`, `/signup`, `/verify-email`, `/verify-email/confirm`, `/verify-email/success`, `/verify-email/error` |
| `(admin)` | `/dashboard` |

Chưa có page cho `/cart`, `/account`, `/admin/*` CRUD, `/terms`, `/privacy`, `/forgot-password`, `/error`, `/forbidden`, checkout hoặc orders.

API route hiện có:

| Path | Vai trò |
|------|--------|
| `/api/auth/[...nextauth]` | Auth.js handlers |
| `/api/internal/runtime/product-repository` | Metrics/health của product repository |

`src/proxy.ts` bỏ qua `/api/*`, nên API route mới phải tự kiểm tra auth nếu cần.

---

## Route constants và enforcement

`src/features/auth/config/app-routes.ts` chứa canonical path không có locale. Một số path là kế hoạch, không phải page đã tồn tại.

`src/features/auth/config/access.ts` hiện có các list:

| List | Được proxy dùng | Vai trò |
|------|-----------------|--------|
| `AUTH_ROUTES` | Có | Redirect user đã login/verified khỏi auth pages |
| `EMAIL_VERIFICATION_EXEMPT_ROUTES` | Có | Cho user chưa verified vào verify/sign-in routes |
| `PROTECTED_ROUTES` | Có | Yêu cầu login cho `/dashboard`, `/account`, `/cart` |
| `PUBLIC_ROUTES` | Không | Định nghĩa nhưng chưa dùng trong proxy |
| `ADMIN_ROUTES` | Không | Định nghĩa nhưng chưa dùng trong proxy |

Admin access cho `/dashboard` được enforce trong `src/app/[locale]/(admin)/layout.tsx`, không qua `ADMIN_ROUTES`.

`src/features/auth/server/index.ts` hiện chỉ re-export các symbol đang tồn tại như route lists, `isPublicApiRoute`, `matchRoute` và session helpers. Nếu thêm export mới, kiểm tra target module trước để tránh barrel lệch source.

---

## Provider tree thực tế

`src/app/[locale]/layout.tsx` mount theo thứ tự:

1. `NextIntlClientProvider`
2. `ReduxProvider`
3. `AuthenticationProviders`

`AuthenticationProviders` chứa `SessionProvider` và `CartAuthSync`.

`src/lib/client/providers/AppProviders.tsx` có composition tương tự nhưng hiện không được app layout import.

---

## Feature modules

### `auth`

Server actions:

| File | Export |
|------|--------|
| `register.ts` | `registerUser` |
| `login.ts` | `loginWithCredentials` |
| `verify-email.ts` | `verifyEmailAction`, `confirmEmailVerificationAction` |
| `resend-verification.ts` | `resendVerificationEmailAction` |

Credentials login là flow hai bước: server action validate/check trước, sau đó client gọi `signIn('credentials', { redirect: false })` để thiết lập JWT session.

Email verification dùng token hash trong `EmailVerificationToken`; confirm page không verify ngay khi GET mà verify sau hành động của người dùng.

### `products`

- Client: `ProductGrid`, `FilterPanel`, `useProductFilters`.
- Server: `data.ts`, `products.ts`, repository implementations.
- Static catalog: `src/features/products/server/facades/product-source.ts`.
- Featured/new arrivals: ID list trong `src/features/products/data/ui.ts`.
- App-level `Product.id` là slug `prod-00x`.
- `PrismaProductRepository.list()` hiện chưa filter `Product.deletedAt`.

### `cart`

Cart chỉ có drawer, chưa có dedicated `/cart` page.

| User | Redux | Durable store | Server actions |
|------|-------|---------------|----------------|
| Guest | Có | localStorage | Validate product/stock, không ghi `UserServerCart` |
| Authenticated | Có | `UserServerCart` JSON | Persist add/update/remove/merge |

Không nhầm Prisma model `CartItem` với `UserServerCart.items`; runtime hiện dùng JSON cart.

### `home`

Chứa các marketing sections. Một số component dùng `framer-motion` và là Client Components.

---

## Edge proxy

`src/proxy.ts` export `proxy` theo convention Next.js 16. Không có `middleware.ts`.

Luồng chính:

1. Skip path bắt đầu bằng `/api`.
2. Chạy `createIntlMiddleware(routing)`.
3. Chạy `edgeAuth` để redirect auth/verification.

Redirect chính:

- User login + verified đi khỏi auth routes.
- User login nhưng chưa verified bị đưa về verify email khi vào protected routes.
- User chưa login vào protected routes bị đưa về sign-in kèm `callbackUrl`.

---

## Product repository

Factory: `src/features/products/server/repositories/create-product-repository.ts`.

| `PRODUCT_REPOSITORY_MODE` | Hành vi |
|---------------------------|---------|
| `STATIC` | Dùng `StaticProductRepository` |
| `PRISMA` | Dùng `PrismaProductRepository`, lỗi thì throw |
| `AUTO` | Thử Prisma khi construct; nếu init lỗi thì fallback static |
| unset | Dev dùng `STATIC`; production server dùng `AUTO` |

`AUTO` fallback chỉ áp dụng khi construct repository, không áp dụng cho lỗi query từng request.

Metrics bật khi `REPO_METRICS_ENABLED === 'true'` hoặc `NODE_ENV !== 'production'`. Endpoint metrics trả 403 khi metrics disabled.

---

## Database và Prisma

- Schema: `prisma/schema.prisma`
- Prisma client: `src/lib/server/prisma/prisma.ts`
- Generate: `pnpm generate`
- Seed: `pnpm prisma db seed`

Model đang được app dùng thực tế:

- Auth: `User`, `Account`, `Session`, `EmailVerificationToken`, `Role`
- Catalog: `Product`, `Category`, `ProductVariant`, `Inventory`, ...
- Cart persistence: `UserServerCart`

Orders, payments, shipments, coupons và inventory reservation có schema nhưng chưa wired thành feature hoàn chỉnh trong `src/app`.

---

## i18n

| File | Vai trò |
|------|--------|
| `src/i18n/routing.ts` | `locales: ['vi','en']`, default `vi`, prefix always |
| `src/i18n/request.ts` | Nạp namespace messages |
| `src/i18n/navigation.ts` | Link/router/redirect có locale |

User-facing string mới nên nằm trong `messages/{vi,en}`.

---

## Biến môi trường

| Biến | Vai trò |
|------|--------|
| `DATABASE_URL` | PostgreSQL |
| `AUTH_SECRET` | Auth.js |
| `NEXT_PUBLIC_BASE_URL` | Public base URL |
| `NEXT_PUBLIC_APP_URL` / `APP_URL` | Email link |
| `SMTP_*` | Verification email |
| `AUTH_GOOGLE_*` / `AUTH_GITHUB_*` | OAuth tùy chọn |
| `PRODUCT_REPOSITORY_MODE` | `STATIC`, `PRISMA`, `AUTO` |
| `REPO_METRICS_ENABLED` | Bật metrics trong production |

Không commit secret. Không expose server-only secret qua `NEXT_PUBLIC_*`.

---

## Lệnh thường dùng

```bash
pnpm install
pnpm dev
pnpm build
pnpm lint
pnpm typecheck
pnpm test
pnpm format
pnpm generate
pnpm prisma migrate dev
pnpm prisma db seed
```

CI dùng Node 20 và chạy install, generate, lint, typecheck, test, build.

---

## Nơi đặt code mới

| Task | Location |
|------|----------|
| Page mới | `src/app/[locale]/(group)/.../page.tsx` |
| Domain logic | `src/features/<domain>/server/` |
| Domain UI | `src/features/<domain>/components/` |
| Shared UI | `src/components/` |
| Zod schemas | `features/*/schemas/` hoặc `server/schemas.ts` |
| DB access | Repository hoặc `features/*/server/db.ts` |
| Translations | `messages/{vi,en}/<namespace>.json` |
| Tests | Colocated `*.test.ts` |

---

## Testing

Vitest dùng Node environment. Test hiện có cho auth schemas, cart merge logic, product filtering và repository contract/comparison. Chưa có E2E, phần lớn React component tests hoặc API route handler tests.

---

## Pitfalls thường gặp

1. Import Prisma vào Client Component.
2. Quên locale prefix: route là `/vi/products`, không phải `/products`.
3. Dùng Prisma cuid thay vì slug `prod-00x` cho app-level product ID.
4. Giả định có `/cart` page trong khi cart hiện là drawer.
5. Ghi guest cart vào `UserServerCart`.
6. Để static product data, seed và repository lệch nhau.
7. Giả định checkout đã implement.
8. Hiểu sai `AUTO` mode: fallback chỉ ở init.
9. Giả định OAuth luôn bật khi thiếu env.
10. Thêm export vào auth server barrel nhưng không kiểm tra symbol thật ở target module.
11. Tin README/script cũ mà không kiểm tra file thật.

---

## Checklist bảo mật khi sửa server

- Validate input `unknown` bằng Zod.
- Check session trước mutation theo user.
- Không tin price/name/stock/cart data từ client.
- Không log password hoặc verification token plain text.
- Verification token trong DB phải là hash.
- Thêm `revalidatePath` / `revalidateTag` nếu mutation ảnh hưởng cached RSC data.
- API route mới phải có auth/authorization riêng nếu không public.

---

## Ngoài phạm vi nếu không được yêu cầu

- Checkout, payment, order UI.
- Account pages.
- Admin CRUD đầy đủ.
- Normalized `CartItem` persistence.
- Inventory reservation.
- Global/API rate limiting.
- Full APM.
- Viết các script audit/smoke product còn thiếu.

---

## File chính

| Concern | File |
|---------|------|
| Auth config | `src/features/auth/server/auth-config.ts` |
| Edge auth | `src/features/auth/server/auth-edge.ts` |
| Session helper | `src/features/auth/server/session.ts` |
| Route lists | `src/features/auth/config/access.ts` |
| Proxy | `src/proxy.ts` |
| Locale layout | `src/app/[locale]/layout.tsx` |
| Product factory | `src/features/products/server/repositories/create-product-repository.ts` |
| Catalog reads | `src/features/products/server/data.ts`, `products.ts` |
| Cart actions | `src/features/cart/server/actions.ts` |
| Cart DB | `src/features/cart/server/db.ts` |
| Cart sync hook | `src/features/cart/hooks/useCartAuthSync.ts` |
| Prisma client | `src/lib/server/prisma/prisma.ts` |
| Repo metrics | `src/lib/server/metrics/product-repo-metrics.ts` |
| Static products | `src/features/products/server/facades/product-source.ts` |

---

## Changelog

### 2026-06-01 — Căn chỉnh audit theo source

- Làm rõ trạng thái auth, i18n, product catalog, cart, admin, checkout và metrics.
- Ghi nhận các route constant chưa có page tương ứng.
- Ghi nhận provider tree thực tế và `AppProviders.tsx` chưa dùng.
- Làm rõ product ID là slug.
- Làm rõ `AUTO` repository fallback chỉ ở init.
- Ghi nhận script/doc bị lệch so với README/package.json.
