import { notificationQueue, deadLetterQueue } from '../infrastructure/queue/queue.client.js';
import { sendWhatsAppMessage } from '../infrastructure/whatsapp/whatsapp.client.js';
import { sendEmail } from '../infrastructure/email/email.client.js';
import { NotificationRepository } from '../modules/notification/notification.repository.js';

notificationQueue.process(async (job) => {
  const { tenantId, parentId, parentName, parentPhone, parentEmail, studentName, examTitle, score, totalMarks, rank, totalStudents } = job.data;

  const notification = await NotificationRepository.create({
    tenantId,
    studentId: job.data.studentId,
    parentId: parentId || null,
    channel: 'whatsapp',
    status: 'queued',
    message: `Dear ${parentName}, your child ${studentName} scored ${score} out of ${totalMarks} in ${examTitle}. Rank: ${rank} out of ${totalStudents}.`,
  });

  let waResult = { success: false };

  if (parentPhone) {
    waResult = await sendWhatsAppMessage(
      parentPhone,
      'exam_result',
      [parentName, studentName, String(score), String(totalMarks), examTitle, String(rank), String(totalStudents)]
    );
  }

  if (waResult.success) {
    await NotificationRepository.update(notification.id, {
      status: 'sent',
      sentAt: new Date(),
    });
    return;
  }

  await NotificationRepository.update(notification.id, {
    status: 'failed',
    errorMessage: waResult.error || 'WhatsApp send failed',
  });

  if (job.attemptsMade < job.opts.attempts) {
    throw new Error(waResult.error || 'WhatsApp failed, will retry');
  }

  if (parentEmail) {
    const emailText = `Dear ${parentName},\n\nYour child ${studentName} scored ${score} out of ${totalMarks} in "${examTitle}".\nRank: ${rank} out of ${totalStudents}.\n\n— EduOMR`;
    const emailResult = await sendEmail(parentEmail, `Exam Result: ${examTitle}`, emailText, emailText.replace(/\n/g, '<br>'));

    await NotificationRepository.create({
      tenantId,
      studentId: job.data.studentId,
      parentId: parentId || null,
      channel: 'email',
      status: emailResult.success ? 'sent' : 'failed',
      message: emailText,
      errorMessage: emailResult.success ? null : emailResult.error,
      sentAt: emailResult.success ? new Date() : null,
    });
  }

  if (job.attemptsMade >= job.opts.attempts) {
    await NotificationRepository.update(notification.id, {
      status: 'dead_letter',
    });

    await deadLetterQueue.add({
      originalQueue: 'notification',
      originalJobId: job.id,
      tenantId,
      examId: job.data.examId,
      parentId,
      parentName,
      studentName,
      examTitle,
      error: waResult.error || 'WhatsApp failed after all retries and email fallback',
    });
  }
});

export { notificationQueue };
