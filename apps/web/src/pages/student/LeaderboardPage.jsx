import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../services/api.js';
import { Trophy } from 'lucide-react';

export default function LeaderboardPage() {
  const { examId } = useParams();
  const [leaders, setLeaders] = useState([]);

  useEffect(() => {
    api.get(`/results/${examId}/leaderboard?limit=10`).then(({ data }) => setLeaders(data.data || [])).catch(() => {});
  }, [examId]);

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="flex items-center gap-2 mb-6">
        <Trophy className="w-6 h-6 text-yellow-500" />
        <h1 className="text-2xl font-bold text-gray-900">Leaderboard</h1>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {leaders.map((entry, i) => (
          <div key={i} className="flex items-center justify-between p-4 border-b last:border-b-0">
            <div className="flex items-center gap-3">
              <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${i === 0 ? 'bg-yellow-100 text-yellow-700' : i === 1 ? 'bg-gray-100 text-gray-600' : i === 2 ? 'bg-orange-100 text-orange-700' : 'bg-gray-50 text-gray-500'}`}>
                {i + 1}
              </span>
              <span className="text-gray-800 font-medium">{entry.studentName || `Student ${entry.studentId?.slice(0, 8)}`}</span>
            </div>
            <span className="text-sm font-semibold text-gray-600">{entry.totalScore} pts ({entry.percentage}%)</span>
          </div>
        ))}
        {leaders.length === 0 && <p className="text-center py-8 text-gray-400">No results published yet</p>}
      </div>
    </div>
  );
}
