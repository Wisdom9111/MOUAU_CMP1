/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { db, storage, auth } from "../firebase";
import { collection, addDoc, onSnapshot, query, where, deleteDoc, doc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Material, AcademicLevel } from "../types";
import { Upload, FileText, Trash2, CheckCircle2, X, Plus, Clock, BrainCircuit, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function LecturerArea() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [showUpload, setShowUpload] = useState(false);

  useEffect(() => {
    const q = query(collection(db, "materials"), where("lecturerId", "==", auth.currentUser?.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMaterials(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Material)));
    });
    return () => unsubscribe();
  }, []);

  const deleteMaterial = async (id: string) => {
    if (confirm("Are you sure you want to delete this material?")) {
      await deleteDoc(doc(db, "materials", id));
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center bg-white p-6 border border-[#D1D5DB] rounded-lg shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-[#111827]">Faculty Courseware Management</h2>
          <p className="text-[#6B7280] text-xs uppercase tracking-wider font-semibold mt-1">Uploader Portal • CS Department</p>
        </div>
        <button 
          onClick={() => setShowUpload(true)}
          className="bg-[#006838] text-white px-5 py-2.5 rounded-md font-semibold text-xs flex items-center gap-2 shadow-sm hover:opacity-90 transition-all"
        >
          <Upload size={14} />
          New Module Upload
        </button>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {materials.length === 0 ? (
          <div className="col-span-full py-12 text-center bg-white rounded-lg border border-[#D1D5DB] border-dashed">
             <FileText className="w-10 h-10 text-gray-200 mx-auto mb-3" />
             <p className="text-[#6B7280] text-xs font-semibold uppercase tracking-wider">No lectures in repository</p>
          </div>
        ) : (
          materials.map((m) => (
            <div key={m.id}>
              <LecturerCard material={m} onDelete={() => deleteMaterial(m.id)} />
            </div>
          ))
        )}
      </section>

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

function LecturerCard({ material, onDelete }: { material: Material, onDelete: () => void }) {
  return (
    <div className="bg-white p-4 rounded-lg border border-[#D1D5DB] shadow-sm flex flex-col h-full group">
      <div className="flex justify-between items-start mb-4">
        <div className="bg-[#E6F4EA] p-2 rounded text-[#006838]">
          <FileText size={16} />
        </div>
        <button 
          onClick={onDelete}
          className="p-1.5 text-[#6B7280] hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100"
        >
          <Trash2 size={14} />
        </button>
      </div>
      
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-2">
          <span className="high-density-badge badge-level">{material.level}</span>
          <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-tighter">{material.semester} Semester</span>
        </div>
        <h3 className="text-sm font-bold text-[#111827] line-clamp-1 mb-1">{material.title}</h3>
        <p className="text-[11px] text-[#6B7280] line-clamp-2 leading-relaxed">{material.description}</p>
      </div>

      <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center text-[10px] font-bold text-[#6B7280]">
         <div className="flex items-center gap-1">
            <Clock size={10} />
            <span>{new Date(material.createdAt).toLocaleDateString()}</span>
         </div>
         <div className="flex gap-2">
            {material.summary && <span className="text-[#006838] uppercase">Summary</span>}
         </div>
      </div>
    </div>
  );
}

function UploadModal({ onClose, isUploading, setIsUploading }: { onClose: () => void, isUploading: boolean, setIsUploading: (b: boolean) => void }) {
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
      const fileRef = ref(storage, `courseware/${auth.currentUser.uid}/${Date.now()}_${file.name}`);
      const uploadResult = await uploadBytes(fileRef, file);
      const fileUrl = await getDownloadURL(uploadResult.ref);

      await addDoc(collection(db, "materials"), {
        title,
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

        <form onSubmit={handleUpload} className="p-6 space-y-5">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-[#6B7280] uppercase tracking-widest">Document Title</label>
            <input 
              required value={title} onChange={e => setTitle(e.target.value)}
              className="w-full bg-[#F9FAFB] border border-[#D1D5DB] px-3 py-2 rounded text-xs outline-none focus:ring-1 focus:ring-[#006838]/30"
              placeholder="CSC 111: Intro to Algorithms"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-[#6B7280] uppercase tracking-widest">Brief Abstract</label>
            <textarea 
              required value={description} onChange={e => setDescription(e.target.value)}
              className="w-full bg-[#F9FAFB] border border-[#D1D5DB] px-3 py-2 rounded text-xs outline-none focus:ring-1 focus:ring-[#006838]/30 h-24 resize-none"
              placeholder="Summary of lecture contents..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-[#6B7280] uppercase tracking-widest">Target Level</label>
                <select 
                  value={level} onChange={(e) => setLevel(e.target.value as AcademicLevel)}
                  className="w-full bg-[#F9FAFB] border border-[#D1D5DB] px-3 py-2 rounded text-xs outline-none"
                >
                  <option value="100L">100L</option>
                  <option value="200L">200L</option>
                  <option value="300L">300L</option>
                  <option value="400L">400L</option>
                  <option value="500L">500L</option>
                </select>
             </div>
             <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-[#6B7280] uppercase tracking-widest">Academic Semester</label>
                <select 
                  value={semester} onChange={(e) => setSemester(e.target.value as any)}
                  className="w-full bg-[#F9FAFB] border border-[#D1D5DB] px-3 py-2 rounded text-xs outline-none"
                >
                  <option value="First">First Semester</option>
                  <option value="Second">Second Semester</option>
                </select>
             </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-[#6B7280] uppercase tracking-widest">Source File</label>
            <div className="border border-[#D1D5DB] border-dashed rounded p-4 bg-[#F9FAFB] text-center relative hover:bg-white transition-colors">
               <input type="file" required onChange={e => setFile(e.target.files?.[0] || null)} className="absolute inset-0 opacity-0 cursor-pointer" />
               <div className="text-[11px] text-[#6B7280]">
                 {file ? <span className="font-bold text-[#006838]">{file.name}</span> : 'Click or drop PDF/Docx files here'}
               </div>
            </div>
          </div>

          <button 
            disabled={isUploading}
            className="w-full bg-[#006838] text-white py-3 rounded font-bold text-xs uppercase tracking-widest hover:opacity-95 disabled:opacity-50 mt-4 transition-all"
          >
            {isUploading ? 'Finalizing Sync...' : 'Publish to Students'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
