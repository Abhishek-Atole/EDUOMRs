import { ChevronLeft, ChevronRight, Circle, CheckCircle2 } from 'lucide-react';

export default function QuestionPanel({ questions, currentIndex, onNavigate, answers }) {
  const q = questions[currentIndex];
  if (!q) return null;

  const isObj = q.options && !Array.isArray(q.options);
  const entries = isObj ? Object.entries(q.options) : (q.options || []);
  const currentAnswer = answers[currentIndex];

  return (
    <div className="bg-white rounded-xl border border-surface-200 shadow-sm animate-fade-in">
      <div className="p-5 border-b border-surface-100 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary-50 text-primary-700 text-sm font-bold">
            {currentIndex + 1}
          </span>
          <div>
            <p className="text-sm font-medium text-surface-900">Question {currentIndex + 1} of {questions.length}</p>
          </div>
        </div>
        <span className="text-xs bg-surface-100 text-surface-600 px-2.5 py-1 rounded-full font-medium">
          {q.marks} mark{q.marks > 1 ? 's' : ''}
        </span>
      </div>

      <div className="p-5">
        <p className="text-base text-surface-900 leading-relaxed mb-5">{q.questionText}</p>
        <div className="space-y-2.5">
          {entries.map((entry) => {
            const [label, text] = isObj ? [entry[0], entry[1]] : [entry.label, entry.text];
            const isSelected = currentAnswer === label;
            return (
              <button
                key={label}
                type="button"
                onClick={() => onNavigate(currentIndex, label)}
                className={`w-full text-left p-3.5 rounded-xl border-2 transition-all ${
                  isSelected
                    ? 'bg-primary-50 border-primary-500 shadow-sm'
                    : 'bg-white border-surface-200 hover:border-primary-300 hover:bg-surface-50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold shrink-0 mt-0.5 ${
                    isSelected ? 'bg-primary-600 text-white' : 'bg-surface-100 text-surface-600'
                  }`}>
                    {isSelected ? <CheckCircle2 className="w-3.5 h-3.5" /> : label}
                  </span>
                  <span className={`text-sm pt-1 ${isSelected ? 'text-primary-900 font-medium' : 'text-surface-700'}`}>{text}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="px-5 pb-5 flex justify-between gap-3">
        <button
          type="button"
          onClick={() => onNavigate(currentIndex - 1)}
          disabled={currentIndex === 0}
          className="flex items-center gap-1.5 px-4 py-2 text-sm rounded-lg border border-surface-200 text-surface-600 hover:bg-surface-50 hover:text-surface-900 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          <ChevronLeft className="w-4 h-4" /> Previous
        </button>
        <button
          type="button"
          onClick={() => onNavigate(currentIndex + 1)}
          disabled={currentIndex === questions.length - 1}
          className="flex items-center gap-1.5 px-4 py-2 text-sm rounded-lg border border-surface-200 text-surface-600 hover:bg-surface-50 hover:text-surface-900 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          Next <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
