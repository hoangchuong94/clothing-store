# ROADMAP.md — Clothing Store

Lộ trình xử lý issue mở từ Full Project Audit (2026-06-03), căn theo [OPEN_ISSUES.md](./OPEN_ISSUES.md).

**SSOT open issues:** [OPEN_ISSUES.md](./OPEN_ISSUES.md) — không duplicate danh sách issue tại đây; bảng dưới chỉ link OI.

**Nguồn audit:** [docs/reviews/FULL_PROJECT_REVIEW.md](../reviews/FULL_PROJECT_REVIEW.md)  
**Index AI:** [docs/INDEX.md](../INDEX.md)  
**Kế hoạch refactor:** [REFACTOR_PLAN.md](./REFACTOR_PLAN.md)  
**Phân tích sâu:** [PROJECT_ANALYSIS.md](./PROJECT_ANALYSIS.md)

---

## Mục tiêu theo giai đoạn

| Giai đoạn | Mục tiêu | Readiness sau phase |
|-----------|----------|---------------------|
| **P0** | Toàn vẹn cart + CI xanh | Staging-ready cho auth/cart demo |
| **P1** | Routing/i18n/API guardrails nhất quán | Giảm 404 và lệch locale |
| **P2** | Performance catalog + DX/docs | Sẵn sàng mở rộng catalog |

**Không nằm trong roadmap này:** checkout, orders UI, inventory reservation, global API rate limit (commerce epic riêng — xem REFACTOR_PLAN RF-101).

---

## P0 — Security / data integrity / CI (làm trước)

**Thời gian gợi ý:** 1–2 sprint ngắn (vài ngày dev)

| Issue ID | Severity | Việc cần làm | Acceptance criteria |
|----------|----------|--------------|---------------------|
| [OI-001](./OPEN_ISSUES.md#oi-001--mergecart-không-xác-thực-tồn-kho-sau-merge) | High | Sau `mergeCart`, validate từng dòng bằng `checkStock`; cap/remove item vượt stock; không tin `userItem.stock` JSON | Test merge: guest qty + user qty không vượt stock server; manual QA login → merge |
| [OI-002](./OPEN_ISSUES.md#oi-002--userservercartitems-đọc-từ-db-không-qua-zod) | Medium | Zod schema cho `CartItem[]` khi read/write `UserServerCart` | Invalid JSON → empty cart hoặc lỗi có kiểu; unit test `db.ts` |
| [OI-003](./OPEN_ISSUES.md#oi-003--ci-lint-fail-pnpm-lint) | Medium | Sửa `no-explicit-any` trong test; dọn unused `trigger` | `pnpm lint` PASS trên CI |

**Thứ tự đề xuất trong P0:** OI-003 → OI-002 → OI-001 (CI trước; cart integrity cuối vì phụ thuộc schema parse).

**REFACTOR_PLAN overlap:** RF-201 (OI-002), RF-003/RF-108 liên quan catalog nhưng không thuộc P0 issue list.

---

## P1 — Routing, i18n, API guardrails

**Thời gian gợi ý:** 1 sprint

| Issue ID | Severity | Việc cần làm | Acceptance criteria |
|----------|----------|--------------|---------------------|
| [OI-004](./OPEN_ISSUES.md#oi-004--route-cart-protected-nhưng-chưa-có-page) | Medium | **Chọn một:** thêm `src/app/[locale]/(home)/cart/page.tsx` **hoặc** bỏ `/cart` khỏi `PROTECTED_ROUTES` đến khi có page | Không còn protected route dẫn tới 404 |
| [OI-005](./OPEN_ISSUES.md#oi-005--redirect-sau-auth-có-thể-mất-locale-prefix) | Medium | `useAuthRedirect` dùng `@/i18n/navigation` | Redirect sau login luôn có prefix `vi`/`en` |
| [OI-006](./OPEN_ISSUES.md#oi-006--mọi-api-bypass-proxy-auth) | Low | Checklist + template (hoặc helper) cho API route mới; rà soát `src/app/api/**` | Mọi route có auth doc trong code hoặc REVIEW_RULES |
| [OI-007](./OPEN_ISSUES.md#oi-007--linknavigation-lệch-chuẩn-i18n-nextlink-nextnavigation) | Medium | Thay `next/link` / `next/navigation` bằng `@/i18n/navigation` ở file liệt kê | Grep không còn deviation ở auth footer/products filter (trừ case được document) |

**Thứ tự đề xuất:** OI-005 + OI-007 (cùng theme i18n) → OI-004 → OI-006.

**REFACTOR_PLAN overlap:** RF-206 (OI-004), RF-207 (OI-005, OI-007), RF-004 (OI-006), RF-102 (access constants — epic rộng hơn).

---

## P2 — Performance / DX / observability

**Thời gian gợi ý:** 1–2 sprint (song song feature work được)

| Issue ID | Severity | Việc cần làm | Acceptance criteria |
|----------|----------|--------------|---------------------|
| [OI-008](./OPEN_ISSUES.md#oi-008--catalog-filter-sau-full-list-read) | Medium | Đẩy filter/pagination xuống repository; hoặc `React.cache()` + single fetch/request | Products page không gọi duplicate full list; metric/request giảm |
| [OI-009](./OPEN_ISSUES.md#oi-009--packagejson-scripts-trỏ-file-không-tồn-tại) | Medium | Thêm `scripts/*.ts` **hoặc** xóa script khỏi `package.json` + cập nhật README/AGENTS | `pnpm audit:products` / smoke hoặc script bị gỡ có doc rõ |
| [OI-010](./OPEN_ISSUES.md#oi-010--authlogger-ghi-email-pii-ra-console) | Low | Redact/hash email trong production logs; giữ debug chi tiết chỉ `NODE_ENV=development` | Không log email plain trong production build |

**REFACTOR_PLAN overlap:** RF-003, RF-108, RF-222 (OI-008); RF-212 (OI-009); RF-306 (OI-010).

---

## Timeline tổng hợp

```text
Tuần 1–2   [P0] OI-003, OI-002, OI-001
Tuần 3–4   [P1] OI-005, OI-007, OI-004, OI-006
Tuần 5+    [P2] OI-008, OI-009, OI-010 (có thể xen kẽ)
Song song  Commerce epic (RF-101) — ngoài OPEN_ISSUES hiện tại
```

---

## Phụ thuộc

```text
OI-002 (Zod cart JSON) ──► hỗ trợ an toàn khi sửa OI-001 (merge validation)
OI-003 (lint) ──► không block PR khác
OI-005, OI-007 ──► nên gom một PR i18n navigation
OI-008 ──► độc lập; lợi khi bật PRISMA catalog production
```

---

## Đánh giá readiness (tham chiếu audit)

| Mức | Trước P0 | Sau P0 | Sau P1 | Sau P2 |
|-----|----------|--------|--------|--------|
| MVP | Có | Có | Có | Có |
| Staging Ready | Gần | **Có** (auth/cart) | Có | Có |
| Production Ready | Chưa | Gần | Gần | **Có** (storefront) |
| Production Commerce | Không | Không | Không | Không (cần checkout epic) |

---

## Theo dõi tiến độ

| Priority | Tổng issue | Open | Resolved |
|----------|------------|------|----------|
| P0 | 3 | 3 | 0 |
| P1 | 4 | 4 | 0 |
| P2 | 3 | 3 | 0 |

Cập nhật bảng trên khi đóng issue trong [OPEN_ISSUES.md](./OPEN_ISSUES.md).

**Quy ước PR:** Ghi `OI-###` trong title/body PR (ví dụ `fix(cart): validate stock on merge OI-001`).

---

## Tài liệu liên quan

- [OPEN_ISSUES.md](./OPEN_ISSUES.md) — chi tiết từng issue
- [REFACTOR_PLAN.md](./REFACTOR_PLAN.md) — backlog rộng (RF-*), gồm item đã Done
- [docs/reviews/REVIEW_RULES.md](../reviews/REVIEW_RULES.md) — severity
- [AGENTS.md](../../AGENTS.md) — trạng thái feature thực tế
