# AI_RULES.md — Clothing Store

Quy tắc kỹ thuật chuẩn cho AI agent và contributor làm việc trong repository này.

File này dùng khi thay đổi code. Để hiểu bối cảnh rộng hơn, đọc thêm [AGENTS.md](./AGENTS.md), [PROJECT_CONTEXT.md](./PROJECT_CONTEXT.md), [docs/planning/PROJECT_ANALYSIS.md](./docs/planning/PROJECT_ANALYSIS.md) và [docs/reviews/REVIEW_RULES.md](./docs/reviews/REVIEW_RULES.md).

**Lần căn chỉnh gần nhất với source:** 2026-06-01  
**Stack:** Next.js 16 App Router, React 19, TypeScript, Prisma 7 + PostgreSQL, Auth.js v5, next-intl, Redux Toolkit cart, Tailwind CSS 4.

---

## Nguyên tắc cốt lõi

1. **Ưu tiên server-first.** Page, layout, đọc product và orchestration nghiệp vụ nên là React Server Components. Chỉ thêm `'use client'` khi cần hook, browser API, interactivity, Radix/shadcn client behavior, animation, Redux hoặc NextAuth client session.
2. **Mutation đi qua Server Actions.** Validate input `unknown` bằng Zod, lấy quyền từ server/session và trả về object success/error có type rõ ràng.
3. **Không dùng Prisma trong UI.** Prisma chỉ nằm trong `src/lib/server/*`, `src/features/*/server/*` hoặc repository implementation. Không import Prisma vào Client Component hoặc presentational component.
4. **Products đi qua repository layer.** App code dùng `src/features/products/server/data.ts` và `products.ts`, không tự construct `StaticProductRepository` hoặc `PrismaProductRepository`.
5. **Routing theo locale.** Route người dùng luôn nằm dưới `/[locale]` với `vi` hoặc `en`; default locale là `vi`; URL luôn có prefix.
6. **Session là nguồn quyền chính.** Với write theo user, dùng user ID từ server session. Không tin `userId`, role, price, stock hoặc permission từ client.
7. **Tài liệu mô tả thực tế, không mô tả ý định.** Nếu route/script/model/page chỉ mới nằm trong kế hoạch, phải ghi rõ là chưa implement.

---

## Bản đồ repository

| Việc cần làm | Vị trí |
|--------------|--------|
| Page/layout | `src/app/[locale]/(home|auth|admin)/...` |
| UI theo feature | `src/features/<feature>/components/` |
| Hook theo feature | `src/features/<feature>/hooks/` |
| Logic server/action/db theo feature | `src/features/<feature>/server/` hoặc `src/features/<feature>/actions/` nếu theo pattern auth |
| UI primitive dùng chung | `src/components/ui/` |
| Layout dùng chung | `src/components/layout/` |
| Hạ tầng server cross-cutting | `src/lib/server/` |
| Client providers | `src/lib/client/providers/` |
| Email infrastructure | `src/lib/email/` |
| i18n routing/navigation | `src/i18n/` |
| Translations | `messages/{vi,en}/<namespace>.json` |
| Prisma schema/seed | `prisma/` |
| Tests | Colocate `*.test.ts` cạnh logic |

Dùng alias `@/*` cho path trong `src/*`. Chỉ dùng feature barrel cho public API của feature; với module nội bộ, import bằng path cụ thể.

---

## Quy tắc App Router và routing

- Page người dùng phải nằm dưới `src/app/[locale]/...`; không thêm route public không có locale.
- Route groups hiện có:
  - `(home)`: `/`, `/products`
  - `(auth)`: `/signin`, `/signup`, `/verify-email`, `/verify-email/confirm`, `/verify-email/success`, `/verify-email/error`, `/forbidden`
  - `(admin)`: `/dashboard`
- Hiện chưa có `/cart` page, checkout page, account page, legal page, `/forgot-password`, `/error` page hoặc admin CRUD page.
- `src/proxy.ts` là edge entrypoint cho i18n và auth redirect. Không có `middleware.ts`.
- `src/proxy.ts` bỏ qua mọi `/api/*`; API route phải tự thiết kế auth/authorization nếu không public.
- `/dashboard` đang được guard trong `src/app/[locale]/(admin)/layout.tsx` với role `ADMIN` hoặc `SUPER_ADMIN`.
- `APP_ROUTES` có thể chứa route dự kiến. Không coi constant là page đã tồn tại.

Độ lệch hiện tại cần nhớ:

- `PROTECTED_ROUTES` có `/cart`, nhưng chưa có cart page.
- `PUBLIC_ROUTES` và `ADMIN_ROUTES` được định nghĩa nhưng chưa được `src/proxy.ts` dùng.
- `src/features/auth/server/index.ts` hiện re-export các symbol đang tồn tại. Nếu thêm helper access/API mới, phải implement ở target module trước rồi mới export.

---

## Ranh giới Server và Client

- Giữ page/layout là Server Component trừ khi cần client hook hoặc browser API.
- Không đẩy business logic vào presentational component.
- Nếu file dùng `useState`, `useEffect`, Redux hook, `useSession`, `useTranslations`, Radix interaction hoặc browser API thì phải có `'use client'`.
- Tránh mở rộng client boundary. `(home)/layout.tsx` hiện là ngoại lệ client-heavy, không phải pattern để copy.
- File có `'use client'` không được import:
  - `@/lib/server/*`
  - Prisma client
  - product repository implementation
  - email/server-only module
  - server-only auth config

---

## Server Actions

Server action phải theo pattern:

1. Nhận input `unknown` nếu gọi từ client.
2. Validate bằng Zod trước khi đọc field.
3. Với write theo user, kiểm tra session bằng `getCurrentUser()` hoặc `getCurrentUserSession()`.
4. Lấy `userId`, role, scope từ session; không authorize bằng body từ client.
5. Re-derive dữ liệu nhạy cảm trên server: product name, price, stock, image, permission.
6. Trả về response có cấu trúc như `{ success, data?, error? }`.
7. Tách validation error khỏi unexpected server error.
8. Thêm `revalidatePath` / `revalidateTag` khi mutation ảnh hưởng dữ liệu RSC được cache.

Với cart actions, phải giữ nguyên tính chất server-authoritative: client cart chỉ là hint; price/name/image/stock phải đến từ product server layer.

---

## Auth và authorization

- Auth.js được tách thành:
  - Node/server config đầy đủ: `src/features/auth/server/auth-config.ts`
  - Edge-safe JWT config: `src/features/auth/server/auth-edge.config.ts`
  - Proxy wrapper: `src/features/auth/server/auth-edge.ts`
- Credentials login yêu cầu user active, có password, có role và email đã verified.
- Credentials verification đi qua `verifyCredentialsLogin()` và được dùng bởi cả `loginWithCredentials` lẫn Auth.js Credentials `authorize()`.
- `loginWithCredentials` nhận `unknown` và validate bằng `LoginSchema.safeParse`.
- Auth rate limiting đã có cho login, register và resend verification:
  - Login: `LOGIN_IP` rồi `LOGIN_EMAIL` trước Prisma/bcrypt.
  - Register: `REGISTER_IP` rồi `REGISTER_EMAIL` trước user lookup/create.
  - Resend verification: `RESEND_VERIFICATION_IP` rồi `RESEND_VERIFICATION_EMAIL` trước user lookup/send.
- Rate-limit keys dùng HMAC hash cho email/IP; database lưu `keyHash`, không lưu raw email/IP.
- Rate limiting dùng PostgreSQL atomic `INSERT ... ON CONFLICT ("action", "keyHash") DO UPDATE ... RETURNING`.
- Login success reset `LOGIN_EMAIL`; không reset `LOGIN_IP`.
- Password đúng nhưng email chưa verified sẽ compensate `LOGIN_EMAIL`.
- Full server `auth()` re-check database `User.status`; existing sessions của `BANNED` và `INACTIVE` user bị invalidated.
- OAuth providers chỉ bật khi có env vars tương ứng. Hành vi hiện tại có thể auto-set `emailVerified` cho OAuth user; coi đây là policy hiện có trừ khi được yêu cầu đổi.
- Registration và verification phải dùng hashed verification token. Không lưu/log token plain text.
- Confirm page không được verify khi GET; verification phải chạy sau hành động xác nhận của người dùng.
- Resend verification rate limit chính dùng `AuthRateLimitBucket`; cooldown 2 phút vẫn dùng `User.verificationResendAt`.
- Admin/server mutation tương lai phải check role/scope ở server, không chỉ ẩn UI.
- Không expose `AUTH_SECRET`, `DATABASE_URL`, SMTP credentials, password hash, verification token đầy đủ hoặc raw session/JWT token ra client hoặc logs.

Hardening gaps đang tồn tại:

- OAuth email verification semantics: callback hiện chưa đọc provider verified claim một cách rõ ràng.
- Register email enumeration: `registerUser` trả `EMAIL_ALREADY_EXISTS`.
- Login/register unexpected errors có thể đưa `error.message` vào response.
- Browser credentials login thành công reserve `LOGIN_IP` hai lần vì flow chạy server action rồi Auth.js `signIn`.
- `ROLE_SCOPES` được đưa vào session nhưng chưa được enforce rộng rãi trong server actions ngoài các guard hiện có.
- `/api/*` bypass proxy auth, nên API mới phải tự thiết kế bảo mật.

---

## Products và catalog

- App-level product ID là slug (`prod-001`, ...), không phải Prisma cuid.
- Static catalog nằm ở `src/features/products/server/facades/product-source.ts`.
- Seed dùng identity từ static catalog và `prisma/seed/catalog-constants.ts`; giữ chúng đồng bộ.
- Product read nên đi qua:
  - `getAllProducts`
  - `getProductById`
  - `getProducts(productIds)`
  - `checkStock`
  - helper cấp cao trong `src/features/products/server/products.ts`
- Repository modes:
  - `STATIC`: catalog in-memory
  - `PRISMA`: DB-backed, fail fast
  - `AUTO`: thử Prisma khi construct repository, fallback static chỉ khi construct lỗi
- Không thêm fallback Prisma theo từng request trong app code nếu chưa cố ý đổi repository contract.
- Nếu thêm admin product writes, phải thêm cache invalidation và tests.
- `PrismaProductRepository` public reads hiện filter `deletedAt: null`; giữ behavior này trừ khi có admin archived-product use case rõ ràng.

Performance rule: tránh đọc full catalog lặp lại. Nếu page cần cả products và filter metadata, ưu tiên một lần `getAllProducts()` mỗi request hoặc thêm request-level caching bằng React `cache()`.

---

## Cart

- Cart UI hiện là drawer, không phải route page.
- Guest cart dùng Redux + localStorage; không lưu server-side.
- Authenticated cart dùng Redux optimistic UI + `UserServerCart` JSON row.
- `CartItem` model trong Prisma hiện chưa dùng runtime; đừng nhầm với `UserServerCart.items`.
- Cart server actions không được tin price/name/stock từ client.
- `mergeCart` phải dùng user ID từ session server-side.
- `MergeCartSchema` chỉ nhận `{ guestCart }`; không yêu cầu `userId` từ client.

---

## Database và Prisma

- Prisma client singleton ở `src/lib/server/prisma/prisma.ts`.
- Không tạo PrismaClient mới trong component, hook hoặc utility client.
- Multi-step write cần atomicity phải dùng `prisma.$transaction`, đặc biệt cho orders, payments, inventory, coupons và token consume.
- Query theo user phải scope bằng user ID từ session.
- Model có `deletedAt` nên filter soft-delete trừ khi cố ý đọc archived data.
- Prisma `Decimal` phải convert có chủ đích trước khi serialize hoặc so sánh.
- Schema change phải đi kèm migration và cập nhật code/tests nếu ảnh hưởng active runtime model.

---

## Quốc tế hóa

- Locale hiện là `vi` và `en`; default là `vi`; prefix luôn bắt buộc.
- Ưu tiên `@/i18n/navigation` cho Link/router trong route public-facing.
- User-facing string mới nên nằm trong `messages/{vi,en}/<namespace>.json`.
- Nếu thêm namespace mới, cập nhật `src/i18n/request.ts`.
- Email link phải preserve locale khi có thể.

---

## UI và accessibility

- Dùng component/design system hiện có trước khi tạo pattern mới.
- Form control cần label hoặc accessible name rõ ràng.
- Button icon-only cần accessible label/tooltip.
- Không đưa business validation chỉ vào UI; server vẫn phải validate.
- Tránh thêm animation nặng vào listing hoặc path hot nếu không cần thiết.

---

## State management

- Cart client state nằm trong Redux Toolkit.
- Không tạo global store mới nếu state chỉ phục vụ một component nhỏ.
- Persistence guest cart đi qua `useCartPersistence`.
- Auth/cart sync đi qua `CartAuthSync` và `useCartAuthSync`.
- Không assume `AppProviders.tsx` đang được mount; layout thật dùng provider tree trong `src/app/[locale]/layout.tsx`.

---

## API Routes

- `/api/auth/[...nextauth]` là Auth.js handler.
- `/api/internal/runtime/product-repository` là metrics endpoint nội bộ, yêu cầu session và role `ADMIN` hoặc `SUPER_ADMIN`.
- API route mới phải tự kiểm tra auth/authorization vì proxy bỏ qua `/api/*`.
- Validate query/body bằng Zod hoặc parser tương đương.
- Không return secret, token, stack trace hoặc dữ liệu nội bộ không cần thiết.

---

## Kiểm thử và quality gates

Ưu tiên test cho:

- Server actions có validation/authorization.
- Logic cart merge, stock, price re-derive.
- Product filtering và repository contract.
- Auth helpers, redirect/callback URL, verification tokens.
- Bất kỳ thay đổi nào chạm DB mapping hoặc schema.

Lệnh thường dùng:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Không dùng `pnpm audit:products` hoặc `pnpm smoke:products*` như nguồn xác minh cho đến khi các file script tương ứng tồn tại.

---

## Quy tắc tài liệu

- Cập nhật docs khi đổi route, env var, command, auth flow, repository behavior hoặc domain status.
- Không ghi feature là đã implement nếu chỉ có schema/constant.
- Khi phát hiện doc lệch source, sửa doc hoặc ghi rõ limitation.
- Giữ `AGENTS.md` là bản hướng dẫn agent thực tế nhất.

---

## Checklist tự kiểm tra của AI

Trước khi kết thúc thay đổi:

- Đã đọc file liên quan trực tiếp chưa?
- Có import server-only vào client không?
- Server action đã validate trước khi đọc field chưa?
- Mutation user-scoped có lấy user ID từ session không?
- Product/cart có tin dữ liệu nhạy cảm từ client không?
- Route mới có locale prefix không?
- API mới có auth riêng không?
- Có cần cập nhật messages hoặc docs không?
- Có test phù hợp với mức rủi ro không?

---

## Ngoài phạm vi nếu không được yêu cầu

- Checkout, payment, orders UI.
- Normalized `CartItem` persistence.
- Inventory reservation.
- Admin CRUD đầy đủ.
- Global/API rate limiting toàn hệ thống.
- Full APM/observability.
- Viết các script product audit/smoke còn thiếu.

---

## Tư thế review

Khi người dùng yêu cầu review, ưu tiên bug, security risk, behavior regression và missing tests. Các finding phải đứng trước phần tóm tắt, có file/line evidence và severity rõ ràng.
