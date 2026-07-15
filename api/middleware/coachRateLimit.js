// middleware/coachRateLimit.js
const mongoose = require('mongoose');

const RateLimitSchema = new mongoose.Schema({
  key:     { type: String, required: true, unique: true },
  count:   { type: Number, default: 0 },
  resetAt: { type: Date,   required: true },
}, { timestamps: false });

const RateLimit = mongoose.models.RateLimit
  || mongoose.model('RateLimit', RateLimitSchema);

const LIMITS = { anonymous: 10, user: 30 };

// Get the real client IP. Fly.io sets Fly-Client-IP with the verified client
// address — prefer it. Falling back to the FIRST x-forwarded-for entry is
// spoofable (clients can send their own XFF and reset their own bucket), so
// req.ip (trust proxy is configured in app.js) comes before it.
function getRealIp(req) {
  return req.headers['fly-client-ip']
    || req.ip
    || req.socket?.remoteAddress
    || 'unknown';
}

module.exports = async function coachRateLimit(req, res, next) {
  try {
    const userId = req.user?._id?.toString() ?? null;
    const ip     = getRealIp(req);
    const key    = userId ? `coach:user:${userId}` : `coach:ip:${ip}`;
    const limit  = userId ? LIMITS.user : LIMITS.anonymous;

    const now      = new Date();
    const midnight = new Date();
    midnight.setHours(24, 0, 0, 0);

    let doc = await RateLimit.findOne({ key });

    // Reset if expired
    if (!doc || doc.resetAt <= now) {
      await RateLimit.findOneAndUpdate(
        { key },
        { key, count: 1, resetAt: midnight },
        { upsert: true, returnDocument: 'after' }
      );
      req.coachMessagesLeft = limit - 1;
      return next();
    }

    if (doc.count >= limit) {
      const hoursLeft = Math.ceil((doc.resetAt - now) / 3600000);
      return res.status(429).json({
        error:          'limit_reached',
        limit,
        hoursUntilReset: hoursLeft,
        isAnonymous:    !userId,
      });
    }

    await RateLimit.findOneAndUpdate(
      { key },
      { $inc: { count: 1 } },
      { returnDocument: 'after' }
    );
    req.coachMessagesLeft = limit - doc.count - 1;
    next();
  } catch (err) {
    console.error('coachRateLimit error:', err.message);
    next(); // fail open
  }
};
// Exposed so /coach/status reports the SAME numbers the limiter enforces
module.exports.LIMITS = LIMITS;
