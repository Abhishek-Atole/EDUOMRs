import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { examAPI } from '../../services/api.js';
import ResultBreakdown from '../../components/exam/ResultBreakdown.jsx';
import { Button } from '../../components/ui/button.jsx';
import { Skeleton } from '../../components/ui/skeleton.jsx';
import { ArrowLeft, AlertCircle, Lock } from 'lucide-react';

export default function ResultView() {
  const { examId } = useParams();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!examId) return;
    const fetch = async () => {
      try {
        setLoading(true);
        const [examRes, resultRes] = await Promise.allSettled([
          examAPI.getExam(examId),
          examAPI.getMyResult(examId),
        ]);

        if (examRes.status === 'fulfilled') setExam(examRes.value.data.data);

        if (resultRes.status === 'fulfilled') {
          setResult(resultRes.value.data.data);
        } else {
          const msg = resultRes.reason?.response?.data?.error?.message || 'Could not load result';
          if (msg.includes('released')) {
            setError('not-released');
          } else {
            setError(msg);
          }
        }
      } catch (err) {
        setError('Failed to load result');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [examId]);

  if (loading) {
    return (
      <div className="space-y-4 animate-fade-in">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-32" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (error === 'not-released') {
    return (
      <div className="max-w-md mx-auto flex flex-col items-center justify-center py-20 text-center animate-fade-in">
        <div className="w-16 h-16 rounded-2xl bg-amber-100 flex items-center justify-center mb-5">
          <Lock className="w-7 h-7 text-amber-600" />
        </div>
        <h2 className="text-xl font-bold text-surface-800 mb-1">Result Not Released</h2>
        <p className="text-surface-500 text-sm mb-6">Your teacher has not released this result yet. Please check back later.</p>
        <Button onClick={() => navigate('/results')} variant="outline">
          <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Results
        </Button>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
        <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
        <h2 className="text-xl font-bold text-surface-800 mb-1">Unable to load result</h2>
        <p className="text-surface-500 text-sm mb-4">{error}</p>
        <Button onClick={() => navigate('/results')} variant="outline">
          <ArrowLeft className="w-4 h-4 mr-1.5" /> Back
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-surface-900">{exam?.title || 'Exam Result'}</h1>
          <p className="text-sm text-surface-500">Your performance summary</p>
        </div>
        <Button onClick={() => navigate('/results')} variant="ghost" size="sm">
          <ArrowLeft className="w-4 h-4 mr-1" /> All Results
        </Button>
      </div>
      <ResultBreakdown result={result} />
    </div>
  );
}
