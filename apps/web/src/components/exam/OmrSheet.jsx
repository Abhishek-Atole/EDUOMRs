import { Circle, CheckCircle2 } from 'lucide-react';

const OPTIONS = ['A', 'B', 'C', 'D'];

export default function OmrSheet({ totalQuestions, answers, onAnswer, answeredCount, skippedCount }) {
  const total = totalQuestions || 0;

  return (
    <div className="bg-white rounded-xl border border-surface-200 shadow-sm">
      <div className="p-4 border-b border-surface-100">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-surface-800 text-sm">OMR Answer Sheet</h3>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-green-500" /> {answeredCount} Answered</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-surface-300" /> {skippedCount} Skipped</span>
          </div>
        </div>
        <div className="mt-2 w-full bg-surface-100 rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-primary-500 h-full rounded-full transition-all duration-300"
            style={{ width: `${total ? (answeredCount / total) * 100 : 0}%` }}
          />
        </div>
      </div>
      <div className="p-4 max-h-[400px] overflow-y-auto">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {Array.from({ length: total }, (_, i) => (
            <div
              key={i}
              className={`rounded-lg border text-center transition-all ${
                answers[i] ? 'border-primary-200 bg-primary-50/50' : 'border-surface-200 bg-white'
              }`}
            >
              <p className="text-[10px] text-surface-400 pt-1.5 pb-0.5 font-medium">Q{(i + 1).toString().padStart(2, '0')}</p>
              <div className="flex justify-center gap-0.5 pb-1.5">
                {OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => onAnswer(i, opt)}
                    className={`w-7 h-7 text-xs rounded-full border transition-all ${
                      answers[i] === opt
                        ? 'bg-primary-600 text-white border-primary-600 shadow-sm scale-105'
                        : 'bg-white text-surface-600 border-surface-300 hover:border-primary-400 hover:bg-primary-50'
                    }`}
                  >
                    {answers[i] === opt ? <CheckCircle2 className="w-3.5 h-3.5 mx-auto" /> : opt}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
