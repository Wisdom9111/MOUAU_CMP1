import React, { useState, useEffect, Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { UserProfile } from "./types";
import { GraduationCap, LogOut, BookOpen, Upload, LayoutDashboard, Search } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

// Auth related components (Smaller footprint)
const Login = lazy(() => import("./components/Auth/Login"));
const SignUp = lazy(() => import("./components/Auth/SignUp"));

// Dashboard components (Large chunks)
const AdminDashboard = lazy(() => import("./components/AdminDashboard"));
const LecturerArea = lazy(() => import("./components/LecturerArea"));
const StudentArea = lazy(() => import("./components/StudentArea"));

// Unified Auth Logic Mock
const getStoredUser = () => {
  const user = localStorage.getItem("mouau_user");
  return user ? JSON.parse(user) as UserProfile : null;
};

// Authentication Guard
function AuthGuard({ children, allowedRoles }: { children: React.ReactNode, allowedRoles?: string[] }) {
  const [profile, setProfile] = useState<UserProfile | null>(getStoredUser());
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const user = getStoredUser();
    if (!user) {
      if (location.pathname !== '/register') navigate('/login', { replace: true });
    } else {
      setProfile(user);
      if (allowedRoles && !allowedRoles.includes(user.role)) {
        navigate(user.role === 'admin' ? '/admin-dashboard' : user.role === 'lecturer' ? '/lecturer-dashboard' : '/student-dashboard', { replace: true });
      }
    }
  }, [navigate, location.pathname]);

  if (loading) return <LoadingScreen />;
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
  
  const logout = () => {
    localStorage.removeItem("mouau_user");
    navigate('/login');
  };

  const isLecturer = profile?.role === 'lecturer';
  const isAdmin = profile?.role === 'admin';

  return (
    <div className="min-h-screen bg-[#F3F4F6] flex">
      <nav className={`w-[260px] ${isLecturer ? 'bg-[#002b18]' : 'bg-[#111827]'} text-white flex flex-col h-screen fixed top-0 left-0 z-20 shadow-2xl transition-colors duration-500`}>
        <div className="p-8">
          <div className="flex items-center gap-4 pb-8 border-b border-white/10 mb-8">
            <div className={`${isLecturer ? 'bg-[#008f4c]' : 'bg-[#006838]'} w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg shadow-lg`}>M</div>
            <div>
               <h2 className="font-black text-sm tracking-tighter uppercase">MOUAU CMS</h2>
               <p className="text-[8px] text-white/40 font-bold tracking-[0.3em] uppercase">Vercel Build</p>
            </div>
          </div>
          
          <div className="space-y-8">
            <div>
              <p className="text-[9px] uppercase tracking-[0.2em] text-white/30 font-black mb-4 px-2">System Navigation</p>
              <div className="space-y-1.5">
                {isAdmin && (
                  <NavItem 
                    icon={<LayoutDashboard size={18} />} 
                    label="Admin Console" 
                    active={location.pathname === '/admin-dashboard'} 
                    onClick={() => navigate('/admin-dashboard')} 
                  />
                )}
                
                {(isLecturer || isAdmin) ? (
                  <NavItem 
                    icon={<Upload size={18} />} 
                    label="Upload Center" 
                    active={location.pathname === '/lecturer-dashboard'} 
                    onClick={() => navigate('/lecturer-dashboard')} 
                  />
                ) : (
                  <NavItem 
                    icon={<BookOpen size={18} />} 
                    label="Course Catalog" 
                    active={location.pathname === '/student-dashboard'} 
                    onClick={() => navigate('/student-dashboard')} 
                  />
                )}
                
                <NavItem icon={<Search size={18} />} label="Global Search" />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-auto p-6 bg-black/30 backdrop-blur-md border-t border-white/5">
          <div className="flex items-center gap-4 mb-6 p-2 rounded-lg bg-white/5 border border-white/10">
            <div className={`w-10 h-10 rounded-full ${isLecturer ? 'bg-[#008f4c]' : 'bg-[#006838]'} flex items-center justify-center border-2 border-white/20 font-black text-white text-sm shadow-inner`}>
              {profile?.name?.charAt(0) || '?'}
            </div>
            <div className="overflow-hidden">
              <p className="text-[11px] font-black text-white truncate uppercase tracking-tight">{profile?.name || 'Local User'}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                 <div className={`w-1.5 h-1.5 rounded-full ${isLecturer ? 'bg-emerald-400' : 'bg-blue-400'} animate-pulse`}></div>
                 <p className="text-[9px] text-white/60 font-black uppercase tracking-[0.15em]">
                   {profile?.role || 'Guest'}
                 </p>
              </div>
            </div>
          </div>
          <button 
            onClick={logout} 
            className="w-full flex items-center justify-center gap-3 bg-red-500/10 text-red-400 py-3 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all border border-red-500/20"
          >
            <LogOut size={14} /> LOGOUT
          </button>
        </div>
      </nav>
      
      <div className="flex-1 ml-[260px] flex flex-col min-h-screen">
        <header className="h-[72px] bg-white border-b border-[#D1D5DB] flex items-center justify-between px-10 sticky top-0 z-10 shadow-sm backdrop-blur-md bg-white/90">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input 
              placeholder="Search local repository..." 
              className="bg-[#F9FAFB] border border-[#D1D5DB] rounded-lg py-2.5 pl-11 pr-4 text-xs w-[400px] outline-none focus:ring-2 focus:ring-[#006838]/20 transition-all font-medium" 
            />
          </div>
        </header>
        <main className="flex-1 p-10 bg-[#f8fafb]">{children}</main>
      </div>
    </div>
  );
}

function NavItem({ icon, label, active = false, onClick }: { icon: React.ReactNode, label: string, active?: boolean, onClick?: () => void }) {
  return (
    <div 
      onClick={onClick} 
      className={`flex items-center gap-3.5 py-3 px-4 rounded-xl cursor-pointer transition-all duration-300 group ${active ? 'bg-[#006838] text-white shadow-lg shadow-black/20' : 'text-white/60 hover:bg-white/5 hover:text-white'}`}
    >
      <span className={`transition-transform duration-300 ${active ? 'text-white' : 'text-white/40 group-hover:text-white group-hover:scale-110'}`}>{icon}</span>
      <span className={`text-[13px] font-bold tracking-tight ${active ? 'text-white' : 'group-hover:translate-x-1'}`}>{label}</span>
    </div>
  );
}

function AuthWrapper({ type }: { type: 'login' | 'signup' }) {
  const navigate = useNavigate();

  useEffect(() => {
    const user = getStoredUser();
    if (user) {
      navigate(user.role === 'admin' ? '/admin-dashboard' : user.role === 'lecturer' ? '/lecturer-dashboard' : '/student-dashboard', { replace: true });
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
    <BrowserRouter>
      <Suspense fallback={<LoadingScreen />}>
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
              <StudentArea profile={getStoredUser()!} />
            </AuthGuard>
          } />

          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
