/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { UserProfile, Material, AcademicLevel, UserRole } from "../types";
import { Users, FileText, Activity, ShieldCheck, GraduationCap, Trophy, ChevronRight, UserPlus, Search } from "lucide-react";
import { motion } from "motion/react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const MOCK_USERS: UserProfile[] = [
  { uid: "1", name: "Dr. Adebayo", email: "adebayo@mouau.edu.ng", role: "lecturer", level: "N/A", department: "Computer Science", createdAt: new Date().toISOString() },
  { uid: "2", name: "Chinedu Okafor", email: "chinedu@mouau.edu.ng", role: "student", level: "300L", department: "Computer Science", createdAt: new Date().toISOString() }
];

export default function AdminDashboard() {
  const [users, setUsers] = useState<UserProfile[]>(MOCK_USERS);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    // Mock Data Load
    setMaterials([]);
  }, []);

  const changeRole = async (uid: string, newRole: UserRole) => {
    setUsers(prev => prev.map(u => u.uid === uid ? { ...u, role: newRole, level: newRole === 'student' ? '100L' : 'N/A' } as UserProfile : u));
  };

  const changeLevel = async (uid: string, newLevel: AcademicLevel) => {
    setUsers(prev => prev.map(u => u.uid === uid ? { ...u, level: newLevel } : u));
  };

  const statsByLevel = ["100L", "200L", "300L", "400L", "500L"].map(lvl => ({
    level: lvl,
    count: materials.filter(m => m.level === lvl).length
  }));

  const COLORS = ['#006838', '#059669', '#10B981', '#34D399', '#6EE7B7'];

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="stats-grid">
        <StatCard label="Total Students" value={users.filter(u => u.role === 'student').length.toLocaleString()} meta="+12% from last semester" />
        <StatCard label="Course Materials" value={materials.length.toLocaleString()} meta="98 uploads this month" />
        <StatCard label="AI Quizzes Ready" value={materials.filter(m => m.summary).length.toLocaleString()} meta="Gemini API Status: Optimal" />
        <StatCard label="Sheet Sync" value="Active" meta="Last sync: 2 mins ago" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border border-[#D1D5DB] rounded-lg shadow-sm flex flex-col overflow-hidden">
          <div className="px-5 py-4 border-b border-[#D1D5DB] flex justify-between items-center bg-gray-50/30">
             <h3 className="text-sm font-semibold text-[#111827]">Recent Courseware Activity</h3>
             <button className="text-[11px] font-bold text-[#006838] uppercase tracking-wider hover:underline">View All Reports</button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13px]">
              <thead>
                <tr className="bg-[#F9FAFB] text-[#6B7280]">
                  <th className="px-5 py-3 font-semibold border-b border-[#D1D5DB]">Course</th>
                  <th className="px-5 py-3 font-semibold border-b border-[#D1D5DB]">Title</th>
                  <th className="px-5 py-3 font-semibold border-b border-[#D1D5DB]">Level</th>
                  <th className="px-5 py-3 font-semibold border-b border-[#D1D5DB]">Lecturer</th>
                  <th className="px-5 py-3 font-semibold border-b border-[#D1D5DB]">AI Status</th>
                </tr>
              </thead>
              <tbody>
                {materials.slice(0, 8).map((m) => (
                  <tr key={m.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3 border-b border-gray-100 font-medium text-[#006838]">{m.title.split(':')[0] || 'CSC'}</td>
                    <td className="px-5 py-3 border-b border-gray-100">{m.title.split(':')[1] || m.title}</td>
                    <td className="px-5 py-3 border-b border-gray-100">
                      <span className="high-density-badge badge-level">{m.level}</span>
                    </td>
                    <td className="px-5 py-3 border-b border-gray-100 text-[#6B7280]">Prof. Akande</td>
                    <td className="px-5 py-3 border-b border-gray-100">
                      <span className={`high-density-badge ${m.summary ? 'badge-ready' : 'badge-pending'}`}>
                        {m.summary ? 'Summary Ready' : 'Processing...'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white border border-[#D1D5DB] rounded-lg shadow-sm flex flex-col overflow-hidden">
          <div className="px-5 py-4 border-b border-[#D1D5DB] flex justify-between items-center bg-gray-50/30">
             <h3 className="text-sm font-semibold text-[#111827]">Faculty Directory</h3>
             <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 w-3 h-3" />
                <input 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Filter users..."
                  className="bg-white border border-[#D1D5DB] py-1.5 pl-8 pr-3 rounded text-[11px] outline-none w-32 focus:w-40 transition-all"
                />
             </div>
          </div>
          
          <div className="flex-1 overflow-y-auto max-h-[500px] custom-scrollbar">
             {filteredUsers.map((u) => (
               <div key={u.uid} className="flex items-center justify-between p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors">
                 <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center font-bold text-[#6B7280] text-[11px]">
                       {u.name.charAt(0)}
                    </div>
                    <div>
                       <p className="text-[12px] font-semibold text-[#111827]">{u.name}</p>
                       <p className="text-[10px] text-[#6B7280]">{u.role} • {u.level}</p>
                    </div>
                 </div>
                 <div className="flex flex-col gap-1">
                    <select 
                      value={u.role}
                      onChange={(e) => changeRole(u.uid, e.target.value as UserRole)}
                      className="text-[9px] font-bold uppercase border border-[#D1D5DB] px-1 py-0.5 rounded outline-none"
                    >
                      <option value="student">Student</option>
                      <option value="lecturer">Lecturer</option>
                      <option value="admin">Admin</option>
                    </select>
                 </div>
               </div>
             ))}
          </div>
        </div>
      </div>
      
      {/* Chart Section */}
      <div className="bg-white border border-[#D1D5DB] rounded-lg p-5">
        <div className="flex items-center gap-2 mb-6">
          <Trophy size={16} className="text-[#006838]" />
          <h3 className="text-sm font-semibold">Upload Density by Level</h3>
        </div>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={statsByLevel} barGap={0}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis dataKey="level" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#6B7280' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#6B7280' }} />
              <Tooltip cursor={{ fill: '#F9FAFB' }} />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {statsByLevel.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, meta }: { label: string, value: string, meta: string }) {
  return (
    <div className="bg-white p-5 rounded-lg border border-[#D1D5DB] shadow-sm flex flex-col justify-between">
      <div>
        <p className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider mb-2">{label}</p>
        <p className="text-2xl font-bold text-[#111827]">{value}</p>
      </div>
      <p className="mt-2 text-[11px] text-[#006838] font-medium">{meta}</p>
    </div>
  );
}
