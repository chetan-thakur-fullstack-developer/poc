# Project Context & Architecture

## Overview
- **Purpose:** [1-2 sentence description of what this system does and who uses it]
- **Tech Stack:** [e.g., TypeScript, Next.js 15, Node.js, PostgreSQL, Prisma, Tailwind CSS]
- **Key Directories:**
  - `src/domain/` — Pure business logic and domain models (zero framework dependencies)
  - `src/adapters/` — Database repositories, external API clients, and third-party integrations
  - `src/api/` — Route handlers, input validation, and transport-layer serialization
- Do not update my build and deploy functionality as it should be same as it is wworking as expected 
- Also apply best ui design in term of user interactive and user engamenet persecpective

## Commands
- **Dev server:** `pnpm dev`
- **Typecheck:** `pnpm typecheck`
- **Lint & Format:** `pnpm lint`
- **Unit tests:** `pnpm test`
- **Single test file:** `pnpm test <path/to/file>`
- **Build:** `pnpm build`

---

# Engineering Standards & Workflow

## 1. Execution & Planning
- **Think before coding:** For any change touching >2 files or altering data schemas/APIs, outline the plan, affected files, and edge cases before writing code.
- **Minimal diff:** Solve the exact problem without opportunistic refactoring of unrelated code unless explicitly requested.
- **Root-cause fixes:** Never mask bugs with silent fallbacks, `@ts-ignore`, or empty `catch` blocks. Fix the underlying invariant.

## 2. Architecture & Code Quality
- **Strict typing:** No `any`, unsafe type assertions (`as Foo`), or implicit `any`. Validate all external boundaries (API payloads, env vars, DB results) at runtime using [Zod / schema validator].
- **Dependency direction:** Keep business logic pure and decoupled from I/O, UI components, and ORM models.
- **Error handling:** Use explicit, typed domain errors. Never swallow errors or expose raw stack traces/internal DB errors to clients.
- **Idempotency & Concurrency:** Assume network retries and concurrent requests happen. Design mutations, webhooks, and background jobs to be idempotent.

## 3. Testing & Verification
- **Definition of Done:** A task is only complete after `typecheck`, `lint`, and relevant `test` suites pass with zero warnings.
- **Test behavior, not implementation:** Write integration and unit tests against public interfaces and observable outcomes. Avoid brittle mocks of internal methods.
- **Regression tests:** Every bug fix must include a test that fails before the fix and passes after.

## 4. Security & Guardrails
- **Never commit or log secrets:** Keep `.env` files, API keys, and PII out of source control and structured logs.
- **Protected paths (Ask before modifying):**
  - `migrations/` or database schema files
  - Authentication/authorization middleware
  - CI/CD workflows and infrastructure-as-code configs
- **Destructive commands:** Never run `rm -rf`, `git push --force`, or database reset/drop commands without explicit confirmation.

## 5. Communication Style
- Be concise and direct. Lead with the answer or diff summary.
- Flag trade-offs, technical debt, or architectural risks explicitly when spotted.
- If requirements are ambiguous in a way that affects data integrity or public APIs, ask 1–2 targeted questions before implementing.

---

# Project-Specific Gotchas & Patterns
- [Example: All timestamps in the database are stored in UTC; convert to user timezone only at the UI edge.]
- [Example: Never import `@prisma/client` inside `src/domain/`; pass repository interfaces instead.]
