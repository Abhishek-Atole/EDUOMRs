import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api.js';
import { Button } from '../../components/ui/button.jsx';
import { Input } from '../../components/ui/input.jsx';
import { Label } from '../../components/ui/label.jsx';

export default function ExamCreatePage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '',
    examMode: 'DIGITAL',
    durationMinutes: 60,
    totalMarks: 100,
    passingMarks: 35,
    negativeMarking: false,
    negativeMarksPerQuestion: 0,
    instructions: '',
    classId: '',
    subjectId: '',
    scheduledAt: '',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const { data } = await api.post('/exams', form);
      navigate(`/exams/${data.data.id}/edit`);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to create exam');
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Create Exam</h1>
      {error && <div className="mb-4 p-3 text-sm bg-red-50 text-red-600 rounded-lg">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-5 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="space-y-2">
          <Label htmlFor="title">Exam Title</Label>
          <Input id="title" name="title" value={form.title} onChange={handleChange} required />
        </div>
        <div className="space-y-2">
          <Label>Exam Mode</Label>
          <div className="flex gap-4">
            <label className={`flex-1 p-4 rounded-lg border-2 cursor-pointer text-center transition-colors ${form.examMode === 'DIGITAL' ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'}`}>
              <input type="radio" name="examMode" value="DIGITAL" checked={form.examMode === 'DIGITAL'} onChange={handleChange} className="sr-only" />
              <p className="font-medium text-gray-900">Online</p>
              <p className="text-sm text-gray-500">Questions + OMR on screen</p>
            </label>
            <label className={`flex-1 p-4 rounded-lg border-2 cursor-pointer text-center transition-colors ${form.examMode === 'PHYSICAL_PAPER' ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'}`}>
              <input type="radio" name="examMode" value="PHYSICAL_PAPER" checked={form.examMode === 'PHYSICAL_PAPER'} onChange={handleChange} className="sr-only" />
              <p className="font-medium text-gray-900">Physical Paper</p>
              <p className="text-sm text-gray-500">Printed question paper + OMR on screen</p>
            </label>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="durationMinutes">Duration (minutes)</Label>
            <Input id="durationMinutes" name="durationMinutes" type="number" min={1} value={form.durationMinutes} onChange={handleChange} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="totalMarks">Total Marks</Label>
            <Input id="totalMarks" name="totalMarks" type="number" min={1} value={form.totalMarks} onChange={handleChange} required />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="passingMarks">Passing Marks</Label>
            <Input id="passingMarks" name="passingMarks" type="number" min={0} value={form.passingMarks} onChange={handleChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="scheduledAt">Schedule Date</Label>
            <Input id="scheduledAt" name="scheduledAt" type="datetime-local" value={form.scheduledAt} onChange={handleChange} />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <input id="negativeMarking" name="negativeMarking" type="checkbox" checked={form.negativeMarking} onChange={handleChange} className="rounded border-gray-300" />
          <Label htmlFor="negativeMarking">Enable Negative Marking</Label>
        </div>
        {form.negativeMarking && (
          <div className="space-y-2">
            <Label htmlFor="negativeMarksPerQuestion">Negative Marks per Wrong Answer</Label>
            <Input id="negativeMarksPerQuestion" name="negativeMarksPerQuestion" type="number" step={0.25} min={0} value={form.negativeMarksPerQuestion} onChange={handleChange} />
          </div>
        )}
        <div className="space-y-2">
          <Label htmlFor="instructions">Instructions (optional)</Label>
          <textarea id="instructions" name="instructions" rows={3} value={form.instructions} onChange={handleChange} className="w-full rounded-lg border border-gray-300 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
        </div>
        <Button type="submit" disabled={submitting} className="w-full">
          {submitting ? 'Creating...' : 'Create Exam'}
        </Button>
      </form>
    </div>
  );
}
