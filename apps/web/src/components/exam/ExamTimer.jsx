import { useExamTimer } from '../../hooks/useExamTimer.js';
import { Clock, AlertTriangle } from 'lucide-react';

export default function ExamTimer({ examId, durationMinutes, onExpired }) {
  const { timeLeft, isExpired, formatTime } = useExamTimer(examId, durationMinutes);

  if (isExpired) {
    onExpired?.();
    return (
      <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-2.5 animate-pulse-soft">
        <AlertTriangle className="w-4 h-4" />
        <span className="text-sm font-semibold">Time's up!</span>
      </div>
    );
  }

  const minutes = Math.floor(timeLeft / 60);
  const isWarning = timeLeft < 300;

  return (
    <div className={`flex items-center gap-2 rounded-xl px-4 py-2.5 border transition-colors ${
      isWarning ? 'bg-red-50 border-red-200 text-red-700' : 'bg-surface-50 border-surface-200 text-surface-700'
    }`}>
      <Clock className={`w-4 h-4 ${isWarning ? 'animate-pulse-soft' : ''}`} />
      <span className={`font-mono text-lg font-bold ${isWarning ? 'text-red-600' : 'text-surface-800'}`}>
        {formatTime()}
      </span>
      {isWarning && <span className="text-xs font-medium">{minutes}m remaining</span>}
    </div>
  );
}
