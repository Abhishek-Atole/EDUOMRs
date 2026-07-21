import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api.js';
import { Button } from '../../components/ui/button.jsx';

export default function StudentDashboard() {
  const [exams, setExams] = useState([]);

  useEffect(() => {
    api.get('/exams').then(({ data }) => setExams(data.data || [])).catch(() => {});
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Exams</h1>
      <div className="grid gap-4">
        {exams.map((exam) => (
          <div key={exam.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
              <h3 className="font-semibold">{exam.title}</h3>
              <p className="text-sm text-gray-500">{exam.examMode === 'DIGITAL' ? 'Online' : 'Physical Paper'} · {exam.durationMinutes} min</p>
            </div>
            <Link to={`/exam/${exam.id}`}><Button size="sm">Start Exam</Button></Link>
          </div>
        ))}
        {exams.length === 0 && <p className="text-gray-400 text-center py-8">No exams available</p>}
      </div>
    </div>
  );
}
