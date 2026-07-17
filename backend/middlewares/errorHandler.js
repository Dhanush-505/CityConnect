const errorHandler = (err, req, res, next) => {
  console.error(err.stack || err.message);

  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ success: false, message: 'Invalid JSON payload.' });
  }

  if (err.name === 'ValidationError') {
    return res.status(400).json({ success: false, message: err.message });
  }

  if (err.code === 11000) {
    return res.status(409).json({ success: false, message: 'Duplicate field value entered.' });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({ success: false, message: 'Invalid ObjectId supplied.' });
  }

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Server error',
  });
};

export default errorHandler;
