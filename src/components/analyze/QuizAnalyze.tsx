import React, { useState } from 'react';
import { useQuiz } from '../../context/QuizContext';
import { QuizSubmission } from '../../types/quiz';
import { 
  BarChart2, 
  Users, 
  Award, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Download, 
  Trash2, 
  Eye, 
  FileSpreadsheet, 
  X,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';

export const QuizAnalyze: React.FC = () => {
  const { activeQuiz, submissions, deleteSubmission, clearQuizSubmissions } = useQuiz();
  const [selectedSubmission, setSelectedSubmission] = useState<QuizSubmission | null>(null);
  
  // Custom confirmation dialog states
  const [isClearAllModalOpen, setIsClearAllModalOpen] = useState(false);
  const [submissionToDelete, setSubmissionToDelete] = useState<QuizSubmission | null>(null);
  const [notificationToast, setNotificationToast] = useState<string | null>(null);

  if (!activeQuiz) return null;

  const quizSubmissions = [...submissions.filter((s) => s.quizId === activeQuiz.id)].sort((a, b) => {
    if (b.percentage !== a.percentage) return b.percentage - a.percentage;
    if (a.durationSeconds !== b.durationSeconds) return a.durationSeconds - b.durationSeconds;
    return new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime();
  });

  const showToast = (msg: string) => {
    setNotificationToast(msg);
    setTimeout(() => {
      setNotificationToast((current) => (current === msg ? null : current));
    }, 3500);
  };

  // Statistics calculation
  const totalSubmissions = quizSubmissions.length;
  const passedSubmissions = quizSubmissions.filter((s) => s.isPassed).length;
  const passRate = totalSubmissions > 0 ? Math.round((passedSubmissions / totalSubmissions) * 100) : 0;
  
  const avgScore = totalSubmissions > 0
    ? Math.round(quizSubmissions.reduce((acc, s) => acc + s.percentage, 0) / totalSubmissions)
    : 0;

  const highestScore = totalSubmissions > 0
    ? Math.max(...quizSubmissions.map((s) => s.percentage))
    : 0;

  const lowestScore = totalSubmissions > 0
    ? Math.min(...quizSubmissions.map((s) => s.percentage))
    : 0;

  const avgDurationSeconds = totalSubmissions > 0
    ? Math.round(quizSubmissions.reduce((acc, s) => acc + s.durationSeconds, 0) / totalSubmissions)
    : 0;

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const handleConfirmClearAll = () => {
    clearQuizSubmissions(activeQuiz.id);
    setIsClearAllModalOpen(false);
    showToast(`Berhasil menghapus seluruh data respon (${totalSubmissions} data mahasiswa).`);
  };

  const handleConfirmDeleteSingle = () => {
    if (submissionToDelete) {
      const name = submissionToDelete.respondent.name;
      deleteSubmission(submissionToDelete.id);
      setSubmissionToDelete(null);
      showToast(`Data pengerjaan mahasiswa "${name}" telah dihapus.`);
    }
  };

  const handleExportCSV = () => {
    if (quizSubmissions.length === 0) {
      showToast('Belum ada data pengerjaan kuis untuk diekspor.');
      return;
    }

    const headers = ['No', 'Nama Siswa', 'Email', 'NIM / ID', 'Kelas', 'Waktu Mulai', 'Waktu Selesai', 'Durasi (detik)', 'Skor', 'Maks Skor', 'Persentase (%)', 'Status Kelulusan'];
    const rows = quizSubmissions.map((s, idx) => [
      idx + 1,
      `"${s.respondent.name || '-'}"`,
      `"${s.respondent.email || '-'}"`,
      `"${s.respondent.studentId || '-'}"`,
      `"${s.respondent.className || '-'}"`,
      `"${new Date(s.startedAt).toLocaleString('id-ID')}"`,
      `"${new Date(s.submittedAt).toLocaleString('id-ID')}"`,
      s.durationSeconds,
      s.totalScore,
      s.maxScore,
      s.percentage,
      s.isPassed ? 'LULUS' : 'TIDAK LULUS',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Hasil_${activeQuiz.settings.title.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('File CSV berhasil diunduh.');
  };

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-8 relative">
      
      {/* Floating Notification Toast */}
      {notificationToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl border border-slate-700 flex items-center space-x-3 text-xs font-semibold animate-in fade-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{notificationToast}</span>
          <button 
            onClick={() => setNotificationToast(null)}
            className="text-slate-400 hover:text-white p-0.5 rounded"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Header & Export Action */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-indigo-600" />
            Laporan & Analisis Nilai Mahasiswa
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Analisis rekap skor, statistik kelulusan, dan lembar jawaban per butir soal.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {quizSubmissions.length > 0 && (
            <button
              onClick={() => setIsClearAllModalOpen(true)}
              className="px-3.5 py-1.5 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold flex items-center gap-1.5 transition shadow-2xs cursor-pointer active:scale-95"
              title="Hapus seluruh data riwayat ujian ini"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-600" />
              <span>Hapus Data ({totalSubmissions})</span>
            </button>
          )}

          <button
            onClick={handleExportCSV}
            disabled={quizSubmissions.length === 0}
            className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold flex items-center space-x-1.5 shadow-xs transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Unduh CSV (Excel)</span>
          </button>
        </div>
      </div>

      {/* Metrics Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Peserta</span>
            <Users className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{totalSubmissions}</div>
          <p className="text-[11px] text-slate-400 mt-0.5">Responden selesai</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Rata-Rata Nilai</span>
            <Award className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-slate-900">{avgScore}%</div>
          <p className="text-[11px] text-slate-400 mt-0.5">Rentang: {lowestScore}% - {highestScore}%</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tingkat Kelulusan</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-600">{passRate}%</div>
          <p className="text-[11px] text-slate-400 mt-0.5">{passedSubmissions} dari {totalSubmissions} mahasiswa lulus</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Rerata Durasi</span>
            <Clock className="w-4 h-4 text-slate-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            {formatDuration(avgDurationSeconds)}
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">Batas: {activeQuiz.settings.timeLimitMinutes || 'Bebas'} mnt</p>
        </div>
      </div>

      {/* Submissions Table */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center space-x-2">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
              Daftar Respon Mahasiswa ({quizSubmissions.length})
            </h3>
            {quizSubmissions.length > 0 && (
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-bold">
                Tersedia {quizSubmissions.length} Data
              </span>
            )}
          </div>
          <span className="text-xs text-slate-500">
            Passing Score: <strong className="text-slate-800">{activeQuiz.settings.passingPercentage}%</strong>
          </span>
        </div>

        {quizSubmissions.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <FileSpreadsheet className="w-12 h-12 mx-auto mb-2 text-slate-300" />
            <p className="text-sm font-semibold text-slate-600">Belum ada data pengerjaan ujian</p>
            <p className="text-xs text-slate-400 mt-1">
              Data respon telah kosong. Bagikan link ujian atau klik tombol &ldquo;Uji Soal (Siswa)&rdquo; di atas untuk melakukan simulasi.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-600 font-bold uppercase border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-center w-14">Rank</th>
                  <th className="px-4 py-3">Nama Mahasiswa</th>
                  <th className="px-4 py-3">NIM / Identitas</th>
                  <th className="px-4 py-3">Waktu Submit</th>
                  <th className="px-4 py-3">Durasi</th>
                  <th className="px-4 py-3 text-center">Skor / Nilai</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {quizSubmissions.map((sub, idx) => (
                  <tr key={sub.id} className="hover:bg-slate-50/80 transition">
                    <td className="px-4 py-3.5 text-center whitespace-nowrap">
                      {idx === 0 ? (
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-amber-400 text-slate-950 font-black text-xs shadow-2xs">
                          1
                        </span>
                      ) : idx === 1 ? (
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-slate-300 text-slate-900 font-black text-xs shadow-2xs">
                          2
                        </span>
                      ) : idx === 2 ? (
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-amber-600 text-white font-black text-xs shadow-2xs">
                          3
                        </span>
                      ) : (
                        <span className="font-bold text-slate-400">#{idx + 1}</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="font-bold text-slate-900">{sub.respondent.name}</div>
                      {sub.respondent.email && (
                        <div className="text-[11px] text-slate-400">{sub.respondent.email}</div>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <div>{sub.respondent.studentId || '-'}</div>
                      {sub.respondent.className && (
                        <div className="text-[11px] text-slate-400">{sub.respondent.className}</div>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-slate-500 whitespace-nowrap">
                      {new Date(sub.submittedAt).toLocaleString('id-ID', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="px-4 py-3.5 text-slate-500 whitespace-nowrap font-mono">
                      {formatDuration(sub.durationSeconds)}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <span className="font-bold text-sm text-slate-900 font-mono">
                        {sub.totalScore}/{sub.maxScore}
                      </span>
                      <div className="text-[11px] text-slate-500 font-semibold">{sub.percentage}%</div>
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          sub.isPassed
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {sub.isPassed ? 'Lulus' : 'Belum Lulus'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right space-x-1 whitespace-nowrap">
                      <button
                        onClick={() => setSelectedSubmission(sub)}
                        className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition cursor-pointer"
                        title="Lihat Lembar Jawaban Lengkap"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setSubmissionToDelete(sub)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                        title="Hapus Data Mahasiswa Ini"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Confirmation Modal: Clear ALL Submissions */}
      {isClearAllModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-6">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mb-4">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1">
                Hapus Seluruh Data Respon Ujian?
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Tindakan ini akan menghapus <strong>{totalSubmissions} data pengerjaan</strong> mahasiswa pada kuis <em>&ldquo;{activeQuiz.settings.title}&rdquo;</em>. Rekap nilai dan statistik kelulusan akan direset menjadi kosong.
              </p>

              <div className="mt-6 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsClearAllModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleConfirmClearAll}
                  className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Ya, Hapus Semua Data</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal: Delete SINGLE Submission */}
      {submissionToDelete && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-6">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mb-4">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1">
                Hapus Data Mahasiswa Ini?
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Anda akan menghapus data pengerjaan milik: <br />
                <strong className="text-slate-900 font-bold">{submissionToDelete.respondent.name}</strong> 
                {submissionToDelete.respondent.studentId ? ` (${submissionToDelete.respondent.studentId})` : ''} dengan skor <strong>{submissionToDelete.percentage}%</strong>.
              </p>

              <div className="mt-6 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setSubmissionToDelete(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDeleteSingle}
                  className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition cursor-pointer active:scale-95"
                >
                  Hapus Data Ini
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Individual Submission Response Sheet Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95">
            
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div>
                <h3 className="font-bold text-sm sm:text-base">
                  Lembar Jawaban: {selectedSubmission.respondent.name}
                </h3>
                <p className="text-xs text-slate-300">
                  Skor: {selectedSubmission.totalScore}/{selectedSubmission.maxScore} ({selectedSubmission.percentage}%) • {selectedSubmission.isPassed ? 'LULUS' : 'TIDAK LULUS'}
                </p>
              </div>
              <button
                onClick={() => setSelectedSubmission(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-800">
              
              {/* Respondent Header Data */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <div>
                  <span className="text-slate-400 block">Peserta:</span>
                  <span className="font-bold">{selectedSubmission.respondent.name}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">NIM/ID:</span>
                  <span className="font-bold">{selectedSubmission.respondent.studentId || '-'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Durasi:</span>
                  <span className="font-bold">{formatDuration(selectedSubmission.durationSeconds)}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Status:</span>
                  <span className={`font-bold ${selectedSubmission.isPassed ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {selectedSubmission.isPassed ? 'Lulus' : 'Belum Lulus'}
                  </span>
                </div>
              </div>

              {/* Questions Breakdown */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Rincian Jawaban Per Butir Soal:
                </h4>

                {selectedSubmission.results?.map((res, i) => (
                  <div
                    key={res.questionId || i}
                    className={`p-4 rounded-xl border transition ${
                      res.isCorrect
                        ? 'border-emerald-200 bg-emerald-50/30'
                        : 'border-rose-200 bg-rose-50/30'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start space-x-2">
                        {res.isCorrect ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                        ) : (
                          <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                        )}
                        <div className="space-y-1.5 flex-1">
                          <p className="text-sm font-semibold text-slate-900">
                            {i + 1}. {res.questionTitle}
                          </p>

                          {res.imageUrl && (
                            <div className="pt-1">
                              <img
                                src={res.imageUrl}
                                alt="Gambar Soal"
                                className="max-h-36 rounded-lg border border-slate-200 object-contain bg-white p-1"
                              />
                            </div>
                          )}
                          
                          <div className="mt-2 space-y-1 text-xs">
                            <div className="flex items-center gap-1.5">
                              <span className="text-slate-500">Jawaban Mahasiswa:</span>
                              <span className={`font-bold ${res.isCorrect ? 'text-emerald-800' : 'text-rose-800'}`}>
                                {typeof res.userAnswer === 'object' ? JSON.stringify(res.userAnswer) : String(res.userAnswer || '(Tidak Dijawab)')}
                              </span>
                            </div>

                            {!res.isCorrect && res.correctAnswerText && (
                              <div className="flex items-center gap-1.5 text-emerald-800 font-medium">
                                <span>Kunci yang benar:</span>
                                <span className="font-bold">{res.correctAnswerText}</span>
                              </div>
                            )}

                            {res.explanation && (
                              <div className="mt-1.5 p-2 bg-white/80 rounded border border-slate-200 text-slate-600 text-[11px]">
                                <strong>Penjelasan:</strong> {res.explanation}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-white border border-slate-200 shrink-0">
                        {res.score}/{res.maxScore} pt
                      </span>
                    </div>
                  </div>
                ))}
              </div>

            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setSelectedSubmission(null)}
                className="px-4 py-1.5 text-xs font-semibold bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg transition cursor-pointer"
              >
                Tutup
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
