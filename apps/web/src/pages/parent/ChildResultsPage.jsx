import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../services/api.js';
import { CheckCircle, XCircle, MinusCircle } from 'lucide-react';

export default function ChildResultsPage() {
  const { childId } = useParams();
  const [child, setChild] = useState(null);
  const [results, setResults] = useState([]);

  useEffect(() => {
    api.get(`/results/student/${childId}`).then(({ data }) => {
      setChild(data.data.student);
      setResults(data.data.results || []);
    }).catch(() => {});
  }, [childId]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">{child?.firstName} {child?.lastName}</h1>
      <p className="text-sm text-gray-500 mb-6">{child?.email} · {results.length} exams</p>
      <div className="grid gap-4">
        {results.map((r) => (
          <div key={r.id} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold">{r.examTitle}</h3>
                <div className="flex gap-4 mt-2 text-sm">
                  <span className="font-bold text-gray-800">{r.totalScore} / {r.totalMarks}</span>
                  <span className="text-gray-500">{r.percentage}%</span>
                  <span className="text-gray-500">Rank #{r.rank}</span>
                </div>
              </div>
              <div className="flex gap-3 text-xs">
                <span className="text-green-600"><CheckCircle className="w-3 h-3 inline mr-1" />{r.correctCount}</span>
                <span className="text-red-600"><XCircle className="w-3 h-3 inline mr-1" />{r.wrongCount}</span>
                <span className="text-gray-400"><MinusCircle className="w-3 h-3 inline mr-1" />{r.skippedCount}</span>
              </div>
            </div>
          </div>
        ))}
        {results.length === 0 && <p className="text-gray-400 text-center py-8">No results published yet</p>}
      </div>
    </div>
  );
}
