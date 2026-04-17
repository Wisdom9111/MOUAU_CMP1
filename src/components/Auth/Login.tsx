/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { auth, db } from "../../firebase";
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { motion } from "motion/react";
import { Mail, Lock, ChevronRight, LogIn, UserPlus } from "lucide-react";

interface LoginProps {
  onSignUpClick: () => void;
  onSuccess: () => void;
}

export default function Login({ onSignUpClick, onSuccess }: LoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGoogleLogin = async () => {
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      onSuccess();
    } catch (err: any) {
      setError("Google Login failed. " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await signInWithEmailAndPassword(auth, email, password);
      onSuccess();
    } catch (err: any) {
      setError("Invalid university credentials. Please check your email or password.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F3F4F6] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-xl shadow-sm border border-[#D1D5DB] overflow-hidden"
      >
        <div className="bg-[#111827] p-10 text-white text-center">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-[#006838] rounded-lg flex items-center justify-center font-bold text-3xl">M</div>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Portal Sign In</h1>
          <p className="text-white/60 text-xs mt-1 uppercase tracking-[0.2em] font-bold">MOUAU Computer Science</p>
        </div>

        <form onSubmit={handleLogin} className="p-10 space-y-6">
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded text-[13px] font-medium border border-red-100 italic">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-[#6B7280] uppercase tracking-widest">University Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4.5 h-4.5" />
              <input 
                required type="email" value={email} onChange={e => setEmail(e.target.value)}
                className="w-full bg-[#F9FAFB] border border-[#D1D5DB] rounded-md py-3 pl-11 pr-4 text-[13px] outline-none focus:ring-1 focus:ring-[#006838]/30"
                placeholder="name@mouau.edu.ng"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-bold text-[#6B7280] uppercase tracking-widest">Password</label>
              <button type="button" className="text-[10px] font-bold text-[#006838] hover:underline uppercase tracking-tight">Forgot Credentials?</button>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4.5 h-4.5" />
              <input 
                required type="password" value={password} onChange={e => setPassword(e.target.value)}
                className="w-full bg-[#F9FAFB] border border-[#D1D5DB] rounded-md py-3 pl-11 pr-4 text-[13px] outline-none focus:ring-1 focus:ring-[#006838]/30"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button 
            type="submit" disabled={loading}
            className="w-full bg-[#006838] text-white py-3.5 rounded-md font-bold text-sm shadow-sm hover:opacity-95 transition-all flex items-center justify-center gap-2 group"
          >
            <LogIn size={18} />
            {loading ? "Verifying Session..." : "Secure Login"}
            {!loading && <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform ml-1" />}
          </button>

          <button 
            type="button" onClick={handleGoogleLogin} disabled={loading}
            className="w-full border border-[#D1D5DB] text-[#4B5563] py-3.5 rounded-md font-bold text-sm shadow-sm hover:bg-gray-50 transition-all flex items-center justify-center gap-3"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with University Google Account
          </button>

          <div className="relative flex items-center py-2">
            <div className="flex-grow border-t border-gray-100"></div>
            <span className="flex-shrink mx-4 text-[10px] text-gray-300 font-bold uppercase tracking-widest">New Student or Faculty?</span>
            <div className="flex-grow border-t border-gray-100"></div>
          </div>

          <button 
            type="button" onClick={onSignUpClick}
            className="w-full border border-[#D1D5DB] text-[#111827] py-3 rounded-md font-bold text-[13px] hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
          >
            <UserPlus size={16} />
            Create Department Account
          </button>
        </form>
      </motion.div>
    </div>
  );
}
