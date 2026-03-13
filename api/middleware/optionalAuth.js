// middleware/optionalAuth.js
const jwt = require('jsonwebtoken');

module.exports = function optionalAuth(req, res, next) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    req.user = null;
    return next();
  }

  const token = header.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { _id: decoded.userId || decoded.id || decoded._id };
  } catch {
    req.user = null;
  }

  next();
};