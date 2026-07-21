import { CONSTANTS } from '../config/constants.js';

export function getPaginationParams(query) {
  const page = Math.max(1, parseInt(query.page, 10) || CONSTANTS.PAGINATION.DEFAULT_PAGE);
  const limit = Math.min(
    CONSTANTS.PAGINATION.MAX_LIMIT,
    Math.max(1, parseInt(query.limit, 10) || CONSTANTS.PAGINATION.DEFAULT_LIMIT)
  );
  const skip = (page - 1) * limit;

  return { page, limit, skip };
}

export function formatPaginationMeta(total, page, limit) {
  const totalPages = Math.ceil(total / limit);
  return {
    page,
    limit,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}

export async function paginatedQuery(prisma, model, query, options = {}) {
  const { page, limit, skip } = getPaginationParams(query);
  const { where, orderBy, include, select } = options;

  const [data, total] = await Promise.all([
    prisma[model].findMany({
      where,
      orderBy: orderBy || { createdAt: 'desc' },
      skip,
      take: limit,
      include,
      select,
    }),
    prisma[model].count({ where }),
  ]);

  return {
    data,
    pagination: formatPaginationMeta(total, page, limit),
  };
}
