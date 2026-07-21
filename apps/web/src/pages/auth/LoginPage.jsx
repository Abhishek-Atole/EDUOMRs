import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore.js';
import { Button } from '../../components/ui/button.jsx';
import { Input } from '../../components/ui/input.jsx';
import { Label } from '../../components/ui/label.jsx';
import { LogIn, AlertCircle, Eye, EyeOff, School } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold text-surface-900">Welcome back</h2>
        <p className="text-sm text-surface-500 mt-1">Sign in to your account to continue</p>
      </div>

      {error && (
        <div className="flex items-start gap-2.5 p-3.5 text-sm bg-red-50 border border-red-200 text-red-700 rounded-xl animate-fade-in">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="email">Email address</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="you@institution.edu"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Password</Label>
          <Link to="/forgot-password" className="text-xs text-primary-600 hover:text-primary-700 font-medium">Forgot?</Link>
        </div>
        <div className="relative">
          <Input
            id="password"
            type={showPw ? 'text' : 'password'}
            autoComplete="current-password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPw(!showPw)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600"
          >
            {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <Button type="submit" className="w-full gap-2" disabled={loading}>
        {loading ? (
          <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Signing in...</span>
        ) : (
          <><LogIn className="w-4 h-4" /> Sign In</>
        )}
      </Button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-surface-200" /></div>
        <div className="relative flex justify-center text-xs"><span className="bg-white px-2 text-surface-400">New institution?</span></div>
      </div>

      <Link to="/register">
        <Button type="button" variant="outline" className="w-full gap-2">
          <School className="w-4 h-4" /> Register your institution
        </Button>
      </Link>

      <div className="text-center">
        <p className="text-xs text-surface-400 leading-relaxed">
          Demo: <span className="font-mono text-surface-500">admin@alpha.edu</span> / <span className="font-mono text-surface-500">Admin@123</span>
        </p>
      </div>
    </form>
  );
}
