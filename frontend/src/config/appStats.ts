// src/config/appStats.ts
// Single source of truth for marketing statistics shown across the app.
// Update these numbers periodically as the product grows.

export const APP_STATS = {
  /** Total guided sessions completed on the platform */
  SESSIONS_COUNT: 50_000,
  /** Number of distinct breathing techniques available */
  TECHNIQUES_COUNT: 12,
  /** Suffix to display after SESSIONS_COUNT */
  SESSIONS_SUFFIX: '+',
} as const;
