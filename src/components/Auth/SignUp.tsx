/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { UserProfile, UserRole, AcademicLevel } from "../../types";
import { motion } from "motion/react";
import { GraduationCap, User, Mail, Lock, Building, ChevronRight, LogIn, Eye, EyeOff } from "lucide-react";

interface SignUpProps {
  onLoginClick: () => void;
  onSuccess: (profile: UserProfile) => void;
}

export default function SignUp({ onLoginClick, onSuccess }: SignUpProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [department, setDepartment] = useState("");
  const [role, setRole] = useState<UserRole>("student");
  const [level, setLevel] = useState<AcademicLevel>("100L");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGoogleSignUp = async () => {
    setLoading(true);
    const demoUser: UserProfile = {
      uid: "google-" + Math.random().toString(36).substr(2, 9),
      email: "google.user@mouau.edu.ng",
      name: "Google Student",
      role: 'student',
      level: '100L',
      department: "Computer Science",
      createdAt: new Date().toISOString()
    };
    onSuccess(demoUser);
    setLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const newProfile: UserProfile = {
        uid: "local-" + Math.random().toString(36).substr(2, 9),
        email: email,
        name: name,
        role: role,
        level: role === 'student' ? level : 'N/A',
        department: department,
        createdAt: new Date().toISOString(),
      };

      onSuccess(newProfile);
    } catch (err: any) {
      setError("Registration encountered a local error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F3F4F6] flex items-center justify-center p-4 py-12">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-xl shadow-sm border border-[#D1D5DB] overflow-hidden"
      >
        <div className="bg-[#111827] p-8 text-white text-center">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 bg-[#006838] rounded-lg flex items-center justify-center font-bold text-xl">M</div>
          </div>
          <h1 className="text-xl font-bold tracking-tight">Create MOUAU Account</h1>
          <p className="text-white/60 text-xs mt-1 uppercase tracking-widest font-bold">Courseware Management System</p>
        </div>

        <form onSubmit={handleSignUp} className="p-8 space-y-5">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded text-xs font-medium border border-red-100 italic">
              {error}
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-[#6B7280] uppercase tracking-widest">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input 
                required value={name} onChange={e => setName(e.target.value)}
                className="w-full bg-[#F9FAFB] border border-[#D1D5DB] rounded-md py-2.5 pl-10 pr-4 text-sm outline-none focus:ring-1 focus:ring-[#006838]/30"
                placeholder="e.g. John Doe"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-[#6B7280] uppercase tracking-widest">University Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input 
                required type="email" value={email} onChange={e => setEmail(e.target.value)}
                className="w-full bg-[#F9FAFB] border border-[#D1D5DB] rounded-md py-2.5 pl-10 pr-4 text-sm outline-none focus:ring-1 focus:ring-[#006838]/30"
                placeholder="name@mouau.edu.ng"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-[#6B7280] uppercase tracking-widest">Department</label>
            <div className="relative">
              <Building className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input 
                required value={department} onChange={e => setDepartment(e.target.value)}
                className="w-full bg-[#F9FAFB] border border-[#D1D5DB] rounded-md py-2.5 pl-10 pr-4 text-sm outline-none focus:ring-1 focus:ring-[#006838]/30"
                placeholder="e.g. Computer Science"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-[#6B7280] uppercase tracking-widest">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input 
                required type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)}
                className="w-full bg-[#F9FAFB] border border-[#D1D5DB] rounded-md py-2.5 pl-10 pr-10 text-sm outline-none focus:ring-1 focus:ring-[#006838]/30"
                placeholder="••••••••"
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#006838] transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-[#6B7280] uppercase tracking-widest">Portal Role</label>
              <select 
                value={role} onChange={e => setRole(e.target.value as UserRole)}
                className="w-full bg-[#F9FAFB] border border-[#D1D5DB] rounded-md py-2.5 px-3 text-sm outline-none"
              >
                <option value="student">Student</option>
                <option value="lecturer">Lecturer</option>
              </select>
            </div>
            {role === 'student' && (
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#6B7280] uppercase tracking-widest">Current Level</label>
                <select 
                  value={level} onChange={e => setLevel(e.target.value as AcademicLevel)}
                  className="w-full bg-[#F9FAFB] border border-[#D1D5DB] rounded-md py-2.5 px-3 text-sm outline-none"
                >
                  <option value="100L">100L</option>
                  <option value="200L">200L</option>
                  <option value="300L">300L</option>
                  <option value="400L">400L</option>
                  <option value="500L">500L</option>
                </select>
              </div>
            )}
          </div>

          <button 
            type="submit" disabled={loading}
            className="w-full bg-[#006838] text-white py-3 rounded-md font-bold text-sm shadow-sm hover:opacity-95 transition-all flex items-center justify-center gap-2 group"
          >
            {loading ? "Creating Profile..." : "Register Account"}
            {!loading && <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />}
          </button>

          <button 
            type="button" onClick={handleGoogleSignUp} disabled={loading}
            className="w-full border border-[#D1D5DB] text-[#4B5563] py-3 rounded-md font-bold text-sm shadow-sm hover:bg-gray-50 transition-all flex items-center justify-center gap-3"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Quick Register with Google
          </button>

          <div className="text-center pt-2">
            <button 
              type="button" onClick={onLoginClick}
              className="text-[11px] font-bold text-[#6B7280] hover:text-[#006838] uppercase tracking-wider transition-colors"
            >
              Already have an account? <span className="text-[#006838] underline">Login here</span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
