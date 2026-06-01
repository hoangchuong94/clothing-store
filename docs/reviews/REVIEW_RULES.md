# REVIEW_RULES.md — Clothing Store

Chuẩn review code cho dự án **clothing-store**. Dùng cùng [AGENTS.md](../../AGENTS.md) và [AI_RULES.md](../../AI_RULES.md).

---

## Phạm vi

Áp dụng cho PR, diff hoặc toàn bộ feature branch. Reviewer là người hoặc AI đều phải ưu tiên:

- Bug.
- Rủi ro bảo mật.
- Regression hành vi.
- Toàn vẹn dữ liệu.
- Thiếu test.
- Lệch kiến trúc so với quy ước project.

Không yêu cầu refactor ngoài phạm vi PR trừ khi phần đó gây rủi ro rõ ràng.

---

## Format báo cáo issue

Mỗi issue phải có đủ 5 trường theo thứ tự:

| Trường | Mô tả |
|--------|-------|
| **Severity** | `Critical`, `High`, `Medium`, `Low` |
| **File Path** | Đường dẫn tương đối từ repo root, ví dụ `src/features/cart/server/actions.ts` |
| **Mô tả** | Vấn đề là gì và ảnh hưởng gì |
| **Bằng chứng** | Dòng code, pattern hoặc hành vi quan sát được |
| **Khuyến nghị** | Cách sửa cụ thể |

Mẫu:

```markdown
### [Tiêu đề ngắn]

- **Severity:** Critical | High | Medium | Low
- **File Path:** `src/...`
- **Mô tả:** ...
- **Bằng chứng:** ...
- **Khuyến nghị:** ...
```

---

## Severity

### Critical

Lỗi bảo mật có thể khai thác, rò rỉ secret, mất toàn vẹn dữ liệu hoặc làm production crash ngay sau deploy.

Ví dụ:

- Import Prisma vào file `'use client'`.
- User A đọc/sửa dữ liệu cart/order của user B.
- Lưu verification token dạng plain text.
- Secret như `AUTH_SECRET`, `DATABASE_URL`, SMTP password xuất hiện trong client bundle hoặc commit.
- Mutation admin không kiểm tra quyền ở server.

Critical thường chặn merge.

### High

Rủi ro nghiêm trọng nhưng không trực tiếp như Critical, hoặc vi phạm kiến trúc bắt buộc gây bug production.

Ví dụ:

- Server Action đọc field trước khi Zod validate.
- API route mới dựa vào proxy auth dù proxy skip `/api/*`.
- Product catalog bypass repository layer.
- Checkout/order/inventory write không có transaction.
- Route locale/proxy bị bypass gây 404 hoặc sai redirect.

High nên chặn merge trừ khi team chấp nhận rủi ro bằng ticket rõ ràng.

### Medium

Vấn đề maintainability, performance, i18n, test coverage hoặc UX/a11y có thể đo được nhưng chưa gây breach ngay.

Ví dụ:

- Hardcoded user-facing string ngoài `messages/{vi,en}`.
- Duplicate full catalog read trên hot path.
- `UserServerCart.items` JSON không được validate khi đọc.
- Thiếu test cho logic thay đổi.

Medium có thể merge nếu có follow-up phù hợp.

### Low

Style, naming, docs polish, dead code nhỏ hoặc tối ưu nhỏ.

Low không nên chặn merge.

---

## Quy trình review

1. Đọc mô tả PR/ticket và xác định domain bị chạm: `auth`, `cart`, `products`, `home`, `app`, `lib`, `prisma`, `messages`, `docs`.
2. Phân loại file: server-only, client-only, shared UI, route handler, schema, test, documentation.
3. Kiểm tra security trước nếu diff chạm Server Actions, API routes, auth/session, cart, Prisma hoặc env.
4. Kiểm tra ranh giới Server/Client.
5. Kiểm tra route và locale.
6. Kiểm tra product/cart business rules.
7. Kiểm tra test và docs.
8. Báo cáo finding theo mức độ nghiêm trọng, findings đứng trước summary.

---

## Checklist nhanh

- File `'use client'` có import server-only module không?
- Prisma có nằm ngoài server/repository layer không?
- Server Action có validate input trước khi đọc field không?
- Mutation theo user có lấy `userId` từ session không?
- API route mới có auth riêng không?
- Product/cart có tin price/name/stock từ client không?
- Route mới có nằm dưới `src/app/[locale]` không?
- User-facing string mới có vào `messages/{vi,en}` không?
- Code đổi behavior có test không?
- Docs có bị lệch so với behavior mới không?

---

## Output review đề xuất

Nếu có issue:

```markdown
## Các finding

### [Tiêu đề]

- **Severity:** High
- **File Path:** `src/...`
- **Mô tả:** ...
- **Bằng chứng:** ...
- **Khuyến nghị:** ...

## Open Questions

- ...

## Tóm tắt

...
```

Nếu không có issue:

```markdown
Không tìm thấy issue blocking. Rủi ro còn lại: ...
```
