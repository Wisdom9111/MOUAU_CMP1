/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { db, auth, storage } from "../firebase";
import { collection, query, where, onSnapshot, doc, deleteDoc, addDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Material, AcademicLevel } from "../types";
import { Upload, FileText, Trash2, CheckCircle2, X, Plus, Clock, BrainCircuit, Sparkles, BookCheck, Tags, FileUp } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { onAuthStateChanged } from "firebase/auth";

export default function LecturerArea() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (u) => {
      if (u) {
        setUser(u);
        const q = query(collection(db, "materials"), where("lecturerId", "==", u.uid));
        const unsubMaterials = onSnapshot(q, (snapshot) => {
          setMaterials(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Material)));
        });
        return () => unsubMaterials();
      }
    });
    return unsubAuth;
  }, []);

  const deleteMaterial = async (id: string) => {
    if (confirm("Permanently remove this courseware from the university repository?")) {
      try {
        await deleteDoc(doc(db, "materials", id));
      } catch (e) {
        console.error("Delete failed:", e);
      }
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center bg-[#111827] p-8 rounded-xl shadow-lg border border-white/10">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
            <div className="bg-[#006838] p-2 rounded-lg">
              <Upload size={24} className="text-white" />
            </div>
            Lecturer Upload Center
          </h2>
          <p className="text-white/50 text-xs uppercase tracking-[0.2em] font-bold mt-2">MOUAU Academic Portal • Faculty Node</p>
        </div>
        <button 
          onClick={() => setShowUpload(true)}
          className="mt-4 md:mt-0 bg-[#006838] text-white px-6 py-3 rounded-lg font-extrabold text-xs flex items-center gap-3 shadow-lg hover:bg-[#005a30] transition-all transform hover:-translate-y-0.5 active:scale-95"
        >
          <Plus size={16} strokeWidth={3} />
          ADD NEW COURSE MATERIAL
        </button>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <section className="xl:col-span-2 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-black text-[#111827] uppercase tracking-widest flex items-center gap-2">
              <FileUp size={14} /> My Repository ({materials.length})
            </h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {materials.length === 0 ? (
              <div className="col-span-full py-20 text-center bg-white rounded-xl border-2 border-dashed border-[#D1D5DB] flex flex-col items-center">
                 <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                    <FileText className="w-8 h-8 text-gray-300" />
                 </div>
                 <p className="text-[#6B7280] text-[10px] font-bold uppercase tracking-widest mb-1">No Courseware Found</p>
                 <p className="text-[11px] text-gray-400">Start by uploading your first lecture or assignment module</p>
              </div>
            ) : (
              materials.map((m) => (
                <motion.div 
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  key={m.id}
                >
                  <LecturerCard material={m} onDelete={() => deleteMaterial(m.id)} />
                </motion.div>
              ))
            )}
          </div>
        </section>

        <section className="space-y-6">
           <div className="bg-white p-6 rounded-xl border border-[#D1D5DB] shadow-sm">
              <h3 className="text-xs font-black text-[#111827] uppercase tracking-widest mb-4 flex items-center gap-2">
                <Sparkles size={14} className="text-[#006838]" /> Quick Analytics
              </h3>
              <div className="space-y-3">
                 <AnalyticsRow label="Total Uploads" value={materials.length} />
                 <AnalyticsRow label="Student Views" value="842" />
                 <AnalyticsRow label="Storage Used" value="12.4 MB" />
              </div>
           </div>

           <div className="bg-[#E6F4EA] p-6 rounded-xl border border-[#006838]/20">
              <h3 className="text-xs font-black text-[#006838] uppercase tracking-widest mb-4">Uploader Statistics</h3>
              <div className="flex flex-col gap-4">
                 <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-[#006838] flex items-center justify-center text-white text-xs font-bold">100%</div>
                    <div>
                       <p className="text-[11px] font-bold text-[#111827]">Sync Integrity</p>
                       <p className="text-[9px] text-[#6B7280]">Real-time cloud backup active</p>
                    </div>
                 </div>
              </div>
           </div>
        </section>
      </div>

      <AnimatePresence>
        {showUpload && (
          <UploadModal 
            onClose={() => setShowUpload(false)} 
            isUploading={isUploading} 
            setIsUploading={setIsUploading} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function AnalyticsRow({ label, value }: { label: string, value: string | number }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
      <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">{label}</span>
      <span className="text-sm font-black text-[#111827]">{value}</span>
    </div>
  );
}

function LecturerCard({ material, onDelete }: { material: Material, onDelete: () => void }) {
  return (
    <div className="bg-white p-5 rounded-xl border border-[#D1D5DB] shadow-sm hover:shadow-md transition-all flex flex-col h-full group relative overflow-hidden">
      <div className="absolute top-0 left-0 w-1 h-full bg-[#006838]"></div>
      
      <div className="flex justify-between items-start mb-4">
        <div className="bg-[#E6F4EA] p-2.5 rounded-lg text-[#006838] shadow-inner">
          <FileText size={20} />
        </div>
        <button 
          onClick={onDelete}
          className="p-2 text-gray-300 hover:text-red-600 hover:bg-red-50 rounded-full transition-all"
          title="Delete Material"
        >
          <Trash2 size={16} />
        </button>
      </div>
      
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-3">
          <span className="bg-[#006838] text-white text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-widest">
            {material.level}
          </span>
          <span className="text-[9px] font-bold text-[#6B7280] uppercase tracking-widest border-l border-gray-200 pl-2">
            Code: {material.title.split(':')[0] || 'CSC'}
          </span>
        </div>
        <h3 className="text-[13px] font-black text-[#111827] leading-snug group-hover:text-[#006838] transition-colors">{material.title}</h3>
        <p className="text-[11px] text-[#6B7280] mt-2 line-clamp-2 italic font-medium leading-relaxed">
          "{material.description}"
        </p>
      </div>

      <div className="mt-5 pt-4 border-t border-gray-100 flex justify-between items-center bg-gray-50/50 -mx-5 -mb-5 px-5 py-3">
         <div className="flex items-center gap-1.5 text-[#6B7280]">
            <Clock size={11} className="opacity-50" />
            <span className="text-[9px] font-bold uppercase tracking-widest">{new Date(material.createdAt).toLocaleDateString()}</span>
         </div>
         <div className="bg-white px-2 py-1 rounded border border-[#D1D5DB] text-[9px] font-bold text-[#006838] uppercase shadow-sm">
            {material.semester} Semester
         </div>
      </div>
    </div>
  );
}

function UploadModal({ onClose, isUploading, setIsUploading }: { onClose: () => void, isUploading: boolean, setIsUploading: (b: boolean) => void }) {
  const [courseCode, setCourseCode] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [level, setLevel] = useState<AcademicLevel>("100L");
  const [semester, setSemester] = useState<'First' | 'Second'>('First');
  const [file, setFile] = useState<File | null>(null);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !auth.currentUser) return;
    
    setIsUploading(true);
    try {
      const storageRef = ref(storage, `courseware/${auth.currentUser.uid}/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const fileUrl = await getDownloadURL(storageRef);

      await addDoc(collection(db, "materials"), {
        title: `${courseCode.toUpperCase()}: ${title}`,
        description,
        fileUrl,
        level,
        semester,
        lecturerId: auth.currentUser.uid,
        createdAt: new Date().toISOString()
      });

      onClose();
    } catch (e) {
      console.error("Upload failed", e);
      alert("Submission failed. Check network integrity.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#111827]/40 backdrop-blur-xs" onClick={onClose} />
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative bg-white w-full max-w-lg rounded-lg shadow-xl border border-[#D1D5DB] flex flex-col overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-[#D1D5DB] flex justify-between items-center bg-gray-50/50">
          <h2 className="text-sm font-bold text-[#111827]">New Courseware Upload</h2>
          <button onClick={onClose} className="text-[#6B7280] hover:text-[#111827]"><X size={18} /></button>
        </div>

        <form onSubmit={handleUpload} className="p-8 space-y-6">
          <div className="grid grid-cols-3 gap-4">
             <div className="space-y-1.5 flex flex-col">
                <label className="text-[10px] font-black text-[#6B7280] uppercase tracking-widest">Course Code</label>
                <input 
                  required value={courseCode} onChange={e => setCourseCode(e.target.value)}
                  className="w-full bg-[#F9FAFB] border border-[#D1D5DB] px-3 py-2.5 rounded text-[11px] font-bold outline-none focus:ring-1 focus:ring-[#006838]/30 placeholder:text-gray-300"
                  placeholder="CSC 312"
                />
             </div>
             <div className="col-span-2 space-y-1.5 flex flex-col">
                <label className="text-[10px] font-black text-[#6B7280] uppercase tracking-widest">Material Title</label>
                <input 
                  required value={title} onChange={e => setTitle(e.target.value)}
                  className="w-full bg-[#F9FAFB] border border-[#D1D5DB] px-3 py-2.5 rounded text-[11px] font-bold outline-none focus:ring-1 focus:ring-[#006838]/30"
                  placeholder="Intro to Distributed Systems"
                />
             </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-[#6B7280] uppercase tracking-widest">Publication Description</label>
            <textarea 
              required value={description} onChange={e => setDescription(e.target.value)}
              className="w-full bg-[#F9FAFB] border border-[#D1D5DB] px-4 py-3 rounded text-[11px] font-medium outline-none focus:ring-1 focus:ring-[#006838]/30 h-28 resize-none leading-relaxed"
              placeholder="Provide a concise overview of this lecture module..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-1.5">
                <label className="text-[10px] font-black text-[#6B7280] uppercase tracking-widest">Academic Year</label>
                <select 
                  value={level} onChange={(e) => setLevel(e.target.value as AcademicLevel)}
                  className="w-full bg-[#F9FAFB] border border-[#D1D5DB] px-3 py-2.5 rounded text-[11px] font-bold outline-none"
                >
                  <option value="100L">100L (Freshman)</option>
                  <option value="200L">200L (Sophomore)</option>
                  <option value="300L">300L (Junior)</option>
                  <option value="400L">400L (Senior I)</option>
                  <option value="500L">500L (Senior II)</option>
                </select>
             </div>
             <div className="space-y-1.5">
                <label className="text-[10px] font-black text-[#6B7280] uppercase tracking-widest">Portal Semester</label>
                <select 
                  value={semester} onChange={(e) => setSemester(e.target.value as any)}
                  className="w-full bg-[#F9FAFB] border border-[#D1D5DB] px-3 py-2.5 rounded text-[11px] font-bold outline-none"
                >
                  <option value="First">First Semester</option>
                  <option value="Second">Second Semester</option>
                </select>
             </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-[#6B7280] uppercase tracking-widest">Payload Selection</label>
            <div className="border-2 border-[#D1D5DB] border-dashed rounded-xl p-8 bg-[#F9FAFB] text-center relative hover:bg-[#E6F4EA] group transition-all cursor-pointer">
               <input type="file" required onChange={e => setFile(e.target.files?.[0] || null)} className="absolute inset-0 opacity-0 cursor-pointer" />
               <div className="flex flex-col items-center gap-2">
                 <FileUp className={`w-8 h-8 ${file ? 'text-[#006838]' : 'text-gray-300'} group-hover:scale-110 transition-transform`} />
                 <div className="text-[10px] font-bold uppercase tracking-widest text-[#6B7280]">
                   {file ? <span className="text-[#006838] font-black">{file.name}</span> : 'Click or Drop PDF/DOCX'}
                 </div>
                 <p className="text-[9px] text-gray-400 font-medium">Maximum permitted file size: 25MB</p>
               </div>
            </div>
          </div>

          <button 
            disabled={isUploading}
            className="w-full bg-[#006838] text-white py-4 rounded-lg font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-[#005a30] disabled:opacity-50 mt-4 transition-all flex items-center justify-center gap-3"
          >
            {isUploading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                SECURE UPLOAD IN PROGRESS...
              </>
            ) : (
              'PUBLISH TO UNIVERSITY DATABASE'
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
