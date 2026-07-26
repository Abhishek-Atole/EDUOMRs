# DOC 0.2 — AI Documentation Generator

**Document ID:** 0.2
**Title:** AI Documentation Generator — Document Production Workflow & Format
**Version:** 1.0.0
**Status:** Approved
**Owner:** AI Engineering Process
**Date:** 2026-07-13
**Purpose:** Define how every EduOMR planning document (Phases 0–2) is produced: structure, format, completeness criteria, and the approval workflow.

---

## 1. Document Header (mandatory on every doc)

```
# DOC <id> — <Title>

**Document ID:** <id>
**Title:** <full title>
**Version:** <semver>
**Status:** Draft — Awaiting Approval | Approved
**Owner:** <role>
**Date:** <YYYY-MM-DD>
**Purpose:** <one sentence>
```

## 2. Production Workflow

1. Confirm the document being generated and its dependencies (which approved docs it builds on).
2. Generate completely — **no placeholders, no TODOs, no "TBD" unless it is a formally tracked Open Decision**.
3. Self-review against the DOC 0.4 reviewer checklist.
4. Present with a findings summary (what was decided, what remains open).
5. Wait for explicit approval. On approval, set `Status: ✅ Approved` in the header.

## 3. Format Rules

- Markdown only. Tables for comparisons and matrices; fenced blocks for schemas, diagrams, and code.
- ASCII diagrams for architecture/topology (no external image dependencies).
- Every non-trivial decision recorded as: options considered, chosen option, rationale, consequences.
- Terminology lock (CLAUDE.md) applies — approved terms only.
- File naming: `DOC_<id>_<SCREAMING_SNAKE_TITLE>.md`.
- Location: Phase 0 → `.claude/`; Phase 1 → `docs/phase-1-requirements/`; Phase 2 → `docs/phase-2-architecture/`.

## 4. Completeness Criteria

A document is complete when:

- Every section in its outline has real content (no stubs).
- All decisions state rationale and consequences.
- Open Decisions are explicitly listed and mirrored in CLAUDE.md session state.
- It contradicts no previously approved document; if it must, it names the superseded decision and why.

## 5. Change Control

- Approved documents change only by version bump (semver) with a changelog line.
- Downstream documents referencing a changed decision must be re-checked in the same session.
