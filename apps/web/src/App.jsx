import React from 'react';
import { Routes, Route, Navigate, useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore.js';
import api from './services/api.js';
import AuthLayout from './layouts/AuthLayout.jsx';
import DashboardLayout from './layouts/DashboardLayout.jsx';
import LoginPage from './pages/auth/LoginPage.jsx';
import RegisterPage from './pages/auth/RegisterPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';
import TeacherDashboard from './pages/teacher/TeacherDashboard.jsx';
import StudentDashboard from './pages/student/StudentDashboard.jsx';
import AdminDashboard from './pages/institution-admin/AdminDashboard.jsx';
import ParentDashboard from './pages/parent/ParentDashboard.jsx';
import ExamMode1 from './pages/student/ExamMode1.jsx';
import ExamMode2 from './pages/student/ExamMode2.jsx';
import ResultView from './pages/student/ResultView.jsx';
import LeaderboardPage from './pages/student/LeaderboardPage.jsx';
import ExamListPage from './pages/teacher/ExamListPage.jsx';
import ExamCreatePage from './pages/teacher/ExamCreatePage.jsx';
import ExamEditPage from './pages/teacher/ExamEditPage.jsx';
import ExamMonitorPage from './pages/teacher/ExamMonitorPage.jsx';
import ExamResultsPage from './pages/teacher/ExamResultsPage.jsx';
import ChildResultsPage from './pages/parent/ChildResultsPage.jsx';
import InstitutionsPage from './pages/super-admin/InstitutionsPage.jsx';
import PaymentsPage from './pages/super-admin/PaymentsPage.jsx';
import PlansPage from './pages/super-admin/PlansPage.jsx';

function ProtectedRoute({ children }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  if (!isAuthenticated) {
    return React.createElement(Navigate, { to: "/login", replace: true });
  }
  return children;
}

function RoleRouter() {
  const user = useAuthStore((s) => s.user);
  if (!user) return React.createElement(Navigate, { to: "/login", replace: true });
  switch (user.role) {
    case 'platform_owner':
    case 'super_admin':
    case 'institution_admin':
      return React.createElement(AdminDashboard);
    case 'teacher':
      return React.createElement(TeacherDashboard);
    case 'student':
      return React.createElement(StudentDashboard);
    case 'parent':
      return React.createElement(ParentDashboard);
    default:
      return React.createElement(StudentDashboard);
  }
}

// Routes /exam/:examId to the correct mode component after fetching the exam.
function ExamRouter() {
  const { examId } = useParams();
  const navigate = useNavigate();
  const [mode, setMode] = React.useState(null);

  React.useEffect(() => {
    api.get(`/exams/${examId}`)
      .then(({ data }) => setMode(data.data.examMode))
      .catch(() => navigate('/dashboard', { replace: true }));
  }, [examId, navigate]);

  if (!mode) return null;
  if (mode === 'DIGITAL') return React.createElement(ExamMode1);
  return React.createElement(ExamMode2);
}

export default function App() {
  const isLoading = useAuthStore((s) => s.isLoading);

  React.useEffect(() => {
    useAuthStore.getState().loadUser();
  }, []);

  if (isLoading) return null;

  return React.createElement(Routes, null,
    React.createElement(Route, { element: React.createElement(AuthLayout) },
      React.createElement(Route, { path: "/login", element: React.createElement(LoginPage) }),
      React.createElement(Route, { path: "/register", element: React.createElement(RegisterPage) }),
      React.createElement(Route, { path: "/forgot-password", element: React.createElement(Navigate, { to: "/login", replace: true }) })
    ),
    React.createElement(Route, { element: React.createElement(ProtectedRoute, null, React.createElement(DashboardLayout)) },
      React.createElement(Route, { path: "/dashboard", element: React.createElement(RoleRouter) }),
      React.createElement(Route, { path: "/exams", element: React.createElement(ExamListPage) }),
      React.createElement(Route, { path: "/exams/new", element: React.createElement(ExamCreatePage) }),
      React.createElement(Route, { path: "/exams/:examId", element: React.createElement(ExamEditPage) }),
      React.createElement(Route, { path: "/exams/:examId/edit", element: React.createElement(ExamEditPage) }),
      React.createElement(Route, { path: "/exams/:examId/monitor", element: React.createElement(ExamMonitorPage) }),
      React.createElement(Route, { path: "/exams/:examId/results", element: React.createElement(ExamResultsPage) }),
      React.createElement(Route, { path: "/teachers", element: React.createElement(AdminDashboard) }),
      React.createElement(Route, { path: "/students", element: React.createElement(AdminDashboard) }),
      React.createElement(Route, { path: "/parents", element: React.createElement(AdminDashboard) }),
      React.createElement(Route, { path: "/academic/classes", element: React.createElement(AdminDashboard) }),
      React.createElement(Route, { path: "/academic/subjects", element: React.createElement(AdminDashboard) }),
      React.createElement(Route, { path: "/subscription", element: React.createElement(AdminDashboard) }),
      React.createElement(Route, { path: "/children", element: React.createElement(ParentDashboard) }),
      React.createElement(Route, { path: "/children/:childId/results", element: React.createElement(ChildResultsPage) }),
      React.createElement(Route, { path: "/institutions", element: React.createElement(InstitutionsPage) }),
      React.createElement(Route, { path: "/payments", element: React.createElement(PaymentsPage) }),
      React.createElement(Route, { path: "/plans", element: React.createElement(PlansPage) }),
      React.createElement(Route, { path: "/exam/:examId", element: React.createElement(ExamRouter) }),
      React.createElement(Route, { path: "/results", element: React.createElement(Navigate, { to: "/dashboard", replace: true }) })
    ),
    React.createElement(Route, { path: "/results/exam/:examId", element: React.createElement(ProtectedRoute, null, React.createElement(ResultView)) }),
    React.createElement(Route, { path: "/leaderboard/:examId", element: React.createElement(ProtectedRoute, null, React.createElement(LeaderboardPage)) }),
    React.createElement(Route, { path: "/", element: React.createElement(Navigate, { to: "/dashboard", replace: true }) }),
    React.createElement(Route, { path: "*", element: React.createElement(NotFoundPage) })
  );
}
