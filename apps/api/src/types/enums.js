export const UserRole = Object.freeze({
  PLATFORM_OWNER: 'platform_owner',
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  TEACHER: 'teacher',
  STUDENT: 'student',
  PARENT: 'parent',
});

export const ExamMode = Object.freeze({
  DIGITAL: 'DIGITAL',
  PHYSICAL_PAPER: 'PHYSICAL_PAPER',
});

export const ExamStatus = Object.freeze({
  DRAFT: 'draft',
  PUBLISHED: 'published',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  RESULTS_RELEASED: 'results_released',
});

export const SessionStatus = Object.freeze({
  IN_PROGRESS: 'in_progress',
  SUBMITTED: 'submitted',
  AUTO_SUBMITTED: 'auto_submitted',
  EXPIRED: 'expired',
});

export const InstitutionStatus = Object.freeze({
  PENDING: 'pending',
  ACTIVE: 'active',
  DISABLED: 'disabled',
});

export const SubscriptionStatus = Object.freeze({
  ACTIVE: 'active',
  EXPIRED: 'expired',
  CANCELLED: 'cancelled',
});

export const PaymentStatus = Object.freeze({
  PENDING: 'pending',
  VERIFIED: 'verified',
  REJECTED: 'rejected',
});

export const NotificationChannel = Object.freeze({
  WHATSAPP: 'whatsapp',
  EMAIL: 'email',
});

export const NotificationStatus = Object.freeze({
  QUEUED: 'queued',
  SENT: 'sent',
  FAILED: 'failed',
  DEAD_LETTER: 'dead_letter',
});
