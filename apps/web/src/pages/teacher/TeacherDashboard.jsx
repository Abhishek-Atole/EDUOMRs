import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api.js';
import { Button } from '../../components/ui/button.jsx';
import { Plus, FileText, Users, Trophy } from 'lucide-react';

export default function TeacherDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get('/exams').then(({ data }) => setStats(data.data || [])).catch(() => {});
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Teacher Dashboard</h1>
        <Link to="/exams/new"><Button><Plus className="w-4 h-4 mr-2" /> Create Exam</Button></Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <FileText className="w-8 h-8 text-primary-500 mb-2" />
          <p className="text-2xl font-bold">{Array.isArray(stats) ? stats.length : '-'}</p>
          <p className="text-sm text-gray-500">Total Exams</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <Users className="w-8 h-8 text-green-500 mb-2" />
          <p className="text-2xl font-bold">-</p>
          <p className="text-sm text-gray-500">Active Sessions</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <Trophy className="w-8 h-8 text-yellow-500 mb-2" />
          <p className="text-2xl font-bold">-</p>
          <p className="text-sm text-gray-500">Results Released</p>
        </div>
      </div>
    </div>
  );
}
