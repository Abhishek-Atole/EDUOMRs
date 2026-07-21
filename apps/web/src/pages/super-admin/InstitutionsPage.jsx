import { useState, useEffect } from 'react';
import api from '../../services/api.js';
import { Button } from '../../components/ui/button.jsx';
import { CheckCircle, XCircle } from 'lucide-react';

export default function InstitutionsPage() {
  const [institutions, setInstitutions] = useState([]);

  useEffect(() => {
    api.get('/institutions').then(({ data }) => setInstitutions(data.data || [])).catch(() => {});
  }, []);

  const toggleStatus = async (id, currentStatus) => {
    try {
      const newStatus = currentStatus === 'active' ? 'disabled' : 'active';
      await api.patch(`/institutions/${id}`, { status: newStatus });
      setInstitutions((prev) => prev.map((i) => i.id === id ? { ...i, status: newStatus } : i));
    } catch (err) {
      console.error('Failed to toggle status:', err);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Institutions</h1>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left p-3 font-medium text-gray-600">Name</th>
              <th className="text-left p-3 font-medium text-gray-600">Contact</th>
              <th className="text-center p-3 font-medium text-gray-600">Active</th>
              <th className="text-center p-3 font-medium text-gray-600">Subscription</th>
              <th className="text-center p-3 font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {institutions.map((inst) => (
              <tr key={inst.id} className="border-b hover:bg-gray-50">
                <td className="p-3 font-medium">{inst.name}</td>
                <td className="p-3 text-gray-500">{inst.contactEmail || inst.contactPhone || '-'}</td>
                <td className="p-3 text-center">
                   {inst.status === 'active'
                     ? <CheckCircle className="w-4 h-4 text-green-500 inline" />
                     : <XCircle className="w-4 h-4 text-red-400 inline" />}
                 </td>
                <td className="p-3 text-center">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${inst.subscriptionStatus === 'ACTIVE' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {inst.subscriptionStatus || 'NONE'}
                  </span>
                </td>
                <td className="p-3 text-center">
                   <Button variant="outline" size="sm" onClick={() => toggleStatus(inst.id, inst.status)}>
                     {inst.status === 'active' ? 'Deactivate' : 'Activate'}
                   </Button>
                 </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
