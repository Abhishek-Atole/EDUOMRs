import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api.js';
import { Button } from '../../components/ui/button.jsx';
import { Input } from '../../components/ui/input.jsx';
import { Label } from '../../components/ui/label.jsx';

export default function RegisterPage() {
  const [form, setForm] = useState({ institutionName: '', adminEmail: '', adminPassword: '', adminFirstName: '', adminLastName: '', contactPhone: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await api.post('/auth/register', form);
      setSuccess('Registration successful! You can now sign in.');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Registration failed');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-2xl font-semibold text-gray-900">Register Institution</h2>
      {error && <div className="p-3 text-sm bg-red-50 text-red-600 rounded-lg">{error}</div>}
      {success && <div className="p-3 text-sm bg-green-50 text-green-600 rounded-lg">{success}</div>}
      <div className="space-y-2">
        <Label htmlFor="institutionName">Institution Name</Label>
        <Input id="institutionName" name="institutionName" value={form.institutionName} onChange={handleChange} required />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="adminFirstName">First Name</Label>
          <Input id="adminFirstName" name="adminFirstName" value={form.adminFirstName} onChange={handleChange} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="adminLastName">Last Name</Label>
          <Input id="adminLastName" name="adminLastName" value={form.adminLastName} onChange={handleChange} />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="adminEmail">Admin Email</Label>
        <Input id="adminEmail" name="adminEmail" type="email" value={form.adminEmail} onChange={handleChange} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="adminPassword">Password</Label>
        <Input id="adminPassword" name="adminPassword" type="password" value={form.adminPassword} onChange={handleChange} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="contactPhone">Contact Phone</Label>
        <Input id="contactPhone" name="contactPhone" value={form.contactPhone} onChange={handleChange} />
      </div>
      <Button type="submit" className="w-full">Register</Button>
      <p className="text-sm text-center text-gray-500">
        Already registered? <Link to="/login" className="text-primary-600 hover:underline">Sign in</Link>
      </p>
    </form>
  );
}
