# DOC 0.3 — AI Code Generator

**Document ID:** 0.3
**Title:** AI Code Generator — Code Production Workflow & Quality Gates
**Version:** 1.0.0
**Status:** Approved
**Owner:** AI Engineering Process
**Date:** 2026-07-13
**Purpose:** Define how all EduOMR code is generated: workflow, layering, quality gates, and the definition of runnable.

---

## 1. Preconditions

- No code before Phase 2 is fully approved (Absolute Rule 1).
- Modules are built in the exact CLAUDE.md build order (Phase A → H). No skipping, no merging.

## 2. Generation Workflow

1. Confirm phase and module name.
2. Generate ALL files for the module completely — immediately runnable, no placeholders.
3. Explain key decisions briefly (options, chosen, rationale).
4. State how to test it (exact commands).
5. Wait for `NEXT` before proceeding.

## 3. Mandatory Structure

Every backend module follows the layered architecture:

```
Controller → Service → Repository → Infrastructure
```

- Controller: parse + Zod-validate input, call service, return response util shape.
- Service: business logic only — no HTTP, no direct DB.
- Repository: DB queries only — every tenant-scoped query includes `tenant_id`.
- Infrastructure: external connections only.

File set per module: `<name>.routes.js`, `<name>.controller.js`, `<name>.service.js`, `<name>.repository.js`, `<name>.validation.js`.

## 4. Quality Gates (all must pass before presenting)

| Gate | Check |
|---|---|
| Lint | `npm run lint` — 0 errors, 0 warnings |
| Tests | `npm test` — all green; new logic ships with at least one test |
| Standards | DOC 0.12 coding standards (naming, async/await, named exports, <40-line functions) |
| Security | DOC 0.5 checklist — tenant scoping, RBAC on every route, no secrets in code |
| Integrity | EI-1..EI-6 — no answer keys or scores client-side |
| Response shape | success/error/paginated envelopes from `response.util.js` |

## 5. Prohibitions

- No hardcoded config — everything through validated `env.js`.
- No new dependencies when stdlib or an installed dependency covers the need.
- No empty catch blocks; no `.then()` chains; no `var`; no default exports.
- No DB query without `tenant_id` on tenant-scoped tables.
- Background jobs must be idempotent (keyed job IDs).
