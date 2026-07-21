import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { examAPI } from '../../services/api.js';
import OmrSheet from '../../components/exam/OmrSheet.jsx';
import ExamTimer from '../../components/exam/ExamTimer.jsx';
import { Button } from '../../components/ui/button.jsx';
import { Skeleton } from '../../components/ui/skeleton.jsx';
import { AlertCircle, FileText, Send, Save } from 'lucide-react';
import { toast } from '../../hooks/useToast.jsx';

export default function ExamMode2() {
  const { examId } = useParams();
  const navigate = useNavigate();

  const [exam, setExam] = useState(null);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!examId) return;
    const init = async () => {
      try {
        setLoading(true);
        const examRes = await examAPI.getExam(examId);
        setExam(examRes.data.data);

        const sessionRes = await examAPI.startSession(examId);
        setTotalQuestions(sessionRes.data.data?.totalQuestions || 0);
      } catch (err) {
        setError(err.response?.data?.error?.message || 'Failed to load exam');
        toast({ title: 'Error', description: 'Could not load exam', variant: 'danger' });
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [examId]);

  const handleAnswer = useCallback((qIndex, option) => {
    setAnswers((prev) => ({ ...prev, [qIndex]: prev[qIndex] === option ? undefined : option }));
  }, []);

  const answeredCount = Object.keys(answers).filter((k) => answers[k] !== undefined).length;
  const skippedCount = totalQuestions - answeredCount;

  const handleSubmit = async () => {
    if (!window.confirm('Are you sure you want to submit? This action cannot be undone.')) return;
    setSubmitting(true);
    try {
      const answerArray = Array.from({ length: totalQuestions }, (_, i) => ({
        questionIndex: i,
        selectedOption: answers[i] || null,
      }));
      await examAPI.submitExam(examId, { answers: answerArray });
      toast({ title: 'Submitted', description: 'Your exam has been submitted successfully', variant: 'success' });
      navigate('/results', { replace: true });
    } catch (err) {
      toast({ title: 'Error', description: err.response?.data?.error?.message || 'Submission failed', variant: 'danger' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 animate-fade-in">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
        <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
        <h2 className="text-xl font-bold text-surface-800 mb-1">Unable to load exam</h2>
        <p className="text-surface-500 text-sm mb-4">{error}</p>
        <Button onClick={() => navigate('/exams')}>Back to Exams</Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-surface-900">{exam?.title || 'Exam'} — Mode 2</h1>
          <p className="text-sm text-surface-500">{totalQuestions} questions</p>
        </div>
        <div className="flex items-center gap-3">
          <ExamTimer examId={examId} durationMinutes={exam?.durationMinutes || 60} onExpired={handleSubmit} />
          <Button variant="outline" size="sm" className="gap-1.5" disabled>
            <Save className="w-4 h-4" /> Auto-saved
          </Button>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3 animate-fade-in">
        <FileText className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-semibold text-amber-800">Answer according to your physical question paper</p>
          <p className="text-xs text-amber-600 mt-0.5">
            This exam uses a physical question paper distributed separately.
            Select your answers on the digital OMR sheet below.
          </p>
        </div>
      </div>

      <OmrSheet
        totalQuestions={totalQuestions}
        answers={answers}
        onAnswer={handleAnswer}
        answeredCount={answeredCount}
        skippedCount={skippedCount}
      />

      <Button
        className="w-full gap-2"
        size="lg"
        onClick={handleSubmit}
        disabled={submitting}
      >
        {submitting ? (
          <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Submitting...</>
        ) : (
          <><Send className="w-4 h-4" /> Submit Exam ({answeredCount}/{totalQuestions})</>
        )}
      </Button>
    </div>
  );
}
