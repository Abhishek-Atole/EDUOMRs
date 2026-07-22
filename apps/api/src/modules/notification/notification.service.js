import { notificationQueue } from '../../infrastructure/queue/queue.client.js';
import { NotificationRepository } from './notification.repository.js';

export class NotificationService {
  static async sendResultNotifications(tenantId, examId) {
    const notifications = await NotificationRepository.findPendingParentsByExam(tenantId, examId);

    if (notifications.length === 0) return { queued: 0 };

    for (const n of notifications) {
      await notificationQueue.add(
        {
          tenantId,
          examId,
          studentId: n.student.id,
          parentId: n.parent.id,
          parentName: `${n.parent.firstName} ${n.parent.lastName || ''}`.trim(),
          parentPhone: n.parent.phone,
          parentEmail: n.parent.email,
          studentName: `${n.student.firstName} ${n.student.lastName || ''}`.trim(),
          examTitle: n.examTitle,
          score: Number(n.score),
          totalMarks: Number(n.totalMarks),
          rank: n.rank,
          totalStudents: n.totalStudents,
        },
        // Idempotency: one job per student-exam pair (NR-3).
        { jobId: `notif-${examId}-${n.student.id}` }
      );
    }

    return { queued: notifications.length };
  }
}
