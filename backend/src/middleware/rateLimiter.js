/**
 * In-Memory Sliding Window Rate Limiter
 * Provides DDoS and brute-force protection for sensitive endpoints without external dependencies.
 */
const rateLimit = (options = {}) => {
  const windowMs = options.windowMs || 15 * 60 * 1000; // 15 minutes default
  const max = options.max || 30; // 30 requests per window
  const message = options.message || 'Too many requests from this IP. Please try again after 15 minutes.';
  const hits = new Map();

  // Periodically clean up stale records every 10 minutes
  const cleanupInterval = setInterval(() => {
    const now = Date.now();
    for (const [ip, timestamps] of hits.entries()) {
      const active = timestamps.filter(t => now - t < windowMs);
      if (active.length === 0) {
        hits.delete(ip);
      } else {
        hits.set(ip, active);
      }
    }
  }, 10 * 60 * 1000);

  if (cleanupInterval.unref) {
    cleanupInterval.unref(); // Do not block process exit
  }

  return (req, res, next) => {
    // Disable rate limiting during automated testing to avoid test flakiness
    if (process.env.NODE_ENV === 'test') {
      return next();
    }

    const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
    const now = Date.now();
    const timestamps = hits.get(ip) || [];
    const validTimestamps = timestamps.filter(t => now - t < windowMs);

    if (validTimestamps.length >= max) {
      return res.status(429).json({
        success: false,
        message,
        retryAfter: Math.ceil((validTimestamps[0] + windowMs - now) / 1000)
      });
    }

    validTimestamps.push(now);
    hits.set(ip, validTimestamps);
    next();
  };
};

module.exports = {
  rateLimit
};
