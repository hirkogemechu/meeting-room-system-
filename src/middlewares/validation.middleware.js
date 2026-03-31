const validate = (schema) => {
  return (req, res, next) => {
    try {
      // Validate request body against schema
      const validatedData = schema.parse(req.body);
      req.body = validatedData; // Replace with validated data
      next();
    } catch (error) {
      // Format Zod errors
      const errors = error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }));

      return res.status(422).json({
        success: false,
        message: 'Validation failed',
        statusCode: 422,
        errors
      });
    }
  };
};

module.exports = { validate };