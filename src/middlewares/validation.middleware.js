const validate = (schema) => {
  return (req, res, next) => {
    try {
      // If no schema or no body, skip validation
      if (!schema || !req.body) {
        return next();
      }

      // Validate request body against schema
      const validatedData = schema.parse(req.body);
      req.body = validatedData;
      next();
    } catch (error) {
      // Safe error handling - check if error.errors exists
      let errors = [];

      if (error.errors && Array.isArray(error.errors)) {
        errors = error.errors.map((err) => ({
          field: err.path?.join('.') || 'unknown',
          message: err.message || 'Validation error',
        }));
      } else {
        errors = [{ message: error.message || 'Validation failed' }];
      }

      return res.status(422).json({
        success: false,
        message: 'Validation failed',
        statusCode: 422,
        errors,
      });
    }
  };
};

module.exports = { validate };
