/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { db, auth, storage } from "../firebase";
import { collection, query, where, onSnapshot, addDoc, doc, updateDoc, setDoc } from "firebase/firestore";
import { Material, UserProfile, ReadingHistory, QuizQuestion, AcademicLevel } from "../types";
import { FileText, Clock, BrainCircuit, Sparkles, X, ChevronRight, Download, BookOpen, User, BookText } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { generateSummary, generateQuiz } from "../services/geminiService";

export default function StudentArea({ profile }: { profile: UserProfile }) {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [history, setHistory] = useState<ReadingHistory[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<AcademicLevel>(profile.level as AcademicLevel);
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);

  useEffect(() => {
    const q = query(collection(db, "materials"), where("level", "==", selectedLevel));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMaterials(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Material)));
    });
    return () => unsubscribe();
  }, [selectedLevel]);

  useEffect(() => {
    const q = query(collection(db, "reading_history"), where("uid", "==", profile.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setHistory(snapshot.docs.map(doc => doc.data() as ReadingHistory));
    });
    return () => unsubscribe();
  }, [profile.uid]);

  const recordViewing = async (materialId: string) => {
    const id = `${profile.uid}_${materialId}`;
    await setDoc(doc(db, "reading_history", id), {
      uid: profile.uid,
      materialId,
      viewedAt: new Date().toISOString()
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-5 border border-[#D1D5DB] rounded-lg shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-[#111827]">Academic Catalog</h2>
          <p className="text-[10px] text-[#6B7280] font-bold uppercase tracking-widest mt-0.5">Filter by Level</p>
        </div>
        <div className="flex gap-2">
          {(["100L", "200L", "300L", "400L", "500L"] as AcademicLevel[]).map((lvl) => (
            <button
              key={lvl}
              onClick={() => setSelectedLevel(lvl)}
              className={`high-density-badge cursor-pointer transition-all border-none outline-none ${selectedLevel === lvl ? 'bg-[#006838] text-white' : 'bg-[#E5E7EB] text-[#4B5563] hover:bg-[#D1D5DB]'}`}
            >
              {lvl}
            </button>
          ))}
        </div>
      </div>

      <div className="lg:grid lg:grid-cols-[1.8fr_1fr] gap-6 space-y-6 lg:space-y-0">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 auto-rows-min">
          {materials.length === 0 ? (
            <div className="col-span-full py-12 text-center bg-white rounded-lg border border-[#D1D5DB] border-dashed">
               <FileText className="w-10 h-10 text-gray-200 mx-auto mb-3" />
               <p className="text-[#6B7280] text-[11px] font-bold uppercase tracking-wider">No materials found for {selectedLevel}</p>
            </div>
          ) : (
            materials.map((m) => (
              <div key={m.id}>
                <MaterialCard 
                  material={m} 
                  isViewed={history.some(h => h.materialId === m.id)}
                  onClick={() => {
                    setSelectedMaterial(m);
                    recordViewing(m.id);
                  }} 
                />
              </div>
            ))
          )}
        </div>

        <div className="space-y-4">
           <div className="bg-white border border-[#D1D5DB] rounded-lg shadow-sm flex flex-col overflow-hidden">
             <div className="px-5 py-4 border-b border-[#D1D5DB] flex justify-between items-center bg-gray-50/30">
               <h3 className="text-sm font-semibold text-[#111827]">Gemini AI Lab</h3>
               <div className="text-[10px] text-[#006838] font-bold uppercase tracking-widest">Live Feed</div>
             </div>
             <div className="p-5" style={{ background: 'linear-gradient(135deg, #FFFFFF 0%, #F0FDF4 100%)' }}>
               {selectedMaterial ? (
                 <>
                   <div className="font-mono text-[11px] text-[#006838] bg-[#F0FDF4] px-2 py-1 rounded inline-block mb-3 border border-[#006838]/20">
                     {selectedMaterial.title.split(':')[0] || 'DOCX_ACTIVE'}
                   </div>
                   <div className="ai-summary-box shadow-sm">
                      <p className="font-bold text-[#006838] mb-1">Summary Snapshot:</p>
                      {selectedMaterial.summary || "Select a document from your catalog to generate an AI summary."}
                   </div>
                   {selectedMaterial.summary && (
                     <div className="mt-4 pt-4 border-t border-[#D1D5DB]">
                        <p className="text-[11px] font-bold text-[#6B7280] uppercase tracking-widest mb-3">Assessment Preview</p>
                        <div className="bg-white p-3 rounded border border-gray-100 text-[12px] italic text-[#4B5563] mb-4">
                           "AI is analyzing document structure to prepare the full practice quiz..."
                        </div>
                        <button 
                          onClick={() => setSelectedMaterial(selectedMaterial)}
                          className="w-full bg-[#006838] text-white py-2 rounded text-[11px] font-bold uppercase tracking-widest hover:opacity-90 shadow-sm"
                        >
                          Launch Full Quiz
                        </button>
                     </div>
                   )}
                 </>
               ) : (
                 <div className="py-12 text-center">
                    <BrainCircuit className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                    <p className="text-[#6B7280] text-[11px] font-bold uppercase tracking-wider">Select material to activate AI</p>
                 </div>
               )}
             </div>
           </div>
        </div>
      </div>

      <AnimatePresence>
        {selectedMaterial && (
          <MaterialDetailModal 
            material={selectedMaterial} 
            onClose={() => setSelectedMaterial(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function MaterialCard({ material, isViewed, onClick }: { material: Material, isViewed: boolean, onClick: () => void }) {
  return (
    <div 
      onClick={onClick}
      className="bg-white p-4 rounded-lg border border-[#D1D5DB] shadow-sm cursor-pointer hover:border-[#006838] transition-all flex flex-col h-full group"
    >
      <div className="flex justify-between items-start mb-3">
        <div className={`p-2 rounded ${isViewed ? 'bg-[#E6F4EA] text-[#006838]' : 'bg-gray-100 text-gray-400 group-hover:bg-[#E6F4EA] group-hover:text-[#006838]'}`}>
          <BookText size={16} />
        </div>
        {isViewed && <span className="high-density-badge badge-ready uppercase">Completed</span>}
      </div>
      
      <div className="flex-1">
        <h3 className="text-[13px] font-bold text-[#111827] line-clamp-1 mb-1">{material.title}</h3>
        <p className="text-[11px] text-[#6B7280] line-clamp-2 leading-relaxed">{material.description}</p>
      </div>

      <div className="mt-4 flex items-center justify-between text-[10px] font-bold text-gray-300 group-hover:text-[#6B7280] transition-colors">
         <div className="flex items-center gap-1">
            <User size={10} />
            <span>DEPT_LECTURER</span>
         </div>
         <div className="flex gap-1.5 font-sans">
            {material.summary && <span className="text-[#006838] uppercase">Summary</span>}
            <ChevronRight size={10} />
         </div>
      </div>
    </div>
  );
}

function MaterialDetailModal({ material, onClose }: { material: Material, onClose: () => void }) {
  const [summary, setSummary] = useState(material.summary || "");
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [loadingQuiz, setLoadingQuiz] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [completedQuiz, setCompletedQuiz] = useState(false);
  const [score, setScore] = useState(0);

  const handleGenerateSummary = async () => {
    setLoadingSummary(true);
    try {
      const s = await generateSummary(`${material.title}: ${material.description}`);
      setSummary(s);
      await updateDoc(doc(db, "materials", material.id), { summary: s });
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingSummary(false);
    }
  };

  const handleGenerateQuiz = async () => {
    if (quizQuestions.length > 0) {
      setShowQuiz(true);
      return;
    }
    setLoadingQuiz(true);
    try {
      const q = await generateQuiz(`${material.title}: ${material.description}`);
      setQuizQuestions(q);
      setShowQuiz(true);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingQuiz(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#111827]/60 backdrop-blur-xs" onClick={onClose} />
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative bg-white w-full max-w-2xl max-h-[90vh] rounded-lg shadow-2xl flex flex-col overflow-hidden border border-[#D1D5DB]"
      >
        <div className="px-6 py-4 border-b border-[#D1D5DB] flex justify-between items-center bg-gray-50/50">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded bg-[#006838] flex items-center justify-center text-white">
                <BookOpen size={16} />
             </div>
             <h2 className="text-sm font-bold text-[#111827]">{material.title}</h2>
          </div>
          <button onClick={onClose} className="text-[#6B7280] hover:text-[#111827]"><X size={18} /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-8">
           <section>
             <div className="flex items-center justify-between mb-4">
               <div>
                  <h3 className="text-[11px] font-bold text-[#6B7280] uppercase tracking-widest">Document Overview</h3>
                  <p className="text-sm text-[#374151] mt-1">{material.description}</p>
               </div>
               <a 
                 href={material.fileUrl} target="_blank" rel="noreferrer"
                 className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded text-[11px] font-bold uppercase tracking-widest hover:bg-gray-200 transition-colors"
               >
                 <Download size={14} /> Download
               </a>
             </div>
           </section>

           <section className="bg-gray-50/50 p-6 rounded-lg border border-[#D1D5DB]">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                   <Sparkles size={16} className="text-[#006838]" />
                   <h3 className="text-sm font-bold text-[#111827]">Gemini AI Insights</h3>
                </div>
                {!summary && (
                  <button 
                    onClick={handleGenerateSummary} disabled={loadingSummary}
                    className="bg-[#006838] text-white px-4 py-1.5 rounded text-[10px] font-bold uppercase tracking-widest disabled:opacity-50"
                  >
                    {loadingSummary ? 'Parsing...' : 'Generate Summary'}
                  </button>
                )}
              </div>

              {summary ? (
                <div className="ai-summary-box shadow-sm">
                  <p className="font-bold text-[#006838] mb-2">Key Learning Points:</p>
                  <div className="space-y-2">
                    {summary.split('\n').map((line, i) => <p key={i}>{line}</p>)}
                  </div>
                </div>
              ) : (
                <p className="text-[12px] text-gray-400 italic text-center py-4">AI Insight requires trigger to analyze content.</p>
              )}

              <div className="mt-8">
                <div className="flex items-center justify-between mb-4">
                   <h3 className="text-[11px] font-bold text-[#6B7280] uppercase tracking-widest">Practice Assessment</h3>
                   <button 
                      onClick={handleGenerateQuiz} disabled={loadingQuiz}
                      className="text-[#006838] font-bold text-[11px] uppercase tracking-wider hover:underline flex items-center gap-1"
                    >
                      {loadingQuiz ? 'Assembling Quiz...' : (quizQuestions.length > 0 ? 'Review Quiz' : 'Assemble Quiz')}
                      <ChevronRight size={12} />
                    </button>
                </div>

                {showQuiz && (
                  <div className="space-y-6 pt-4 border-t border-gray-100">
                    {quizQuestions.map((q, idx) => (
                      <div key={idx} className="space-y-3">
                         <p className="text-[13px] font-semibold text-[#111827] flex gap-2">
                            <span className="text-[#006838]">Q{idx+1}.</span>
                            {q.question}
                         </p>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {q.options.map((opt, oIdx) => (
                              <button 
                                key={oIdx}
                                onClick={() => {
                                  if (completedQuiz) return;
                                  if (oIdx === q.answerIndex) setScore(s => s + 1);
                                  if (idx === quizQuestions.length - 1) setCompletedQuiz(true);
                                }}
                                className={`text-left p-2.5 rounded border text-[12px] transition-all ${completedQuiz ? (oIdx === q.answerIndex ? 'bg-[#DCFCE7] border-[#DCFCE7] text-[#166534]' : 'bg-gray-50 border-gray-100 text-[#6B7280]') : 'border-gray-100 hover:border-[#006838] hover:bg-[#F0FDF4]'}`}
                              >
                                {opt}
                              </button>
                            ))}
                         </div>
                      </div>
                    ))}
                    
                    {completedQuiz && (
                      <div className="bg-[#006838] text-white p-4 rounded-lg text-center">
                         <p className="text-[11px] font-bold uppercase tracking-[0.2em] mb-1">Assessment Complete</p>
                         <p className="text-xl font-bold">Your Score: {score} / {quizQuestions.length}</p>
                         <button 
                           onClick={() => { setCompletedQuiz(false); setScore(0); setShowQuiz(false); }}
                           className="mt-3 text-[10px] font-bold uppercase bg-white/20 px-4 py-1.5 rounded hover:bg-white/30 transition-all shadow-sm"
                         >
                           Reset Assessment
                         </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
           </section>
        </div>
      </motion.div>
    </div>
  );
}
