# ADR-0005: Crisis-language detection runs client-side, before the LLM

**Status:** accepted

## Context
The AI Coach forwards free-text messages to Gemini. A mental-wellness app
must never let an LLM improvise a reply to "I want to die". Server-side
moderation adds latency and still shows the user a normal chat UI while the
message is in flight.

## Decision
`frontend/src/utils/crisisDetection.ts` screens every message **before** it
leaves the device. On a hit, the UI opens the CrisisHelp modal with regional
helplines instead of sending the message anywhere.

Design properties:
- **Multi-script**: EN / RU / ES patterns. JavaScript's `\b` is ASCII-only, so
  boundaries use Unicode look-arounds (`(?<!\p{L})` / `(?!\p{L})` with the `u`
  flag). The original `\b` implementation silently never matched a single
  Russian pattern — that regression is now pinned by 36 Vitest cases.
- **Biased to false positives**: an unnecessary helpline screen is harmless;
  a missed crisis message is not.
- **Client-side is a floor, not the ceiling**: the payload also passes the
  backend, which can add server-side moderation later without UX change.

## Consequences
- Patterns ship in the bundle and are technically discoverable — fine; this
  is safety UX, not an anti-abuse secret.
- Every new locale must add patterns AND tests before the coach is enabled
  for that language.
