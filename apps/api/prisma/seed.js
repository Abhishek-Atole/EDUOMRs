import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding EduOMR Database...');

  console.log('  Cleaning existing data...');
  const tables = [
    'question_results', 'results', 'student_answers', 'exam_sessions',
    'answer_keys', 'questions', 'notification_logs', 'exams',
    'enrollments', 'sections', 'subjects', 'classes', 'academic_years',
    'parent_students', 'refresh_tokens', 'password_reset_tokens',
    'audit_logs', 'payment_uploads', 'subscriptions', 'subscription_plans',
    'users', 'institutions',
  ];
  for (const table of tables) {
    await prisma.$executeRawUnsafe(`TRUNCATE TABLE "${table}" RESTART IDENTITY CASCADE`);
  }

  const PASSWORD = 'Admin@123';
  const passwordHash = await bcrypt.hash(PASSWORD, 12);
  const now = new Date();

  // ─── Platform Level ───────────────────────────────────────
  console.log('  Creating subscription plans...');
  const [basicPlan, proPlan, enterprisePlan] = await Promise.all([
    prisma.subscriptionPlan.create({
      data: { name: 'Basic', price: 4999, durationDays: 365, maxStudents: 100, features: ['100 Students', '5 Teachers', 'Digital Exams Only'], isActive: true },
    }),
    prisma.subscriptionPlan.create({
      data: { name: 'Pro', price: 9999, durationDays: 365, maxStudents: 500, features: ['500 Students', '25 Teachers', 'Digital + Physical OMR Exams', 'Email Notifications'], isActive: true },
    }),
    prisma.subscriptionPlan.create({
      data: { name: 'Enterprise', price: 19999, durationDays: 365, maxStudents: 2000, features: ['2000 Students', 'Unlimited Teachers', 'Both Exam Modes', 'WhatsApp + Email Alerts', 'Priority Support'], isActive: true },
    }),
  ]);

  const superInst = await prisma.institution.create({
    data: { name: 'EduOMR Platforms Inc.', status: 'active' },
  });

  await prisma.user.create({
    data: { tenantId: superInst.id, email: 'platform@eduomr.com', passwordHash, firstName: 'Platform', lastName: 'Owner', role: 'super_admin', isActive: true },
  });

  // ─── Institution 1: Alpha Academy ──────────────────────────
  console.log('  Creating Alpha Academy...');
  const alpha = await prisma.institution.create({
    data: { name: 'Alpha Academy', address: '123 Tech Park, Bangalore', contactEmail: 'admin@alpha.edu', contactPhone: '+919876543210', status: 'active' },
  });

  await prisma.subscription.create({
    data: { tenantId: alpha.id, planId: enterprisePlan.id, startDate: now, endDate: new Date(now.getTime() + 365 * 86400000), status: 'active' },
  });

  const aAdmin = await prisma.user.create({ data: { tenantId: alpha.id, email: 'admin@alpha.edu', passwordHash, firstName: 'Alpha', lastName: 'Admin', role: 'admin', isActive: true } });
  const aTeacher = await prisma.user.create({ data: { tenantId: alpha.id, email: 'teacher@alpha.edu', passwordHash, firstName: 'John', lastName: 'Teacher', role: 'teacher', isActive: true } });
  const aTeacher2 = await prisma.user.create({ data: { tenantId: alpha.id, email: 'sarah@alpha.edu', passwordHash, firstName: 'Sarah', lastName: 'Conner', role: 'teacher', isActive: true } });
  const aStudent = await prisma.user.create({ data: { tenantId: alpha.id, email: 'student@alpha.edu', passwordHash, firstName: 'Jimmy', lastName: 'Student', role: 'student', isActive: true } });
  const aStudent2 = await prisma.user.create({ data: { tenantId: alpha.id, email: 'alice@alpha.edu', passwordHash, firstName: 'Alice', lastName: 'Wonder', role: 'student', isActive: true } });
  const aStudent3 = await prisma.user.create({ data: { tenantId: alpha.id, email: 'bob@alpha.edu', passwordHash, firstName: 'Bob', lastName: 'Builder', role: 'student', isActive: true } });
  const aParent = await prisma.user.create({ data: { tenantId: alpha.id, email: 'parent@alpha.edu', passwordHash, firstName: 'James', lastName: 'Parent', role: 'parent', isActive: true } });
  const aParent2 = await prisma.user.create({ data: { tenantId: alpha.id, email: 'linda@alpha.edu', passwordHash, firstName: 'Linda', lastName: 'Parent', role: 'parent', isActive: true } });
  const aParent3 = await prisma.user.create({ data: { tenantId: alpha.id, email: 'robert@alpha.edu', passwordHash, firstName: 'Robert', lastName: 'Parent', role: 'parent', isActive: true } });

  await prisma.parentStudent.createMany({
    data: [
      { tenantId: alpha.id, parentId: aParent.id, studentId: aStudent.id },
      { tenantId: alpha.id, parentId: aParent2.id, studentId: aStudent2.id },
      { tenantId: alpha.id, parentId: aParent3.id, studentId: aStudent3.id },
    ],
  });

  console.log('  Creating academic structure for Alpha Academy...');
  const ay = await prisma.academicYear.create({ data: { tenantId: alpha.id, name: '2026-27', startDate: new Date('2026-06-01'), endDate: new Date('2027-05-31'), isCurrent: true } });
  const aClass10 = await prisma.class.create({ data: { tenantId: alpha.id, name: 'Class 10', academicYearId: ay.id } });
  const aClass12 = await prisma.class.create({ data: { tenantId: alpha.id, name: 'Class 12', academicYearId: ay.id } });

  const [secA, secB] = await Promise.all([
    prisma.section.create({ data: { tenantId: alpha.id, classId: aClass10.id, name: 'Section A' } }),
    prisma.section.create({ data: { tenantId: alpha.id, classId: aClass12.id, name: 'Section A' } }),
  ]);

  const [math, physics, english] = await Promise.all([
    prisma.subject.create({ data: { tenantId: alpha.id, classId: aClass10.id, name: 'Mathematics', code: 'MATH10' } }),
    prisma.subject.create({ data: { tenantId: alpha.id, classId: aClass12.id, name: 'Physics', code: 'PHY12' } }),
    prisma.subject.create({ data: { tenantId: alpha.id, classId: aClass10.id, name: 'English', code: 'ENG10' } }),
  ]);

  await prisma.enrollment.createMany({
    data: [
      { tenantId: alpha.id, studentId: aStudent.id, classId: aClass10.id, sectionId: secA.id, academicYearId: ay.id, isActive: true },
      { tenantId: alpha.id, studentId: aStudent2.id, classId: aClass10.id, sectionId: secA.id, academicYearId: ay.id, isActive: true },
      { tenantId: alpha.id, studentId: aStudent3.id, classId: aClass12.id, sectionId: secB.id, academicYearId: ay.id, isActive: true },
    ],
  });

  // ─── Institution 2: Beta School ────────────────────────────
  console.log('  Creating Beta School...');
  const beta = await prisma.institution.create({
    data: { name: 'Beta School', address: '456 Education Blvd, Mumbai', contactEmail: 'admin@beta.edu', contactPhone: '+919812345678', status: 'active' },
  });

  await prisma.subscription.create({
    data: { tenantId: beta.id, planId: proPlan.id, startDate: now, endDate: new Date(now.getTime() + 365 * 86400000), status: 'active' },
  });

  const bAdmin = await prisma.user.create({ data: { tenantId: beta.id, email: 'admin@beta.edu', passwordHash, firstName: 'Beta', lastName: 'Admin', role: 'admin', isActive: true } });
  const bTeacher = await prisma.user.create({ data: { tenantId: beta.id, email: 'teacher@beta.edu', passwordHash, firstName: 'Mike', lastName: 'Teacher', role: 'teacher', isActive: true } });
  const bStudent = await prisma.user.create({ data: { tenantId: beta.id, email: 'student@beta.edu', passwordHash, firstName: 'Emma', lastName: 'Student', role: 'student', isActive: true } });
  const bParent = await prisma.user.create({ data: { tenantId: beta.id, email: 'parent@beta.edu', passwordHash, firstName: 'David', lastName: 'Parent', role: 'parent', isActive: true } });

  await prisma.parentStudent.create({
    data: { tenantId: beta.id, parentId: bParent.id, studentId: bStudent.id },
  });

  const bAy = await prisma.academicYear.create({ data: { tenantId: beta.id, name: '2026-27', startDate: new Date('2026-06-01'), endDate: new Date('2027-05-31'), isCurrent: true } });
  const bClass = await prisma.class.create({ data: { tenantId: beta.id, name: 'Class 9', academicYearId: bAy.id } });
  const bSec = await prisma.section.create({ data: { tenantId: beta.id, classId: bClass.id, name: 'Section A' } });
  const bScience = await prisma.subject.create({ data: { tenantId: beta.id, classId: bClass.id, name: 'Science', code: 'SCI09' } });

  await prisma.enrollment.create({
    data: { tenantId: beta.id, studentId: bStudent.id, classId: bClass.id, sectionId: bSec.id, academicYearId: bAy.id, isActive: true },
  });

  // ═══════════════════════════════════════════════════════════════
  //  EXAMS
  // ═══════════════════════════════════════════════════════════════
  console.log('  Creating exams, questions, answer keys...');

  // ─── Alpha Academy Exams ──────────────────────────────────

  // --- Exam A1: Published/Completed Digital Exam ---
  const completedExam = await prisma.exam.create({
    data: {
      tenantId: alpha.id, title: 'Mathematics Midterm', description: 'First term assessment covering algebra, calculus and geometry.',
      examMode: 'DIGITAL', totalMarks: 30, marksPerCorrect: 10, marksPerWrong: 0, negativeMarking: false,
      durationMinutes: 45, status: 'results_released', classId: aClass10.id, subjectId: math.id, createdBy: aTeacher.id,
    },
  });

  const completedQuestions = await Promise.all([
    prisma.question.create({ data: { tenantId: alpha.id, examId: completedExam.id, questionText: 'What is the derivative of x²?', options: { A: 'x', B: '2x', C: '2', D: 'x²' }, correctOption: 'B', marks: 10, orderIndex: 0 } }),
    prisma.question.create({ data: { tenantId: alpha.id, examId: completedExam.id, questionText: 'Sum of angles in a triangle?', options: { A: '90°', B: '180°', C: '270°', D: '360°' }, correctOption: 'B', marks: 10, orderIndex: 1 } }),
    prisma.question.create({ data: { tenantId: alpha.id, examId: completedExam.id, questionText: 'Solve: 2x - 4 = 10', options: { A: '5', B: '6', C: '7', D: '8' }, correctOption: 'C', marks: 10, orderIndex: 2 } }),
  ]);

  await prisma.answerKey.create({
    data: { tenantId: alpha.id, examId: completedExam.id, entries: [{ questionNumber: 1, correctOption: 'B' }, { questionNumber: 2, correctOption: 'B' }, { questionNumber: 3, correctOption: 'C' }] },
  });

  // Session & Result for aStudent (2 correct, 1 wrong)
  const s1 = await prisma.examSession.create({
    data: { tenantId: alpha.id, examId: completedExam.id, studentId: aStudent.id, status: 'submitted', startedAt: new Date(now.getTime() - 86400000), submittedAt: now },
  });
  await prisma.studentAnswer.createMany({
    data: [
      { tenantId: alpha.id, examSessionId: s1.id, questionId: completedQuestions[0].id, selectedOption: 'B', isSaved: true },
      { tenantId: alpha.id, examSessionId: s1.id, questionId: completedQuestions[1].id, selectedOption: 'B', isSaved: true },
      { tenantId: alpha.id, examSessionId: s1.id, questionId: completedQuestions[2].id, selectedOption: 'A', isSaved: true },
    ],
  });
  const r1 = await prisma.result.create({
    data: { tenantId: alpha.id, examSessionId: s1.id, examId: completedExam.id, studentId: aStudent.id, totalScore: 20, totalMarks: 30, correctCount: 2, wrongCount: 1, skippedCount: 0, percentage: 66.67, rank: 1, totalStudents: 2, isReleased: true, releasedAt: now },
  });
  await prisma.questionResult.createMany({
    data: [
      { tenantId: alpha.id, resultId: r1.id, questionId: completedQuestions[0].id, studentAnswer: 'B', correctAnswer: 'B', isCorrect: true, marksAwarded: 10 },
      { tenantId: alpha.id, resultId: r1.id, questionId: completedQuestions[1].id, studentAnswer: 'B', correctAnswer: 'B', isCorrect: true, marksAwarded: 10 },
      { tenantId: alpha.id, resultId: r1.id, questionId: completedQuestions[2].id, studentAnswer: 'A', correctAnswer: 'C', isCorrect: false, marksAwarded: 0 },
    ],
  });

  // Session & Result for aStudent2 (3 correct)
  const s2 = await prisma.examSession.create({
    data: { tenantId: alpha.id, examId: completedExam.id, studentId: aStudent2.id, status: 'submitted', startedAt: new Date(now.getTime() - 86400000), submittedAt: now },
  });
  await prisma.studentAnswer.createMany({
    data: [
      { tenantId: alpha.id, examSessionId: s2.id, questionId: completedQuestions[0].id, selectedOption: 'B', isSaved: true },
      { tenantId: alpha.id, examSessionId: s2.id, questionId: completedQuestions[1].id, selectedOption: 'B', isSaved: true },
      { tenantId: alpha.id, examSessionId: s2.id, questionId: completedQuestions[2].id, selectedOption: 'C', isSaved: true },
    ],
  });
  const r2 = await prisma.result.create({
    data: { tenantId: alpha.id, examSessionId: s2.id, examId: completedExam.id, studentId: aStudent2.id, totalScore: 30, totalMarks: 30, correctCount: 3, wrongCount: 0, skippedCount: 0, percentage: 100, rank: 2, totalStudents: 2, isReleased: true, releasedAt: now },
  });
  await prisma.questionResult.createMany({
    data: [
      { tenantId: alpha.id, resultId: r2.id, questionId: completedQuestions[0].id, studentAnswer: 'B', correctAnswer: 'B', isCorrect: true, marksAwarded: 10 },
      { tenantId: alpha.id, resultId: r2.id, questionId: completedQuestions[1].id, studentAnswer: 'B', correctAnswer: 'B', isCorrect: true, marksAwarded: 10 },
      { tenantId: alpha.id, resultId: r2.id, questionId: completedQuestions[2].id, studentAnswer: 'C', correctAnswer: 'C', isCorrect: true, marksAwarded: 10 },
    ],
  });

  // --- Exam A2: Published (ready to take) ---
  const publishedExam = await prisma.exam.create({
    data: {
      tenantId: alpha.id, title: 'Physics Basics', description: 'Fundamentals of physics — motion, force, and energy.',
      examMode: 'DIGITAL', totalMarks: 20, marksPerCorrect: 5, marksPerWrong: 0, negativeMarking: false,
      durationMinutes: 30, status: 'PUBLISHED', classId: aClass12.id, subjectId: physics.id, createdBy: aTeacher2.id,
    },
  });

  await Promise.all([
    prisma.question.create({ data: { tenantId: alpha.id, examId: publishedExam.id, questionText: 'What is the SI unit of force?', options: { A: 'Newton', B: 'Joule', C: 'Watt', D: 'Pascal' }, correctOption: 'A', marks: 5, orderIndex: 0 } }),
    prisma.question.create({ data: { tenantId: alpha.id, examId: publishedExam.id, questionText: 'Speed = Distance / ?', options: { A: 'Mass', B: 'Time', C: 'Force', D: 'Area' }, correctOption: 'B', marks: 5, orderIndex: 1 } }),
    prisma.question.create({ data: { tenantId: alpha.id, examId: publishedExam.id, questionText: 'Energy possessed by a moving object?', options: { A: 'Potential', B: 'Thermal', C: 'Kinetic', D: 'Chemical' }, correctOption: 'C', marks: 5, orderIndex: 2 } }),
    prisma.question.create({ data: { tenantId: alpha.id, examId: publishedExam.id, questionText: 'Newton\'s first law is also called?', options: { A: 'Law of Inertia', B: 'Law of Acceleration', C: 'Law of Reaction', D: 'Law of Gravity' }, correctOption: 'A', marks: 5, orderIndex: 3 } }),
  ]);

  await prisma.answerKey.create({
    data: { tenantId: alpha.id, examId: publishedExam.id, entries: [{ questionNumber: 1, correctOption: 'A' }, { questionNumber: 2, correctOption: 'B' }, { questionNumber: 3, correctOption: 'C' }, { questionNumber: 4, correctOption: 'A' }] },
  });

  // --- Exam A3: Published Mode 2 (Physical Paper) ---
  const mode2Exam = await prisma.exam.create({
    data: {
      tenantId: alpha.id, title: 'English Grammar Test', description: 'Fill bubbles on screen based on printed question paper.',
      examMode: 'PHYSICAL_PAPER', totalMarks: 20, marksPerCorrect: 5, marksPerWrong: -1.25, negativeMarking: true,
      durationMinutes: 30, status: 'PUBLISHED', classId: aClass10.id, subjectId: english.id, createdBy: aTeacher.id,
    },
  });

  await Promise.all([
    prisma.question.create({ data: { tenantId: alpha.id, examId: mode2Exam.id, questionText: 'Q1', options: { A: 'Option A', B: 'Option B', C: 'Option C', D: 'Option D' }, correctOption: 'A', marks: 5, orderIndex: 0 } }),
    prisma.question.create({ data: { tenantId: alpha.id, examId: mode2Exam.id, questionText: 'Q2', options: { A: 'Option A', B: 'Option B', C: 'Option C', D: 'Option D' }, correctOption: 'C', marks: 5, orderIndex: 1 } }),
    prisma.question.create({ data: { tenantId: alpha.id, examId: mode2Exam.id, questionText: 'Q3', options: { A: 'Option A', B: 'Option B', C: 'Option C', D: 'Option D' }, correctOption: 'B', marks: 5, orderIndex: 2 } }),
    prisma.question.create({ data: { tenantId: alpha.id, examId: mode2Exam.id, questionText: 'Q4', options: { A: 'Option A', B: 'Option B', C: 'Option C', D: 'Option D' }, correctOption: 'D', marks: 5, orderIndex: 3 } }),
  ]);

  await prisma.answerKey.create({
    data: { tenantId: alpha.id, examId: mode2Exam.id, entries: [{ questionNumber: 1, correctOption: 'A' }, { questionNumber: 2, correctOption: 'C' }, { questionNumber: 3, correctOption: 'B' }, { questionNumber: 4, correctOption: 'D' }] },
  });

  // --- Exam A4: Draft (not yet published) ---
  await prisma.exam.create({
    data: {
      tenantId: alpha.id, title: 'Advanced Calculus Quiz', description: 'Draft quiz — coming soon.',
      examMode: 'DIGITAL', totalMarks: 50, marksPerCorrect: 10, marksPerWrong: 0, negativeMarking: false,
      durationMinutes: 60, status: 'draft', classId: aClass10.id, subjectId: math.id, createdBy: aTeacher.id,
    },
  });

  // ─── Beta School Exams ────────────────────────────────────
  const betaExam = await prisma.exam.create({
    data: {
      tenantId: beta.id, title: 'Science Quiz', description: 'General science quiz for Class 9.',
      examMode: 'DIGITAL', totalMarks: 10, marksPerCorrect: 2, marksPerWrong: 0, negativeMarking: false,
      durationMinutes: 15, status: 'PUBLISHED', classId: bClass.id, subjectId: bScience.id, createdBy: bTeacher.id,
    },
  });

  await Promise.all([
    prisma.question.create({ data: { tenantId: beta.id, examId: betaExam.id, questionText: 'H₂O is the chemical formula for?', options: { A: 'Salt', B: 'Water', C: 'Sugar', D: 'Oxygen' }, correctOption: 'B', marks: 2, orderIndex: 0 } }),
    prisma.question.create({ data: { tenantId: beta.id, examId: betaExam.id, questionText: 'Which gas do plants absorb?', options: { A: 'Oxygen', B: 'Nitrogen', C: 'CO₂', D: 'Hydrogen' }, correctOption: 'C', marks: 2, orderIndex: 1 } }),
    prisma.question.create({ data: { tenantId: beta.id, examId: betaExam.id, questionText: 'The human heart has how many chambers?', options: { A: '2', B: '3', C: '4', D: '5' }, correctOption: 'C', marks: 2, orderIndex: 2 } }),
    prisma.question.create({ data: { tenantId: beta.id, examId: betaExam.id, questionText: 'What planet is known as Red Planet?', options: { A: 'Venus', B: 'Mars', C: 'Jupiter', D: 'Saturn' }, correctOption: 'B', marks: 2, orderIndex: 3 } }),
    prisma.question.create({ data: { tenantId: beta.id, examId: betaExam.id, questionText: 'Speed of light is approx?', options: { A: '3×10⁶ m/s', B: '3×10⁸ m/s', C: '3×10¹⁰ m/s', D: '3×10¹² m/s' }, correctOption: 'B', marks: 2, orderIndex: 4 } }),
  ]);

  await prisma.answerKey.create({
    data: { tenantId: beta.id, examId: betaExam.id, entries: [{ questionNumber: 1, correctOption: 'B' }, { questionNumber: 2, correctOption: 'C' }, { questionNumber: 3, correctOption: 'C' }, { questionNumber: 4, correctOption: 'B' }, { questionNumber: 5, correctOption: 'B' }] },
  });

  // ─── Summary ─────────────────────────────────────────────
  console.log('\n\x1b[32m✓ Database Seeding Complete!\x1b[0m');
  console.log('\n\x1b[1mLogin Credentials\x1b[0m (all passwords: \x1b[33mAdmin@123\x1b[0m)');
  console.log('  ┌──────────────────────┬──────────────────────────────┬──────────────┐');
  console.log('  │ Role                 │ Email                        │ Institution  │');
  console.log('  ├──────────────────────┼──────────────────────────────┼──────────────┤');
  console.log('  │ Super Admin          │ platform@eduomr.com          │ —            │');
  console.log('  │ Institution Admin    │ admin@alpha.edu              │ Alpha Academy│');
  console.log('  │ Teacher              │ teacher@alpha.edu            │ Alpha Academy│');
  console.log('  │ Teacher              │ sarah@alpha.edu              │ Alpha Academy│');
  console.log('  │ Student              │ student@alpha.edu            │ Alpha Academy│');
  console.log('  │ Student              │ alice@alpha.edu              │ Alpha Academy│');
  console.log('  │ Student              │ bob@alpha.edu                │ Alpha Academy│');
  console.log('  │ Parent               │ parent@alpha.edu             │ Alpha Academy│');
  console.log('  │ Institution Admin    │ admin@beta.edu               │ Beta School  │');
  console.log('  │ Teacher              │ teacher@beta.edu             │ Beta School  │');
  console.log('  │ Student              │ student@beta.edu             │ Beta School  │');
  console.log('  │ Parent               │ parent@beta.edu              │ Beta School  │');
  console.log('  └──────────────────────┴──────────────────────────────┴──────────────┘');
  console.log('\n\x1b[1mSample Exams\x1b[0m');
  console.log('  Alpha Academy:');
  console.log('    • Mathematics Midterm  (DIGITAL, 3 Qs)    — results_released ✓');
  console.log('    • Physics Basics        (DIGITAL, 4 Qs)    — PUBLISHED');
  console.log('    • English Grammar Test  (PHYSICAL_PAPER, 4 Qs) — PUBLISHED');
  console.log('    • Advanced Calculus Quiz(DIGITAL, draft)   — draft');
  console.log('  Beta School:');
  console.log('    • Science Quiz          (DIGITAL, 5 Qs)    — PUBLISHED');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('Seeding failed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
