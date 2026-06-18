# AGENTS.md

## Project

Listening Insights is a local-first Spicetify custom app for Spotify Desktop. It tracks playback events in local browser storage and renders listening analytics: heatmaps, streaks, skip rate, top tracks/artists, monthly recap, goals, genre insights, recommendations, backup/import, and data quality notices.

The package/app id is `listening-insights`.

## Stack

- TypeScript + React.
- Built with `spicetify-creator`.
- Output goes to `dist/`.
- Main source is in `src/`.
- Dashboard orchestration is intentionally thin in `src/components/HeatmapPage.tsx`.
- Dashboard state and refresh lifecycle live in `src/hooks/useListeningDashboard.ts`.
- Tab sections live in `src/components/tabs/`.
- Chart components live in `src/components/charts/`.
- Advanced insight helpers live in `src/components/advanced/`.
- High-value local analytics live in `src/analytics/`.
- Marketplace metadata is in `manifest.json`.
- User docs are in `README.md`, `CHANGELOG.md`, `BRANCHING.md`, and `GIT_CHEATSHEET.md`.

## Commands

- `pnpm typecheck`: TypeScript validation.
- `pnpm build-local`: production/minified build to `dist`.
- `pnpm build`: default Spicetify creator build.
- `pnpm watch`: local watch build.
- `pnpm release:check`: release metadata checks.
- `pnpm hooks:install`: install local Git hooks.

Run `pnpm typecheck` and `pnpm build-local` after meaningful code changes.

## Data Model

Playback data is local only:

- `spicetify-heatmap-v1`: play history.
- `spicetify-heatmap-skips-v1`: skip timestamps.
- `spicetify-heatmap-lang`: selected language.

Do not add a backend, analytics service, account database, or external tracking unless explicitly requested.

## Spotify API Boundaries

Do not re-add Spotify Audio Features or Audio Analysis based mood/vibe detection. Spotify deprecated and restricted those endpoints for new or development-mode apps, so the old feature fails silently for many users.

Allowed Spotify API usage in this app should stay limited and failure-tolerant:

- Track metadata/cover fetches for top tracks.
- Artist metadata/genres for genre insights.
- Spotify search/navigation helpers.

Every Spotify API call must tolerate failure without blocking the dashboard. Playlist creation (in Library tab) is an optional action that gracefully shows an error message when unavailable.

## UI Structure

The main dashboard uses tabs to avoid a crowded single page:

- Overview: primary heatmap and simple listening insights.
- Patterns: advanced analytics, active-time trend, goals, calendar, recommendations, and pattern charts.
- Library: top tracks and top artists, playlist export.
- Library trend charts and arrows compare the selected period with the immediately previous period. Keep those comparisons local and derived from stored play events.
- Library charts use Recharts. Keep chart components small and avoid adding another charting library unless Recharts cannot handle the required visualization.
- Data: privacy/sync/anti-skip notices and reset entry point.

Keep tabs lightweight inside the single Spicetify app. Do not introduce router-level navigation for these sections without a strong reason.

The Listening Coach is intentionally local-only. It should use playback history, skip timestamps, and existing analytics helpers, not deprecated Spotify Audio Features or a remote analytics backend.

## UX Rules

- Keep the page dense but readable; this is an operational dashboard, not a marketing landing page.
- Prefer existing Spotify CSS variables such as `var(--spice-card)`, `var(--spice-text)`, `var(--spice-subtext)`, and `var(--spice-button)`.
- Preserve bilingual English/Indonesian support when adding visible text.
- Make empty/failure states explicit when data is missing.
- Avoid browser alerts for normal feedback.
- Keep all cards responsive with `repeat(auto-fit, minmax(...))` patterns already used in the codebase.

## Release Notes

Every meaningful code change MUST update `CHANGELOG.md` with a clear entry under the relevant version section (Added / Changed / Removed / Fixed).

When changing public behavior or marketplace-visible claims:

- Update `README.md`.
- Update `manifest.json` if the short description changes.
- Keep generated `dist` changes aligned with source builds.

## Branching

See `BRANCHING.md`. Source lives on `main`; generated Marketplace artifacts are published to the `dist` branch.
