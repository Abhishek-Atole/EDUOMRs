import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api.js';
import { Button } from '../../components/ui/button.jsx';
import { CheckCircle, XCircle, Clock, RefreshCw } from 'lucide-react';

export default function ExamMonitorPage() {
  const { examId } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [sessions, setSessions] = useState([]);

  const load = () => {
    api.get(`/exam-sessions/${examId}/monitor`).then(({ data }) => {
      setExam(data.data.exam);
      setSessions(data.data.sessions || []);
    }).catch(() => navigate('/exams'));
  };

  useEffect(() => { load(); }, [examId]);

  const submitted = sessions.filter((s) => s.submittedAt).length;
  const inProgress = sessions.length - submitted;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{exam?.title || 'Monitor'}</h1>
          <p className="text-sm text-gray-500">{sessions.length} students · {submitted} submitted · {inProgress} in progress</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={load}><RefreshCw className="w-4 h-4 mr-1" /> Refresh</Button>
          <Button variant="outline" size="sm" onClick={() => navigate(`/exams/${examId}/results`)}>Results</Button>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left p-3 font-medium text-gray-600">Student</th>
              <th className="text-center p-3 font-medium text-gray-600">Status</th>
              <th className="text-center p-3 font-medium text-gray-600">Answered</th>
              <th className="text-center p-3 font-medium text-gray-600">Time Elapsed</th>
              <th className="text-center p-3 font-medium text-gray-600">Submitted At</th>
            </tr>
          </thead>
          <tbody>
            {sessions.map((s) => (
              <tr key={s.id} className="border-b last:border-b-0 hover:bg-gray-50">
                <td className="p-3">{s.studentName || s.studentId?.slice(0, 8)}</td>
                <td className="p-3 text-center">
                  {s.submittedAt
                    ? <span className="text-green-600 flex items-center justify-center gap-1"><CheckCircle className="w-4 h-4" /> Submitted</span>
                    : <span className="text-blue-600 flex items-center justify-center gap-1"><Clock className="w-4 h-4" /> In Progress</span>
                  }
                </td>
                <td className="p-3 text-center text-gray-600">{s.answeredCount ?? '-'}</td>
                <td className="p-3 text-center text-gray-600">{s.elapsedMinutes ? `${s.elapsedMinutes}m` : '-'}</td>
                <td className="p-3 text-center text-gray-500 text-xs">
                  {s.submittedAt ? new Date(s.submittedAt).toLocaleTimeString() : '-'}
                </td>
              </tr>
            ))}
            {sessions.length === 0 && (
              <tr><td colSpan={5} className="p-8 text-center text-gray-400">No sessions started yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
