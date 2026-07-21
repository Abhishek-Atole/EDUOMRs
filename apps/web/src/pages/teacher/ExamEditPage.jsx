import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api.js';
import { Button } from '../../components/ui/button.jsx';
import { Input } from '../../components/ui/input.jsx';
import { Label } from '../../components/ui/label.jsx';
import { Plus, Trash2, Upload, CheckCircle, Printer } from 'lucide-react';

export default function ExamEditPage() {
  const { examId } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [newQ, setNewQ] = useState({ questionText: '', options: [{ label: 'A', text: '' }, { label: 'B', text: '' }, { label: 'C', text: '' }, { label: 'D', text: '' }], marks: 1 });
  const [answerKeyFile, setAnswerKeyFile] = useState(null);
  const [answerKeyJson, setAnswerKeyJson] = useState('');
  const [tab, setTab] = useState('questions');
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');

  useEffect(() => {
    api.get(`/exams/${examId}`).then(({ data }) => setExam(data.data)).catch(() => navigate('/exams'));
    api.get(`/questions/exam/${examId}`).then(({ data }) => setQuestions(data.data || [])).catch(() => {});
  }, [examId]);

  const addOption = () => {
    if (newQ.options.length >= 6) return;
    const label = String.fromCharCode(65 + newQ.options.length);
    setNewQ({ ...newQ, options: [...newQ.options, { label, text: '' }] });
  };

  const updateOption = (idx, val) => {
    const opts = [...newQ.options];
    opts[idx] = { ...opts[idx], text: val };
    setNewQ({ ...newQ, options: opts });
  };

  const addQuestion = async () => {
    if (!newQ.questionText.trim() || newQ.options.some((o) => !o.text.trim())) {
      setError('Fill question text and all options');
      return;
    }
    setError('');
    try {
      await api.post(`/questions/exam/${examId}`, { questions: [newQ] });
      const { data } = await api.get(`/questions/exam/${examId}`);
      setQuestions(data.data || []);
      setNewQ({ questionText: '', options: [{ label: 'A', text: '' }, { label: 'B', text: '' }, { label: 'C', text: '' }, { label: 'D', text: '' }], marks: 1 });
      setMsg('Question added');
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to add question');
    }
  };

  const deleteQuestion = async (qId) => {
    try {
      await api.delete(`/questions/${qId}`);
      setQuestions((prev) => prev.filter((q) => q.id !== qId));
    } catch {}
  };

  const handlePublish = async () => {
    try {
      await api.post(`/exams/${examId}/publish`);
      setMsg('Exam published!');
      setTimeout(() => navigate('/exams'), 1500);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Publish failed');
    }
  };

  const handleAnswerKeyUpload = async () => {
    setError('');
    setMsg('');
    try {
      if (answerKeyFile) {
        const formData = new FormData();
        formData.append('file', answerKeyFile);
        await api.post(`/answer-keys/${examId}/upload`, formData);
      } else if (answerKeyJson.trim()) {
        await api.post(`/answer-keys/${examId}/upload`, { answers: JSON.parse(answerKeyJson) });
      } else {
        setError('Select a file or paste JSON');
        return;
      }
      setMsg('Answer key uploaded');
      setAnswerKeyFile(null);
      setAnswerKeyJson('');
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Upload failed');
    }
  };

  if (!exam) return <div className="text-center py-16 text-gray-400">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{exam.title}</h1>
          <p className="text-sm text-gray-500">
            {exam.examMode === 'DIGITAL' ? 'Online' : 'Physical Paper'} · {exam.durationMinutes} min · {exam.totalMarks} marks
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handlePublish} disabled={exam.status === 'PUBLISHED'}>Publish Exam</Button>
        </div>
      </div>
      {error && <div className="mb-4 p-3 text-sm bg-red-50 text-red-600 rounded-lg">{error}</div>}
      {msg && <div className="mb-4 p-3 text-sm bg-green-50 text-green-600 rounded-lg">{msg}</div>}

      <div className="flex gap-1 mb-6 bg-gray-100 rounded-lg p-1 w-fit">
        {['questions', 'answer-key', 'preview'].map((t) => (
          <button key={t} onClick={() => { setTab(t); setError(''); setMsg(''); }} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${tab === t ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>
            {t === 'questions' ? 'Questions' : t === 'answer-key' ? 'Answer Key' : 'Preview'}
          </button>
        ))}
      </div>

      {tab === 'questions' && exam.examMode === 'DIGITAL' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 space-y-4">
            <h3 className="font-semibold">Add Question</h3>
            <div className="space-y-2">
              <Label>Question Text</Label>
              <textarea rows={2} value={newQ.questionText} onChange={(e) => setNewQ({ ...newQ, questionText: e.target.value })} className="w-full rounded-lg border border-gray-300 p-2 text-sm" />
            </div>
            <div className="space-y-2">
              <Label>Options</Label>
              {newQ.options.map((opt, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="w-6 text-sm font-medium text-gray-500">{opt.label}.</span>
                  <Input value={opt.text} onChange={(e) => updateOption(i, e.target.value)} placeholder={`Option ${opt.label}`} />
                </div>
              ))}
              {newQ.options.length < 6 && (
                <Button variant="ghost" size="sm" onClick={addOption}><Plus className="w-3 h-3 mr-1" /> Add Option</Button>
              )}
            </div>
            <div className="space-y-2 w-32">
              <Label>Marks</Label>
              <Input type="number" min={1} value={newQ.marks} onChange={(e) => setNewQ({ ...newQ, marks: Number(e.target.value) })} />
            </div>
            <Button onClick={addQuestion}><Plus className="w-4 h-4 mr-2" /> Add Question</Button>
          </div>
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-700">{questions.length} Questions</h3>
            {questions.map((q, i) => (
              <div key={q.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-start justify-between">
                <div className="flex-1">
                  <p className="font-medium text-sm"><span className="text-gray-400">Q{i + 1}.</span> {q.questionText}</p>
                  <div className="flex gap-3 mt-1 text-xs text-gray-500">
                    {q.options?.map((o) => <span key={o.label}>{o.label}. {o.text}</span>)}
                    <span className="ml-auto font-medium">{q.marks} mark{q.marks > 1 ? 's' : ''}</span>
                  </div>
                </div>
                <button onClick={() => deleteQuestion(q.id)} className="text-red-400 hover:text-red-600 ml-2"><Trash2 className="w-4 h-4" /></button>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'answer-key' && (
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 space-y-4">
          <h3 className="font-semibold">Upload Answer Key</h3>
          <div className="space-y-2">
            <Label>Upload CSV/Excel File</Label>
            <input type="file" accept=".csv,.xlsx,.xls" onChange={(e) => setAnswerKeyFile(e.target.files[0])} className="block w-full text-sm" />
          </div>
          <div className="text-center text-gray-400 text-sm">— or —</div>
          <div className="space-y-2">
            <Label>Paste JSON</Label>
            <textarea rows={5} value={answerKeyJson} onChange={(e) => setAnswerKeyJson(e.target.value)} placeholder='[{"questionNumber": 1, "correctOption": "A"}, ...]' className="w-full rounded-lg border border-gray-300 p-2 text-sm font-mono" />
          </div>
          <Button onClick={handleAnswerKeyUpload}><Upload className="w-4 h-4 mr-2" /> Upload Answer Key</Button>
        </div>
      )}

      {tab === 'preview' && (
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h3 className="font-semibold mb-4">Exam Preview</h3>
          {exam.examMode === 'PHYSICAL_PAPER' ? (
            <div>
              <p className="text-sm text-gray-500">This is a Physical Paper exam. Students will see only the OMR grid on their screen.</p>
              {exam.status === 'PUBLISHED' && (
                <Button variant="outline" className="mt-4" onClick={() => window.open(`/api/exams/${exam.id}/print`, '_blank')}>
                  <Printer className="w-4 h-4 mr-2" /> Download Question Paper PDF
                </Button>
              )}
            </div>
          ) : (
            <p className="text-sm text-gray-500">Students will see questions on the left panel and the OMR grid on the right.</p>
          )}
        </div>
      )}
    </div>
  );
}
