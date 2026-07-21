export class AppError extends Error {
  constructor({ code, message, statusCode = 500, details = {} }) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message = 'Validation failed', details = {}) {
    super({ code: 'VALIDATION_ERROR', message, statusCode: 400, details });
  }
}

export class AuthenticationError extends AppError {
  constructor(message = 'Authentication failed') {
    super({ code: 'AUTHENTICATION_ERROR', message, statusCode: 401 });
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Access denied') {
    super({ code: 'FORBIDDEN', message, statusCode: 403 });
  }
}

export class NotFoundError extends AppError {
  constructor(resource = 'Resource') {
    super({ code: 'NOT_FOUND', message: `${resource} not found`, statusCode: 404 });
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Resource already exists') {
    super({ code: 'CONFLICT', message, statusCode: 409 });
  }
}

export class ExamExpiredError extends AppError {
  constructor(message = 'Exam deadline has passed') {
    super({ code: 'EXAM_EXPIRED', message, statusCode: 422 });
  }
}

export class BadRequestError extends AppError {
  constructor(message = 'Bad request') {
    super({ code: 'BAD_REQUEST', message, statusCode: 400 });
  }
}

export class RateLimitError extends AppError {
  constructor(message = 'Too many requests') {
    super({ code: 'RATE_LIMIT_EXCEEDED', message, statusCode: 429 });
  }
}
