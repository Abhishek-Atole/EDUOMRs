import { Outlet, Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore.js';
import { GraduationCap } from 'lucide-react';

export default function AuthLayout() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary-50 via-white to-blue-50 p-4">
      <div className="w-full max-w-md animate-fade-in-up">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary-600 shadow-lg shadow-primary-200 mb-4">
            <GraduationCap className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-surface-900 tracking-tight">EduOMR</h1>
          <p className="text-surface-500 mt-1.5 text-sm">Education Management Platform</p>
        </div>
        <div className="bg-white rounded-2xl shadow-xl shadow-surface-200/50 border border-surface-100 p-8">
          <Outlet />
        </div>
        <p className="text-center text-xs text-surface-400 mt-6">&copy; {new Date().getFullYear()} EduOMR. All rights reserved.</p>
      </div>
    </div>
  );
}
