import { useRef, useEffect, useCallback } from 'react';
import api from '../services/api.js';

export function useAutoSave(sessionId, answers) {
  const savedRef = useRef(answers);

  const save = useCallback(async () => {
    if (!sessionId || !answers) return;
    try {
      const entries = Object.entries(answers);
      if (entries.length === 0) return;
      await api.post(`/submissions/${sessionId}/bulk-save`, {
        answers: entries.map(([questionId, selectedOption]) => ({ questionId, selectedOption })),
      });
    } catch { /* auto-save failures are silent */ }
  }, [sessionId, answers]);

  useEffect(() => {
    savedRef.current = answers;
  }, [answers]);

  useEffect(() => {
    if (!sessionId) return;
    const interval = setInterval(() => save(), 30000);
    return () => clearInterval(interval);
  }, [sessionId, save]);

  return { save };
}
