import { useState, useEffect } from 'react';
import api from '../../services/api.js';
import { Button } from '../../components/ui/button.jsx';
import { CheckCircle, XCircle, Eye } from 'lucide-react';

export default function PaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/subscriptions/payments')
      .then(({ data }) => setPayments(data.data || []))
      .catch((err) => setError(err.response?.data?.error?.message || 'Could not load payments'));
  }, []);

  const verifyPayment = async (paymentId, status) => {
    try {
      await api.patch(`/subscriptions/payments/${paymentId}/verify`, { status });
      setPayments((prev) => prev.map((p) => p.id === paymentId ? { ...p, status } : p));
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Verification failed');
    }
  };

  const pending = payments.filter((p) => p.status === 'pending');

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Payments</h1>
      {error && <p className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">{error}</p>}
      {pending.length > 0 && (
        <div className="mb-8">
          <h2 className="font-semibold text-gray-700 mb-3">Pending Verification ({pending.length})</h2>
          <div className="grid gap-3">
            {pending.map((p) => (
              <div key={p.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center justify-between">
                <div>
                  <p className="font-medium">{p.tenant?.name}</p>
                  <p className="text-sm text-gray-500">₹{p.amount} · {p.plan?.name} · UTR: {p.utrNumber}</p>
                </div>
                <div className="flex gap-2">
                  {p.screenshotUrl && (
                    <Button variant="outline" size="sm" onClick={() => window.open(p.screenshotUrl, '_blank')}>
                      <Eye className="w-3 h-3 mr-1" /> Screenshot
                    </Button>
                  )}
                  <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => verifyPayment(p.id, 'verified')}>
                    <CheckCircle className="w-3 h-3 mr-1" /> Approve
                  </Button>
                  <Button size="sm" variant="outline" className="text-red-600" onClick={() => verifyPayment(p.id, 'rejected')}>
                    <XCircle className="w-3 h-3 mr-1" /> Reject
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      <h2 className="font-semibold text-gray-700 mb-3">All Payments ({payments.length})</h2>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left p-3 font-medium text-gray-600">Institution</th>
              <th className="text-left p-3 font-medium text-gray-600">Plan</th>
              <th className="text-center p-3 font-medium text-gray-600">Amount</th>
              <th className="text-center p-3 font-medium text-gray-600">UTR</th>
              <th className="text-center p-3 font-medium text-gray-600">Status</th>
              <th className="text-center p-3 font-medium text-gray-600">Date</th>
            </tr>
          </thead>
          <tbody>
            {payments.length === 0 && (
              <tr><td colSpan={6} className="p-8 text-center text-gray-400">No payments yet</td></tr>
            )}
            {payments.map((p) => (
              <tr key={p.id} className="border-b hover:bg-gray-50">
                <td className="p-3">{p.tenant?.name}</td>
                <td className="p-3">{p.plan?.name}</td>
                <td className="p-3 text-center font-medium">₹{p.amount}</td>
                <td className="p-3 text-center font-mono text-xs">{p.utrNumber}</td>
                <td className="p-3 text-center">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${p.status === 'verified' ? 'bg-green-50 text-green-700' : p.status === 'rejected' ? 'bg-red-50 text-red-700' : 'bg-yellow-50 text-yellow-700'}`}>
                    {p.status}
                  </span>
                </td>
                <td className="p-3 text-center text-gray-500 text-xs">{new Date(p.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
