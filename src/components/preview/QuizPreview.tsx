import React, { useState } from 'react';
import { useQuiz } from '../../context/QuizContext';
import { 
  Eye, 
  Smartphone, 
  Monitor, 
  RotateCcw, 
  CheckCircle2, 
  Clock, 
  Award,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';

export const QuizPreview: React.FC = () => {
  const { activeQuiz } = useQuiz();
  const [deviceMode, setDeviceMode] = useState<'desktop' | 'mobile'>('desktop');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [mockAnswers, setMockAnswers] = useState<Record<string, any>>({});
  const [showAnswerKeys, setShowAnswerKeys] = useState(false);

  if (!activeQuiz) return null;

  const questions = activeQuiz.questions;
  const currentQ = questions[currentQuestionIndex];

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-6">
      
      {/* Preview Toolbar */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-4 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Mode Tampilan:</span>
          <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200">
            <button
              onClick={() => setDeviceMode('desktop')}
              className={`px-3 py-1 text-xs font-semibold rounded flex items-center gap-1.5 transition ${
                deviceMode === 'desktop' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>Desktop</span>
            </button>
            <button
              onClick={() => setDeviceMode('mobile')}
              className={`px-3 py-1 text-xs font-semibold rounded flex items-center gap-1.5 transition ${
                deviceMode === 'mobile' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Ponsel (Mobile)</span>
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <label className="flex items-center space-x-2 text-xs font-semibold text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={showAnswerKeys}
              onChange={(e) => setShowAnswerKeys(e.target.checked)}
              className="rounded text-indigo-600 focus:ring-indigo-500"
            />
            <span>Tampilkan Kunci Jawaban</span>
          </label>

          <button
            onClick={() => setMockAnswers({})}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition"
            title="Reset Pilihan Preview"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Device Frame */}
      <div className="flex justify-center">
        <div
          className={`transition-all duration-300 ${
            deviceMode === 'mobile'
              ? 'w-full max-w-sm border-8 border-slate-800 rounded-[2.5rem] shadow-2xl p-2 bg-slate-800'
              : 'w-full max-w-4xl'
          }`}
        >
          <div
            className={`bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden ${
              deviceMode === 'mobile' ? 'min-h-[560px] rounded-3xl' : ''
            }`}
          >
            {/* Top Bar Preview */}
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between border-b border-slate-800">
              <div>
                <h3 className="font-bold text-xs sm:text-sm truncate">{activeQuiz.settings.title}</h3>
                <span className="text-[11px] text-slate-400">{questions.length} Butir Soal</span>
              </div>
              {activeQuiz.settings.timeLimitMinutes > 0 && (
                <div className="flex items-center space-x-1 text-xs bg-slate-800 text-indigo-300 border border-indigo-900/50 px-2.5 py-0.5 rounded-full font-mono">
                  <Clock className="w-3 h-3" />
                  <span>{activeQuiz.settings.timeLimitMinutes}:00</span>
                </div>
              )}
            </div>

            {/* Question Body */}
            {questions.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                Belum ada pertanyaan pada kuis ini.
              </div>
            ) : (
              <div className="p-6 sm:p-8 space-y-6">
                
                {/* Question Info */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 text-xs">
                  <span className="font-bold text-indigo-900 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-lg">
                    Soal {currentQuestionIndex + 1} dari {questions.length}
                  </span>
                  <span className="text-slate-400 font-mono">{currentQ.points} poin</span>
                </div>

                {/* Title */}
                <h4 className="text-sm sm:text-base font-bold text-slate-900 leading-relaxed">
                  {currentQ.title}
                </h4>

                {/* Options Preview */}
                {(currentQ.type === 'single_choice' || currentQ.type === 'true_false' || currentQ.type === 'multiple_choice') && (
                  <div className="space-y-2">
                    {currentQ.options.map((opt, oIdx) => {
                      const isSelected = mockAnswers[currentQ.id] === opt.id;
                      return (
                        <div
                          key={opt.id}
                          onClick={() => setMockAnswers({ ...mockAnswers, [currentQ.id]: opt.id })}
                          className={`p-3.5 rounded-xl border text-xs sm:text-sm flex items-center space-x-3 cursor-pointer transition ${
                            isSelected
                              ? 'border-indigo-600 bg-indigo-50/70 text-indigo-950 font-semibold ring-1 ring-indigo-500'
                              : showAnswerKeys && opt.isCorrect
                              ? 'border-emerald-500 bg-emerald-50 text-emerald-900'
                              : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <div
                            className={`w-5 h-5 rounded-full border flex items-center justify-center text-[10px] shrink-0 ${
                              isSelected
                                ? 'border-indigo-600 bg-indigo-600 text-white font-bold'
                                : 'border-slate-300 bg-white'
                            }`}
                          >
                            {opt.label || String.fromCharCode(65 + oIdx)}
                          </div>
                          <span className="flex-1">{opt.text}</span>
                          {showAnswerKeys && opt.isCorrect && (
                            <span className="text-[10px] bg-emerald-600 text-white font-bold px-1.5 py-0.5 rounded">
                              Kunci
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Short Answer */}
                {currentQ.type === 'short_answer' && (
                  <div className="space-y-2">
                    <input
                      type="text"
                      placeholder="Ketik jawaban di sini..."
                      value={mockAnswers[currentQ.id] || ''}
                      onChange={(e) => setMockAnswers({ ...mockAnswers, [currentQ.id]: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                    {showAnswerKeys && currentQ.correctAnswers && (
                      <p className="text-xs text-emerald-700 font-semibold">
                        Kunci Jawaban: {currentQ.correctAnswers.join(', ')}
                      </p>
                    )}
                  </div>
                )}

                {/* Matching */}
                {currentQ.type === 'matching' && currentQ.matchingPairs && (
                  <div className="space-y-2">
                    {currentQ.matchingPairs.map((pair, pIdx) => (
                      <div key={pair.id} className="grid grid-cols-2 gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs items-center">
                        <span className="font-semibold text-slate-700">{pIdx + 1}. {pair.leftText}</span>
                        <select className="px-2 py-1 text-xs border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500">
                          <option>-- Pilih Pasangan --</option>
                          {currentQ.matchingPairs?.map((mp) => (
                            <option key={mp.id}>{mp.rightText}</option>
                          ))}
                        </select>
                      </div>
                    ))}
                  </div>
                )}

                {/* Navigation in Preview */}
                <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                  <button
                    disabled={currentQuestionIndex === 0}
                    onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
                    className="px-3.5 py-1.5 text-xs font-bold text-slate-700 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-30 flex items-center gap-1 transition"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span>Prev</span>
                  </button>

                  <button
                    disabled={currentQuestionIndex === questions.length - 1}
                    onClick={() => setCurrentQuestionIndex((prev) => Math.min(questions.length - 1, prev + 1))}
                    className="px-3.5 py-1.5 text-xs font-bold text-white rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-30 flex items-center gap-1 shadow-xs transition"
                  >
                    <span>Next</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>
            )}

          </div>
        </div>
      </div>

    </div>
  );
};
