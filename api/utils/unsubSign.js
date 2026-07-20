// utils/unsubSign.js
//
// HMAC signature for one-click unsubscribe links. Without it anyone who
// knows (or guesses) an email address can silently turn off that user's
// emails: GET /api/unsubscribe?email=victim@x.com&type=reminder.
// The sig proves the link came from an email WE sent to that address.
const crypto = require('crypto');

function sign(email, type) {
  return crypto
    .createHmac('sha256', process.env.JWT_SECRET || 'dev-secret')
    .update(`unsub:${String(email).toLowerCase()}:${type}`)
    .digest('hex')
    .slice(0, 32);
}

function verify(email, type, sig) {
  if (!sig || typeof sig !== 'string') return false;
  const expected = sign(email, type);
  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(sig));
  } catch {
    return false; // length mismatch
  }
}

module.exports = { sign, verify };
