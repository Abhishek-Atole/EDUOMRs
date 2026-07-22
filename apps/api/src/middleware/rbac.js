import { ROLE_HIERARCHY } from '../config/roles.js';
import { ForbiddenError } from '../types/errors.js';

export function authorize(...allowedRoles) {
  return (req, _res, next) => {
    const userRole = req.user?.role;

    if (!userRole) {
      return next(new ForbiddenError('Authentication required'));
    }

    if (ROLE_HIERARCHY[userRole] === undefined) {
      return next(new ForbiddenError('Invalid role'));
    }

    // Exact-match authorization — a role only passes a gate that names it.
    // Do NOT grant access by hierarchy level, or higher roles could reach
    // student-only endpoints (e.g. taking/submitting an exam).
    if (!allowedRoles.includes(userRole)) {
      return next(new ForbiddenError('Insufficient permissions'));
    }

    next();
  };
}
