export default function QuestionNavigator({ totalQuestions, currentIndex, answers, onSelect }) {
  return (
    <div className="bg-white rounded-xl border border-surface-200 shadow-sm p-4">
      <h3 className="font-semibold text-surface-800 text-sm mb-3">Question Navigator</h3>
      <div className="grid grid-cols-5 gap-1.5">
        {Array.from({ length: totalQuestions }, (_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => onSelect(i)}
            className={`w-full aspect-square rounded-lg text-xs font-medium transition-all ${
              i === currentIndex
                ? 'ring-2 ring-primary-500 bg-primary-50 text-primary-700'
                : answers[i]
                  ? 'bg-primary-100 text-primary-700'
                  : 'bg-surface-100 text-surface-500 hover:bg-surface-200'
            }`}
          >
            {i + 1}
          </button>
        ))}
      </div>
      <div className="mt-3 pt-3 border-t border-surface-100 flex items-center gap-3 text-[10px] text-surface-500">
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-primary-100" /> Answered</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-surface-100" /> Not answered</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded ring-2 ring-primary-500" /> Current</span>
      </div>
    </div>
  );
}
