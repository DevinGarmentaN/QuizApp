import React, { useState } from 'react';
import { useQuiz } from '../../context/QuizContext';
import { Printer, ArrowLeft, Check, Eye } from 'lucide-react';

interface QuizPrintViewProps {
  onClose: () => void;
}

export const QuizPrintView: React.FC<QuizPrintViewProps> = ({ onClose }) => {
  const { activeQuiz } = useQuiz();
  const [includeAnswerKey, setIncludeAnswerKey] = useState(false);

  if (!activeQuiz) return null;

  return (
    <div className="min-h-screen bg-slate-200 py-8 px-4 sm:px-6">
      
      {/* Print Control Toolbar (hidden during print) */}
      <div className="no-print max-w-4xl mx-auto mb-6 bg-slate-900 text-white p-4 rounded-xl shadow-lg flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center space-x-3">
          <button
            onClick={onClose}
            className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 hover:text-white transition flex items-center gap-1.5 text-xs font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Editor</span>
          </button>
          <div>
            <h2 className="text-sm font-bold text-white">Mode Cetak Lembar Ujian</h2>
            <p className="text-xs text-slate-400">Siap dicetak pada kertas A4 / PDF.</p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <label className="flex items-center space-x-2 text-xs font-semibold text-slate-200 cursor-pointer">
            <input
              type="checkbox"
              checked={includeAnswerKey}
              onChange={(e) => setIncludeAnswerKey(e.target.checked)}
              className="rounded text-indigo-500 focus:ring-indigo-500"
            />
            <span>Sertakan Kunci Jawaban (Guru)</span>
          </label>

          <button
            onClick={() => window.print()}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-xs transition transform active:scale-95"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Dokumen (Print)</span>
          </button>
        </div>
      </div>

      {/* Printable Sheet (White Paper A4 Look) */}
      <div className="bg-white max-w-4xl mx-auto p-10 sm:p-12 shadow-2xl rounded-sm border border-slate-300 text-slate-900 space-y-6">
        
        {/* Exam Header */}
        <div className="border-b-2 border-slate-900 pb-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-black uppercase tracking-tight text-slate-900">
                {activeQuiz.settings.title}
              </h1>
              <p className="text-xs text-slate-600 font-medium">
                {activeQuiz.settings.category || 'Mata Pelajaran Umum'} • Pengajar: {activeQuiz.settings.author || '-'}
              </p>
            </div>
            
            {/* Score Box on paper */}
            <div className="border-2 border-slate-900 rounded p-2 text-center w-24">
              <span className="text-[10px] font-bold uppercase block text-slate-500">Nilai</span>
              <div className="h-8 flex items-center justify-center font-bold text-lg font-mono">
                {includeAnswerKey ? 'KUNCI' : ''}
              </div>
            </div>
          </div>

          {/* Student Fill-in Grid */}
          {!includeAnswerKey && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs pt-2 font-mono border-t border-slate-200">
              <div>Nama: ................................................</div>
              <div>NIM / NIS: .....................................</div>
              <div>Kelas: ..............................................</div>
            </div>
          )}

          {/* Instructions */}
          {activeQuiz.settings.description && (
            <p className="text-xs text-slate-600 italic pt-1">
              Petunjuk: {activeQuiz.settings.description}
            </p>
          )}
        </div>

        {/* Question List */}
        <div className="space-y-6 pt-2">
          {activeQuiz.questions.map((q, idx) => (
            <div key={q.id} className="space-y-2 text-sm break-inside-avoid">
              <div className="flex items-start space-x-2">
                <span className="font-bold text-slate-900 shrink-0">{idx + 1}.</span>
                <div className="flex-1 space-y-1">
                  <p className="font-medium text-slate-900 leading-relaxed">{q.title}</p>
                  {q.description && <p className="text-xs text-slate-500 italic">{q.description}</p>}
                </div>
                <span className="text-xs text-slate-400 font-mono">({q.points} poin)</span>
              </div>

              {/* Options */}
              {(q.type === 'single_choice' || q.type === 'true_false' || q.type === 'multiple_choice') && (
                <div className="pl-6 space-y-1.5 text-xs sm:text-sm">
                  {q.options.map((opt, oIdx) => (
                    <div
                      key={opt.id}
                      className={`flex items-center space-x-2.5 py-0.5 ${
                        includeAnswerKey && opt.isCorrect ? 'font-bold text-emerald-800' : 'text-slate-800'
                      }`}
                    >
                      <span className="w-5 h-5 rounded-full border border-slate-400 flex items-center justify-center text-xs shrink-0">
                        {opt.label || String.fromCharCode(65 + oIdx)}
                      </span>
                      <span>{opt.text}</span>
                      {includeAnswerKey && opt.isCorrect && (
                        <span className="text-[11px] font-bold text-emerald-600">✓ (Kunci)</span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Short Answer blank */}
              {q.type === 'short_answer' && (
                <div className="pl-6 pt-1">
                  {includeAnswerKey ? (
                    <div className="p-2 bg-emerald-50 text-emerald-900 font-semibold text-xs border border-emerald-200 rounded">
                      Kunci Jawaban: {q.correctAnswers?.join(' / ')}
                    </div>
                  ) : (
                    <div className="w-full h-8 border-b-2 border-dotted border-slate-400" />
                  )}
                </div>
              )}

              {/* Matching */}
              {q.type === 'matching' && q.matchingPairs && (
                <div className="pl-6 pt-1 grid grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1.5">
                    {q.matchingPairs.map((pair, pIdx) => (
                      <div key={pair.id}>{pIdx + 1}. {pair.leftText}</div>
                    ))}
                  </div>
                  <div className="space-y-1.5">
                    {q.matchingPairs.map((pair, pIdx) => (
                      <div key={pair.id} className={includeAnswerKey ? 'font-bold text-emerald-800' : ''}>
                        ({String.fromCharCode(65 + pIdx)}) {pair.rightText} {includeAnswerKey ? `➔ (Pasangan ${pIdx + 1})` : ''}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Essay blank space */}
              {q.type === 'essay' && (
                <div className="pl-6 pt-2 space-y-2">
                  <div className="w-full h-20 border border-slate-300 rounded p-2 text-xs text-slate-400">
                    {includeAnswerKey ? `Catatan Pengajar: ${q.explanation || 'Evaluasi manual sesuai rubrik.'}` : 'Jawaban uraian siswa...'}
                  </div>
                </div>
              )}

              {/* Explanation in Teacher Answer Key Mode */}
              {includeAnswerKey && q.explanation && (
                <div className="pl-6 pt-1 text-xs text-cyan-900 bg-cyan-50/70 p-2 rounded border border-cyan-200">
                  <strong>Pembahasan:</strong> {q.explanation}
                </div>
              )}

            </div>
          ))}
        </div>

        {/* Footer info */}
        <div className="border-t border-slate-300 pt-4 text-center text-xs text-slate-400">
          FlexiTest Exam System • Dicetak pada {new Date().toLocaleDateString('id-ID')}
        </div>

      </div>

    </div>
  );
};
