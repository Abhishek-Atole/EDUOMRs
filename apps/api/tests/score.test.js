import { calculateScore } from '../src/utils/score.util.js';

const a = (isCorrect) => ({ isCorrect });

describe('calculateScore', () => {
  it('scores correct answers with marksPerCorrect', () => {
    const r = calculateScore({
      answers: [a(true), a(true), a(false), a(null)],
      marksPerCorrect: 4,
      marksPerWrong: 1,
      negativeMarking: false,
    });
    expect(r.correctCount).toBe(2);
    expect(r.wrongCount).toBe(1);
    expect(r.skippedCount).toBe(1);
    expect(r.totalScore).toBe(8);
  });

  it('counts unanswered questions as skipped and includes them in the denominator', () => {
    const r = calculateScore({
      answers: [a(true), a(null), a(null), a(null)],
      marksPerCorrect: 1,
      marksPerWrong: 0,
      negativeMarking: false,
    });
    expect(r.skippedCount).toBe(3);
    expect(r.totalMarks).toBe(4);
    expect(r.percentage).toBe(25);
  });

  it('subtracts a positive marksPerWrong magnitude when negative marking is on', () => {
    const r = calculateScore({
      answers: [a(true), a(false), a(false)],
      marksPerCorrect: 4,
      marksPerWrong: 1,
      negativeMarking: true,
    });
    expect(r.totalScore).toBe(2);
    expect(r.perQuestion[1].marksAwarded).toBe(-1);
  });

  it('ignores marksPerWrong when negative marking is off', () => {
    const r = calculateScore({
      answers: [a(true), a(false)],
      marksPerCorrect: 4,
      marksPerWrong: 1,
      negativeMarking: false,
    });
    expect(r.totalScore).toBe(4);
    expect(r.perQuestion[1].marksAwarded).toBe(0);
  });

  it('clamps the score to zero before deriving percentage', () => {
    const r = calculateScore({
      answers: [a(false), a(false), a(false)],
      marksPerCorrect: 4,
      marksPerWrong: 2,
      negativeMarking: true,
    });
    expect(r.totalScore).toBe(0);
    expect(r.percentage).toBe(0);
  });

  it('returns zero percentage for an empty answer set', () => {
    const r = calculateScore({
      answers: [],
      marksPerCorrect: 4,
      marksPerWrong: 1,
      negativeMarking: false,
    });
    expect(r.totalMarks).toBe(0);
    expect(r.percentage).toBe(0);
  });

  it('rounds percentage to two decimals', () => {
    const r = calculateScore({
      answers: [a(true), a(false), a(false)],
      marksPerCorrect: 1,
      marksPerWrong: 0,
      negativeMarking: false,
    });
    expect(r.percentage).toBe(33.33);
  });
});
