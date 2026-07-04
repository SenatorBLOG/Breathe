# ADR-0002: JWT in localStorage — accepted as transitional debt

**Status:** accepted-with-debt (target: httpOnly cookie + refresh rotation)

## Context
Auth uses a 7-day JWT issued at login and stored in `localStorage`, attached
by an axios request interceptor. This is simple and survives page reloads, but:

- any XSS gives an attacker a week-long token,
- there is no server-side revocation (logout is purely client-side),
- the 401 interceptor can only clean up locally.

## Decision
Keep localStorage short-term while the product stabilizes, and mitigate:
strict CSP, React's default escaping, no `dangerouslySetInnerHTML` with user
content (the only uses are self-authored JSON-LD), and aggressive input
validation server-side.

Planned migration (Phase 1/2 of the development plan):
1. short-lived access token (≤ 24 h) + httpOnly `SameSite=Lax` refresh cookie,
2. refresh rotation with reuse detection,
3. server-side session invalidation on password change / GDPR delete.

## Consequences
- Until migrated, XSS severity is "token theft", not just defacement — CSP
  hygiene is therefore a security control, not a nice-to-have.
- The migration touches CORS (`credentials: true` already set), axios config,
  and AuthContext, and must be shipped as one atomic change.
