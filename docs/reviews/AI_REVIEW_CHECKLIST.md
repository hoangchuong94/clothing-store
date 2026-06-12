# AI_REVIEW_CHECKLIST.md

Checklist dành cho AI reviewer trước khi approve thay đổi trong dự án **Clothing Store**.

---

## Mục đích

Checklist này không phải checklist chung chung. Nó bám vào kiến trúc hiện tại của repo để phát hiện:

- Bug bảo mật.
- Sai auth/authorization.
- Lệch ranh giới Server/Client.
- Sai logic product/cart.
- Rủi ro data integrity.
- Regression i18n.
- Regression performance.
- Thiếu test hoặc docs.

Nguồn đối chiếu chính:

- `AI_RULES.md`
- `AGENTS.md`
- `PROJECT_CONTEXT.md`
- `docs/reviews/REVIEW_RULES.md`
- `docs/reviews/ARCHITECTURE_REVIEW.md`
- `docs/reviews/SECURITY_REVIEW.md`
- `docs/reviews/PERFORMANCE_REVIEW.md`
- `docs/planning/PROJECT_ANALYSIS.md`
- `src/app/**`
- `src/features/**`
- `src/lib/**`
- `prisma/schema.prisma`

---

## Quy trình

1. Xác định domain bị chạm: `auth`, `cart`, `products`, `home`, routing, `lib`, `prisma`, `messages`, `docs`.
2. Phân loại file: server-only, client-only, shared UI, route handler, schema, test hoặc docs.
3. Chạy checklist security nếu có Server Actions, API routes, auth/session, cart, Prisma hoặc env.
4. Với mỗi issue, dẫn bằng chứng từ diff và pattern đúng trong repo.
5. Khi không chắc severity, chọn mức cao hơn cho auth, authorization, money, cart persistence, inventory hoặc token handling.
6. Xác nhận tests/docs được cập nhật khi behavior đổi.
7. Output theo format trong `REVIEW_RULES.md`.

---

## Severity

- **Critical:** rò rỉ secret, privilege escalation, cross-user data access, Prisma trong Client Component, token plain text.
- **High:** thiếu validate server-side, API không auth, bypass repository, write order/inventory thiếu transaction, hoặc thêm barrel export trỏ tới symbol chưa tồn tại.
- **Medium:** performance regression, i18n drift, missing test, JSON cart không validate, client boundary quá rộng.
- **Low:** polish, docs nhỏ, naming, dead code nhỏ.

---

## Security checklist

- Server Action có `'use server'` và validate Zod trước field access.
- User-scoped mutation lấy `userId` từ session, không lấy từ client.
- Cart/order mutation không tin `price`, `stock`, `name`, `image`, role hoặc permission từ client.
- API route mới tự kiểm tra authorization vì proxy skip `/api/*`.
- Internal/debug API không chỉ dựa vào flag bật/tắt nếu chạy production.
- Credentials auth vẫn yêu cầu active user, password, role và verified email.
- Credentials auth vẫn dùng shared `verifyCredentialsLogin()` trong cả login server action và Auth.js Credentials provider.
- Auth rate limiting vẫn reserve IP trước email trước khi chạm Prisma/bcrypt hoặc user lookup.
- Existing JWT sessions của `BANNED`/`INACTIVE` user vẫn bị invalidated qua full server `auth()`.
- Registration vẫn hash password bằng bcrypt và validate schema.
- Verification token vẫn hashed, expiry-bound và single-use.
- Resend verification vẫn giữ AuthRateLimitBucket rate limit và cooldown.
- Callback/redirect vẫn chặn open redirect.
- Không log hoặc expose password, password hash, `AUTH_SECRET`, `DATABASE_URL`, SMTP password, verification token đầy đủ hoặc raw JWT/session token.
- Admin/server mutation kiểm tra role/scope ở server.

---

## Server/Client boundary checklist

- File `'use client'` không import `@/lib/server/*`, Prisma, repository implementation, auth config hoặc email server module.
- Prisma chỉ nằm trong server-only path.
- Business rules không nằm trong presentational component.
- Client Component mới có lý do rõ ràng: hook, browser API, Redux, NextAuth client session, Radix interaction hoặc animation.
- Không biến layout thành Client Component nếu không cần.
- Edge/proxy code không import Prisma hoặc Node-only module.

---

## Architecture checklist

- Page mới nằm dưới `src/app/[locale]/...`.
- Không claim route constant là đã implement page nếu không có `page.tsx`.
- Nếu đổi route protection, cập nhật đúng nơi enforcement thực tế.
- `/dashboard` vẫn được guard trong `(admin)/layout.tsx`.
- Feature code nằm đúng feature folder.
- Shared UI nằm trong `src/components`.
- Provider tree khớp `src/app/[locale]/layout.tsx`.
- Không thêm checkout/order/admin CRUD nửa vời thiếu module boundary, validation, auth, transaction, tests và docs.
- README/package scripts trỏ tới file tồn tại.

---

## Database checklist

- Prisma read/write đi qua singleton server.
- Multi-step write cần atomicity dùng `prisma.$transaction`.
- Query theo user scope bằng user ID từ session.
- Soft-deletable models filter `deletedAt` khi cần.
- Product public reads trong Prisma repository filter `deletedAt: null`.
- Prisma `Decimal` được convert có chủ đích.
- Schema change có migration và update code/tests.
- Không coi schema-only domain là feature runtime.
- Không dùng raw SQL string concat.

---

## Product catalog checklist

- Catalog read đi qua product server layer.
- App-level product ID vẫn là slug `prod-00x`.
- Static catalog, seed và canonical IDs đồng bộ.
- Không bypass repository trong page/component.
- Nếu thêm DB filter/pagination, cập nhật repository contract và tests.
- Nếu thêm product writes, có cache invalidation.

---

## Cart checklist

- Guest cart chỉ localStorage/Redux.
- Auth cart persist vào `UserServerCart`.
- `mergeCart` dùng session user ID.
- `MergeCartSchema` không yêu cầu client `userId`.
- Server re-derive product data.
- Không nhầm `CartItem` model với runtime JSON cart.
- Nếu đổi merge/update/remove, có tests cho conflict, stock và rollback.

---

## i18n checklist

- Route public-facing có locale.
- Link/router ưu tiên `@/i18n/navigation`.
- User-facing string có trong `messages/{vi,en}`.
- Namespace mới được thêm vào `src/i18n/request.ts`.
- Auth/email redirect giữ locale khi hợp lý.

---

## Performance checklist

- Không mở rộng client boundary không cần thiết.
- Không thêm `framer-motion` vào dense listing/hot path nếu không có lý do.
- Tránh duplicate full catalog reads.
- Prisma list không over-fetch quá mức.
- Cân nhắc `cache()`, `unstable_cache`, Suspense hoặc loading state khi phù hợp.

---

## Testing checklist

- Logic server mới có unit test hoặc integration-style test phù hợp.
- Auth/cart/product repository changes có test.
- Schema/mapping changes có test hoặc migration verification.
- Không claim đã chạy test nếu chưa chạy.

---

## Documentation checklist

- Docs cập nhật khi đổi route, env, command, auth flow, cart/product behavior hoặc repository mode.
- Không để README trỏ tới script/doc không tồn tại.
- Nếu feature chưa đã implement, ghi rõ là chưa đã implement.

---

## Format output

Các finding phải đứng trước phần tóm tắt. Mỗi issue dùng format:

```markdown
### [Tiêu đề]

- **Severity:** High
- **File Path:** `src/...`
- **Mô tả:** ...
- **Bằng chứng:** ...
- **Khuyến nghị:** ...
```
