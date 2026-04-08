const logger = require('../utils/logger');

const errorMiddleware = (err, req, res, _next) => {
  // Log error
  logger.error({
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
  });

  // Default error response
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // Handle Prisma errors
  if (err.code === 'P2002') {
    statusCode = 409;
    message = `Duplicate field value: ${err.meta.target.join(', ')}`;
  }

  if (err.code === 'P2025') {
    statusCode = 404;
    message = 'Record not found';
  }

  // Send response
  res.status(statusCode).json({
    success: false,
    message: message,
    statusCode: statusCode,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = errorMiddleware;
