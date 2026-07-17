const validateFields = (requiredFields = []) => {
  return (req, res, next) => {
    const missing = requiredFields.filter((field) => {
      const value = req.body[field];
      return value === undefined || value === null || String(value).trim() === '';
    });

    if (missing.length > 0) {
      return res.status(400).json({ success: false, message: `Missing required fields: ${missing.join(', ')}` });
    }

    next();
  };
};

export default validateFields;
