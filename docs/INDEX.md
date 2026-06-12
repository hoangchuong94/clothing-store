# Documentation Index

Entry point duy nhất cho AI và contributor khi cần biết **đọc file nào**. Source code vẫn là nguồn sự thật cuối cùng.

**Single source of truth cho issue đang mở:** [docs/planning/OPEN_ISSUES.md](./planning/OPEN_ISSUES.md)

---

## Read By Goal

### Hiểu hệ thống

- [AGENTS.md](../AGENTS.md)
- [docs/architecture/system-overview.md](./architecture/system-overview.md)

### Fix Auth

- [AGENTS.md](../AGENTS.md)
- [AI_RULES.md](../AI_RULES.md)
- [docs/architecture/auth-flow.md](./architecture/auth-flow.md)
- [docs/planning/OPEN_ISSUES.md](./planning/OPEN_ISSUES.md)
- Auth follow-ups (không nằm trong OPEN_ISSUES): [docs/reviews/SECURITY_REVIEW.md](./reviews/SECURITY_REVIEW.md) §3

### Fix Cart

- [AGENTS.md](../AGENTS.md)
- [AI_RULES.md](../AI_RULES.md)
- [docs/domain/cart.md](./domain/cart.md)
- [docs/planning/OPEN_ISSUES.md](./planning/OPEN_ISSUES.md)

### Fix Products

- [AGENTS.md](../AGENTS.md)
- [AI_RULES.md](../AI_RULES.md)
- [docs/domain/products.md](./domain/products.md)
- [docs/engineering/feature-flags.md](./engineering/feature-flags.md)

### Planning

- [docs/planning/OPEN_ISSUES.md](./planning/OPEN_ISSUES.md) — SSOT backlog active
- [docs/planning/ROADMAP.md](./planning/ROADMAP.md) — phases P0/P1/P2
- [docs/planning/REFACTOR_PLAN.md](./planning/REFACTOR_PLAN.md) — epics RF-* (gồm Done)

### Review PR

- [docs/reviews/REVIEW_RULES.md](./reviews/REVIEW_RULES.md)
- [docs/reviews/AI_REVIEW_CHECKLIST.md](./reviews/AI_REVIEW_CHECKLIST.md)

---

## Deep Reference (không đọc mỗi session)

| File | Khi nào cần |
|------|-------------|
| [PROJECT_CONTEXT.md](../PROJECT_CONTEXT.md) | Bối cảnh nghiệp vụ, auth hardening status |
| [docs/planning/PROJECT_ANALYSIS.md](./planning/PROJECT_ANALYSIS.md) | Phân tích kiến trúc + flows đầy đủ |
| [docs/reviews/FULL_PROJECT_REVIEW.md](./reviews/FULL_PROJECT_REVIEW.md) | Audit snapshot 2026-06-03 |
| [docs/reviews/ARCHITECTURE_REVIEW.md](./reviews/ARCHITECTURE_REVIEW.md) | Snapshot AR-* (archive) |
| [docs/reviews/SECURITY_REVIEW.md](./reviews/SECURITY_REVIEW.md) | Snapshot SEC-* (archive) |
| [docs/reviews/PERFORMANCE_REVIEW.md](./reviews/PERFORMANCE_REVIEW.md) | Snapshot PERF-* (archive) |

---

## Mục lục theo thư mục

| Thư mục | Vai trò |
|---------|---------|
| [architecture/](./architecture/) | Topology, auth flow, data flow |
| [domain/](./domain/) | Contract cart, products |
| [engineering/](./engineering/) | Deploy, feature flags, conventions |
| [planning/](./planning/) | OPEN_ISSUES, ROADMAP, REFACTOR_PLAN, PROJECT_ANALYSIS |
| [reviews/](./reviews/) | Quy trình review + audit snapshots |

---

## Quy ước SSOT

| Chủ đề | File |
|--------|------|
| Agent entry + feature status | `AGENTS.md` |
| Quy tắc khi sửa code | `AI_RULES.md` |
| Issue đang mở (OI-*) | `docs/planning/OPEN_ISSUES.md` |
| Lộ trình ngắn hạn | `docs/planning/ROADMAP.md` |
| Human setup | `README.md` |

Không duplicate danh sách issue trong `PROJECT_CONTEXT.md`, `docs/README.md` hoặc review snapshots — chỉ link tới `OPEN_ISSUES.md`.
