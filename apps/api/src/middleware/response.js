export function responseMiddleware(req, res, next) {
  res.success = (data, statusCode = 200) => {
    res.status(statusCode).json({
      success: true,
      data,
      meta: {
        requestId: req.requestId,
        timestamp: new Date().toISOString(),
      },
    });
  };

  res.paginated = (data, total, page, limit) => {
    const totalPages = Math.ceil(total / limit);
    res.status(200).json({
      success: true,
      data,
      meta: {
        requestId: req.requestId,
        timestamp: new Date().toISOString(),
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      },
    });
  };

  res.error = (code, message, statusCode = 400, details = {}) => {
    res.status(statusCode).json({
      success: false,
      error: {
        code,
        message,
        details,
        timestamp: new Date().toISOString(),
        requestId: req.requestId,
      },
    });
  };

  next();
}
