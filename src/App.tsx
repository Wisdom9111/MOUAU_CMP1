import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { auth, db } from "./firebase";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { UserProfile } from "./types";
import { GraduationCap, LogOut, BookOpen, Upload, LayoutDashboard, BrainCircuit, Search } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

import AdminDashboard from "./components/AdminDashboard";
import LecturerArea from "./components/LecturerArea";
import StudentArea from "./components/StudentArea";
import Login from "./components/Auth/Login";
import SignUp from "./components/Auth/SignUp";

// Authentication Guard
function AuthGuard({ children, allowedRoles }: { children: React.ReactNode, allowedRoles?: string[] }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (u) {
        setUser(u);
        const docRef = doc(db, "users", u.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const p = docSnap.data() as UserProfile;
          setProfile(p);
          if (allowedRoles && !allowedRoles.includes(p.role)) {
            navigate(p.role === 'admin' ? '/admin-dashboard' : p.role === 'lecturer' ? '/lecturer-dashboard' : '/student-dashboard', { replace: true });
          }
        } else {
          if (location.pathname !== '/register') navigate('/register', { replace: true });
        }
      } else if (location.pathname !== '/login' && location.pathname !== '/register') {
        navigate('/login', { replace: true });
      }
      setLoading(false);
    });
    return unsub;
  }, [navigate]);

  if (loading) return <LoadingScreen />;
  return <Layout profile={profile}>{children}</Layout>;
}

function LoadingScreen() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#F3F4F6]">
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}>
        <GraduationCap className="w-12 h-12 text-[#006838]" />
      </motion.div>
      <p className="mt-4 font-sans text-sm text-[#6B7280]">Verifying Portal Credentials...</p>
    </div>
  );
}

function Layout({ children, profile }: { children: React.ReactNode, profile: UserProfile | null }) {
  const navigate = useNavigate();
  const location = useLocation();
  const logout = () => signOut(auth).then(() => navigate('/login'));

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
               <p className="text-[8px] text-white/40 font-bold tracking-[0.3em] uppercase">Academic Portal</p>
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
                  <>
                    <NavItem 
                      icon={<Upload size={18} />} 
                      label="Upload Center" 
                      active={location.pathname === '/lecturer-dashboard'} 
                      onClick={() => navigate('/lecturer-dashboard')} 
                    />
                    <NavItem 
                      icon={<BookOpen size={18} />} 
                      label="Management" 
                      onClick={() => navigate('/lecturer-dashboard')} 
                    />
                  </>
                ) : (
                  <>
                    <NavItem 
                      icon={<BookOpen size={18} />} 
                      label="Course Catalog" 
                      active={location.pathname === '/student-dashboard'} 
                      onClick={() => navigate('/student-dashboard')} 
                    />
                    <NavItem 
                      icon={<BrainCircuit size={18} />} 
                      label="Quiz Generator" 
                    />
                  </>
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
              <p className="text-[11px] font-black text-white truncate uppercase tracking-tight">{profile?.name || 'Loading User...'}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                 <div className={`w-1.5 h-1.5 rounded-full ${isLecturer ? 'bg-emerald-400' : 'bg-blue-400'} animate-pulse`}></div>
                 <p className="text-[9px] text-white/60 font-black uppercase tracking-[0.15em]">
                   {profile?.role || 'Identifying...'}
                 </p>
              </div>
            </div>
          </div>
          <button 
            onClick={logout} 
            className="w-full flex items-center justify-center gap-3 bg-red-500/10 text-red-400 py-3 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all border border-red-500/20"
          >
            <LogOut size={14} /> BREAK SESSION
          </button>
        </div>
      </nav>
      
      <div className="flex-1 ml-[260px] flex flex-col min-h-screen">
        <header className="h-[72px] bg-white border-b border-[#D1D5DB] flex items-center justify-between px-10 sticky top-0 z-10 shadow-sm backdrop-blur-md bg-white/90">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input 
              placeholder="Search faculty repository..." 
              className="bg-[#F9FAFB] border border-[#D1D5DB] rounded-lg py-2.5 pl-11 pr-4 text-xs w-[400px] outline-none focus:ring-2 focus:ring-[#006838]/20 transition-all font-medium" 
            />
          </div>
          <div className="flex items-center gap-5 text-right">
            <div className="hidden sm:block">
              <p className="text-xs font-black text-[#111827] uppercase tracking-tight">{profile?.name}</p>
              <p className="text-[9px] text-[#6B7280] font-bold uppercase tracking-widest">{profile?.department || 'Faculty of Engineering'}</p>
            </div>
            <div className={`w-10 h-10 rounded-full ${isLecturer ? 'bg-[#E6F4EA] text-[#006838]' : 'bg-gray-100 text-gray-600'} flex items-center justify-center font-black text-sm border border-[#D1D5DB]`}>
              {profile?.name?.charAt(0)}
            </div>
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
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const p = docSnap.data() as UserProfile;
          navigate(p.role === 'admin' ? '/admin-dashboard' : p.role === 'lecturer' ? '/lecturer-dashboard' : '/student-dashboard', { replace: true });
        }
      }
      setChecking(false);
    });
    return unsub;
  }, [navigate]);

  if (checking) return <LoadingScreen />;

  return (
    <AnimatePresence mode="wait">
      {type === 'login' ? (
        <Login key="login" onSignUpClick={() => navigate('/register')} onSuccess={() => {}} />
      ) : (
        <SignUp key="signup" onLoginClick={() => navigate('/login')} onSuccess={(p) => navigate(p.role === 'lecturer' ? '/lecturer-dashboard' : '/student-dashboard', { replace: true })} />
      )}
    </AnimatePresence>
  );
}

export default function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, () => setLoading(false));
    return unsub;
  }, []);

  if (loading) return <LoadingScreen />;

  return (
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
            <StudentAreaWithProfile />
          </AuthGuard>
        } />

        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

function StudentAreaWithProfile() {
  const [p, setP] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (u) {
        const docRef = doc(db, "users", u.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setP(docSnap.data() as UserProfile);
        }
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  if (loading) return <LoadingScreen />;
  if (!p) return <Navigate to="/login" replace />;
  return <StudentArea profile={p} />;
}
