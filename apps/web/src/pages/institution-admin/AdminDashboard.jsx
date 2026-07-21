import { Building, Users, GraduationCap, CreditCard } from 'lucide-react';

export default function AdminDashboard() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Institution Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Users, label: 'Teachers', color: 'text-blue-500', value: '-' },
          { icon: GraduationCap, label: 'Students', color: 'text-green-500', value: '-' },
          { icon: Building, label: 'Classes', color: 'text-purple-500', value: '-' },
          { icon: CreditCard, label: 'Subscription', color: 'text-yellow-500', value: 'Active' },
        ].map((card) => (
          <div key={card.label} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <card.icon className={`w-8 h-8 ${card.color} mb-2`} />
            <p className="text-2xl font-bold">{card.value}</p>
            <p className="text-sm text-gray-500">{card.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
