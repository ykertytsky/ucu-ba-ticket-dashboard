<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know
This repo uses Next.js `16.2.2`, React `19.2.4`, TypeScript `5`, ESLint `9`, and Tailwind CSS `4`.
Read the relevant guide in `node_modules/next/dist/docs/` before changing framework behavior.
Do not assume older App Router examples are still correct.
<!-- END:nextjs-agent-rules -->

# AGENTS.md
## Purpose
This is the primary guide for coding agents in this repository.
`CLAUDE.md` contains only `@AGENTS.md`, so keep this file current.

## Product Brief
- Product: UCU IT Helpdesk Dashboard.
- Core workflow: upload HESK SpreadsheetML XML, parse server-side, persist in SQLite, expose analytics.
- Primary users: Helpdesk Manager, IT Director, individual agents.
- Main views: Overview, Ticket Explorer, Agent Performance, Category Analysis, Trends, Data Quality.
- Non-goals for v1: real-time HESK API sync, auth, AI narratives, email/PDF export, mobile-first polish.

## Current Repo Vs Target
- Current repo is a minimal Next.js App Router starter app.
- Package manager is `pnpm`.
- There is no DB layer, no test runner, and no shadcn/ui setup yet.
- Target architecture from the spec is a self-hosted dashboard with SQLite persistence.
- Planned stack includes `better-sqlite3`, Drizzle ORM, shadcn/ui, Recharts, SWR, TanStack Table, `date-fns`, `react-dropzone`, Lucide, Docker Compose, and Caddy.
- Planned runtime structure includes `src/app`, `src/app/api`, `src/db`, `src/components`, `src/lib`, and `src/hooks`.
- Trust the checked-in repo for installed tooling and framework versions.
- Trust the spec for product behavior, data rules, page requirements, and API intent.
- Ask instead of guessing when those two sources conflict in a way that changes behavior.

## Rule Files
- Repo guidance file: `AGENTS.md`.
- `CLAUDE.md` is present and points here.
- No Cursor rules were found in `.cursor/rules/`.
- No `.cursorrules` file is present.
- No Copilot rules were found in `.github/copilot-instructions.md`.

## Commands
- Install dependencies: `pnpm install`
- Start dev server: `pnpm dev`
- Start dev server on another port: `pnpm next dev --port 3001`
- Lint repo: `pnpm lint`
- Lint one file: `pnpm exec eslint app/page.tsx`
- Lint one directory: `pnpm exec eslint app`
- Type-check: `pnpm exec tsc --noEmit`
- Generate route types then type-check: `pnpm exec next typegen && pnpm exec tsc --noEmit`
- Production build: `pnpm build`
- Start production server: `pnpm start`
- Debug build: `pnpm exec next build --debug`
- Debug specific build paths: `pnpm exec next build --debug-build-paths=/`
- Verified in this repo: `pnpm lint`, `pnpm exec tsc --noEmit`, and `pnpm build` all pass.

## Tests
- There is no `test` script in `package.json`.
- No test framework dependency is installed.
- No `*.test.*` or `*.spec.*` files exist.
- There is currently no valid repo-native command for full-suite, single-file, or single-test execution.
- Do not invent `vitest`, `jest`, `playwright`, or other test commands unless that tooling is actually added.
- If you add a test stack, update this file with full-suite, single-file, single-test, and watch-mode commands.

## Working Principles
- Make the smallest correct change.
- Preserve structure unless refactoring is clearly needed.
- Prefer repo conventions over generic framework advice.
- Prefer `pnpm` examples over `npm` or `yarn`.
- Read current Next 16 docs before changing framework-level behavior.
- Keep zero external-service assumptions unless the user changes the project scope.

## Product Rules
- Source data is HESK SpreadsheetML XML and must be parsed server-side.
- Persist ticket data in SQLite; do not assume an external DB service.
- Use `trackingId` as the natural ticket key and support upsert on re-import.
- Store timestamps as ISO strings if they live in SQLite text columns.
- Compute `resolutionTimeHours` at insert time, not on every read.
- Parse `timeTracked HH:MM:SS` into integer seconds at insert time.
- Batch deletes must cascade to related tickets.
- Column 4, `Перша відповідь о`, is broken in the sample and must not be stored or used for SLA metrics.
- Columns 24-26, SEDO fields, are empty and should be skipped.
- Sparse duplicate `Тип звернення` style columns should be skipped except the primary mapped one.
- Time tracking exists on about 46% of tickets; always caveat metrics derived from it.
- Open tickets are anything not in resolved status.
- Average resolution time excludes negative values and values above 720 hours.
- Period-over-period deltas only make sense when adjacent historical periods exist.
- Data Quality must surface known issues instead of hiding them.

## Expected App Areas
- `/dashboard` for Overview.
- `/dashboard/tickets`
- `/dashboard/agents`
- `/dashboard/categories`
- `/dashboard/trends`
- `/dashboard/data-quality`
- `/api/upload`, `/api/tickets`, `/api/metrics`, `/api/batches`, `/api/health`
- Prefer the approved route names and directory layout from the spec when building toward the target app.

## Code Style
### Imports
- Use ES modules.
- Prefer `import type` for type-only imports.
- Keep external imports before local imports.
- Keep side-effect CSS imports last in the import block.
- Use the `@/*` alias when internal paths get deep.
- Do not leave unused imports.

### Formatting
- Use 2-space indentation.
- Use double quotes.
- Use semicolons.
- Keep JSX readable; wrap long props instead of compressing them.
- No Prettier config exists, so preserve the current formatting style.

### Types
- TypeScript is `strict`; keep it strict.
- Avoid `any`.
- Prefer framework-provided types such as `Metadata`.
- Use explicit prop types for React components.
- `Readonly<{ ... }>` props are acceptable and already used in `app/layout.tsx`.
- Do not suppress type errors without a strong documented reason.

### Naming
- `PascalCase` for components and types.
- `camelCase` for functions and variables.
- Keep exact Next file names such as `page.tsx`, `layout.tsx`, `route.ts`, and `error.tsx`.
- Use `kebab-case` for route segments, asset names, and CSS custom properties.

### React And Next
- Default to Server Components in `app/`.
- Add `"use client"` only when state, refs, effects, browser APIs, or event handlers require it.
- Prefer Next primitives such as `next/image`, metadata exports, route handlers, `redirect()`, and `notFound()`.
- Route components should remain default exports.
- Do not add manual `useMemo` or `useCallback` by default; Next 16 React Compiler guidance reduces the need for them.

### Styling And UI
- Prefer Tailwind utilities for component-level styling.
- Keep shared tokens in global CSS.
- Reuse existing CSS variables before inventing new ones.
- Preserve accessibility and keyboard behavior.
- Use meaningful `alt` text and `rel="noopener noreferrer"` for external links opened in new tabs.
- Once shadcn/ui is added, stay consistent with its patterns.

### Error Handling
- Do not swallow errors silently.
- Fail fast on unexpected states.
- Surface actionable errors in API routes.
- Prefer framework-native boundaries such as `error.tsx` and `not-found.tsx`.
- Keep logs short and production-appropriate.

### Comments
- Prefer self-explanatory code.
- Add comments only for non-obvious intent or constraints.
- Keep comments short and factual.

## Validation Before Finishing
- For most code changes, run `pnpm lint` and `pnpm build`.
- If the change is type-focused or touches route typing, also run `pnpm exec next typegen && pnpm exec tsc --noEmit`.

## Open Questions To Escalate
- Ukrainian vs English UI labels.
- Whether `Перша відповідь о` is broken in all exports or only the sample.
- Whether SEDO fields will ever be populated.
- The deployment domain for `Caddyfile`.
- Whether auth is still out of scope.
