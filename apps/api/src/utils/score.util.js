export function calculateScore({ answers, marksPerCorrect, marksPerWrong, negativeMarking, clampToZero = true }) {
  let totalScore = 0;
  let correctCount = 0;
  let wrongCount = 0;
  let skippedCount = 0;

  const perQuestion = [];

  for (const answer of answers) {
    const { isCorrect } = answer;

    if (isCorrect === null || isCorrect === undefined) {
      skippedCount += 1;
      perQuestion.push({ isCorrect: null, marksAwarded: 0 });
    } else if (isCorrect === true) {
      totalScore += Number(marksPerCorrect);
      correctCount += 1;
      perQuestion.push({ isCorrect: true, marksAwarded: Number(marksPerCorrect) });
    } else {
      const penalty = negativeMarking ? Math.abs(Number(marksPerWrong)) : 0;
      totalScore -= penalty;
      wrongCount += 1;
      perQuestion.push({ isCorrect: false, marksAwarded: penalty ? -penalty : 0 });
    }
  }

  const clampedScore = clampToZero ? Math.max(0, totalScore) : totalScore;
  const totalPossibleMarks = Number(marksPerCorrect) * answers.length;
  const percentage = totalPossibleMarks > 0
    ? Math.round((clampedScore / totalPossibleMarks) * 10000) / 100
    : 0;

  return {
    totalScore: clampedScore,
    totalMarks: totalPossibleMarks,
    correctCount,
    wrongCount,
    skippedCount,
    percentage,
    perQuestion,
  };
}

export async function calculateAndStoreResult(prisma, examSession, exam) {
  // Evaluate against the FULL question set so unanswered questions count as skipped
  // and the denominator reflects every question, not only the ones the student touched.
  const questions = await prisma.question.findMany({
    where: { examId: examSession.examId },
    select: { id: true, correctOption: true },
    orderBy: { orderIndex: 'asc' },
  });

  // Answer key is the source of truth for correct answers (EI-6); fall back to
  // the question's stored correctOption if no key exists.
  const answerKey = await prisma.answerKey.findUnique({ where: { examId: examSession.examId } });
  const keyEntries = answerKey?.entries || null;

  const studentAnswers = await prisma.studentAnswer.findMany({
    where: { examSessionId: examSession.id },
    select: { questionId: true, selectedOption: true },
  });
  const answerByQuestion = new Map(studentAnswers.map((sa) => [sa.questionId, sa.selectedOption]));

  const answers = questions.map((q, index) => {
    const selected = answerByQuestion.get(q.id) ?? null;
    const correct = keyEntries?.[String(index + 1)] ?? keyEntries?.[q.id] ?? q.correctOption;
    return {
      questionId: q.id,
      studentAnswer: selected,
      correctAnswer: correct,
      isCorrect: selected ? selected === correct : null,
    };
  });

  const scoreResult = calculateScore({
    answers: answers.map((a) => ({ isCorrect: a.isCorrect })),
    marksPerCorrect: Number(exam.marksPerCorrect),
    marksPerWrong: Number(exam.marksPerWrong),
    negativeMarking: exam.negativeMarking,
  });

  const result = await prisma.result.upsert({
    where: { examSessionId: examSession.id },
    update: {
      totalScore: scoreResult.totalScore,
      totalMarks: scoreResult.totalMarks,
      correctCount: scoreResult.correctCount,
      wrongCount: scoreResult.wrongCount,
      skippedCount: scoreResult.skippedCount,
      percentage: scoreResult.percentage,
    },
    create: {
      tenantId: examSession.tenantId,
      examSessionId: examSession.id,
      examId: examSession.examId,
      studentId: examSession.studentId,
      totalScore: scoreResult.totalScore,
      totalMarks: scoreResult.totalMarks,
      correctCount: scoreResult.correctCount,
      wrongCount: scoreResult.wrongCount,
      skippedCount: scoreResult.skippedCount,
      percentage: scoreResult.percentage,
    },
  });

  await prisma.questionResult.deleteMany({ where: { resultId: result.id } });

  const questionResultsData = answers.map((answer, i) => ({
    tenantId: examSession.tenantId,
    resultId: result.id,
    questionId: answer.questionId,
    studentAnswer: answer.studentAnswer,
    correctAnswer: answer.correctAnswer,
    isCorrect: answer.isCorrect === true,
    marksAwarded: scoreResult.perQuestion[i].marksAwarded,
  }));

  if (questionResultsData.length > 0) {
    await prisma.questionResult.createMany({ data: questionResultsData });
  }

  await recomputeRanks(prisma, examSession.examId);

  return result;
}

export async function recomputeRanks(prisma, examId) {
  const allResults = await prisma.result.findMany({
    where: { examId },
    orderBy: { percentage: 'desc' },
    select: { id: true, percentage: true },
  });

  let currentRank = 1;
  for (let i = 0; i < allResults.length; i++) {
    // percentage is a Prisma Decimal — compare numerically, not lexicographically.
    if (i > 0 && Number(allResults[i].percentage) < Number(allResults[i - 1].percentage)) {
      currentRank = i + 1;
    }
    await prisma.result.update({
      where: { id: allResults[i].id },
      data: { rank: currentRank, totalStudents: allResults.length },
    });
  }
}
