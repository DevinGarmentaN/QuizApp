import React, { useState } from 'react';
import { useQuiz } from '../../context/QuizContext';
import { 
  FileCheck, 
  Layers, 
  PlusCircle, 
  ExternalLink, 
  BarChart3, 
  Sparkles, 
  RotateCcw, 
  ChevronDown,
  GraduationCap
} from 'lucide-react';

interface TopNavbarProps {
  onOpenAiModal: () => void;
  onOpenNewQuizModal: () => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({ onOpenAiModal, onOpenNewQuizModal }) => {
  const { 
    quizzes, 
    activeQuizId, 
    setActiveQuizId, 
    setAppMode, 
    setTakingQuizId, 
    resetToDefaultData,
    activeTab,
    setActiveTab
  } = useQuiz();

  const [isQuizMenuOpen, setIsQuizMenuOpen] = useState(false);

  const activeQuiz = quizzes.find((q) => q.id === activeQuizId) || quizzes[0];

  const handleStartTestAsStudent = () => {
    setTakingQuizId(activeQuizId);
    setAppMode('taker');
  };

  return (
    <header className="bg-slate-900 text-white shadow-md border-b border-slate-800 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        
        {/* Left Zone: Brand & Active Quiz Switcher */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-indigo-400 font-bold text-lg tracking-tight">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-black shadow-xs">
              <span className="text-xl leading-none">F</span>
            </div>
            <span className="text-white font-extrabold hidden sm:inline">Flexi<span className="text-indigo-400">Test</span></span>
          </div>

          <div className="h-6 w-px bg-slate-800 hidden md:block"></div>

          {/* Quiz Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsQuizMenuOpen(!isQuizMenuOpen)}
              className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition border border-slate-700 max-w-[220px] md:max-w-[280px]"
              title={activeQuiz?.settings.title}
            >
              <Layers className="w-4 h-4 text-indigo-400 shrink-0" />
              <span className="truncate">{activeQuiz?.settings.title}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            </button>

            {isQuizMenuOpen && (
              <>
                <div 
                  className="fixed inset-0 z-20" 
                  onClick={() => setIsQuizMenuOpen(false)}
                />
                <div className="absolute left-0 mt-1.5 w-80 bg-white text-slate-800 rounded-xl shadow-xl border border-slate-200 py-1.5 z-30 divide-y divide-slate-100">
                  <div className="px-3.5 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Daftar Kuis Anda ({quizzes.length})
                  </div>
                  <div className="max-h-60 overflow-y-auto py-1">
                    {quizzes.map((q) => (
                      <button
                        key={q.id}
                        onClick={() => {
                          setActiveQuizId(q.id);
                          setIsQuizMenuOpen(false);
                        }}
                        className={`w-full text-left px-3.5 py-2.5 text-xs flex items-start justify-between hover:bg-slate-50 transition ${
                          q.id === activeQuizId ? 'bg-indigo-50 font-semibold text-indigo-900 border-l-4 border-indigo-600' : 'text-slate-700'
                        }`}
                      >
                        <div className="truncate pr-2">
                          <p className="truncate text-xs font-semibold">{q.settings.title}</p>
                          <p className="text-[11px] text-slate-500 mt-0.5">{q.questions.length} Soal • {q.settings.category || 'Umum'}</p>
                        </div>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono uppercase tracking-wider ${
                          q.settings.status === 'published' 
                            ? 'bg-emerald-100 text-emerald-800 font-bold' 
                            : 'bg-amber-100 text-amber-800 font-bold'
                        }`}>
                          {q.settings.status === 'published' ? 'Live' : 'Draft'}
                        </span>
                      </button>
                    ))}
                  </div>
                  <div className="p-2 bg-slate-50 flex flex-col gap-1">
                    <button
                      onClick={() => {
                        setIsQuizMenuOpen(false);
                        onOpenNewQuizModal();
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-semibold text-indigo-700 hover:bg-indigo-100/60 rounded-lg flex items-center gap-1.5 transition"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      Buat Kuis Baru
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Center Zone: Quick Tools */}
        <div className="hidden lg:flex items-center space-x-2">
          <button
            onClick={onOpenNewQuizModal}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
          >
            <PlusCircle className="w-3.5 h-3.5 text-indigo-400" />
            <span>Kuis Baru</span>
          </button>

          <button
            onClick={onOpenAiModal}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-950/90 text-indigo-300 border border-indigo-800/80 hover:bg-indigo-900 transition"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>AI Quiz Generator</span>
          </button>
        </div>

        {/* Right Zone: Test Taker Launcher & Actions */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => {
              if (confirm('Muat ulang template contoh Basis Data & Pemrograman Web?')) {
                resetToDefaultData();
              }
            }}
            title="Reset ke Contoh Template Soal Asli"
            className="p-2 text-slate-400 hover:text-slate-200 rounded hover:bg-slate-800 transition"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Direct Live Test Mode Button */}
          <button
            onClick={handleStartTestAsStudent}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 text-xs font-bold rounded-md bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition transform active:scale-95"
            title="Buka tampilan pengerjaan ujian untuk siswa / peserta"
          >
            <GraduationCap className="w-4 h-4" />
            <span className="hidden sm:inline">Mulai Tes (Siswa)</span>
            <span className="sm:hidden">Tes</span>
          </button>
        </div>

      </div>
    </header>
  );
};
