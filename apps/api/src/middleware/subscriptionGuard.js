import { getCache, setCache } from '../infrastructure/cache/redis.js';
import { ForbiddenError } from '../types/errors.js';

export function subscriptionGuard(req, _res, next) {
  const tenantId = req.tenantId || req.user?.tenantId;

  if (!tenantId) {
    return next();
  }

  (async () => {
    try {
      const cacheKey = `sub:active:${tenantId}`;
      let isActive = await getCache(cacheKey);

      if (isActive === null) {
        const { getPrisma } = await import('../infrastructure/database/prisma.js');
        const prisma = getPrisma();

        const sub = await prisma.subscription.findFirst({
          where: {
            tenantId,
            status: 'active',
            endDate: { gte: new Date() },
          },
          orderBy: { endDate: 'desc' },
        });

        isActive = !!sub;
        await setCache(cacheKey, isActive, 300);
      }

      if (!isActive) {
        return next(new ForbiddenError('Active subscription required'));
      }

      next();
    } catch (err) {
      console.error('Subscription guard error:', err.message);
      next();
    }
  })();
}
