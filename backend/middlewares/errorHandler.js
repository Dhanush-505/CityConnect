import logger from '../utils/logger.js';

const errorHandler = (err, req, res, next) => {
  logger.error(`Error on ${req.method} ${req.originalUrl}: ${err.message}`, err);

  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      success: false,
      message: 'Invalid JSON payload in request body.',
      errorCode: 'INVALID_JSON'
    });
  }

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: err.message,
      errorCode: 'VALIDATION_ERROR'
    });
  }

  if (err.code === 11000) {
    return res.status(409).json({
      success: false,
      message: 'Duplicate field value entered in database.',
      errorCode: 'DUPLICATE_KEY_ERROR'
    });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'Invalid record identifier or resource ID supplied.',
      errorCode: 'INVALID_ID'
    });
  }

  if (err.name === 'UnauthorizedError' || err.status === 401) {
    return res.status(401).json({
      success: false,
      message: err.message || 'Authentication required.',
      errorCode: 'UNAUTHORIZED'
    });
  }

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'An unexpected internal server error occurred.',
    errorCode: err.errorCode || 'INTERNAL_SERVER_ERROR'
  });
};

export default errorHandler;
