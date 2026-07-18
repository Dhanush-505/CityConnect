/**
 * In-memory response caching middleware
 */

const cacheMap = new Map();

export const cacheMiddleware = (durationSeconds = 60) => {
  return (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    const key = `${req.originalUrl || req.url}_${req.user?.id || 'public'}`;
    const cached = cacheMap.get(key);
    const now = Date.now();

    if (cached && now < cached.expiry) {
      res.setHeader('X-Cache', 'HIT');
      return res.json(cached.data);
    }

    const originalJson = res.json.bind(res);
    res.json = (body) => {
      if (res.statusCode === 200 && body && body.success !== false) {
        cacheMap.set(key, {
          data: body,
          expiry: now + durationSeconds * 1000
        });
      }
      res.setHeader('X-Cache', 'MISS');
      return originalJson(body);
    };

    next();
  };
};

export const clearCache = () => {
  cacheMap.clear();
};

export default cacheMiddleware;
