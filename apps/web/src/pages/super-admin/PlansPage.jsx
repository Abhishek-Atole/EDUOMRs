import { useState, useEffect } from 'react';
import api from '../../services/api.js';
import { Button } from '../../components/ui/button.jsx';
import { Input } from '../../components/ui/input.jsx';
import { Label } from '../../components/ui/label.jsx';
import { Plus, Edit3, Check, X } from 'lucide-react';

export default function PlansPage() {
  const [plans, setPlans] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', price: 0, durationDays: 365, maxStudents: 500, maxTeachers: 20, features: '' });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    api.get('/subscriptions/plans').then(({ data }) => setPlans(data.data || [])).catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...form, features: form.features.split('\n').filter(Boolean) };
    try {
      if (editingId) {
        await api.patch(`/subscriptions/plans/${editingId}`, payload);
      } else {
        await api.post('/subscriptions/plans', payload);
      }
      const { data } = await api.get('/subscriptions/plans');
      setPlans(data.data || []);
      setShowForm(false);
      setEditingId(null);
      setForm({ name: '', price: 0, durationDays: 365, maxStudents: 500, maxTeachers: 20, features: '' });
    } catch {}
  };

  const edit = (plan) => {
    setForm({ ...plan, features: plan.features?.join('\n') || '' });
    setEditingId(plan.id);
    setShowForm(true);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Subscription Plans</h1>
        <Button onClick={() => { setShowForm(!showForm); setEditingId(null); setForm({ name: '', price: 0, durationDays: 365, maxStudents: 500, maxTeachers: 20, features: '' }); }}>
          <Plus className="w-4 h-4 mr-1" /> {showForm ? 'Cancel' : 'Add Plan'}
        </Button>
      </div>
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 space-y-4 mb-6">
          <h3 className="font-semibold">{editingId ? 'Edit Plan' : 'New Plan'}</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Plan Name</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label>Price (₹)</Label>
              <Input type="number" min={0} value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} required />
            </div>
            <div className="space-y-2">
              <Label>Duration (days)</Label>
              <Input type="number" min={1} value={form.durationDays} onChange={(e) => setForm({ ...form, durationDays: Number(e.target.value) })} />
            </div>
            <div className="space-y-2">
              <Label>Max Students</Label>
              <Input type="number" min={1} value={form.maxStudents} onChange={(e) => setForm({ ...form, maxStudents: Number(e.target.value) })} />
            </div>
            <div className="space-y-2">
              <Label>Max Teachers</Label>
              <Input type="number" min={1} value={form.maxTeachers} onChange={(e) => setForm({ ...form, maxTeachers: Number(e.target.value) })} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Features (one per line)</Label>
            <textarea rows={4} value={form.features} onChange={(e) => setForm({ ...form, features: e.target.value })} className="w-full rounded-lg border border-gray-300 p-2 text-sm" />
          </div>
          <Button type="submit">{editingId ? 'Update' : 'Create'} Plan</Button>
        </form>
      )}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {plans.map((plan) => (
          <div key={plan.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-lg">{plan.name}</h3>
              <button onClick={() => edit(plan)} className="text-gray-400 hover:text-gray-600"><Edit3 className="w-4 h-4" /></button>
            </div>
            <p className="text-3xl font-bold text-primary-700 mb-4">₹{plan.price}<span className="text-sm font-normal text-gray-400">/{plan.durationDays}d</span></p>
            <div className="space-y-2 text-sm">
              <p className="text-gray-600">Students: {plan.maxStudents}</p>
              <p className="text-gray-600">Teachers: {plan.maxTeachers}</p>
              {plan.features?.map((f, i) => (
                <p key={i} className="flex items-center gap-2 text-gray-600"><Check className="w-3 h-3 text-green-500" /> {f}</p>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
