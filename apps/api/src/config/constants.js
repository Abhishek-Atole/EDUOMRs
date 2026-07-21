export const CONSTANTS = Object.freeze({
  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 20,
    MAX_LIMIT: 100,
  },

  EXAM_STATUS: Object.freeze({
    DRAFT: 'draft',
    PUBLISHED: 'published',
    IN_PROGRESS: 'in_progress',
    COMPLETED: 'completed',
    RESULTS_RELEASED: 'results_released',
  }),

  EXAM_MODE: Object.freeze({
    DIGITAL: 'DIGITAL',
    PHYSICAL_PAPER: 'PHYSICAL_PAPER',
  }),

  SESSION_STATUS: Object.freeze({
    IN_PROGRESS: 'in_progress',
    SUBMITTED: 'submitted',
    AUTO_SUBMITTED: 'auto_submitted',
    EXPIRED: 'expired',
  }),

  INSTITUTION_STATUS: Object.freeze({
    PENDING: 'pending',
    ACTIVE: 'active',
    DISABLED: 'disabled',
  }),

  SUBSCRIPTION_STATUS: Object.freeze({
    ACTIVE: 'active',
    EXPIRED: 'expired',
    CANCELLED: 'cancelled',
  }),

  PAYMENT_STATUS: Object.freeze({
    PENDING: 'pending',
    VERIFIED: 'verified',
    REJECTED: 'rejected',
  }),

  NOTIFICATION_CHANNEL: Object.freeze({
    WHATSAPP: 'whatsapp',
    EMAIL: 'email',
  }),

  NOTIFICATION_STATUS: Object.freeze({
    QUEUED: 'queued',
    SENT: 'sent',
    FAILED: 'failed',
    DEAD_LETTER: 'dead_letter',
  }),

  AUTO_SAVE_INTERVAL_MS: 30000,
  MAX_RETRY_ATTEMPTS: 3,
  RETRY_BACKOFF_MS: [2000, 4000, 8000],
  REFRESH_TOKEN_BYTES: 64,
  PASSWORD_RESET_EXPIRY_HOURS: 1,
});
