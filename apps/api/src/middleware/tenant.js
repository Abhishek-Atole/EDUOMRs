import { ForbiddenError } from '../types/errors.js';

export function tenantGuard(req, _res, next) {
  const requestTenantId = req.user?.tenantId;

  if (!requestTenantId) {
    return next(new ForbiddenError('Tenant context required'));
  }

  const paramTenantId = req.params.tenantId;
  const bodyTenantId = req.body?.tenantId;

  if (paramTenantId && paramTenantId !== requestTenantId) {
    return next(new ForbiddenError('Tenant mismatch'));
  }

  if (bodyTenantId && bodyTenantId !== requestTenantId) {
    return next(new ForbiddenError('Cannot set tenant_id in request body'));
  }

  req.tenantId = requestTenantId;
  next();
}
