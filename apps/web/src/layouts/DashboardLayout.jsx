import { Outlet, Navigate, Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore.js';
import { Button } from '../components/ui/button.jsx';
import { Avatar, AvatarFallback } from '../components/ui/avatar.jsx';
import { Badge } from '../components/ui/badge.jsx';
import {
  LayoutDashboard, GraduationCap, Users, BookOpen, ClipboardList, Settings,
  CreditCard, LogOut, Menu, X, ChevronRight, Building2, UserCheck, Shield,
} from 'lucide-react';
import { useState } from 'react';

const icons = {
  Dashboard: LayoutDashboard,
  Institutions: Building2,
  Plans: CreditCard,
  Payments: CreditCard,
  Teachers: UserCheck,
  Students: Users,
  Parents: Users,
  Classes: BookOpen,
  Subjects: BookOpen,
  Subscription: Shield,
  Exams: ClipboardList,
  'My Exams': ClipboardList,
  Results: ClipboardList,
  'My Children': Users,
};

const navItems = {
  platform_owner: [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Institutions', path: '/institutions' },
    { label: 'Plans', path: '/plans' },
  ],
  super_admin: [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Institutions', path: '/institutions' },
    { label: 'Payments', path: '/payments' },
    { label: 'Plans', path: '/plans' },
  ],
  admin: [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Teachers', path: '/teachers' },
    { label: 'Students', path: '/students' },
    { label: 'Parents', path: '/parents' },
    { label: 'Classes', path: '/academic/classes' },
    { label: 'Subjects', path: '/academic/subjects' },
    { label: 'Subscription', path: '/subscription' },
  ],
  teacher: [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Exams', path: '/exams' },
  ],
  student: [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'My Exams', path: '/exams' },
    { label: 'Results', path: '/results' },
  ],
  parent: [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'My Children', path: '/children' },
  ],
};

export default function DashboardLayout() {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  if (!user) return <Navigate to="/login" replace />;

  const items = navItems[user.role] || navItems.student;
  const roleLabel = user.role?.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
  const initials = (user.firstName?.[0] || user.email?.[0] || 'U').toUpperCase();

  return (
    <div className="min-h-screen bg-surface-50 flex">
      <aside className={`${menuOpen ? 'block' : 'hidden'} md:flex md:flex-col w-64 bg-white border-r border-surface-200 fixed md:static inset-y-0 left-0 z-50 animate-fade-in`}>
        <div className="p-5 border-b border-surface-100">
          <div className="flex items-center justify-between">
            <Link to="/dashboard" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center">
                <GraduationCap className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold text-surface-900">EduOMR</span>
            </Link>
            <button className="md:hidden text-surface-400 hover:text-surface-600" onClick={() => setMenuOpen(false)}>
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="px-5 py-3 border-b border-surface-100">
          <Badge variant="primary" className="text-[10px] uppercase tracking-wider">{roleLabel}</Badge>
        </div>

        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {items.map((item) => {
            const Icon = icons[item.label] || ChevronRight;
            const active = location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                  active
                    ? 'bg-primary-50 text-primary-700 font-medium'
                    : 'text-surface-600 hover:bg-surface-100 hover:text-surface-900'
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? 'text-primary-600' : 'text-surface-400'}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-surface-100">
          <div className="flex items-center gap-3 mb-3">
            <Avatar className="w-8 h-8">
              <AvatarFallback className="text-xs bg-primary-100 text-primary-700">{initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-surface-900 truncate">{user.firstName || 'User'}</p>
              <p className="text-xs text-surface-400 truncate">{user.email}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="w-full justify-start text-surface-500 hover:text-red-600 hover:bg-red-50" onClick={logout}>
            <LogOut className="w-4 h-4 mr-2" /> Sign Out
          </Button>
        </div>
      </aside>

      {menuOpen && <div className="fixed inset-0 bg-black/30 z-40 md:hidden animate-fade-in" onClick={() => setMenuOpen(false)} />}

      <main className="flex-1 min-w-0">
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-sm border-b border-surface-200 px-4 md:px-6 py-3 flex items-center justify-between md:hidden">
          <button onClick={() => setMenuOpen(true)} className="p-2 -ml-2 rounded-lg hover:bg-surface-100 text-surface-600">
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary-600 flex items-center justify-center">
              <GraduationCap className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold text-surface-900">EduOMR</span>
          </div>
          <Avatar className="w-7 h-7">
            <AvatarFallback className="text-[10px] bg-primary-100 text-primary-700">{initials}</AvatarFallback>
          </Avatar>
        </header>

        <div className="p-4 md:p-8 max-w-7xl mx-auto animate-fade-in">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
