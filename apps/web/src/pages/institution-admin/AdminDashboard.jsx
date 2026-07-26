import { useState, useEffect } from 'react';
import { Building, Users, GraduationCap, CreditCard } from 'lucide-react';
import api from '../../services/api.js';

export default function AdminDashboard() {
  const [counts, setCounts] = useState({});
  const [error, setError] = useState('');

  useEffect(() => {
    const total = (r) => r.data.meta?.pagination?.total ?? 0;
    Promise.all([
      api.get('/teachers?limit=1'),
      api.get('/students?limit=1'),
      api.get('/academic/classes?limit=1'),
      api.get('/subscriptions'),
    ])
      .then(([teachers, students, classes, subscription]) => setCounts({
        teachers: total(teachers),
        students: total(students),
        classes: total(classes),
        subscription: subscription.data.data?.status ?? 'inactive',
      }))
      .catch((err) => setError(err.response?.data?.error?.message || 'Could not load dashboard'));
  }, []);

  const cards = [
    { icon: Users, label: 'Teachers', color: 'text-blue-500', value: counts.teachers },
    { icon: GraduationCap, label: 'Students', color: 'text-green-500', value: counts.students },
    { icon: Building, label: 'Classes', color: 'text-purple-500', value: counts.classes },
    { icon: CreditCard, label: 'Subscription', color: 'text-yellow-500', value: counts.subscription },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Institution Dashboard</h1>
      {error && <p className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">{error}</p>}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <div key={card.label} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <card.icon className={`w-8 h-8 ${card.color} mb-2`} />
            <p className="text-2xl font-bold capitalize">{card.value ?? '-'}</p>
            <p className="text-sm text-gray-500">{card.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
