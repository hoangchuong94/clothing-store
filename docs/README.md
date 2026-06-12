# Tài liệu dự án — Clothing Store

**Entry point cho AI:** [docs/INDEX.md](./INDEX.md)

Source code là nguồn sự thật cuối cùng. Tài liệu mô tả trạng thái đã xác minh hoặc được đánh dấu rõ là kế hoạch.

---

## Root docs

| File | Vai trò |
|------|---------|
| [README.md](../README.md) | Cài đặt, scripts, build (human) |
| [AGENTS.md](../AGENTS.md) | Hướng dẫn agent + trạng thái feature |
| [AI_RULES.md](../AI_RULES.md) | Quy tắc khi sửa code |
| [PROJECT_CONTEXT.md](../PROJECT_CONTEXT.md) | Bối cảnh nghiệp vụ + auth hardening |

---

## Issue đang mở (SSOT)

**Không duplicate danh sách issue tại đây.**

- [docs/planning/OPEN_ISSUES.md](./planning/OPEN_ISSUES.md) — `OI-*` active
- [docs/planning/ROADMAP.md](./planning/ROADMAP.md) — phases P0/P1/P2
- [docs/reviews/SECURITY_REVIEW.md](./reviews/SECURITY_REVIEW.md) §3 — `SEC-*` auth follow-ups (ngoài OI list)

---

## Architecture / domain / engineering

| File | Nội dung |
|------|----------|
| [architecture/system-overview.md](./architecture/system-overview.md) | Monolith overview |
| [architecture/data-flow.md](./architecture/data-flow.md) | Product/cart/auth flows |
| [architecture/auth-flow.md](./architecture/auth-flow.md) | Auth chi tiết |
| [domain/cart.md](./domain/cart.md) | Cart contract |
| [domain/products.md](./domain/products.md) | Products + repository |
| [engineering/conventions.md](./engineering/conventions.md) | Conventions (→ `AI_RULES.md`) |
| [engineering/deployment.md](./engineering/deployment.md) | Deploy/env |
| [engineering/feature-flags.md](./engineering/feature-flags.md) | Runtime modes |

---

## Reviews / planning (reference)

| File | Vai trò |
|------|---------|
| [reviews/FULL_PROJECT_REVIEW.md](./reviews/FULL_PROJECT_REVIEW.md) | Audit snapshot 2026-06-03 |
| [reviews/REVIEW_RULES.md](./reviews/REVIEW_RULES.md) | Quy trình review PR |
| [reviews/AI_REVIEW_CHECKLIST.md](./reviews/AI_REVIEW_CHECKLIST.md) | Checklist audit |
| [reviews/ARCHITECTURE_REVIEW.md](./reviews/ARCHITECTURE_REVIEW.md) | Snapshot AR-* (archive) |
| [reviews/SECURITY_REVIEW.md](./reviews/SECURITY_REVIEW.md) | Snapshot SEC-* |
| [reviews/PERFORMANCE_REVIEW.md](./reviews/PERFORMANCE_REVIEW.md) | Snapshot PERF-* |
| [planning/PROJECT_ANALYSIS.md](./planning/PROJECT_ANALYSIS.md) | Deep dive on demand |
| [planning/REFACTOR_PLAN.md](./planning/REFACTOR_PLAN.md) | RF-* backlog |

---

## Auth hardening completed (tóm tắt)

Đã implement: shared `verifyCredentialsLogin`, auth rate limits, session revocation, metrics API role guard, cart merge ownership từ session, Prisma soft-delete filter.

Chi tiết: [PROJECT_CONTEXT.md](../PROJECT_CONTEXT.md) § Auth Hardening Status.
