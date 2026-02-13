# Startup Growth AE Manager Dashboard

Production-style demo command center for a Growth AE manager leading 8 AEs.

## Stack
- Next.js App Router + TypeScript
- TailwindCSS + shadcn-style UI primitives
- Prisma + SQLite
- Recharts
- TanStack Table
- Vitest + Playwright

## Run Locally
1. Install dependencies
```bash
npm install
```
2. Generate Prisma client
```bash
npm run prisma:generate
```
3. Apply local migration SQL
```bash
npx prisma db execute --file prisma/migrations/20260213010000_init/migration.sql --url "file:./prisma/dev.db"
```
4. Seed coherent demo data
```bash
npm run db:seed
```
5. Start dev server
```bash
npm run dev
```

Open `http://localhost:3000/dashboard`.

## Scrape Refresh Workflow
- Sources list: `data/scrape-sources.json`
- Cached snapshot: `data/customer_snapshot.json`

Refresh snapshot (optional):
```bash
npm run scrape:refresh
```

Seed remains deterministic by default because it reads the cached snapshot.

## Pages
- `/dashboard`: executive snapshot, forecast, risk, coaching, operating cadence, manager actions
- `/accounts`: account table with dense filters + health
- `/accounts/[accountId]`: usage, stakeholder map, QBRs, risks, next actions, editable account plan
- `/pipeline`: funnel conversion, scenario builder, deal desk
- `/team`: AE performance trends + 1:1 coaching prep
- `/playbooks`: 5 interactive operating playbooks
- `/resume`: quantified profile + PDF button + dashboard link
- `/demo-notes`: metric rationale + source transparency

## KPI Glossary
- **NRR**: Renewal ARR won this quarter / total renewal ARR at stake this quarter.
- **Expansion ARR**: Closed-won expansion ARR this quarter.
- **Renewal ARR**: Closed-won renewal ARR this quarter.
- **Pipeline Coverage**: Total open pipeline this quarter / remaining team target.
- **Forecast Buckets**:
  - Commit: opportunities with probability >= 0.70
  - Best Case: opportunities with probability 0.40 to 0.69
  - Upside: opportunities with probability 0.10 to 0.39
- **Forecast Accuracy**: `abs(actual - commit) / actual` per quarter.
- **Health Score (0-100)**:
  - Usage trend (30%)
  - Support burden (20%)
  - Stakeholder engagement (20%)
  - Renewal proximity (15%)
  - Payment reliability (15%)
- **Account Plan Completeness**: completed required account-plan fields / total required fields.

## Data Model Coverage
Implemented models:
- `User`, `AE`, `Account`, `Stakeholder`, `UsageMetric`, `SupportTicket`, `Opportunity`, `Activity`, `QBR`, `ForecastSnapshot`
- `AccountPlan`, `QuarterTarget`, `DiscountApproval`

## Testing
```bash
npm run lint
npm test
npm run test:e2e
npm run build
```

## 30-60-90 Day Operating Plan
### 30 Days
- Establish forecast hygiene: stage definitions, probability standards, commit criteria.
- Segment accounts by ARR, renewal timing, and health risk tier.
- Launch weekly manager action review: top renewal risks, top slippage risks, and coaching priorities.

### 60 Days
- Reach full QBR cadence coverage with overdue elimination.
- Enforce account-plan completeness standards and owner accountability.
- Tighten deal desk guardrails with clear give/get negotiation policy.

### 90 Days
- Scale repeatable expansion motion across strongest use-case archetypes.
- Improve forecast accuracy by reducing commit error quarter-over-quarter.
- Operationalize AE coaching loop tied to funnel conversion and multi-threading quality.

## Demo Banner
This app intentionally shows:
> Synthetic data. For portfolio demonstration only.