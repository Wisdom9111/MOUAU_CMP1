import React, { useState, useEffect } from "react";
import { Material, UserProfile } from "../types";
import { FileText, Maximize2, Minimize2, Search, BookOpen, Clock } from "lucide-react";
import { motion } from "motion/react";

// Standard reliable PDF for demonstration of online reading
const DEMO_PDF = "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf";

const MOCK_MATERIALS: Material[] = [
  { id: "1", title: "CSC 101: Introduction", description: "Foundations of Computer Science.", fileUrl: DEMO_PDF, level: "100L", semester: "First", lecturerId: "l1", createdAt: new Date().toISOString() },
  { id: "2", title: "MTH 101: Elementary Math", description: "Algebra and Trigonometry concepts.", fileUrl: DEMO_PDF, level: "100L", semester: "First", lecturerId: "l2", createdAt: new Date().toISOString() },
  { id: "3", title: "CSC 201: Data Structures", description: "Arrays, Linked Lists, Trees, and Graphs.", fileUrl: DEMO_PDF, level: "200L", semester: "First", lecturerId: "l1", createdAt: new Date().toISOString() },
  { id: "4", title: "CSC 301: Algorithms", description: "Sorting, Searching, and Complexity.", fileUrl: DEMO_PDF, level: "300L", semester: "First", lecturerId: "l1", createdAt: new Date().toISOString() },
  { id: "5", title: "CSC 401: AI Fundamentals", description: "Heuristics and Neural Networks.", fileUrl: DEMO_PDF, level: "400L", semester: "First", lecturerId: "l1", createdAt: new Date().toISOString() },
];

export default function StudentArea({ profile }: { profile: UserProfile | null }) {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<Material | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (profile?.level) {
      setMaterials(MOCK_MATERIALS.filter(m => m.level === profile.level));
    }
  }, [profile]);

  if (!profile) return null;

  const filtered = materials.filter(m => m.title.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className={`flex flex-col h-[calc(100vh-80px)] transition-all ${isFullscreen ? 'fixed inset-0 z-50 bg-white p-0 h-screen' : ''}`}>
      {isFullscreen && (
        <div className="flex items-center justify-between p-4 bg-[#111827] text-white">
          <h2 className="font-bold text-sm tracking-tight">{selectedDoc?.title}</h2>
          <button 
            onClick={() => setIsFullscreen(false)}
            className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-colors text-xs font-bold uppercase tracking-widest flex items-center gap-2"
          >
            <Minimize2 size={16} /> Exit Reader Mode
          </button>
        </div>
      )}

      <div className={`grid grid-cols-1 md:grid-cols-12 gap-6 flex-1 min-h-0 ${isFullscreen ? 'p-0' : ''}`}>
        {/* Left Sidebar: Document List */}
        {!isFullscreen && (
          <div className="md:col-span-4 lg:col-span-4 xl:col-span-3 flex flex-col bg-white border border-[#D1D5DB] rounded-xl shadow-sm overflow-hidden h-full">
            <div className="p-5 border-b border-[#D1D5DB] bg-gray-50/50">
              <h2 className="text-[15px] font-black text-[#111827] mb-1 leading-tight">Your {profile.level} Library</h2>
              <p className="text-[10px] text-[#006838] font-black uppercase tracking-[0.2em] mb-5">Curriculum Materials</p>
              
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input 
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search material topics..."
                  className="w-full pl-9 pr-4 py-2.5 bg-white border border-[#D1D5DB] rounded-lg text-[13px] outline-none focus:ring-2 focus:ring-[#006838]/20 transition-shadow font-medium"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-1.5 custom-scrollbar bg-gray-50/20">
              {filtered.length === 0 ? (
                 <div className="p-8 text-center text-gray-400 mt-10">
                    <BookOpen size={32} className="mx-auto mb-3 opacity-30 text-[#006838]" />
                    <p className="text-[13px] font-bold">No materials published yet.</p>
                    <p className="text-[11px] mt-1 text-gray-400">Lecturers have not sent documents for this level.</p>
                 </div>
              ) : filtered.map(m => (
                <button
                  key={m.id}
                  onClick={() => setSelectedDoc(m)}
                  className={`w-full text-left p-4 rounded-xl transition-all border outline-none ${selectedDoc?.id === m.id ? 'bg-[#F0FDF4] border-[#006838]/30 shadow-sm ring-1 ring-[#006838]/10' : 'border-transparent hover:bg-white hover:border-[#D1D5DB] hover:shadow-sm'}`}
                >
                  <div className="flex items-start gap-3.5">
                    <div className={`p-2.5 rounded-lg shrink-0 ${selectedDoc?.id === m.id ? 'bg-[#006838] text-white shadow-sm' : 'bg-gray-100 text-[#6B7280]'}`}>
                       <FileText size={18} />
                    </div>
                    <div>
                      <h3 className={`text-[13px] font-bold line-clamp-1 leading-tight mb-1 ${selectedDoc?.id === m.id ? 'text-[#006838]' : 'text-gray-900'}`}>{m.title}</h3>
                      <p className="text-[11px] text-gray-500 line-clamp-2 leading-relaxed">{m.description}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Right Side: Online Reader Engine */}
        <div className={`flex flex-col bg-white border-[#D1D5DB] ${isFullscreen ? 'border-0 rounded-none' : 'border rounded-xl md:col-span-8 lg:col-span-8 xl:col-span-9'} shadow-sm overflow-hidden h-[600px] md:h-full`}>
          {selectedDoc ? (
            <>
              {!isFullscreen && (
                <div className="px-6 py-5 border-b border-[#D1D5DB] flex justify-between items-center bg-gray-50/50">
                  <div>
                    <h2 className="text-base font-black text-[#111827]">{selectedDoc.title}</h2>
                    <div className="flex gap-4 mt-1.5 flex-wrap">
                      <span className="text-[11px] font-bold text-[#6B7280] flex items-center gap-1.5 uppercase tracking-wider bg-gray-100 px-2.5 py-1 rounded-md"><Clock size={12} /> Uploaded: {new Date(selectedDoc.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => setIsFullscreen(true)}
                    className="flex shrink-0 items-center gap-2 px-6 py-2.5 bg-[#006838] text-white rounded-lg text-[11px] font-black uppercase tracking-widest hover:bg-[#00522c] transition-colors shadow-md hover:shadow-lg focus:ring-4 focus:ring-[#006838]/20"
                  >
                    <Maximize2 size={16} /> Maximize Reader
                  </button>
                </div>
              )}
              
              {/* PDF Secure iFrame Reader */}
              <div className="flex-1 bg-[#F3F4F6] relative group">
                 <div className="absolute inset-0 flex items-center justify-center p-10 text-center pointer-events-none">
                    <div>
                        <div className="w-12 h-12 rounded-full border-4 border-[#006838] border-t-transparent animate-spin mx-auto mb-4 opacity-20"></div>
                        <p className="text-[#6B7280] font-bold text-[11px] uppercase tracking-widest">Rendering Document Engine...</p>
                    </div>
                 </div>
                 <iframe 
                   src={`${selectedDoc.fileUrl}#toolbar=0&navpanes=0&scrollbar=1&view=FitH`} 
                   className="absolute inset-0 w-full h-full border-0 shadow-inner z-10"
                   title={selectedDoc.title}
                 />
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center flex-1 text-center p-10 bg-gradient-to-br from-white to-gray-50">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6 shadow-inner">
                <BookOpen size={40} className="text-gray-300" />
              </div>
              <h3 className="text-xl font-black text-gray-900 mb-3">Online Document Engine</h3>
              <p className="text-[13px] text-gray-500 max-w-sm leading-relaxed font-medium">Select a document from your curriculum library on the left to read it instantly in your browser.<br/><br/> <strong className="text-[#006838] font-bold">No downloads required.</strong></p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
