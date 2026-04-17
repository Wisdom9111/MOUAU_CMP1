/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { auth, db } from "./firebase";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { doc, getDoc, getDocFromServer } from "firebase/firestore";
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
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      if (u) {
        setUser(u);
        const docRef = doc(db, "users", u.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const p = docSnap.data() as UserProfile;
          setProfile(p);
          // Role-based verification
          if (allowedRoles && !allowedRoles.includes(p.role)) {
            navigate(p.role === 'admin' ? '/admin-dashboard' : p.role === 'lecturer' ? '/lecturer-dashboard' : '/student-dashboard');
          }
        } else {
          // No profile found - force signup/profile completion
          if (location.pathname !== '/register') navigate('/register');
        }
      } else {
        navigate('/login');
      }
      setLoading(false);
    });
    return () => unsubscribe();
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
      <p className="mt-4 font-sans text-sm text-[#6B7280]">Verifying Portal Credentials...</p>
    </div>
  );
}

function Layout({ children, profile }: { children: React.ReactNode, profile: UserProfile | null }) {
  const navigate = useNavigate();
  const logout = () => signOut(auth).then(() => navigate('/login'));

  return (
    <div className="min-h-screen bg-[#F3F4F6] flex">
      <nav className="w-[240px] bg-[#111827] text-white flex flex-col h-screen fixed top-0 left-0 z-20">
        <div className="p-6">
          <div className="flex items-center gap-3 pb-6 border-b border-white/10 mb-8">
            <div className="bg-[#006838] w-8 h-8 rounded flex items-center justify-center font-bold text-xs">M</div>
            <h2 className="font-bold text-base tracking-tight">MOUAU CMS</h2>
          </div>
          <div className="space-y-6">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold mb-3">Main Menu</p>
              <div className="space-y-1">
                {profile?.role === 'admin' && <NavItem icon={<LayoutDashboard size={16} />} label="Dashboard" active onClick={() => navigate('/admin-dashboard')} />}
                {(profile?.role === 'lecturer' || profile?.role === 'admin') && <NavItem icon={<Upload size={16} />} label="Faculty Uploads" onClick={() => navigate('/lecturer-dashboard')} />}
                <NavItem icon={<BookOpen size={16} />} label="Course Catalog" onClick={() => navigate('/student-dashboard')} />
                <NavItem icon={<BrainCircuit size={16} />} label="Quiz Generator" />
              </div>
            </div>
          </div>
        </div>
        <div className="mt-auto p-6 bg-black/20">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center border border-white/20 font-bold text-white text-xs">
              {profile?.name.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-white truncate">{profile?.name}</p>
              <p className="text-[9px] text-white/50 font-bold uppercase tracking-wider">{profile?.role}</p>
            </div>
          </div>
          <button onClick={logout} className="w-full flex items-center gap-2 text-red-400 text-[10px] font-bold uppercase tracking-widest hover:text-red-300 transition-colors px-2">
            <LogOut size={12} /> Sign Out
          </button>
        </div>
      </nav>
      <div className="flex-1 ml-[240px] flex flex-col min-h-screen">
        <header className="h-[64px] bg-white border-b border-[#D1D5DB] flex items-center justify-between px-8 sticky top-0 z-10 shadow-sm">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input placeholder="Search course codes..." className="bg-[#F9FAFB] border border-[#D1D5DB] rounded-md py-2 pl-10 pr-4 text-xs w-[400px] outline-none focus:ring-1 focus:ring-[#006838]/30" />
          </div>
          <div className="flex items-center gap-4 text-right">
            <div>
              <p className="text-xs font-bold text-[#111827]">{profile?.name}</p>
              <p className="text-[10px] text-[#6B7280] font-medium uppercase tracking-wider">{profile?.role}, CS Dept</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center font-bold text-xs text-gray-600">{profile?.name.charAt(0)}</div>
          </div>
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}

function NavItem({ icon, label, active = false, onClick }: { icon: React.ReactNode, label: string, active?: boolean, onClick?: () => void }) {
  return (
    <div onClick={onClick} className={`flex items-center gap-3 py-2.5 px-3 rounded-md cursor-pointer transition-all ${active ? 'bg-[#006838] text-white' : 'text-white/70 hover:bg-white/5 hover:text-white'}`}>
      <span className={active ? 'text-white' : 'text-white/50'}>{icon}</span>
      <span className="text-sm font-medium">{label}</span>
    </div>
  );
}

function AuthWrapper({ type }: { type: 'login' | 'signup' }) {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (u) {
        const d = await getDoc(doc(db, "users", u.uid));
        if (d.exists()) {
          const p = d.data() as UserProfile;
          navigate(p.role === 'admin' ? '/admin-dashboard' : p.role === 'lecturer' ? '/lecturer-dashboard' : '/student-dashboard');
        }
      }
      setChecking(false);
    });
    return () => unsub();
  }, [navigate]);

  if (checking) return <LoadingScreen />;

  return (
    <AnimatePresence mode="wait">
      {type === 'login' ? (
        <Login key="login" onSignUpClick={() => navigate('/register')} onSuccess={() => {}} />
      ) : (
        <SignUp key="signup" onLoginClick={() => navigate('/login')} onSuccess={(p) => navigate(p.role === 'lecturer' ? '/lecturer-dashboard' : '/student-dashboard')} />
      )}
    </AnimatePresence>
  );
}

export default function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function testConnection() {
      try { 
        await getDocFromServer(doc(db, 'test', 'connection')); 
      } catch (error: any) { 
        if (error.message?.includes('the client is offline')) {
           console.error("Firebase connection check failed: Please check your Firebase configuration.");
        }
      }
    }
    testConnection();
    const unsubscribe = onAuthStateChanged(auth, () => setLoading(false));
    return () => unsubscribe();
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
            {/* We need to pass profile to StudentArea - but AuthGuard children won't have it easily unless we use Outlet or state */}
            {/* I'll use a hacky way since the existing StudentArea expects a profile prop */}
            <StudentAreaWithProfile />
          </AuthGuard>
        } />

        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

// Wrapper for StudentArea to get profile from local fetch
function StudentAreaWithProfile() {
  const [p, setP] = useState<UserProfile | null>(null);
  useEffect(() => {
    if (auth.currentUser) {
      getDoc(doc(db, "users", auth.currentUser.uid)).then(d => setP(d.data() as UserProfile));
    }
  }, []);
  if (!p) return null;
  return <StudentArea profile={p} />;
}
