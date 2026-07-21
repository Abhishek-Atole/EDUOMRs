import { ROLE_HIERARCHY } from '../config/roles.js';
import { ForbiddenError } from '../types/errors.js';

export function authorize(...allowedRoles) {
  return (req, _res, next) => {
    const userRole = req.user?.role;

    if (!userRole) {
      return next(new ForbiddenError('Authentication required'));
    }

    const userLevel = ROLE_HIERARCHY[userRole];
    if (userLevel === undefined) {
      return next(new ForbiddenError('Invalid role'));
    }

    const hasAccess = allowedRoles.some((role) => {
      const allowedLevel = ROLE_HIERARCHY[role];
      return allowedLevel !== undefined && userLevel >= allowedLevel;
    });

    if (!hasAccess) {
      return next(new ForbiddenError('Insufficient permissions'));
    }

    next();
  };
}
