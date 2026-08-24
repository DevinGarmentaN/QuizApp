import React, { useState } from 'react';
import { useQuiz } from '../../context/QuizContext';
import { 
  Layers, 
  PlusCircle, 
  Sparkles, 
  RotateCcw, 
  ChevronDown,
  GraduationCap,
  LogOut,
  Building2,
  Trash2,
  AlertTriangle
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
    deleteQuiz,
    currentUser,
    logout
  } = useQuiz();

  const [isQuizMenuOpen, setIsQuizMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [quizToDelete, setQuizToDelete] = useState<{ id: string; title: string } | null>(null);

  const activeQuiz = quizzes.find((q) => q.id === activeQuizId) || quizzes[0];

  const handleStartTestAsStudent = () => {
    setTakingQuizId(activeQuizId);
    setAppMode('taker');
  };

  const handleConfirmDeleteQuiz = () => {
    if (quizToDelete) {
      deleteQuiz(quizToDelete.id);
      setQuizToDelete(null);
      setIsQuizMenuOpen(false);
    }
  };

  const handleConfirmReset = () => {
    resetToDefaultData();
    setIsResetModalOpen(false);
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

          {/* Active Quiz Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsQuizMenuOpen(!isQuizMenuOpen)}
              className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition border border-slate-700 max-w-[200px] md:max-w-[260px] cursor-pointer"
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
                <div className="absolute left-0 mt-1.5 w-84 bg-white text-slate-800 rounded-xl shadow-xl border border-slate-200 py-1.5 z-30 divide-y divide-slate-100 animate-in fade-in zoom-in-95">
                  <div className="px-3.5 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                    <span>Daftar Kuis Anda ({quizzes.length})</span>
                  </div>
                  <div className="max-h-64 overflow-y-auto py-1 divide-y divide-slate-50">
                    {quizzes.map((q) => (
                      <div
                        key={q.id}
                        className={`group px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 transition ${
                          q.id === activeQuizId ? 'bg-indigo-50/70 border-l-4 border-indigo-600' : ''
                        }`}
                      >
                        <button
                          onClick={() => {
                            setActiveQuizId(q.id);
                            setIsQuizMenuOpen(false);
                          }}
                          className="flex-1 text-left truncate mr-2 cursor-pointer"
                        >
                          <p className={`truncate text-xs ${q.id === activeQuizId ? 'font-bold text-indigo-900' : 'font-semibold text-slate-700'}`}>
                            {q.settings.title}
                          </p>
                          <p className="text-[11px] text-slate-500 mt-0.5">{q.questions.length} Soal • {q.settings.category || 'Umum'}</p>
                        </button>

                        <div className="flex items-center space-x-1.5 shrink-0">
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono uppercase tracking-wider ${
                            q.settings.status === 'published' 
                              ? 'bg-emerald-100 text-emerald-800 font-bold' 
                              : 'bg-amber-100 text-amber-800 font-bold'
                          }`}>
                            {q.settings.status === 'published' ? 'Live' : 'Draft'}
                          </span>

                          {quizzes.length > 1 && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setQuizToDelete({ id: q.id, title: q.settings.title });
                              }}
                              className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition cursor-pointer"
                              title="Hapus Kuis Ini"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-2 bg-slate-50 flex flex-col gap-1">
                    <button
                      onClick={() => {
                        setIsQuizMenuOpen(false);
                        onOpenNewQuizModal();
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-semibold text-indigo-700 hover:bg-indigo-100/60 rounded-lg flex items-center gap-1.5 transition cursor-pointer"
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
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5 text-indigo-400" />
            <span>Kuis Baru</span>
          </button>

          <button
            onClick={onOpenAiModal}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-950/90 text-indigo-300 border border-indigo-800/80 hover:bg-indigo-900 transition cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>AI Quiz Generator</span>
          </button>
        </div>

        {/* Right Zone: User Profile & Actions */}
        <div className="flex items-center space-x-2.5">
          <button
            onClick={() => setIsResetModalOpen(true)}
            title="Muat ulang contoh template soal asli"
            className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Direct Live Test Mode Button */}
          <button
            onClick={handleStartTestAsStudent}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs transition transform active:scale-95 cursor-pointer"
            title="Buka tampilan pengerjaan ujian untuk siswa / peserta"
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Uji Soal (Siswa)</span>
            <span className="sm:hidden">Tes</span>
          </button>

          {/* User Account Menu Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center space-x-2 pl-2 pr-2.5 py-1 rounded-xl bg-slate-800/90 hover:bg-slate-800 border border-slate-700/80 transition cursor-pointer"
            >
              <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
                {currentUser?.name ? currentUser.name.charAt(0) : 'D'}
              </div>
              <div className="text-left hidden md:block max-w-[140px] truncate">
                <p className="text-xs font-semibold text-slate-200 truncate leading-tight">
                  {currentUser?.name || 'Devin Garmenta'}
                </p>
                <p className="text-[10px] text-indigo-300 font-medium uppercase tracking-wider leading-none">
                  {currentUser?.role || 'Dosen'}
                </p>
              </div>
              <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
            </button>

            {isUserMenuOpen && (
              <>
                <div 
                  className="fixed inset-0 z-20" 
                  onClick={() => setIsUserMenuOpen(false)}
                />
                <div className="absolute right-0 mt-1.5 w-76 bg-white text-slate-800 rounded-2xl shadow-2xl border border-slate-200 py-2 z-30 divide-y divide-slate-100 animate-in fade-in zoom-in-95">
                  {/* User Profile Card */}
                  <div className="p-3.5">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
                        {currentUser?.name ? currentUser.name.charAt(0) : 'D'}
                      </div>
                      <div className="truncate">
                        <p className="font-bold text-xs text-slate-900 truncate">{currentUser?.name}</p>
                        <p className="text-[11px] text-slate-500 truncate">{currentUser?.email}</p>
                        <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-indigo-50 text-indigo-700 border border-indigo-200">
                          {currentUser?.role || 'Dosen'}
                        </span>
                      </div>
                    </div>
                    {currentUser?.institution && (
                      <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center space-x-1.5 text-[11px] text-slate-500">
                        <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{currentUser.institution}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="p-1.5">
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        logout();
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50 rounded-xl flex items-center space-x-2 transition cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Keluar (Logout)</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

      </div>

      {/* Confirmation Modal: Reset Template */}
      {isResetModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 text-slate-800">
            <div className="p-6">
              <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-4">
                <RotateCcw className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1">
                Muat Ulang Template Soal?
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Tindakan ini akan memuat kembali template soal resmi <em>Basis Data & Pemrograman Web</em> oleh <strong>{currentUser?.name || 'Devin Garmenta Nuriansyah, S.Kom., M.Kom'}</strong>.
              </p>

              <div className="mt-6 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsResetModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleConfirmReset}
                  className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition cursor-pointer active:scale-95"
                >
                  Muat Ulang
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal: Delete Quiz */}
      {quizToDelete && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 text-slate-800">
            <div className="p-6">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mb-4">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1">
                Hapus Kuis Ini?
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Anda akan menghapus seluruh data kuis <strong className="text-slate-900 font-bold">&ldquo;{quizToDelete.title}&rdquo;</strong> beserta butir soal dan data pengerjaannya. Tindakan ini tidak dapat dibatalkan.
              </p>

              <div className="mt-6 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setQuizToDelete(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDeleteQuiz}
                  className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition cursor-pointer active:scale-95"
                >
                  Ya, Hapus Kuis
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </header>
  );
};
