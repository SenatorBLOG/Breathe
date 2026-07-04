# ADR-0004: GDPR erasure — hard-delete cascade, not soft anonymisation

**Status:** accepted

## Context
GDPR Art. 17 requires account deletion. Two common designs:

1. **Soft anonymisation** — keep posts/comments, null out the author.
2. **Hard delete** — remove the user and everything they created.

Option 1 preserves community threads but our schemas make it impossible
without a migration: `Post.author` and `Comment.author` are `required: true`,
so `$set: { author: null }` fails Mongoose validation. Beyond the mechanics,
comment *text* is user-authored content — under GDPR it is PII regardless of
whether the author field is nulled.

## Decision
`DELETE /api/users/me` hard-deletes in a cascade:
sessions, globe pins, challenge progress, the user's comments everywhere,
**all comments on the user's posts** (they'd be orphaned), the posts
themselves, then the account document.

Bystander isolation is pinned by a test: another user's account, posts and
comments on *their own* content survive the cascade untouched.

## Consequences
- Community threads lose replies when a participant is erased — accepted;
  correctness beats continuity for a wellness app's trust story.
- Deletion is irreversible with no grace period. If support load ever shows
  regret-deletes, add a 14-day soft-lock stage *before* the cascade rather
  than replacing it.
