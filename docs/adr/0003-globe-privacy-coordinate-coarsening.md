# ADR-0003: Globe pins — coordinate coarsening instead of exact locations

**Status:** accepted

## Context
The Meditation Globe lets users pin where they practice. Exact coordinates of
a recurring personal location ("my balcony, every morning at 7") published
with a username is a stalking vector and a GDPR problem.

## Decision
The API applies privacy shaping per-viewer in `GET /api/globe`:

- **Everyone except the owner** sees coordinates rounded to 2 decimals
  (~1.1 km grid) — enough to say "this neighbourhood", never "this door".
- Usernames are reduced to an initial (`Alice` → `A.`) for non-owners.
- `userId` is selected internally for the ownership check but **stripped from
  every response**, so the wire format cannot be used for user enumeration.
- The pin's owner sees their own pin at full precision.

Enforced in tests (`api/tests/globe.test.js`): coarsening for anonymous and
for other authenticated users, full precision for the owner, and a regression
test asserting `userId` never appears in any response variant.

## Consequences
- The map renders slightly "snapped" pins for visitors — acceptable, and
  invisible at world zoom.
- Owner-precision requires resolving the requester on a public endpoint →
  `optionalAuth` middleware rather than a public/authed route split.
