export function successResponse(req, res, data, statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    data,
    meta: {
      requestId: req.requestId,
      timestamp: new Date().toISOString(),
    },
  });
}

export function paginatedResponse(req, res, data, pagination) {
  return res.status(200).json({
    success: true,
    data,
    meta: {
      requestId: req.requestId,
      timestamp: new Date().toISOString(),
      pagination,
    },
  });
}

export function createdResponse(req, res, data) {
  return successResponse(req, res, data, 201);
}

export function noContentResponse(req, res) {
  return res.status(204).send();
}
