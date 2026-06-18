# Changelog

All notable changes to Listening Insights are documented here.

## 1.2.0 - 2026-06-18

### Added
- Genre Distribution PieChart using Recharts in the Patterns tab.
- `src/components/charts/` for Recharts-based chart components.
- Skip Analytics card in Patterns tab showing skip rate by time of day, most skipped tracks, and most skipped artists.
- Hourly Genre Breakdown card showing top genre per morning/afternoon/evening/night.
- `src/analytics/skipAnalytics.ts` with `skipRateByTimeSegment` and `mostSkippedTracks` helpers.

### Changed
- Anti-skip tracking rewritten from fixed-timer to progress-based adaptive thresholds (50% for <30s tracks, 35% for 30s-2min, 20%/min15s for 2-5min, 15%/min30s for >5min). Harder to game.
- Data Manager (export/import/clear) moved from Patterns tab to Data tab for better tab relevance.

### Fixed
- Marketplace preview image paths now point to the `images/` folder in `manifest.json`, README, CI artifacts, release artifacts, and release validation.
- Sequential (non-parallel) artist/track image fetching with 250ms delay to avoid Spotify API rate limiting (429 errors).
- Genre artist fetching in AdvancedInsights changed from parallel `Promise.all` to sequential with 250ms delay + per-artist genre cache for stable hourly breakdown.

### Removed
- Removed heatmap theme picker (green / purple / orange / cyan); theme is now always Spotify green.
- Removed unused ShareModal (dead code from the previous layout).
- Removed Save to Spotify Playlist feature (unreliable due to Spotify rate limiting).

## 1.1.0 - 2026-06-18

### Changed
- Simplified the branch flow to `main` for source and generated `dist` for Marketplace.
- Added automated `dist` branch publishing on tagged releases.
- Improved local Git hooks so pre-push checks do not mutate generated files.
- Updated release and branching documentation for solo open-source maintenance.
- Replaced the long single-page layout with tabs for Overview, Patterns, Library, and Data.
- Modularized the dashboard shell into a data hook, tab components, shared theme helpers, and advanced insight helpers.
- Added a local Listening Coach panel that surfaces activity shifts, repeat behavior, skip hotspots, discovery gaps, and search actions.
- Added track/artist trend arrows and Recharts-powered Library trend charts.
- Reduced micro animations so motion stays subtle and focused.

### Removed
- Removed dynamic vibe detection because Spotify's Audio Features endpoints are deprecated and no longer reliable for new or development-mode apps.

## 1.0.0 - 2026-06-18

### Added
- Interactive hourly and daily listening heatmaps.
- Music persona, active streak, longest streak, and skip-rate insights.
- Top tracks and top artists with direct playback controls.
- Monthly recap, listening goals, genre insights, and smart recommendations.
- Listening score, best listening day, repeat addiction, artist loyalty, session detection, skip hotspots, compare mode, active-time trend, mini wrapped, and current taste hints.
- Data quality warnings and Spotify Desktop sync gap notices.
- Backup export/import and local data manager.
- Bilingual English and Indonesian UI.

### Privacy
- Listening history stays in local browser storage.
- No server, account database, analytics backend, or external tracking service is used by this app.

### Known Notes
- Spotify Desktop must be open for tracking to run.
- Plays made while Spotify Desktop is closed cannot be recovered.
