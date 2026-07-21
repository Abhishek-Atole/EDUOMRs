import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api.js';
import { Button } from '../../components/ui/button.jsx';
import { Plus, FileText, Eye, Printer, Clock, Users, Trophy } from 'lucide-react';

export default function ExamListPage() {
  const [exams, setExams] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/exams').then(({ data }) => setExams(data.data || [])).catch(() => {});
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Exams</h1>
        <Link to="/exams/new"><Button><Plus className="w-4 h-4 mr-2" /> Create Exam</Button></Link>
      </div>
      <div className="grid gap-4">
        {exams.map((exam) => (
          <div key={exam.id} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">{exam.title}</h3>
                <div className="flex flex-wrap gap-3 mt-1 text-sm text-gray-500">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${exam.examMode === 'DIGITAL' ? 'bg-blue-50 text-blue-700' : 'bg-yellow-50 text-yellow-700'}`}>
                    {exam.examMode === 'DIGITAL' ? 'Online' : 'Physical Paper'}
                  </span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {exam.durationMinutes} min</span>
                  <span className="flex items-center gap-1"><FileText className="w-3 h-3" /> {exam.totalQuestions || '-'} questions</span>
                  <span className={`${exam.status === 'PUBLISHED' ? 'text-green-600' : exam.status === 'DRAFT' ? 'text-gray-400' : 'text-blue-600'}`}>
                    {exam.status}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => navigate(`/exams/${exam.id}`)}>
                  <Eye className="w-3 h-3 mr-1" /> View
                </Button>
                {exam.examMode === 'PHYSICAL_PAPER' && exam.status === 'PUBLISHED' && (
                  <Button variant="outline" size="sm" onClick={() => window.open(`/api/exams/${exam.id}/print`, '_blank')}>
                    <Printer className="w-3 h-3 mr-1" /> Print
                  </Button>
                )}
                {exam.status === 'PUBLISHED' && (
                  <Button variant="outline" size="sm" onClick={() => navigate(`/exams/${exam.id}/monitor`)}>
                    <Users className="w-3 h-3 mr-1" /> Monitor
                  </Button>
                )}
                {exam.resultReleased && (
                  <Button variant="outline" size="sm" onClick={() => navigate(`/leaderboard/${exam.id}`)}>
                    <Trophy className="w-3 h-3 mr-1" /> Leaderboard
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
        {exams.length === 0 && <p className="text-gray-400 text-center py-8">No exams created yet. Click "Create Exam" to start.</p>}
      </div>
    </div>
  );
}
