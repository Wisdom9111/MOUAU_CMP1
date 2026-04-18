import React, { useState, useEffect, Suspense, lazy, Component, ErrorInfo, ReactNode } from "react";
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { GraduationCap, LogOut, BookOpen, Upload, LayoutDashboard, Search, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

// TOTAL SURGERY: Every single page is lazy-loaded to ensure zero monolithic chunks
const AdminDashboard = lazy(() => import("./components/AdminDashboard"));
const LecturerArea = lazy(() => import("./components/LecturerArea"));
const StudentArea = lazy(() => import("./components/StudentArea"));
const Login = lazy(() => import("./components/Auth/Login"));
const SignUp = lazy(() => import("./components/Auth/SignUp"));

// Unified Auth Logic Mock
const getStoredUser = () => {
  try {
    const user = localStorage.getItem("mouau_user");
    return user ? JSON.parse(user) : null;
  } catch (e) {
    return null;
  }
};

// Error Boundary for UI Resilience
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    if (this.state.hasError) return <div className="p-20 text-center"><h1>CMS Render Error</h1><button onClick={() => window.location.reload()}>Reload System</button></div>;
    return this.props.children;
  }
}

// Authentication Guard
function AuthGuard({ children, allowedRoles }) {
  const [profile, setProfile] = useState(getStoredUser());
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const user = getStoredUser();
    if (!user) {
      if (location.pathname !== '/register') navigate('/login', { replace: true });
    } else {
      setProfile(user);
      if (allowedRoles && !allowedRoles.includes(user.role)) {
        const fallback = user.role === 'admin' ? '/admin-dashboard' : 
                         user.role === 'lecturer' ? '/lecturer-dashboard' : 
                         '/student-dashboard';
        navigate(fallback, { replace: true });
      }
    }
  }, [navigate, location.pathname, allowedRoles]);

  return <Layout profile={profile}>{children}</Layout>;
}

function LoadingScreen() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#F3F4F6]">
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}>
        <GraduationCap className="w-12 h-12 text-[#006838]" />
      </motion.div>
      <p className="mt-4 font-sans text-xs font-bold text-[#6B7280] uppercase tracking-widest">Initialising MOUAU Repository...</p>
    </div>
  );
}

function Layout({ children, profile }) {
  const navigate = useNavigate();
  const location = useLocation();
  const logout = () => { localStorage.removeItem("mouau_user"); navigate('/login'); };

  const isLecturer = profile?.role === 'lecturer';
  const isAdmin = profile?.role === 'admin';

  return (
    <div className="min-h-screen bg-[#F3F4F6] flex">
      <nav className={`w-[260px] ${isLecturer ? 'bg-[#002b18]' : 'bg-[#111827]'} text-white flex flex-col h-screen fixed top-0 left-0 z-20 transition-all`}>
        <div className="p-8">
           <div className="flex items-center gap-4 mb-10 pb-6 border-b border-white/5">
              <div className="w-10 h-10 bg-[#006838] rounded-xl flex items-center justify-center font-black shadow-lg">M</div>
              <h1 className="font-black text-xs uppercase tracking-tighter italic leading-none">MOUAU<br/><span className="text-[10px] text-white/30 tracking-widest not-italic">PORTAL</span></h1>
           </div>
           <div className="space-y-4">
              <button 
                onClick={() => navigate(isAdmin ? '/admin-dashboard' : isLecturer ? '/lecturer-dashboard' : '/student-dashboard')}
                className={`w-full text-left py-4 px-5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${location.pathname.includes('dashboard') ? 'bg-[#006838] text-white shadow-xl' : 'text-white/40 hover:bg-white/5'}`}
              >
                Dashboard Area
              </button>
           </div>
        </div>
        <div className="mt-auto p-8 border-t border-white/5 bg-black/20">
           <button onClick={logout} className="w-full bg-red-500/10 text-red-500 py-3 rounded-lg text-[9px] font-black uppercase tracking-[0.2em] border border-red-500/20 hover:bg-red-500 hover:text-white transition-all">Logout Session</button>
        </div>
      </nav>
      <main className="flex-1 ml-[260px] p-10 overflow-y-auto h-screen">{children}</main>
    </div>
  );
}

function AuthWrapper({ type }) {
  const navigate = useNavigate();
  useEffect(() => {
    const user = getStoredUser();
    if (user) {
      const path = user.role === 'admin' ? '/admin-dashboard' : 
                   user.role === 'lecturer' ? '/lecturer-dashboard' : 
                   '/student-dashboard';
      navigate(path, { replace: true });
    }
  }, [navigate]);

  return (
    <Suspense fallback={<LoadingScreen />}>
      {type === 'login' ? (
        <Login onSignUpClick={() => navigate('/register')} onSuccess={() => navigate('/')} />
      ) : (
        <SignUp onLoginClick={() => navigate('/login')} onSuccess={() => navigate('/')} />
      )}
    </Suspense>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingScreen />}>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<AuthWrapper type="login" />} />
            <Route path="/register" element={<AuthWrapper type="signup" />} />
            
            <Route path="/admin-dashboard" element={
              <AuthGuard allowedRoles={['admin']}><AdminDashboard /></AuthGuard>
            } />
            
            <Route path="/lecturer-dashboard" element={
              <AuthGuard allowedRoles={['lecturer', 'admin']}><LecturerArea /></AuthGuard>
            } />
            
            <Route path="/student-dashboard" element={
              <AuthGuard allowedRoles={['student', 'lecturer', 'admin']}>
                <StudentArea profile={getStoredUser()} />
              </AuthGuard>
            } />

            <Route path="/" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
      </Suspense>
    </ErrorBoundary>
  );
}
