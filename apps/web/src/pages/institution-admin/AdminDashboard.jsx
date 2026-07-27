import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Building, Users, GraduationCap, CreditCard, FileText, UserRound } from 'lucide-react';
import api from '../../services/api.js';

const STATUS_STYLES = {
  draft: 'bg-gray-100 text-gray-600',
  published: 'bg-blue-50 text-blue-700',
  results_released: 'bg-green-50 text-green-700',
};

export default function AdminDashboard() {
  const [counts, setCounts] = useState({});
  const [exams, setExams] = useState([]);
  const [subscription, setSubscription] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const total = (r) => r.data.meta?.pagination?.total ?? 0;
    Promise.all([
      api.get('/teachers?limit=1'),
      api.get('/students?limit=1'),
      api.get('/parents?limit=1'),
      api.get('/academic/classes?limit=1'),
      api.get('/exams?limit=5'),
      api.get('/subscriptions'),
    ])
      .then(([teachers, students, parents, classes, examsRes, sub]) => {
        setCounts({
          teachers: total(teachers),
          students: total(students),
          parents: total(parents),
          classes: total(classes),
          exams: total(examsRes),
        });
        setExams(examsRes.data.data || []);
        setSubscription(sub.data.data);
      })
      .catch((err) => setError(err.response?.data?.error?.message || 'Could not load dashboard'));
  }, []);

  const daysLeft = subscription?.endDate
    ? Math.max(0, Math.ceil((new Date(subscription.endDate) - Date.now()) / 86400000))
    : null;

  const cards = [
    { icon: Users, label: 'Teachers', color: 'text-blue-500', value: counts.teachers },
    { icon: GraduationCap, label: 'Students', color: 'text-green-500', value: counts.students },
    { icon: UserRound, label: 'Parents', color: 'text-pink-500', value: counts.parents },
    { icon: Building, label: 'Classes', color: 'text-purple-500', value: counts.classes },
    { icon: FileText, label: 'Exams', color: 'text-amber-500', value: counts.exams },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Institution Dashboard</h1>
      {error && <p className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">{error}</p>}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        {cards.map((card) => (
          <div key={card.label} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <card.icon className={`w-8 h-8 ${card.color} mb-2`} />
            <p className="text-2xl font-bold">{card.value ?? '-'}</p>
            <p className="text-sm text-gray-500">{card.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-800">Recent Exams</h2>
            <Link to="/exams" className="text-sm text-primary-600 hover:underline">View all</Link>
          </div>
          <div>
            {exams.length === 0 && <p className="text-gray-400 text-center py-8 text-sm">No exams yet</p>}
            {exams.map((exam) => (
              <Link key={exam.id} to={`/exams/${exam.id}`} className="flex items-center justify-between px-4 py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50">
                <div>
                  <p className="text-sm font-medium text-gray-800">{exam.title}</p>
                  <p className="text-xs text-gray-500">
                    {exam.class?.name || '—'} · {exam.subject?.name || '—'} · {exam._count?.examSessions ?? 0} sessions
                  </p>
                </div>
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${STATUS_STYLES[exam.status] || 'bg-gray-100 text-gray-600'}`}>
                  {exam.status?.replace(/_/g, ' ')}
                </span>
              </Link>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 h-fit">
          <div className="flex items-center gap-2 mb-4">
            <CreditCard className="w-5 h-5 text-yellow-500" />
            <h2 className="font-semibold text-gray-800">Subscription</h2>
          </div>
          {subscription?.status === 'active' ? (
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Plan</span>
                <span className="font-medium">{subscription.plan?.name || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Expires</span>
                <span className="font-medium">{new Date(subscription.endDate).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Days left</span>
                <span className={`font-medium ${daysLeft <= 14 ? 'text-red-600' : 'text-green-600'}`}>{daysLeft}</span>
              </div>
              {subscription.plan?.maxStudents != null && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Student limit</span>
                  <span className={`font-medium ${counts.students > subscription.plan.maxStudents ? 'text-red-600' : ''}`}>
                    {counts.students ?? '-'} / {subscription.plan.maxStudents}
                  </span>
                </div>
              )}
              {daysLeft <= 14 && (
                <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg p-2 mt-2">
                  Subscription expires soon. Renew to avoid interruption.
                </p>
              )}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No active subscription</p>
          )}
        </div>
      </div>
    </div>
  );
}
