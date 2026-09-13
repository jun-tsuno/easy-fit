# easy-fit Project Overview

A personal workout tracking app. It records daily training details (exercise, weight, reps, sets) and body weight, so they can be reviewed later via a calendar and history charts. Built with AWS Amplify Gen2 as the backend and React (Vite) on the frontend.

This document is meant to share development status across sessions. It summarizes the implemented screens and data model. Rewrite it to match reality whenever things change.

## Setup

```bash
pnpm install
```

## Development

```bash
pnpm dev
```

To use the Amplify backend (auth/data) locally, configure your AWS credentials and run the following. The frontend won't connect to the backend until `amplify_outputs.json` is generated.

```bash
pnpm ampx sandbox
```

## Other commands

```bash
pnpm build      # Production build (tsc -b + vite build)
pnpm lint       # Check with Biome
pnpm lint:fix   # Auto-fix with Biome
pnpm format     # Format with Biome
```

## Tech stack

| Area              | Technology                                                                                                                                    |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Frontend          | React 19 + Vite, TypeScript (strict)                                                                                                            |
| Routing           | React Router v8 (`createBrowserRouter`)                                                                                                         |
| Server state      | TanStack React Query v5                                                                                                                         |
| Backend           | AWS Amplify Gen2 (`defineData`, `defineAuth`)                                                                                                   |
| Auth              | Amazon Cognito (email + password, no sign-up flow, users are registered manually)                                                               |
| UI                | Chakra UI v3 + CSS Modules (layout/custom styles use CSS Modules; component variants etc. use Chakra's theme/recipe API)                        |
| Charts            | `@chakra-ui/charts` + `recharts` (History screen only; the route is lazy-loaded)                                                                |
| Icons             | react-icons (Lucide: `react-icons/lu`)                                                                                                          |
| Toast notifications | Chakra UI's `Toaster` (`src/components/Toaster/Toaster.tsx`)                                                                                  |
| Lint/Format       | Biome                                                                                                                                            |

### Design guidelines

- Light mode only (dark mode / theme switching is not supported)
- Full-screen background is `#FFF`. No cards (white surface + shadow); elements are laid out flat
- Section/list-item separators use generous spacing plus a 1px divider (`--color-divider`)
- Primary color `#FF7628` (orange; `--color-accent` / Chakra `brand` palette 500). Reserved for the primary button, today's cell, record icon, exercise chart, and active tab
- Secondary color `#FFA66D` (light orange; `--color-secondary` / `brand` palette 300). Used for things like the body-weight chart line
- Both primary and secondary are **accent colors**. Don't use them for neutral buttons like Cancel — use `colorPalette="gray"` instead
- Text on top of an orange surface is white (`--color-on-accent` / Chakra `brand.contrast`). Accent-colored text on a white background uses `brand.fg` = `brand.700` (dark enough to stay legible)
- Destructive actions (delete, trash icon) use `--color-destructive` `#CE0000` (red). Attach `colorPalette="red"` to the corresponding `Button` / `IconButton`
- Back buttons have no border (Chakra `IconButton`'s `ghost` variant). Top-level tab screens (Home / History / Exercises) don't have a back button
- Base font weight is 500 (`body { font-weight: 500 }`; headings are 600)
- Horizontal screen padding is 16px (`PageContainer` / fixed bars use `padding-inline: 16px`)
- Root font size is 17px (`:root { font-size: 106.25% }`). Body text baseline is `0.9375rem`, supporting text is `0.8125rem`
- Colors and border radius are centralized in CSS variables in `src/index.css` (`--color-*` / `--radius-card`). Muted gray text uses `--color-fg-muted` (`#545454`, kept dark enough for contrast)
- Authenticated screens use `AppLayout` (`src/routes/AppLayout/`), which always shows the global `BottomNav` menu (`src/components/BottomNav/`) at the bottom. Tabs from left to right: Home `/`, History `/history`, Exercises `/exercises`

## Data model (`amplify/data/resource.ts`)

Owner-based authorization (`allow.owner().identityClaim('sub')`) ensures each user can only operate on their own data.

- **Exercise** (exercise master): `name`, `category`, `owner`. Holds the exercises a user has registered, used for exercise selection on the record screens.
- **WorkoutSet** (one record per set): `date`, `exerciseId`, `weight`, `reps`, `setNumber`, `owner`. A secondary index on `owner + date` (`listWorkoutSetsByDate`) supports the calendar and per-day views.
  - A secondary index on `exerciseId + date` (`listWorkoutSetsByExerciseDate`) supports per-exercise queries on the History screen.
- **BodyWeight** (body weight record): `date`, `weight`, `owner`. Secondary index on `owner + date` (`listBodyWeightsByDate`).

## Auth (`amplify/auth/resource.ts`)

- Email + password login only (no sign-up flow; users are registered manually via the Cognito console)
- Redirects to `/login` when not signed in (`ProtectedRoute`)
- Sessions are kept long-lived (roughly 30 days) so users don't need to sign in repeatedly
- The `nickname` user attribute (mutable, required) is used as the user's display name in the app, to avoid exposing the Cognito `sub`/username

## Screens (implemented)

### Login screen `/login`

- Sign in with email and password
- Redirects to `/` if already authenticated

### Home screen `/`

- Header: logo image, a link (icon button) to the My Page screen `/mypage`
- The calendar is the main content (`src/components/Calendar/Calendar.tsx`, starts on Sunday, fixed 6-week display)
  - Navigate with month forward/back and a "This month" button (shown only when not viewing the current month)
  - Days with a workout record show a dumbbell icon and days with a body-weight record show a scale icon at the bottom of the cell (no numeric values shown)
  - Today's cell is highlighted
  - Tapping a date navigates to that day's workout record screen `/record?date=<date>`
  - Fetches `WorkoutSet` / `BodyWeight` for the displayed month's 6-week range in a single date-range query each (`useWorkoutSetsInRange` / `useBodyWeightsInRange`)
- Weekly record summary: always shows "this week" (Sunday through Saturday including today, independent of the calendar's displayed month) — "training days", "total sets", "total volume" (Σ weight × reps), and "body weight" (latest record that week). The body-weight value links to `/body-weight?date=<today>` (rendered in normal text color, not the accent color)
  - Per-exercise summary: groups this week's `WorkoutSet` records by `exerciseId` and lists "sets", "total reps", and "max weight" for each exercise, sorted by total volume (weight × reps) descending. Exercises missing from the master list show as "Unregistered exercise". Shows a skeleton while loading and an empty-state message when there are no records for the week
- A fixed "Record today's workout" button at the bottom → `/record?date=<today>`

### History screen `/history` (`src/pages/History/`)

- A toggle at the top switches the review period (Week = last 7 days, daily buckets / Month = last 30 days, daily buckets / Year = last 12 months, monthly buckets). Selected via `SegmentGroup`, defaults to "Week"
- Aggregates the period into buckets (day or month) and shows the trend as a line chart (`StatsLineChart` = `@chakra-ui/charts`). Flat display with no card background; generous spacing between the two sections
- **Per-exercise trend** (top): exercise select + metric toggle (max weight / total volume). Aggregates the selected exercise's sets per bucket and shows a line chart (primary color). The period's overall average is shown to the right of the heading
  - Per-exercise queries use `WorkoutSet`'s `listWorkoutSetsByExerciseDate` (the `exerciseId + date` GSI)
- **Body-weight trend** (bottom): shows the average body weight per bucket as a line chart (secondary color). The period's overall average is shown to the right of the heading
- Bucket generation is handled by `getStatsBuckets` (`src/utils/date.ts`); aggregation logic is in `src/utils/stats.ts`
- Buckets with no records are connected by a line without a point marker. Shows a message when there is no data or no registered exercises
- The route (which pulls in recharts) is lazy-loaded via `React.lazy`

### Exercise management screen `/exercises`

- Add an exercise by specifying its name and category (chest / back / shoulders / arms / legs / cardio / other)
- Registered exercises are listed grouped by category (distinguished by a category-color dot)
- Each exercise can be deleted (with a confirmation dialog)
- No back button since this is a top-level tab screen (navigation happens via the global menu)
- The `?category=` query param pre-selects the category in the add form. If `?from=` is present (from the "Add exercise" flow on the record screen), it navigates back to that URL automatically after a successful add

### Workout record list screen `/record?date=YYYY-MM-DD`

- The page title shows the target date (e.g. "Workout for Mon, Sep 8"). Since the date comes from calendar navigation, there's no in-page date picker (defaults to today)
- Shows the given day's workout records grouped by category
- Each exercise summarizes its sets (e.g. "60kg×10 / 60kg×8"); clicking navigates to that exercise's set-input screen
- The header's "+" button → exercise selection screen `/record/new?date=...`
- Back button returns to the Home screen

### Exercise selection screen `/record/new?date=YYYY-MM-DD`

- Lists the user's registered exercises grouped by category
- Each category always shows an "Add exercise" button; tapping it navigates to `/exercises` with that category pre-filled (returns to this screen after saving)
- Clicking an exercise goes to the set-input screen `/record/new/:exerciseId?date=...`
- Back button returns to the record list screen

### Set-input screen `/record/new/:exerciseId?date=YYYY-MM-DD`

- Shows the records for the selected exercise/date as one row per set (starts with one empty input row)
- Weight and reps are side by side, underline-only inputs (no border). Editing a row doesn't save immediately — the "Save" button at the bottom applies everything at once (`useSaveExerciseSets`)
  - Rows left empty (both weight and reps blank) are ignored. Existing sets removed from the screen are deleted on save. `setNumber` is renumbered based on display order
  - Shows a toast on successful save and returns to the record list screen `/record?date=...`
- The "Add set" button appends further sets. Each set has its own delete button
- Back button returns to the exercise selection screen

### Body-weight screen `/body-weight?date=YYYY-MM-DD`

- Enter and save body weight for the given date (defaults to today, shows the saved value if one exists)
- Shows a toast on successful save
- Back button returns to the Home screen

### My Page screen `/mypage`

- Reached via the icon button in the Home screen header
- Shows the user's nickname (a mutable, editable Cognito user attribute), suffixed with "さん"; editable inline via a pencil icon (limited to 10 characters, validated on the frontend; unchanged edits don't trigger an update call)
- Shows "training days this month" (days with a workout record in the displayed month), with month navigation
- Sign-out button (the only sign-out entry point in the app)

## Error handling

- `ErrorBoundary` (`src/components/ErrorBoundary/`): wraps the whole app (`main.tsx`), catches render-time exceptions, and shows `ErrorFallback`
- `RouteErrorBoundary` (`src/routes/RouteErrorBoundary/`): set as React Router's route `errorElement`. Shows a dedicated message for 404s (non-existent paths) and the generic `ErrorFallback` otherwise

## Screen flow

```
/login ──(sign-in success)──> /

Global menu (always shown at the bottom of every authenticated screen, left to right)
 ├─ Home ───> /
 ├─ History ─> /history
 └─ Exercises ─> /exercises

/ (Home / calendar)
 ├─ Header icon button ────────────> /mypage
 │                                        └─ Sign out / back ──> /login / /
 ├─ Tap a calendar date ────────────> /record?date=<date>
 ├─ "Record today's workout" ───────> /record?date=<today>
 ├─ Weekly summary body-weight link ─> /body-weight?date=<today>
 │                                        └─ back ──> /
 └─ /record
      ├─ "+" ──────────────> /record/new
      │                        ├─ click an exercise ──> /record/new/:exerciseId
      │                        │                          └─ back ──> /record/new
      │                        ├─ "Add exercise" (always shown) ──> /exercises?category=..&from=/record/new
      │                        │                                          └─ after save ──> /record/new
      │                        └─ back ──> /record
      └─ click an exercise (already recorded) ──> /record/new/:exerciseId
```

## Development rules

- Create a feature branch per change and open a PR. Don't push directly to `main` or `dev`
- Directory structure:
  - Components use UpperCamelCase for file/directory names, laid out as `Xxx/Xxx.tsx` + `Xxx.module.css` (same under `pages`)
  - `src/components` is for UI components only. Routing lives in `src/routes`, providers in `src/providers`
  - Hook files are named `useXxx.ts`
- Since real-data (Cognito + AppSync) testing isn't possible in the sandbox environment, spell out the manual verification steps in each PR's test plan
