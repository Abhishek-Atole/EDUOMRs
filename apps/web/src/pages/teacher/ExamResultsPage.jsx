import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api.js';
import { Button } from '../../components/ui/button.jsx';
import { Trophy, Send, CheckCircle, XCircle, MinusCircle } from 'lucide-react';

export default function ExamResultsPage() {
  const { examId } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [results, setResults] = useState([]);
  const [releasing, setReleasing] = useState(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/exams/${examId}`).then(({ data }) => setExam(data.data)).catch(() => navigate('/exams'));
    api.get(`/results/${examId}/all`).then(({ data }) => setResults(data.data || [])).catch(() => {});
  }, [examId]);

  const handleRelease = async () => {
    setReleasing(true);
    setError('');
    setMsg('');
    try {
      await api.post(`/results/${examId}/release`);
      setMsg('Results released! Notifications queued.');
      const { data } = await api.get(`/results/${examId}/all`);
      setResults(data.data || []);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Release failed');
    }
    setReleasing(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{exam?.title || 'Results'}</h1>
          <p className="text-sm text-gray-500">{results.length} submissions evaluated</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate(`/leaderboard/${examId}`)}>
            <Trophy className="w-4 h-4 mr-2" /> Leaderboard
          </Button>
          <Button onClick={handleRelease} disabled={releasing || exam?.resultReleased}>
            <Send className="w-4 h-4 mr-2" />
            {exam?.resultReleased ? 'Already Released' : releasing ? 'Releasing...' : 'Release Results'}
          </Button>
        </div>
      </div>
      {error && <div className="mb-4 p-3 text-sm bg-red-50 text-red-600 rounded-lg">{error}</div>}
      {msg && <div className="mb-4 p-3 text-sm bg-green-50 text-green-600 rounded-lg">{msg}</div>}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left p-3 font-medium text-gray-600">Student</th>
              <th className="text-center p-3 font-medium text-gray-600">Score</th>
              <th className="text-center p-3 font-medium text-gray-600">%</th>
              <th className="text-center p-3 font-medium text-gray-600">Correct</th>
              <th className="text-center p-3 font-medium text-gray-600">Wrong</th>
              <th className="text-center p-3 font-medium text-gray-600">Skipped</th>
              <th className="text-center p-3 font-medium text-gray-600">Rank</th>
              <th className="text-center p-3 font-medium text-gray-600">Status</th>
            </tr>
          </thead>
          <tbody>
            {results.map((r) => (
              <tr key={r.id} className="border-b last:border-b-0 hover:bg-gray-50">
                <td className="p-3 font-medium">{r.studentName || r.studentId?.slice(0, 8)}</td>
                <td className="p-3 text-center font-semibold">{r.totalScore}</td>
                <td className="p-3 text-center">{r.percentage}%</td>
                <td className="p-3 text-center text-green-600">{r.correctCount}</td>
                <td className="p-3 text-center text-red-600">{r.wrongCount}</td>
                <td className="p-3 text-center text-gray-400">{r.skippedCount}</td>
                <td className="p-3 text-center font-medium">#{r.rank}</td>
                <td className="p-3 text-center">
                  {r.notificationStatus === 'SENT'
                    ? <span className="text-green-600 flex items-center justify-center gap-1"><CheckCircle className="w-3 h-3" /> Notified</span>
                    : r.notificationStatus === 'FAILED'
                      ? <span className="text-red-600 flex items-center justify-center gap-1"><XCircle className="w-3 h-3" /> Failed</span>
                      : <span className="text-gray-400">—</span>
                  }
                </td>
              </tr>
            ))}
            {results.length === 0 && (
              <tr><td colSpan={8} className="p-8 text-center text-gray-400">No results yet. Students need to submit first.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
