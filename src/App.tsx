import React, { useState, useEffect, Component, ErrorInfo, ReactNode } from "react";
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { UserProfile } from "./types";
import { GraduationCap, LogOut, BookOpen, Upload, LayoutDashboard, Search, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

// FAIL-SAFE: Reverting to static imports to rule out chunking/lazy-loading issues
import AdminDashboard from "./components/AdminDashboard";
import LecturerArea from "./components/LecturerArea";
import StudentArea from "./components/StudentArea";
import Login from "./components/Auth/Login";
import SignUp from "./components/Auth/SignUp";

// Unified Auth Logic Mock
const getStoredUser = () => {
  try {
    const user = localStorage.getItem("mouau_user");
    return user ? JSON.parse(user) as UserProfile : null;
  } catch (e) {
    console.error("Local storage corruption:", e);
    return null;
  }
};

// Error Boundary Component
class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean, error: Error | null }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("CRITICAL UI ERROR:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-white flex items-center justify-center p-10 font-sans">
          <div className="max-w-xl w-full text-center">
            <div className="bg-red-50 p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="text-red-500 w-10 h-10" />
            </div>
            <h1 className="text-2xl font-black text-gray-900 mb-2">PORTAL RENDER ERROR</h1>
            <p className="text-gray-500 text-sm mb-8 leading-relaxed">
              The application encountered a runtime error that prevented it from loading. 
              This usually happens during high-performance chunking on Vercel.
            </p>
            <div className="bg-gray-900 text-left p-6 rounded-xl overflow-auto max-h-60 border border-white/10 shadow-2xl">
              <p className="text-emerald-400 font-mono text-[11px] mb-2 uppercase tracking-widest font-black">Technical Details:</p>
              <pre className="text-white font-mono text-xs whitespace-pre-wrap leading-tight">
                {this.state.error?.toString()}
              </pre>
            </div>
            <button 
              onClick={() => { localStorage.clear(); window.location.href = '/'; }}
              className="mt-10 bg-[#006838] text-white px-8 py-3 rounded-full font-black text-xs uppercase tracking-[0.2em] shadow-lg hover:shadow-xl transition-all"
            >
              Clear Session & Force Recover
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// Authentication Guard
function AuthGuard({ children, allowedRoles }: { children: React.ReactNode, allowedRoles?: string[] }) {
  const [profile, setProfile] = useState<UserProfile | null>(getStoredUser());
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
      <p className="mt-4 font-sans text-sm text-[#6B7280]">Connecting to Node...</p>
    </div>
  );
}

function Layout({ children, profile }: { children: React.ReactNode, profile: UserProfile | null }) {
  const navigate = useNavigate();
  const location = useLocation();
  const logout = () => { localStorage.removeItem("mouau_user"); navigate('/login'); };

  const isLecturer = profile?.role === 'lecturer';
  const isAdmin = profile?.role === 'admin';

  return (
    <div className="min-h-screen bg-[#F3F4F6] flex">
      <nav className={`w-[260px] ${isLecturer ? 'bg-[#002b18]' : 'bg-[#111827]'} text-white flex flex-col h-screen fixed top-0 left-0 z-20 transition-colors`}>
        {/* Navigation contents... (Keeping logic simplified for debugging) */}
        <div className="p-8">
           <div className="flex items-center gap-4 mb-10">
              <div className="w-10 h-10 bg-[#006838] rounded-xl flex items-center justify-center font-black">M</div>
              <h1 className="font-black text-xs uppercase tracking-widest italic">MOUAU DEBUG</h1>
           </div>
           <div className="space-y-2">
              <button 
                onClick={() => navigate(isAdmin ? '/admin-dashboard' : isLecturer ? '/lecturer-dashboard' : '/student-dashboard')}
                className={`w-full text-left py-3 px-4 rounded-xl text-xs font-black uppercase tracking-widest ${location.pathname.includes('dashboard') ? 'bg-[#006838] shadow-lg' : 'text-white/40'}`}
              >
                Dashboard
              </button>
           </div>
        </div>
        <div className="mt-auto p-8 border-t border-white/5">
           <button onClick={logout} className="text-red-400 text-[10px] font-black uppercase tracking-widest">Logout Session</button>
        </div>
      </nav>
      <main className="flex-1 ml-[260px] p-10">{children}</main>
    </div>
  );
}

function AuthWrapper({ type }: { type: 'login' | 'signup' }) {
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
    <AnimatePresence mode="wait">
      {type === 'login' ? (
        <Login 
          key="login" 
          onSignUpClick={() => navigate('/register')} 
          onSuccess={() => {
            const user = getStoredUser();
            if (user) {
              const path = user.role === 'admin' ? '/admin-dashboard' : 
                          user.role === 'lecturer' ? '/lecturer-dashboard' : 
                          '/student-dashboard';
              navigate(path, { replace: true });
            }
          }} 
        />
      ) : (
        <SignUp key="signup" onLoginClick={() => navigate('/login')} onSuccess={(p) => {
          localStorage.setItem("mouau_user", JSON.stringify(p));
          navigate(p.role === 'lecturer' ? '/lecturer-dashboard' : '/student-dashboard', { replace: true });
        }} />
      )}
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
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
              <ErrorBoundary>
                <StudentArea profile={getStoredUser()!} />
              </ErrorBoundary>
            </AuthGuard>
          } />

          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
