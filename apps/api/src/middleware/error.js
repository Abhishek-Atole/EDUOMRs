import { AppError } from '../types/errors.js';

export function errorHandler(err, req, res, _next) {
  const requestId = req.requestId || 'unknown';

  if (err instanceof AppError) {
    const statusCode = err.statusCode;
    if (statusCode >= 500) {
      console.error(`[${requestId}] ${err.code}: ${err.message}`, {
        stack: err.stack,
        userId: req.user?.id,
        tenantId: req.user?.tenantId,
      });
    }

    return res.status(statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        details: err.details,
        timestamp: new Date().toISOString(),
        requestId,
      },
    });
  }

  console.error(`[${requestId}] Unhandled error:`, {
    message: err.message,
    stack: err.stack,
    userId: req.user?.id,
    tenantId: req.user?.tenantId,
  });

  return res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred',
      details: {},
      timestamp: new Date().toISOString(),
      requestId,
    },
  });
}
