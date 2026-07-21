import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api.js';
import { Button } from '../../components/ui/button.jsx';

export default function ParentDashboard() {
  const [children, setChildren] = useState([]);

  useEffect(() => {
    api.get('/parents/children').then(({ data }) => setChildren(data.data || [])).catch(() => {});
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Children</h1>
      <div className="grid gap-4">
        {children.map((child) => (
          <div key={child.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
              <h3 className="font-semibold">{child.firstName} {child.lastName}</h3>
              <p className="text-sm text-gray-500">{child.email}</p>
            </div>
            <Link to={`/children/${child.id}/results`}><Button size="sm" variant="outline">View Results</Button></Link>
          </div>
        ))}
        {children.length === 0 && <p className="text-gray-400 text-center py-8">No children linked to your account</p>}
      </div>
    </div>
  );
}
