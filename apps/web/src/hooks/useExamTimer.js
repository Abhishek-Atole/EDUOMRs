import { useState, useEffect, useCallback } from 'react';

// deadlineAt (ISO string from server) is the authoritative deadline.
// durationMinutes is a fallback used only when deadlineAt is absent.
export function useExamTimer(examId, durationMinutes, deadlineAt) {
  const computeDeadlineMs = () => {
    if (deadlineAt) return new Date(deadlineAt).getTime();
    if (durationMinutes > 0) return Date.now() + durationMinutes * 60 * 1000;
    return null;
  };

  const [deadlineMs] = useState(computeDeadlineMs);
  const [timeLeft, setTimeLeft] = useState(() => {
    if (!deadlineMs) return 0;
    return Math.max(0, Math.floor((deadlineMs - Date.now()) / 1000));
  });
  const [isExpired, setIsExpired] = useState(() => !deadlineMs || Date.now() >= deadlineMs);

  useEffect(() => {
    if (!deadlineMs) return;
    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.floor((deadlineMs - Date.now()) / 1000));
      setTimeLeft(remaining);
      if (remaining <= 0) {
        clearInterval(interval);
        setIsExpired(true);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [deadlineMs]);

  const formatTime = useCallback(() => {
    const m = Math.floor(timeLeft / 60);
    const s = timeLeft % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }, [timeLeft]);

  return { timeLeft, isExpired, formatTime };
}
