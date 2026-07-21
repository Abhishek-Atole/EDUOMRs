import { ExamRepository } from './exam.repository.js';
import { getPrisma } from '../../infrastructure/database/prisma.js';
import { NotFoundError, ValidationError } from '../../types/errors.js';

export class ExamService {
  static async list(tenantId, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    return ExamRepository.findAll(tenantId, page, limit, skip);
  }

  static async getById(tenantId, id) {
    const exam = await ExamRepository.findById(tenantId, id);
    if (!exam) throw new NotFoundError('Exam not found');
    return exam;
  }

  static async create(tenantId, data, userId) {
    // Transform frontend payload to backend schema
    // Frontend sends: totalMarks, passingMarks, negativeMarking, negativeMarksPerQuestion
    // Backend stores: totalMarks, marksPerCorrect (per question), marksPerWrong (per question)
    const marksPerCorrect = data.marksPerCorrect || 1;
    let marksPerWrong = 0;

    // marksPerWrong is stored as a positive magnitude; the score engine subtracts it.
    if (data.negativeMarking && data.negativeMarksPerQuestion) {
      marksPerWrong = Math.abs(data.negativeMarksPerQuestion);
    }
    
    return ExamRepository.create(tenantId, {
      title: data.title,
      description: data.description || null,
      examMode: data.examMode,
      totalMarks: data.totalMarks,
      marksPerCorrect,
      marksPerWrong,
      negativeMarking: data.negativeMarking || false,
      durationMinutes: data.durationMinutes,
      scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : null,
      deadlineAt: data.deadlineAt ? new Date(data.deadlineAt) : null,
      classId: data.classId || null,
      subjectId: data.subjectId || null,
      createdBy: userId,
      status: 'draft',
    });
  }

  static async update(tenantId, id, data) {
    const exam = await ExamRepository.findById(tenantId, id);
    if (!exam) throw new NotFoundError('Exam not found');
    if (exam.status !== 'draft') throw new ValidationError('Only draft exams can be edited');

    const updateData = {};
    if (data.title) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.totalMarks) updateData.totalMarks = data.totalMarks;
    if (data.marksPerCorrect) updateData.marksPerCorrect = data.marksPerCorrect;
    if (data.marksPerWrong !== undefined) updateData.marksPerWrong = Math.abs(data.marksPerWrong);
    if (data.negativeMarksPerQuestion !== undefined) updateData.marksPerWrong = Math.abs(data.negativeMarksPerQuestion);
    if (data.negativeMarking !== undefined) updateData.negativeMarking = data.negativeMarking;
    if (data.durationMinutes) updateData.durationMinutes = data.durationMinutes;
    if (data.scheduledAt !== undefined) updateData.scheduledAt = data.scheduledAt ? new Date(data.scheduledAt) : null;
    if (data.deadlineAt !== undefined) updateData.deadlineAt = data.deadlineAt ? new Date(data.deadlineAt) : null;
    if (data.classId !== undefined) updateData.classId = data.classId || null;
    if (data.subjectId !== undefined) updateData.subjectId = data.subjectId || null;

    return ExamRepository.update(tenantId, id, updateData);
  }

  static async delete(tenantId, id) {
    const exam = await ExamRepository.findById(tenantId, id);
    if (!exam) throw new NotFoundError('Exam not found');
    if (exam.status !== 'draft') throw new ValidationError('Only draft exams can be deleted');

    await ExamRepository.softDelete(tenantId, id);
  }

  static async publish(tenantId, id, scheduleData) {
    const exam = await ExamRepository.findById(tenantId, id);
    if (!exam) throw new NotFoundError('Exam not found');
    if (exam.status !== 'draft') throw new ValidationError('Exam is already published');

    const prisma = getPrisma();

    if (exam.examMode === 'DIGITAL') {
      const questionCount = await prisma.question.count({ where: { examId: id } });
      if (questionCount === 0) throw new ValidationError('Cannot publish a digital exam with no questions');
    }

    if (exam.examMode === 'PHYSICAL_PAPER') {
      const answerKey = await prisma.answerKey.findUnique({ where: { examId: id } });
      if (!answerKey) throw new ValidationError('Cannot publish a physical paper exam without an answer key');
    }

    const updateData = { status: 'published' };
    if (scheduleData.scheduledAt) updateData.scheduledAt = new Date(scheduleData.scheduledAt);
    if (scheduleData.deadlineAt) updateData.deadlineAt = new Date(scheduleData.deadlineAt);

    return ExamRepository.update(tenantId, id, updateData);
  }
}
