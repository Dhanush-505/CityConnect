/**
 * Input Sanitization Middleware to prevent XSS and NoSQL Injection
 */

const sanitizeValue = (value) => {
  if (typeof value === 'string') {
    // Basic XSS escaping for scripts and dangerous HTML
    return value
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/onerror\s*=/gi, '');
  }

  if (typeof value === 'object' && value !== null) {
    if (Array.isArray(value)) {
      return value.map(sanitizeValue);
    }

    const sanitizedObj = {};
    for (const key of Object.keys(value)) {
      // Remove dangerous MongoDB operators like $where, $gt, etc. from input keys
      const cleanKey = key.startsWith('$') ? key.replace(/^\$/, '') : key;
      sanitizedObj[cleanKey] = sanitizeValue(value[key]);
    }
    return sanitizedObj;
  }

  return value;
};

const sanitizeInput = (req, res, next) => {
  if (req.body) {
    req.body = sanitizeValue(req.body);
  }
  if (req.query) {
    req.query = sanitizeValue(req.query);
  }
  if (req.params) {
    req.params = sanitizeValue(req.params);
  }
  next();
};

export default sanitizeInput;
