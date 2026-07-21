import { useState, useEffect, useCallback } from 'react';
import api from '../services/api.js';

export function useExamTimer(examId, durationMinutes) {
  const [timeLeft, setTimeLeft] = useState(durationMinutes * 60);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    if (!durationMinutes || durationMinutes <= 0) return;
    const deadline = Date.now() + durationMinutes * 60 * 1000;

    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.floor((deadline - Date.now()) / 1000));
      setTimeLeft(remaining);
      if (remaining <= 0) {
        clearInterval(interval);
        setIsExpired(true);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [durationMinutes]);

  const formatTime = useCallback(() => {
    const m = Math.floor(timeLeft / 60);
    const s = timeLeft % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }, [timeLeft]);

  return { timeLeft, isExpired, formatTime };
}
