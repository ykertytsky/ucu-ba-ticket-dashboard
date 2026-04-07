Here's the complete consolidated spec — everything from all amendments merged into one authoritative document:

---

# UCU IT Helpdesk Dashboard — Final Project Specification

**Version:** 2.0 (Final) | **Date:** April 2026 | **Language**: Ukrainian

---

## 1. Problem Statement

UCU IT support team operates blind. Ticket operations data lives in HESK exports that require manual Excel work to interpret. This dashboard closes that loop: periodic XML upload → persistent SQLite storage → operational intelligence across 6 purpose-built views.

---

## 2. Goals & Non-Goals

**Goals:**
- Upload HESK XML exports → parse server-side → persist in SQLite
- KPI tracking with period-over-period deltas as data accumulates
- Agent performance, category analysis, resolution health visibility
- Usable by non-technical helpdesk managers without training
- Self-hosted, zero external service dependencies

**Non-Goals (v1):**
- Real-time HESK API integration
- Multi-user auth
- Mobile-first layout
- AI-generated narratives
- PDF/email digest export

---

## 3. User Personas

| Persona | Role | Primary Question |
|---|---|---|
| Helpdesk Manager | Primary user, owns ops | Are we resolving fast enough? Who's overloaded? |
| IT Director | Oversight, monthly reviews | What are top problem categories? Trends? |
| Agent | Secondary | How many open tickets do I have? |
| Dean Office | Primary | How is our helpdesk performing? What is executive summary on their performance? |

---

## 4. Tech Stack

| Layer | Choice | Rationale |
|---|---|---|
| Framework | Next.js 15 (App Router, `output: 'standalone'`) | Self-contained server.js for Docker |
| UI | shadcn/ui + Tailwind CSS | Consistent, accessible, no license issues |
| Charts | Recharts | Native shadcn palette integration |
| DB Driver | `better-sqlite3` | Fastest Node.js SQLite driver, synchronous |
| ORM | Drizzle ORM (`drizzle-orm/better-sqlite3`) | Type-safe, lightweight, great migrations |
| Migrations | `drizzle-kit` | Schema push dev / migration files prod |
| Data Fetching | SWR | Vercel-native, `keepPreviousData` for filter UX |
| Filter State | URL search params (`useSearchParams`) | Bookmarkable, shareable filter state |
| Tables | TanStack Table v8 | Powers shadcn DataTable |
| Date handling | `date-fns` | Lightweight, tree-shakeable |
| Upload | `react-dropzone` | Accessible, minimal |
| Icons | Lucide React | Ships with shadcn |
| Process | Docker Compose | App container + Caddy container |
| Reverse Proxy | Caddy 2 | Auto SSL, zero config |
| Package Manager | pnpm | Faster installs, disk efficient |

**No external services. No auth. No cloud DB. No paid components.**

---

## 5. Data Model

### 5.1 Source Data Facts (HESK XML)

- Format: SpreadsheetML XML (Excel-compatible)
- Dataset: 367 tickets, 38 columns, March 2026 sample
- Language: Ukrainian
- Known data issues carried into spec:
  - `Перша відповідь о` (col 4) = export timestamp on all rows — **unusable for SLA**, never display first-response-time metrics
  - `Статус користувача в СЕДО` (cols 24–26) = 0% fill — skip entirely
  - `Тип звернення` appears 3× (cols 27, 28, 30) — category-specific subcategories, <5% fill each
  - Time tracking: 46% fill rate — always caveat metrics derived from it

### 5.2 Column Mapping

| Col | Ukrainian Header | Field | Notes |
|---|---|---|---|
| 0 | # | `ticketNumber` | Int |
| 1 | Ідентифікатор | `trackingId` | Primary key |
| 2 | Дата | `createdAt` | DateTime |
| 3 | Оновлено | `updatedAt` | DateTime |
| 4 | Перша відповідь о | — | **Do not store** — broken field |
| 5 | Вирішено | `resolvedAt` | DateTime, nullable |
| 6 | Ім'я та Прізвище | `requesterName` | |
| 7 | Email | `requesterEmail` | |
| 8 | Підписники | — | Skip — sparse, no dashboard use |
| 9 | Категорія | `category` | 12 distinct values |
| 10 | Пріоритет | `priority` | 4 levels |
| 11 | Статус | `status` | 6 states |
| 12 | Тема | `subject` | Free text |
| 13 | Повідомлення | `body` | Free text |
| 14 | Виконавець | `assignee` | 14 agents in sample |
| 15 | Відповіді | `totalReplies` | Int |
| 16 | Відповіді (Співробітник) | `staffReplies` | Int |
| 17 | Відстеження часу | `timeTrackedSeconds` | Parse HH:MM:SS → int seconds at insert |
| 18 | Термін виконання | `dueDate` | DateTime, nullable |
| 19 | Дата події | `eventDate` | Event-support tickets only |
| 20 | Час події | `eventTime` | String (e.g. "13:30-15:00") |
| 21 | Локація | `location` | 8 UCU buildings |
| 22 | Кімната | `room` | Room number string |
| 23 | Програма/система | `program` | 8 distinct values, 72/367 filled |
| 24–26 | СЕДО fields | — | **Skip** — 0% fill |
| 27 | Тип звернення | `requestType` | Most populated subcategory col |
| 28–30 | Тип звернення (×2), Аплікація | — | Skip — too sparse |
| 31 | Оберіть Академію | `academy` | 14/367 filled |
| 32–36 | LMS Moodle, URL, Phone, IP, Phone | — | Skip — too sparse or duplicate |
| 37 | URL-адреса звернення | `ticketUrl` | Always populated |

### 5.3 Drizzle Schema

```typescript
// src/db/schema.ts
import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

export const batches = sqliteTable('batches', {
  id:          text('id').primaryKey(),        // uuid
  filename:    text('filename').notNull(),
  uploadedAt:  text('uploaded_at').notNull(),  // ISO string
  periodStart: text('period_start').notNull(), // min(createdAt) in file
  periodEnd:   text('period_end').notNull(),   // max(createdAt) in file
  ticketCount: integer('ticket_count').notNull(),
});

export const tickets = sqliteTable('tickets', {
  trackingId:          text('tracking_id').primaryKey(),
  ticketNumber:        integer('ticket_number'),
  createdAt:           text('created_at').notNull(),
  updatedAt:           text('updated_at'),
  resolvedAt:          text('resolved_at'),
  requesterName:       text('requester_name'),
  requesterEmail:      text('requester_email'),
  category:            text('category'),
  priority:            text('priority'),
  status:              text('status'),
  subject:             text('subject'),
  body:                text('body'),
  assignee:            text('assignee'),
  totalReplies:        integer('total_replies').default(0),
  staffReplies:        integer('staff_replies').default(0),
  timeTrackedSeconds:  integer('time_tracked_seconds').default(0),
  dueDate:             text('due_date'),
  eventDate:           text('event_date'),
  eventTime:           text('event_time'),
  location:            text('location'),
  room:                text('room'),
  program:             text('program'),
  requestType:         text('request_type'),
  academy:             text('academy'),
  ticketUrl:           text('ticket_url'),
  resolutionTimeHours: real('resolution_time_hours'), // computed at insert
  batchId:             text('batch_id')
                         .references(() => batches.id, { onDelete: 'cascade' }),
});
```

**Schema decisions:**
- `trackingId` as PK — natural dedup, upsert on re-import
- `timeTracked` stored as seconds integer — no string parsing at query time
- `resolutionTimeHours` computed at insert — not on every read
- `batchId` FK with CASCADE DELETE — delete batch → tickets gone
- All timestamps as ISO strings — SQLite has no native datetime; ISO sorts correctly as strings
- `Перша відповідь о` not stored at all — prevents accidental misuse

---

## 6. Project Structure

```
/
├── docker-compose.yml
├── Dockerfile
├── Caddyfile
├── entrypoint.sh
├── drizzle.config.ts
├── next.config.ts
├── data/                          ← host volume mount (gitignored)
│   └── helpdesk.db
└── src/
    ├── app/
    │   ├── layout.tsx
    │   ├── page.tsx               → redirect to /dashboard
    │   └── dashboard/
    │       ├── layout.tsx         → sidebar + topbar shell
    │       ├── page.tsx           → Overview
    │       ├── tickets/
    │       │   └── page.tsx       → Ticket Explorer
    │       ├── agents/
    │       │   └── page.tsx       → Agent Performance
    │       ├── categories/
    │       │   └── page.tsx       → Category Analysis
    │       ├── trends/
    │       │   └── page.tsx       → Historical Trends
    │       └── data-quality/
    │           └── page.tsx       → Data Quality Report
    ├── app/api/
    │   ├── upload/route.ts        → POST: parse XML + bulk upsert
    │   ├── tickets/route.ts       → GET: filtered paginated tickets
    │   ├── batches/
    │   │   ├── route.ts           → GET: list batches
    │   │   └── [id]/route.ts      → DELETE: remove batch + cascade
    │   ├── metrics/route.ts       → GET: aggregated metrics
    │   └── health/route.ts        → GET: Docker healthcheck
    ├── db/
    │   ├── schema.ts
    │   ├── index.ts               → better-sqlite3 + Drizzle client
    │   ├── migrate.ts             → run at container startup
    │   └── migrations/            → drizzle-kit generated files
    ├── components/
    │   ├── layout/
    │   │   ├── Sidebar.tsx
    │   │   ├── Topbar.tsx
    │   │   └── PageHeader.tsx     → dynamic title + active filter pills
    │   ├── upload/
    │   │   ├── UploadZone.tsx
    │   │   └── BatchHistory.tsx
    │   ├── filters/
    │   │   └── GlobalFilterBar.tsx
    │   ├── charts/                → thin Recharts wrappers
    │   │   ├── BarChart.tsx
    │   │   ├── DonutChart.tsx
    │   │   ├── LineChart.tsx
    │   │   └── HeatmapChart.tsx
    │   └── cards/
    │       ├── KpiCard.tsx
    │       └── NarrativeBox.tsx
    ├── lib/
    │   ├── parser/
    │   │   └── hesk-xml.ts        → XML → Ticket[] (runs server-side)
    │   └── analytics/
    │       └── metrics.ts         → all derived metric computations
    └── hooks/
        ├── useTickets.ts          → SWR → /api/tickets
        └── useMetrics.ts          → SWR → /api/metrics
```

---

## 7. API Routes

### `POST /api/upload`
```
Request: multipart/form-data { file: XML }
Process:
  1. Parse XML server-side (Node DOMParser)
  2. Extract period range (min/max createdAt)
  3. Create batch record
  4. Compute resolutionTimeHours per ticket
  5. Parse timeTracked HH:MM:SS → seconds
  6. INSERT OR REPLACE tickets (natural dedup by trackingId)
Response: {
  batchId: string,
  ticketCount: number,
  periodStart: string,
  periodEnd: string,
  duplicatesUpdated: number
}
```

### `GET /api/tickets`
```
Query params:
  category, priority, status, assignee  → array, multi-value
  dateFrom, dateTo                       → ISO strings
  search                                 → text search on subject + body
  page, limit                            → pagination (default limit: 50)
Response: {
  tickets: Ticket[],
  total: number,
  page: number
}
```

### `GET /api/metrics`
```
Query params: same filter set as /api/tickets
Response: {
  totalTickets: number,
  resolutionRate: number,
  avgResolutionHours: number,
  openTickets: number,
  unassigned: number,
  byCategory: { category: string, count: number }[],
  byStatus:   { status: string, count: number }[],
  byPriority: { priority: string, count: number }[],
  byAgent:    { assignee: string, count: number, resolved: number,
                avgResolutionHours: number, timeTrackedMinutes: number }[],
  dailyVolume: { date: string, count: number }[],
  dataQualityScore: number,
  dataQualityRules: DataQualityRule[]
}
```

### `GET /api/batches`
```
Response: { batches: Batch[] }
```

### `DELETE /api/batches/:id`
```
Cascades to tickets via FK. Response: { deleted: true }
```

### `GET /api/health`
```
Response: { status: 'ok' }   ← Docker healthcheck target
```

---

## 8. DB Client & Startup

```typescript
// src/db/index.ts
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema';
import path from 'path';

const DB_PATH = process.env.DB_PATH
  ?? path.join(process.cwd(), 'data', 'helpdesk.db');

const sqlite = new Database(DB_PATH);
sqlite.pragma('journal_mode = WAL');   // concurrent reads during writes
sqlite.pragma('foreign_keys = ON');
sqlite.pragma('synchronous = NORMAL');

export const db = drizzle(sqlite, { schema });
```

```typescript
// src/db/migrate.ts  — runs at container startup before server
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { db } from './index';
import path from 'path';

migrate(db, { migrationsFolder: path.join(__dirname, '../../migrations') });
console.log('[db] migrations complete');
```

---

## 9. Canonical Metric Definitions

All computed in `src/lib/analytics/metrics.ts` or as SQL aggregations in `/api/metrics`:

```
Resolution Rate (%)
  = count(resolvedAt IS NOT NULL) / count(*) * 100

Avg Resolution Time
  = mean(resolutionTimeHours)
  — exclude: resolutionTimeHours > 720 (30d cap, data anomalies)
  — exclude: resolutionTimeHours < 0 (data error)

Open Tickets
  = count(status NOT IN ('Вирішене'))

Unassigned
  = count(assignee IS NULL OR assignee = '')

Time Tracked per Agent (minutes)
  = sum(timeTrackedSeconds) / 60
  — only where timeTrackedSeconds > 0
  — always show with caveat: "46% of tickets have time tracking"

Period Delta (%)
  = (current_metric - prior_metric) / prior_metric * 100
  — prior period = same duration immediately before current filter range
  — only shown when 2+ batches cover adjacent periods
```

---

## 11. Pages — Full Specification

### 11.1 Overview (Landing)

**Business question:** "Is everything okay right now?"

**Layout:** KPI row → charts row → narrative box → open tickets list

**KPI Cards (5, with period delta):**
1. Total Tickets
2. Resolution Rate %
3. Avg Resolution Time (hrs)
4. Open Tickets
5. Unassigned Tickets

**Charts:**
- Tickets by Status — donut
- Daily Ticket Volume — bar (current period)

**Smart Narrative Box** (always visible, plain Ukrainian text):
> "За цей період: 367 тікетів, 78.8% вирішено. Середній час вирішення — 54.7 год. 26 тікетів нові та без виконавця. Топ категорія: Система друку (66 тікетів)."

---

### 11.2 Ticket Explorer

**Business question:** "Find me this specific ticket / all tickets matching X."

**Components:**
- shadcn DataTable (TanStack Table)
- Columns: #, Tracking ID, Created, Category, Priority, Status, Assignee, Resolution Time, Replies
- Row click → Sheet (slide-over) with full ticket detail
- Column visibility toggle
- CSV export of filtered view

**Filters (sidebar panel):**
- Date range picker
- Category multi-select (checkboxes)
- Priority multi-select
- Status multi-select
- Assignee multi-select
- Free text search (subject + body)

---

### 11.3 Agent Performance

**Business question:** "Who's doing what, and how well?"

**Per-agent metrics:**
- Total assigned
- Resolution rate %
- Avg resolution time (hrs)
- Total staff replies
- Time tracked (minutes) — with 46% coverage caveat
- Open/unresolved count

**Visuals:**
- Agent workload bar chart (stacked by status)
- Agent resolution time bar
- Summary table — sortable, load quartile color coding

---

### 11.4 Category Analysis

**Business question:** "Where is the most pain? What categories need attention?"

**Visuals:**
- Volume by category — horizontal bar (sorted desc)
- Category × Priority heatmap — rows: category, cols: priority, cell: count
- Resolution time by category — min/avg/max bars
- Top subjects per category — list (top 5 subjects by frequency)

**Inline drill-down:** Click category → all charts filter to that category (no page nav)

**Event Support sub-section** (shown only when "Техпідтримка події" active):
- Event date list / calendar
- Location breakdown (bar by building)
- Room frequency

---

### 11.5 Trends

**Business question:** "Is volume growing? Are we getting better or worse over time?"

**Requires:** 2+ upload batches covering different periods

**Visuals:**
- Monthly ticket volume — line chart per category
- Monthly resolution rate — line chart
- Agent load over time — stacked area
- Category share over time — 100% stacked bar

**Period Comparison tool:** Select any two periods → side-by-side KPI diff table

**Empty state:** "Завантажте дані за щонайменше 2 різні місяці, щоб побачити тренди." + Upload CTA

---


## 12. Navigation & Layout

### Sidebar (persistent, collapsible)
```
UCU IT Helpdesk
─────────────────
📊  Огляд
🎫  Тікети
👤  Виконавці
📁  Категорії
📈  Тренди
─────────────────
⚠️  Якість даних     ← badge: DQ score
─────────────────
⚙️  Налаштування     ← upload history, manage batches
```

### Topbar (persistent)
- Left: Dynamic page title
- Center: Active filter pills (each dismissible)
- Right: [Скинути фільтри] [Завантажити дані ↑] [DQ badge]

### PageHeader component
Renders: `"{Page Name} — {active period} · {active filters as pills}"`
Reset button always adjacent. Per the expert guidance (Step 7) — user never loses context.

### Info button (per page)
shadcn `Sheet` — plain-language explanation of what's on the page, what decisions it supports, how to read each chart.

---

## 13. Global Filter State

URL search params (not Zustand) — filters are bookmarkable and shareable:

```
/dashboard/agents?dateFrom=2026-03-01&dateTo=2026-03-30&category=Система+друку&priority=Високий
```

```typescript
// Canonical filter params
interface FilterParams {
  dateFrom: string;       // ISO date
  dateTo: string;         // ISO date
  category: string[];     // multi-value
  priority: string[];
  status: string[];
  assignee: string[];
  search: string;
}
```

`useFilters()` hook reads/writes via `useSearchParams` + `useRouter`. All API calls built from this shared state. Reset button → `router.replace('/dashboard/[page]')` with no params.

---

## 14. Upload Flow

```
Topbar [Завантажити дані] button
  → shadcn Sheet opens
    → react-dropzone zone (accepts .xml only)
    → POST /api/upload (multipart/form-data)
    → Server: parse → dedup → upsert → return summary
    → Preview shown: "Знайдено 367 тікетів, 01–30 березня 2026"
                     "14 тікетів оновлено (вже існували)"
    → [Підтвердити] → toast success
    → Sheet closes
    → SWR mutates /api/metrics + /api/tickets → dashboard refreshes

Batch Management (Settings page):
  - List: filename / period / ticket count / uploaded at
  - Delete batch (confirm dialog) → cascade deletes tickets
```

---

## 15. Docker & Infrastructure

### `next.config.ts`
```typescript
const config = { output: 'standalone' };
export default config;
```

### `Dockerfile`
```dockerfile
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN corepack enable && pnpm install --frozen-lockfile

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm build

FROM node:20-alpine AS runner
WORKDIR /app
RUN apk add --no-cache sqlite
ENV NODE_ENV=production PORT=3000
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
COPY --from=builder /app/src/db/migrations ./db/migrations
COPY entrypoint.sh ./
RUN mkdir -p /app/data && chmod +x entrypoint.sh
EXPOSE 3000
CMD ["./entrypoint.sh"]
```

### `entrypoint.sh`
```bash
#!/bin/sh
set -e
echo "[startup] running migrations..."
node -e "require('./db/migrate')"
echo "[startup] starting server..."
exec node server.js
```

### `docker-compose.yml`
```yaml
services:
  app:
    build: .
    restart: unless-stopped
    environment:
      NODE_ENV: production
      DB_PATH: /app/data/helpdesk.db
    volumes:
      - ./data:/app/data
    healthcheck:
      test: ["CMD", "wget", "-qO-", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 5s
      retries: 3

  caddy:
    image: caddy:2-alpine
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile
      - caddy_data:/data
      - caddy_certs:/config

volumes:
  caddy_data:
  caddy_certs:
```

### `Caddyfile`
```
helpdesk.yourdomain.com {
    reverse_proxy app:3000
}
```

### `drizzle.config.ts`
```typescript
import type { Config } from 'drizzle-kit';

export default {
  schema: './src/db/schema.ts',
  out: './src/db/migrations',
  driver: 'better-sqlite',
  dbCredentials: {
    url: process.env.DB_PATH ?? './data/helpdesk.db',
  },
} satisfies Config;
```

### `.env`
```env
DB_PATH=/app/data/helpdesk.db
```

---

## 16. Backup

```bash
# /etc/cron.daily/backup-helpdesk  (runs on host)
#!/bin/bash
mkdir -p /opt/helpdesk/data/backups
cp /opt/helpdesk/data/helpdesk.db \
   /opt/helpdesk/data/backups/helpdesk-$(date +%Y%m%d).db
find /opt/helpdesk/data/backups -name "*.db" -mtime +30 -delete
```

No Docker exec needed — file is directly accessible on host via volume mount.

---

## 17. MVP vs V2

### MVP
- Upload + parse + SQLite storage
- Overview page (KPIs + charts + narrative)
- Ticket Explorer (table + filters + detail drawer)
- Agent Performance
- Category Analysis
- Global filters via URL params
- Dynamic page titles + reset filters
- Docker Compose deploy

### V2
- Trends page (needs multi-period data anyway — low value at launch)
- CSV export from Ticket Explorer
- AI narrative generation (Anthropic API)
- Period comparison tool
- Dark/light theme toggle

---

## 18. Open Questions (Pre-Build Decisions)

| # | Question | Impact |
|---|---|---|
| 1 | UI language — Ukrainian or English? | All labels, nav, buttons |
| 2 | `Перша відповідь о` — is it broken in all HESK exports or just this one? | Unlocks SLA metrics if fixable |
| 3 | Will SEDО fields ever be populated? | Reserve DQ rules or drop permanently |
| 4 | Domain for Caddyfile? | Needed before first deploy |
| 5 | Auth needed eventually? | Determines if v2 needs backend session layer |

## 19. Answers to Open Questions
1. UI language — Ukrainian.
2. `Перша відповідь о` — is it broken in all HESK exports or just this one? No, it is broken in all HESK exports.
3. Will SEDО fields ever be populated? They will not be populated most of the times.
4. Domain for Caddyfile?
5. Auth needed eventually? Yeah, it would be nice to have.


**Estimated build:** MVP ~2 weeks solo. Full spec including Trends ~3 weeks.