import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { examAPI } from '../../services/api.js';
import { useAuthStore } from '../../store/authStore.js';
import QuestionPanel from '../../components/exam/QuestionPanel.jsx';
import OmrSheet from '../../components/exam/OmrSheet.jsx';
import ExamTimer from '../../components/exam/ExamTimer.jsx';
import QuestionNavigator from '../../components/exam/QuestionNavigator.jsx';
import { Button } from '../../components/ui/button.jsx';
import { Skeleton } from '../../components/ui/skeleton.jsx';
import { AlertCircle, Send, Save, Eye, EyeOff } from 'lucide-react';
import { toast } from '../../hooks/useToast.jsx';

export default function ExamMode1() {
  const { examId } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

  const [exam, setExam] = useState(null);
  const [session, setSession] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showOmr, setShowOmr] = useState(true);
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
        setSession(sessionRes.data.data);

        if (sessionRes.data.data?.questions) {
          setQuestions(sessionRes.data.data.questions);
        } else {
          throw new Error('No questions returned for this exam');
        }
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

  const handleQuestionNav = useCallback((index, option) => {
    if (option) handleAnswer(index, option);
    setCurrentIndex(index);
  }, [handleAnswer]);

  const answeredCount = Object.keys(answers).filter((k) => answers[k] !== undefined).length;
  const skippedCount = questions.length - answeredCount;

  const handleSubmit = async () => {
    if (!window.confirm('Are you sure you want to submit? This action cannot be undone.')) return;
    setSubmitting(true);
    try {
      const answerArray = questions.map((q, i) => ({
        questionId: q.id,
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
        <Skeleton className="h-64" />
        <Skeleton className="h-32" />
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
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center flex-wrap gap-3 justify-between">
        <div>
          <h1 className="text-xl font-bold text-surface-900">{exam?.title || 'Exam'}</h1>
          <p className="text-sm text-surface-500">{questions.length} Questions</p>
        </div>
        <div className="flex items-center gap-3">
          <ExamTimer examId={examId} durationMinutes={exam?.durationMinutes || 60} onExpired={handleSubmit} />
          <Button variant="ghost" size="sm" onClick={() => setShowOmr(!showOmr)} className="hidden md:flex gap-1.5">
            {showOmr ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {showOmr ? 'Hide OMR' : 'Show OMR'}
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5" disabled>
            <Save className="w-4 h-4" /> Auto-saved
          </Button>
        </div>
      </div>

      <div className="flex gap-4">
        <div className="flex-1 min-w-0 space-y-4">
          <QuestionPanel
            questions={questions}
            currentIndex={currentIndex}
            onNavigate={handleQuestionNav}
            answers={answers}
          />
          <div className="md:hidden">
            <QuestionNavigator
              totalQuestions={questions.length}
              currentIndex={currentIndex}
              answers={answers}
              onSelect={setCurrentIndex}
            />
          </div>
        </div>

        <div className={`w-80 shrink-0 space-y-4 ${showOmr ? 'block' : 'hidden'} lg:block`}>
          <OmrSheet
            totalQuestions={questions.length}
            answers={answers}
            onAnswer={handleAnswer}
            answeredCount={answeredCount}
            skippedCount={skippedCount}
          />
          <div className="hidden lg:block">
            <QuestionNavigator
              totalQuestions={questions.length}
              currentIndex={currentIndex}
              answers={answers}
              onSelect={setCurrentIndex}
            />
          </div>
          <Button
            className="w-full gap-2"
            size="lg"
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Submitting...</>
            ) : (
              <><Send className="w-4 h-4" /> Submit Exam ({answeredCount}/{questions.length})</>
            )}
          </Button>
        </div>
      </div>

      {!showOmr && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-surface-200 p-4 flex gap-3 lg:hidden">
          <Button className="flex-1" onClick={handleSubmit} disabled={submitting}>
            <Send className="w-4 h-4 mr-1.5" /> Submit
          </Button>
        </div>
      )}
    </div>
  );
}
