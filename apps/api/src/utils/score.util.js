export function calculateScore({ answers, marksPerCorrect, marksPerWrong, negativeMarking }) {
  let totalScore = 0;
  let correctCount = 0;
  let wrongCount = 0;
  let skippedCount = 0;

  const perQuestion = [];

  for (const answer of answers) {
    const { isCorrect } = answer;

    if (isCorrect === null || isCorrect === undefined) {
      skippedCount += 1;
      perQuestion.push({
        isCorrect: null,
        marksAwarded: 0,
      });
    } else if (isCorrect === true) {
      totalScore += Number(marksPerCorrect);
      correctCount += 1;
      perQuestion.push({
        isCorrect: true,
        marksAwarded: Number(marksPerCorrect),
      });
    } else {
      totalScore -= negativeMarking ? Number(marksPerWrong) : 0;
      wrongCount += 1;
      perQuestion.push({
        isCorrect: false,
        marksAwarded: negativeMarking ? -Number(marksPerWrong) : 0,
      });
    }
  }

  const totalPossibleMarks = Number(marksPerCorrect) * answers.length;
  const percentage = totalPossibleMarks > 0
    ? Math.round((totalScore / totalPossibleMarks) * 10000) / 100
    : 0;

  return {
    totalScore: Math.max(0, totalScore),
    totalMarks: totalPossibleMarks,
    correctCount,
    wrongCount,
    skippedCount,
    percentage,
    perQuestion,
  };
}

export async function calculateAndStoreResult(prisma, examSession, exam) {
  const studentAnswers = await prisma.studentAnswer.findMany({
    where: { examSessionId: examSession.id },
    include: {
      question: {
        select: { id: true, correctOption: true, marks: true },
      },
    },
  });

  const answers = studentAnswers.map((sa) => ({
    questionId: sa.questionId,
    studentAnswer: sa.selectedOption,
    correctAnswer: sa.question.correctOption,
    isCorrect: sa.selectedOption
      ? sa.selectedOption === sa.question.correctOption
      : null,
    marks: Number(sa.question.marks),
  }));

  const scoreResult = calculateScore({
    answers: answers.map((a) => ({
      isCorrect: a.isCorrect,
    })),
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

  await prisma.questionResult.deleteMany({
    where: { resultId: result.id },
  });

  const questionResultsData = [];
  for (let i = 0; i < answers.length; i++) {
    const answer = answers[i];
    questionResultsData.push({
      tenantId: examSession.tenantId,
      resultId: result.id,
      questionId: answer.questionId,
      studentAnswer: answer.studentAnswer,
      correctAnswer: answer.correctAnswer,
      isCorrect: answer.isCorrect === true,
      marksAwarded: scoreResult.perQuestion[i].marksAwarded,
    });
  }

  if (questionResultsData.length > 0) {
    await prisma.questionResult.createMany({
      data: questionResultsData,
    });
  }

  const allResults = await prisma.result.findMany({
    where: { examId: examSession.examId },
    orderBy: { percentage: 'desc' },
    select: { id: true, percentage: true },
  });

  let currentRank = 1;
  const rankUpdates = [];
  for (let i = 0; i < allResults.length; i++) {
    if (i > 0 && allResults[i].percentage < allResults[i - 1].percentage) {
      currentRank = i + 1;
    }
    rankUpdates.push({
      id: allResults[i].id,
      rank: currentRank,
      totalStudents: allResults.length,
    });
  }

  for (const update of rankUpdates) {
    await prisma.result.update({
      where: { id: update.id },
      data: { rank: update.rank, totalStudents: update.totalStudents },
    });
  }

  return result;
}
