import { notificationQueue, deadLetterQueue } from '../infrastructure/queue/queue.client.js';
import { sendWhatsAppMessage } from '../infrastructure/whatsapp/whatsapp.client.js';
import { sendEmail } from '../infrastructure/email/email.client.js';
import { NotificationRepository } from '../modules/notification/notification.repository.js';

notificationQueue.process(async (job) => {
  const {
    tenantId, examId, studentId,
    parentId, parentName, parentPhone, parentEmail,
    studentName, examTitle, score, totalMarks, rank, totalStudents,
  } = job.data;

  // Record this attempt — create on attempt 0, skip duplicate creation on retries
  // because the initial log row already exists (NR-3).
  const attemptNumber = job.attemptsMade + 1;
  const totalAttempts = job.opts.attempts || 3;

  let notification;
  if (attemptNumber === 1) {
    notification = await NotificationRepository.create({
      tenantId,
      examId: examId || null,
      studentId: studentId || null,
      parentId: parentId || null,
      channel: 'whatsapp',
      status: 'queued',
      attemptNumber: 1,
      maxRetries: totalAttempts,
      message: `Dear ${parentName}, your child ${studentName} scored ${score} out of ${totalMarks} in ${examTitle}. Rank: ${rank} out of ${totalStudents}.`,
    });
  }

  let waResult = { success: false };

  if (parentPhone) {
    waResult = await sendWhatsAppMessage(
      parentPhone,
      'exam_result',
      [parentName, studentName, String(score), String(totalMarks), examTitle, String(rank), String(totalStudents)]
    );
  }

  if (waResult.success) {
    if (notification) {
      await NotificationRepository.update(notification.id, { status: 'sent', sentAt: new Date() });
    }
    return;
  }

  if (notification) {
    await NotificationRepository.update(notification.id, {
      status: 'failed',
      errorMessage: waResult.error || 'WhatsApp send failed',
    });
  }

  // Retry if attempts remain. On the LAST attempt (attemptsMade === totalAttempts - 1),
  // fall through to email fallback instead of throwing again (NR-4).
  if (job.attemptsMade < totalAttempts - 1) {
    throw new Error(waResult.error || 'WhatsApp failed, will retry');
  }

  // All WhatsApp retries exhausted — email fallback (NR-5).
  if (parentEmail) {
    const emailText = `Dear ${parentName},\n\nYour child ${studentName} scored ${score} out of ${totalMarks} in "${examTitle}".\nRank: ${rank} out of ${totalStudents}.\n\n— EduOMR`;
    const emailResult = await sendEmail(parentEmail, `Exam Result: ${examTitle}`, emailText, emailText.replace(/\n/g, '<br>'));

    await NotificationRepository.create({
      tenantId,
      examId: examId || null,
      studentId: studentId || null,
      parentId: parentId || null,
      channel: 'email',
      status: emailResult.success ? 'sent' : 'failed',
      message: emailText,
      errorMessage: emailResult.success ? null : emailResult.error,
      sentAt: emailResult.success ? new Date() : null,
    });
  }

  if (notification) {
    await NotificationRepository.update(notification.id, { status: 'dead_letter' });
  }

  await deadLetterQueue.add({
    originalQueue: 'notification',
    originalJobId: job.id,
    tenantId,
    examId: examId || null,
    studentId: studentId || null,
    parentId,
    parentName,
    studentName,
    examTitle,
    error: waResult.error || 'WhatsApp failed after all retries and email fallback',
  });
});

export { notificationQueue };
