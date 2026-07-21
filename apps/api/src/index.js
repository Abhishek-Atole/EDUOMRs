import { env } from './config/env.js';
import { ROLES, ROLE_HIERARCHY, PERMISSIONS } from './config/roles.js';
import { CONSTANTS } from './config/constants.js';
import { getPrisma, disconnectPrisma } from './infrastructure/database/prisma.js';
import { getRedis, connectRedis, disconnectRedis } from './infrastructure/cache/redis.js';
import { requestIdMiddleware } from './middleware/requestId.js';
import { authenticate } from './middleware/auth.js';
import { authorize } from './middleware/rbac.js';
import { tenantGuard } from './middleware/tenant.js';
import { validate, validateQuery, validateParams } from './middleware/validate.js';
import { errorHandler } from './middleware/error.js';
import { subscriptionGuard } from './middleware/subscriptionGuard.js';
import { successResponse, createdResponse, paginatedResponse, noContentResponse } from './utils/response.util.js';
import { calculateScore, calculateAndStoreResult } from './utils/score.util.js';
import { getPaginationParams, formatPaginationMeta, paginatedQuery } from './utils/pagination.util.js';
import { formatIndianPhone, maskPhone, isValidIndianPhone } from './utils/phone.util.js';
import { AppError, AuthenticationError, ValidationError, ForbiddenError, NotFoundError, ConflictError, ExamExpiredError, RateLimitError } from './types/errors.js';
import { UserRole, ExamMode, ExamStatus, SessionStatus, InstitutionStatus, SubscriptionStatus, PaymentStatus, NotificationChannel, NotificationStatus } from './types/enums.js';

export {
  env,
  ROLES,
  ROLE_HIERARCHY,
  PERMISSIONS,
  CONSTANTS,
  getPrisma,
  disconnectPrisma,
  getRedis,
  connectRedis,
  disconnectRedis,
  requestIdMiddleware,
  authenticate,
  authorize,
  tenantGuard,
  validate,
  validateQuery,
  validateParams,
  errorHandler,
  subscriptionGuard,
  successResponse,
  createdResponse,
  paginatedResponse,
  noContentResponse,
  calculateScore,
  calculateAndStoreResult,
  getPaginationParams,
  formatPaginationMeta,
  paginatedQuery,
  formatIndianPhone,
  maskPhone,
  isValidIndianPhone,
  AppError,
  AuthenticationError,
  ValidationError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  ExamExpiredError,
  RateLimitError,
  UserRole,
  ExamMode,
  ExamStatus,
  SessionStatus,
  InstitutionStatus,
  SubscriptionStatus,
  PaymentStatus,
  NotificationChannel,
  NotificationStatus,
};
