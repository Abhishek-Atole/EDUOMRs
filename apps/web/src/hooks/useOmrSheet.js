import { useState, useCallback } from 'react';

export function useOmrSheet(totalQuestions) {
  const [answers, setAnswers] = useState({});

  const setAnswer = useCallback((questionIndex, option) => {
    setAnswers((prev) => ({
      ...prev,
      [questionIndex]: prev[questionIndex] === option ? null : option,
    }));
  }, []);

  const answeredCount = Object.values(answers).filter(Boolean).length;
  const skippedCount = totalQuestions - answeredCount;

  return { answers, setAnswer, answeredCount, skippedCount };
}
