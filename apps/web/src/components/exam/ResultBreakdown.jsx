import { CheckCircle2, XCircle, MinusCircle, Trophy, Target, BarChart3, Award } from 'lucide-react';
import { Badge } from '../ui/badge.jsx';

export default function ResultBreakdown({ result }) {
  if (!result) return null;

  const perQuestion = result.questionResults || result.breakdown || [];
  const percentage = Number(result.percentage || 0);
  const totalScore = Number(result.totalScore || 0);
  const totalMarks = Number(result.totalMarks || 1);

  const grade = percentage >= 90 ? 'A+' : percentage >= 80 ? 'A' : percentage >= 70 ? 'B' : percentage >= 60 ? 'C' : percentage >= 40 ? 'D' : 'F';
  const gradeColor = percentage >= 70 ? 'success' : percentage >= 40 ? 'warning' : 'danger';

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-primary-50 rounded-xl p-4 text-center border border-primary-100">
          <Trophy className="w-5 h-5 text-primary-600 mx-auto mb-1" />
          <p className="text-2xl font-bold text-primary-700">{totalScore}<span className="text-sm font-normal text-primary-400">/{totalMarks}</span></p>
          <p className="text-xs text-primary-500 mt-0.5">Total Score</p>
        </div>
        <div className="bg-green-50 rounded-xl p-4 text-center border border-green-100">
          <CheckCircle2 className="w-5 h-5 text-green-600 mx-auto mb-1" />
          <p className="text-2xl font-bold text-green-700">{result.correctCount || 0}</p>
          <p className="text-xs text-green-500 mt-0.5">Correct</p>
        </div>
        <div className="bg-red-50 rounded-xl p-4 text-center border border-red-100">
          <XCircle className="w-5 h-5 text-red-600 mx-auto mb-1" />
          <p className="text-2xl font-bold text-red-700">{result.wrongCount || 0}</p>
          <p className="text-xs text-red-500 mt-0.5">Wrong</p>
        </div>
        <div className="bg-surface-50 rounded-xl p-4 text-center border border-surface-200">
          <MinusCircle className="w-5 h-5 text-surface-500 mx-auto mb-1" />
          <p className="text-2xl font-bold text-surface-700">{result.skippedCount || 0}</p>
          <p className="text-xs text-surface-500 mt-0.5">Skipped</p>
        </div>
      </div>

      <div className="bg-surface-50 rounded-xl border border-surface-200 p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-surface-500" />
            <span className="text-sm font-semibold text-surface-700">Score Percentage</span>
          </div>
          <Badge variant={gradeColor} className="text-sm px-3 py-1">{grade}</Badge>
        </div>
        <div className="w-full bg-surface-200 rounded-full h-3 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-1000 ${
              percentage >= 70 ? 'bg-green-500' : percentage >= 40 ? 'bg-amber-500' : 'bg-red-500'
            }`}
            style={{ width: `${Math.min(100, percentage)}%` }}
          />
        </div>
        <p className="text-right text-sm font-bold text-surface-700 mt-1">{percentage}%</p>
      </div>

      {result.rank && (
        <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4">
          <Award className="w-5 h-5 text-amber-600" />
          <div>
            <p className="text-sm font-semibold text-amber-800">Rank #{result.rank} of {result.totalStudents || '-'}</p>
            <p className="text-xs text-amber-600">{result.totalStudents ? `Top ${Math.round((result.rank / result.totalStudents) * 100)}%` : ''}</p>
          </div>
        </div>
      )}

      {perQuestion.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 className="w-4 h-4 text-surface-500" />
            <h4 className="text-sm font-semibold text-surface-700">Per-Question Breakdown</h4>
          </div>
          <div className="space-y-1.5">
            {perQuestion.map((q, i) => (
              <div key={i} className={`flex items-center gap-3 p-3 rounded-lg border ${
                q.isCorrect === true ? 'bg-green-50 border-green-200' :
                q.isCorrect === false ? 'bg-red-50 border-red-200' :
                'bg-surface-50 border-surface-200'
              }`}>
                <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                  q.isCorrect === true ? 'bg-green-500 text-white' :
                  q.isCorrect === false ? 'bg-red-500 text-white' :
                  'bg-surface-300 text-surface-600'
                }`}>
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-surface-700">
                    Your answer: <span className="font-mono font-medium">{q.studentAnswer || '—'}</span>
                    <span className="text-surface-400 mx-1">|</span>
                    Correct: <span className="font-mono font-medium">{q.correctAnswer}</span>
                  </p>
                </div>
                <span className={`text-xs font-bold shrink-0 ${
                  q.isCorrect === true ? 'text-green-600' :
                  q.isCorrect === false ? 'text-red-600' :
                  'text-surface-400'
                }`}>
                  {q.isCorrect === true ? `+${q.marksAwarded || 0}` :
                   q.isCorrect === false ? `${q.marksAwarded || 0}` : '0'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
