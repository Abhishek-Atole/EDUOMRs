import { ValidationError } from '../types/errors.js';

export function validate(schema) {
  return (req, _res, next) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const details = result.error.flatten();
      return next(new ValidationError('Validation failed', details));
    }

    req.body = result.data;
    next();
  };
}

export function validateQuery(schema) {
  return (req, _res, next) => {
    const result = schema.safeParse(req.query);

    if (!result.success) {
      const details = result.error.flatten();
      return next(new ValidationError('Invalid query parameters', details));
    }

    req.query = result.data;
    next();
  };
}

export function validateParams(schema) {
  return (req, _res, next) => {
    const result = schema.safeParse(req.params);

    if (!result.success) {
      const details = result.error.flatten();
      return next(new ValidationError('Invalid path parameters', details));
    }

    next();
  };
}
