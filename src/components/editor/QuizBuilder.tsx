import React, { useState } from 'react';
import { useQuiz } from '../../context/QuizContext';
import { Question, QuestionType, QuizPage } from '../../types/quiz';
import { QuestionModalEditor } from './QuestionModalEditor';
import { 
  Plus, 
  ChevronDown, 
  Edit2, 
  Trash2, 
  Copy, 
  ArrowUp, 
  ArrowDown, 
  ListChecks, 
  CheckSquare, 
  ToggleLeft, 
  Type, 
  AlignLeft, 
  Shuffle, 
  FileText,
  GripVertical,
  CheckCircle2,
  HelpCircle,
  Sparkles,
  Layers,
  Settings,
  Info
} from 'lucide-react';

interface QuizBuilderProps {
  onOpenAiModal: () => void;
}

export const QuizBuilder: React.FC<QuizBuilderProps> = ({ onOpenAiModal }) => {
  const { 
    activeQuiz, 
    addQuestion, 
    updateQuestion, 
    deleteQuestion, 
    duplicateQuestion, 
    moveQuestion,
    addPage,
    updatePage,
    deletePage
  } = useQuiz();

  const [editingQuestion, setEditingQuestion] = useState<Partial<Question> | null>(null);
  const [isEditorModalOpen, setIsEditorModalOpen] = useState(false);
  const [activePageId, setActivePageId] = useState<string>('page-1');
  const [openAddItemMenuPageId, setOpenAddItemMenuPageId] = useState<string | null>(null);
  const [editingPageInfo, setEditingPageInfo] = useState<{ id: string; title: string } | null>(null);
  
  // Custom delete confirmation modals
  const [questionToDelete, setQuestionToDelete] = useState<{ id: string; title: string } | null>(null);
  const [pageToDelete, setPageToDelete] = useState<{ id: string; pageIndex: number } | null>(null);

  if (!activeQuiz) return null;

  // Make sure activePageId is valid
  const currentPage = activeQuiz.pages.find((p) => p.id === activePageId) || activeQuiz.pages[0];

  const handleOpenAddQuestion = (pageId: string, type: QuestionType = 'single_choice') => {
    setOpenAddItemMenuPageId(null);
    setEditingQuestion({
      type,
      title: '',
      points: 10,
      isRequired: true,
      pageId,
      options: [
        { id: 'opt-1', label: 'A', text: '', isCorrect: true },
        { id: 'opt-2', label: 'B', text: '', isCorrect: false },
        { id: 'opt-3', label: 'C', text: '', isCorrect: false },
        { id: 'opt-4', label: 'D', text: '', isCorrect: false },
      ],
    });
    setIsEditorModalOpen(true);
  };

  const handleSaveQuestion = (questionData: Partial<Question>) => {
    if (editingQuestion && editingQuestion.id) {
      // Edit existing
      updateQuestion(activeQuiz.id, editingQuestion.id, questionData);
    } else {
      // Add new directly with full data
      const targetPageId = editingQuestion?.pageId || activeQuiz.pages[0]?.id || 'page-1';
      addQuestion(activeQuiz.id, targetPageId, questionData.type || 'single_choice', questionData);
    }
    setIsEditorModalOpen(false);
    setEditingQuestion(null);
  };

  const questionTypeMenuOptions: { type: QuestionType; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { type: 'single_choice', label: 'Radio Buttons (Pilihan Tunggal)', icon: ListChecks },
    { type: 'multiple_choice', label: 'Checkboxes (Pilihan Ganda Multi)', icon: CheckSquare },
    { type: 'true_false', label: 'True / False (Benar / Salah)', icon: ToggleLeft },
    { type: 'short_answer', label: 'Isian Singkat (Short Answer)', icon: Type },
    { type: 'essay', label: 'Esai / Jawaban Terbuka', icon: AlignLeft },
    { type: 'matching', label: 'Menjodohkan (Matching Pairs)', icon: Shuffle },
  ];

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-6">
      
      {/* Quiz Header Summary Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">
            {activeQuiz.settings.title}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
            {activeQuiz.settings.description || 'Tidak ada deskripsi instruksi kuis.'}
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={onOpenAiModal}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold transition"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Generate Soal AI</span>
          </button>
        </div>
      </div>

      {/* Pages Container */}
      {activeQuiz.pages.map((page, pageIndex) => {
        const pageQuestions = activeQuiz.questions.filter((q) => q.pageId === page.id);
        const globalQuestionOffset = activeQuiz.questions
          .slice(0, activeQuiz.questions.findIndex((q) => q.pageId === page.id))
          .length;

        return (
          <div
            key={page.id}
            className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden"
          >
            {/* Page Header Strip */}
            <div className="bg-slate-50 px-6 py-3 border-b border-slate-200 flex items-center justify-between text-slate-700">
              <div className="flex items-center space-x-3">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Page: <span className="text-slate-900 font-bold">{page.pageNumber || pageIndex + 1}</span>
                </span>
                {editingPageInfo?.id === page.id ? (
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={editingPageInfo.title}
                      onChange={(e) => setEditingPageInfo({ ...editingPageInfo, title: e.target.value })}
                      className="px-2.5 py-1 text-xs border border-indigo-400 rounded-lg bg-white"
                      placeholder="Judul Halaman"
                      autoFocus
                    />
                    <button
                      onClick={() => {
                        updatePage(activeQuiz.id, page.id, { title: editingPageInfo.title });
                        setEditingPageInfo(null);
                      }}
                      className="text-xs text-white font-bold px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 rounded-lg"
                    >
                      Simpan
                    </button>
                  </div>
                ) : (
                  <span className="text-xs font-semibold text-slate-700">
                    {page.title || `Halaman ${pageIndex + 1}`}
                  </span>
                )}
              </div>

              {/* Page Actions */}
              <div className="flex items-center space-x-1 text-slate-400">
                <button
                  onClick={() => setEditingPageInfo({ id: page.id, title: page.title })}
                  className="hover:text-indigo-700 p-1.5 rounded-lg hover:bg-slate-200 transition"
                  title="Ubah judul halaman"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                {activeQuiz.pages.length > 1 && (
                  <button
                    onClick={() => setPageToDelete({ id: page.id, pageIndex: pageIndex + 1 })}
                    className="hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition cursor-pointer"
                    title="Hapus halaman ini"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Paper Sheet Body with Questions */}
            <div className="p-6 sm:p-8 space-y-6">
              
              {/* Top "Add item" Button */}
              <div className="relative inline-block">
                <button
                  onClick={() =>
                    setOpenAddItemMenuPageId(
                      openAddItemMenuPageId === `${page.id}-top` ? null : `${page.id}-top`
                    )
                  }
                  className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center space-x-1.5 shadow-xs transition"
                >
                  <span>Add item</span>
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>

                {openAddItemMenuPageId === `${page.id}-top` && (
                  <>
                    <div
                      className="fixed inset-0 z-20"
                      onClick={() => setOpenAddItemMenuPageId(null)}
                    />
                    <div className="absolute left-0 mt-1.5 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-30 divide-y divide-slate-100 animate-in fade-in zoom-in-95">
                      <div className="px-3.5 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        Pilih Tipe Pertanyaan
                      </div>
                      <div className="py-1">
                        {questionTypeMenuOptions.map((opt) => {
                          const Icon = opt.icon;
                          return (
                            <button
                              key={opt.type}
                              onClick={() => handleOpenAddQuestion(page.id, opt.type)}
                              className="w-full text-left px-3.5 py-2 text-xs text-slate-700 hover:bg-indigo-50 hover:text-indigo-900 flex items-center space-x-2.5 transition"
                            >
                              <Icon className="w-4 h-4 text-indigo-600 shrink-0" />
                              <span>{opt.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Question List in Paper Style */}
              {pageQuestions.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                  <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-slate-600">Belum ada pertanyaan di halaman ini</p>
                  <p className="text-xs text-slate-400 mt-1">Klik tombol &ldquo;Add item&rdquo; di atas untuk menambahkan butir soal.</p>
                </div>
              ) : (
                <div className="space-y-8 divide-y divide-slate-100">
                  {pageQuestions.map((question, qIdx) => {
                    const globalIdx = activeQuiz.questions.findIndex((q) => q.id === question.id) + 1;
                    return (
                      <div
                        key={question.id}
                        className={`group relative pt-6 first:pt-0 transition rounded-xl p-3 -mx-3 hover:bg-slate-50/80`}
                      >
                        {/* Question Title & Action Bar Row */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start space-x-2.5 flex-1">
                            <span className="font-black text-slate-900 text-sm leading-6 select-none shrink-0 font-mono">
                              {globalIdx}.
                            </span>
                            <div className="space-y-1 flex-1">
                              <h3 className="text-sm font-semibold text-slate-900 leading-relaxed">
                                {question.title}
                              </h3>
                              {question.description && (
                                <p className="text-xs text-slate-500 italic">
                                  {question.description}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Action Toolbar on Question */}
                          <div className="flex items-center space-x-1 shrink-0 opacity-80 group-hover:opacity-100 transition">
                            <span className="text-[11px] font-mono font-bold px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md border border-slate-200">
                              {question.points} pts
                            </span>
                            
                            <button
                              onClick={() => moveQuestion(activeQuiz.id, question.id, 'up')}
                              disabled={globalIdx === 1}
                              className="p-1.5 text-slate-400 hover:text-slate-700 disabled:opacity-30 rounded-lg hover:bg-slate-200 transition"
                              title="Pindahkan Ke Atas"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => moveQuestion(activeQuiz.id, question.id, 'down')}
                              disabled={globalIdx === activeQuiz.questions.length}
                              className="p-1.5 text-slate-400 hover:text-slate-700 disabled:opacity-30 rounded-lg hover:bg-slate-200 transition"
                              title="Pindahkan Ke Bawah"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => {
                                setEditingQuestion(question);
                                setIsEditorModalOpen(true);
                              }}
                              className="p-1.5 text-indigo-600 hover:text-indigo-800 rounded-lg hover:bg-indigo-50 transition"
                              title="Edit Pertanyaan"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => duplicateQuestion(activeQuiz.id, question.id)}
                              className="p-1.5 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition"
                              title="Duplikat Soal"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => setQuestionToDelete({ id: question.id, title: question.title })}
                              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition cursor-pointer"
                              title="Hapus Soal"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Question Content Display depending on Type */}
                        <div className="pl-6 pt-3 space-y-2">
                          
                          {/* Single Choice / Multiple Choice / True False Options */}
                          {(question.type === 'single_choice' || question.type === 'multiple_choice' || question.type === 'true_false') && (
                            <div className="space-y-1.5">
                              {question.options.map((opt, oIdx) => (
                                <div
                                  key={opt.id}
                                  className="flex items-center space-x-3 text-xs sm:text-sm text-slate-700 py-0.5"
                                >
                                  {/* Radio or Checkbox visual shape */}
                                  <div
                                    className={`w-4 h-4 shrink-0 flex items-center justify-center border transition ${
                                      question.type === 'multiple_choice'
                                        ? 'rounded-xs'
                                        : 'rounded-full'
                                    } ${
                                      opt.isCorrect
                                        ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
                                        : 'border-slate-300 bg-white'
                                    }`}
                                  >
                                    {opt.isCorrect && (
                                      <div className={`w-2 h-2 ${question.type === 'multiple_choice' ? 'rounded-xs' : 'rounded-full'} bg-emerald-600`} />
                                    )}
                                  </div>

                                  <span className={`leading-tight ${opt.isCorrect ? 'font-bold text-slate-900' : ''}`}>
                                    {opt.label ? `${opt.label}. ` : ''}{opt.text}
                                  </span>

                                  {opt.isCorrect && (
                                    <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 font-bold border border-emerald-200">
                                      Kunci Jawaban
                                    </span>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Short Answer Preview */}
                          {question.type === 'short_answer' && (
                            <div className="space-y-1 text-xs">
                              <div className="w-full max-w-sm h-8 bg-slate-50 border border-dashed border-slate-300 rounded-lg px-3 flex items-center text-slate-400 italic">
                                Siswa mengetik isian teks di sini...
                              </div>
                              {question.correctAnswers && question.correctAnswers.length > 0 && (
                                <div className="text-[11px] text-emerald-700 flex items-center gap-1 mt-1 font-medium">
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>Kunci diterima: <strong className="font-mono">{question.correctAnswers.join(', ')}</strong></span>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Matching Pairs Preview */}
                          {question.type === 'matching' && question.matchingPairs && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                              <div className="space-y-1.5">
                                <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px] block mb-1">Item Kiri:</span>
                                {question.matchingPairs.map((pair, pIdx) => (
                                  <div key={pair.id} className="p-2 bg-white border border-slate-200 rounded-lg text-slate-700 font-medium">
                                    {pIdx + 1}. {pair.leftText}
                                  </div>
                                ))}
                              </div>
                              <div className="space-y-1.5">
                                <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px] block mb-1">Pasangan Kanan (Kunci):</span>
                                {question.matchingPairs.map((pair) => (
                                  <div key={pair.id} className="p-2 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-900 font-semibold">
                                    ➔ {pair.rightText}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Essay Preview */}
                          {question.type === 'essay' && (
                            <div className="w-full max-w-lg h-16 bg-slate-50 border border-dashed border-slate-300 rounded-lg p-2.5 text-xs text-slate-400 italic">
                              Lembar jawaban uraian panjang untuk peserta...
                            </div>
                          )}

                          {/* Explanation preview if exists */}
                          {question.explanation && (
                            <div className="mt-2 text-xs bg-indigo-50/80 border border-indigo-100 text-indigo-950 p-3 rounded-xl flex items-start gap-2">
                              <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                              <div>
                                <span className="font-bold text-indigo-900">Pembahasan Soal:</span>{' '}
                                <span className="text-indigo-950">{question.explanation}</span>
                              </div>
                            </div>
                          )}

                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Bottom "Add item" button for this page */}
              <div className="pt-4 border-t border-slate-100 relative inline-block">
                <button
                  onClick={() =>
                    setOpenAddItemMenuPageId(
                      openAddItemMenuPageId === `${page.id}-bottom` ? null : `${page.id}-bottom`
                    )
                  }
                  className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center space-x-1.5 shadow-xs transition"
                >
                  <span>Add item</span>
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>

                {openAddItemMenuPageId === `${page.id}-bottom` && (
                  <>
                    <div
                      className="fixed inset-0 z-20"
                      onClick={() => setOpenAddItemMenuPageId(null)}
                    />
                    <div className="absolute left-0 bottom-full mb-1.5 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-30 divide-y divide-slate-100 animate-in fade-in zoom-in-95">
                      <div className="px-3.5 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        Pilih Tipe Pertanyaan
                      </div>
                      <div className="py-1">
                        {questionTypeMenuOptions.map((opt) => {
                          const Icon = opt.icon;
                          return (
                            <button
                              key={opt.type}
                              onClick={() => handleOpenAddQuestion(page.id, opt.type)}
                              className="w-full text-left px-3.5 py-2 text-xs text-slate-700 hover:bg-indigo-50 hover:text-indigo-900 flex items-center space-x-2.5 transition"
                            >
                              <Icon className="w-4 h-4 text-indigo-600 shrink-0" />
                              <span>{opt.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </>
                )}
              </div>

            </div>
          </div>
        );
      })}

      {/* Global "Add page" button at bottom */}
      <div className="flex justify-center pt-2">
        <button
          onClick={() => addPage(activeQuiz.id)}
          className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center space-x-1.5 shadow-xs transition"
        >
          <Plus className="w-4 h-4" />
          <span>Add page</span>
        </button>
      </div>

      {/* Question Modal Editor */}
      {isEditorModalOpen && editingQuestion && (
        <QuestionModalEditor
          question={editingQuestion}
          isOpen={isEditorModalOpen}
          onClose={() => {
            setIsEditorModalOpen(false);
            setEditingQuestion(null);
          }}
          onSave={handleSaveQuestion}
        />
      )}

      {/* Confirmation Modal: Delete Question */}
      {questionToDelete && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-6">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mb-4">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1">
                Hapus Butir Soal Ini?
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Anda akan menghapus soal: <br />
                <strong className="text-slate-900 font-bold line-clamp-2 mt-1">{questionToDelete.title}</strong>
              </p>

              <div className="mt-6 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setQuestionToDelete(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={() => {
                    deleteQuestion(activeQuiz.id, questionToDelete.id);
                    setQuestionToDelete(null);
                  }}
                  className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition cursor-pointer active:scale-95"
                >
                  Ya, Hapus Soal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal: Delete Page */}
      {pageToDelete && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-6">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mb-4">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1">
                Hapus Halaman {pageToDelete.pageIndex}?
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Seluruh butir soal yang ada di dalam halaman ini akan otomatis dipindahkan ke halaman pertama.
              </p>

              <div className="mt-6 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setPageToDelete(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={() => {
                    deletePage(activeQuiz.id, pageToDelete.id);
                    setPageToDelete(null);
                  }}
                  className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition cursor-pointer active:scale-95"
                >
                  Ya, Hapus Halaman
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
