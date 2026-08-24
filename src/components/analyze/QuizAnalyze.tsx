import React, { useState, useEffect } from 'react';
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
  const { quizzes, activeQuizId, setActiveQuizId, submissions, deleteSubmission, clearQuizSubmissions, isCloudSynced } = useQuiz();
  const [selectedQuizFilter, setSelectedQuizFilter] = useState<string>(activeQuizId);
  const [selectedSubmission, setSelectedSubmission] = useState<QuizSubmission | null>(null);
  const [activeAnalysisTab, setActiveAnalysisTab] = useState<'submissions' | 'questions'>('submissions');
  
  // Custom confirmation dialog states
  const [isClearAllModalOpen, setIsClearAllModalOpen] = useState(false);
  const [submissionToDelete, setSubmissionToDelete] = useState<QuizSubmission | null>(null);
  const [notificationToast, setNotificationToast] = useState<string | null>(null);

  // Sync selected filter with active quiz if changed externally
  useEffect(() => {
    if (activeQuizId && selectedQuizFilter !== 'all' && selectedQuizFilter !== activeQuizId) {
      setSelectedQuizFilter(activeQuizId);
    }
  }, [activeQuizId]);

  const activeQuiz = quizzes.find((q) => q.id === (selectedQuizFilter === 'all' ? activeQuizId : selectedQuizFilter)) || quizzes[0];

  const handleSelectQuiz = (quizId: string) => {
    setSelectedQuizFilter(quizId);
    if (quizId !== 'all') {
      setActiveQuizId(quizId);
    }
  };

  const quizSubmissions = [
    ...(selectedQuizFilter === 'all'
      ? submissions
      : submissions.filter((s) => s.quizId === (activeQuiz?.id || selectedQuizFilter)))
  ].sort((a, b) => {
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
    if (activeQuiz) {
      clearQuizSubmissions(activeQuiz.id);
      setIsClearAllModalOpen(false);
      showToast(`Berhasil menghapus seluruh data respon (${totalSubmissions} data mahasiswa).`);
    }
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

    const headers = ['No', 'Nama Siswa', 'Email', 'NIM / ID', 'Kelas', 'Kuis', 'Waktu Mulai', 'Waktu Selesai', 'Durasi (detik)', 'Skor', 'Maks Skor', 'Persentase (%)', 'Status Kelulusan'];
    const rows = quizSubmissions.map((s, idx) => [
      idx + 1,
      `"${s.respondent.name || '-'}"`,
      `"${s.respondent.email || '-'}"`,
      `"${s.respondent.studentId || '-'}"`,
      `"${s.respondent.className || '-'}"`,
      `"${s.quizTitle || activeQuiz?.settings.title || '-'}"`,
      `"${new Date(s.startedAt).toLocaleString('id-ID')}"`,
      `"${new Date(s.submittedAt).toLocaleString('id-ID')}"`,
      s.durationSeconds,
      s.totalScore,
      s.maxScore,
      s.percentage,
      `"${s.isPassed ? 'Lulus' : 'Belum Lulus'}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `rekap-nilai-${activeQuiz?.settings.title.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'kuis'}-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('File CSV rekap nilai berhasil diunduh.');
  };

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-6 relative">
      
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

      {/* Top Bar: Title & Quiz Selector */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-indigo-600" />
              Laporan & Analisis Nilai Mahasiswa
            </h2>
            {isCloudSynced && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Sync
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Analisis rekap skor mahasiswa, tingkat kelulusan, dan evaluasi butir soal.
          </p>
        </div>

        {/* Quiz Filter Selector Dropdown */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-slate-600 whitespace-nowrap">Kuis:</span>
            <select
              value={selectedQuizFilter}
              onChange={(e) => handleSelectQuiz(e.target.value)}
              className="px-3 py-1.5 text-xs font-semibold bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 text-slate-800 max-w-[240px] truncate"
            >
              <option value="all">📁 Semua Kuis ({submissions.length} Respon)</option>
              {quizzes.map((q) => {
                const count = submissions.filter((s) => s.quizId === q.id).length;
                return (
                  <option key={q.id} value={q.id}>
                    {q.settings.title} ({q.questions.length} Soal • {count} Respon)
                  </option>
                );
              })}
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            {quizSubmissions.length > 0 && selectedQuizFilter !== 'all' && (
              <button
                onClick={() => setIsClearAllModalOpen(true)}
                className="px-3 py-1.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold flex items-center gap-1.5 transition shadow-2xs cursor-pointer active:scale-95 whitespace-nowrap"
                title="Hapus seluruh data riwayat ujian ini"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                <span className="hidden sm:inline">Hapus ({totalSubmissions})</span>
              </button>
            )}

            <button
              onClick={handleExportCSV}
              disabled={quizSubmissions.length === 0}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold flex items-center space-x-1.5 shadow-xs transition cursor-pointer whitespace-nowrap"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Unduh CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs: Daftar Responden vs Analisis Butir Soal */}
      <div className="flex items-center space-x-2 border-b border-slate-200">
        <button
          onClick={() => setActiveAnalysisTab('submissions')}
          className={`pb-2.5 px-3 text-xs font-bold flex items-center gap-1.5 border-b-2 transition cursor-pointer ${
            activeAnalysisTab === 'submissions'
              ? 'border-indigo-600 text-indigo-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Daftar Nilai Mahasiswa ({quizSubmissions.length})</span>
        </button>
        <button
          onClick={() => setActiveAnalysisTab('questions')}
          className={`pb-2.5 px-3 text-xs font-bold flex items-center gap-1.5 border-b-2 transition cursor-pointer ${
            activeAnalysisTab === 'questions'
              ? 'border-indigo-600 text-indigo-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <BarChart2 className="w-4 h-4" />
          <span>Analisis Butir Soal ({activeQuiz?.questions.length || 0} Butir)</span>
        </button>
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

      {/* Submissions Table / Item Analysis */}
      {activeAnalysisTab === 'submissions' ? (
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
                    <th className="px-4 py-3">Kuis</th>
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
                      <td className="px-4 py-3.5">
                        <span className="font-medium text-slate-600 truncate max-w-[150px] block" title={sub.quizTitle}>
                          {sub.quizTitle || activeQuiz?.settings.title}
                        </span>
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
      ) : (
        /* Item-level Question Analysis Section */
        <div className="space-y-4">
          <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <div>
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                  Evaluasi Kualitas Butir Soal ({activeQuiz.questions.length} Butir)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Tingkat keberhasilan respon mahasiswa terhadap setiap butir soal pada kuis <strong>{activeQuiz.settings.title}</strong>.
                </p>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 font-bold">
                {quizSubmissions.length} Data Mahasiswa
              </span>
            </div>

            {activeQuiz.questions.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                Belum ada butir soal pada kuis ini.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {activeQuiz.questions.map((quest, qIdx) => {
                  // Calculate question stats from submissions
                  let totalAttempts = 0;
                  let correctAttempts = 0;
                  let totalEarnedScore = 0;

                  quizSubmissions.forEach((sub) => {
                    const res = sub.results?.find((r) => r.questionId === quest.id || r.questionTitle === quest.title);
                    if (res) {
                      totalAttempts++;
                      if (res.isCorrect) correctAttempts++;
                      totalEarnedScore += res.score;
                    }
                  });

                  const successRate = totalAttempts > 0 ? Math.round((correctAttempts / totalAttempts) * 100) : 0;
                  const avgPoints = totalAttempts > 0 ? (totalEarnedScore / totalAttempts).toFixed(1) : '0';

                  const difficultyLabel = totalAttempts === 0 
                    ? 'Belum Ada Respon' 
                    : successRate >= 75 
                      ? 'Mudah' 
                      : successRate >= 45 
                        ? 'Sedang' 
                        : 'Sulit';

                  const difficultyColor = totalAttempts === 0
                    ? 'bg-slate-100 text-slate-600'
                    : successRate >= 75
                      ? 'bg-emerald-100 text-emerald-800'
                      : successRate >= 45
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-rose-100 text-rose-800';

                  return (
                    <div key={quest.id} className="py-4 first:pt-0 last:pb-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="w-5 h-5 rounded-md bg-slate-800 text-white flex items-center justify-center font-bold text-[10px] shrink-0">
                              {qIdx + 1}
                            </span>
                            <span className="text-xs font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold uppercase">
                              {quest.type.replace('_', ' ')}
                            </span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${difficultyColor}`}>
                              {difficultyLabel}
                            </span>
                          </div>

                          <p className="text-xs sm:text-sm font-bold text-slate-900 mt-1">
                            {quest.title}
                          </p>

                          {quest.options && quest.options.length > 0 && (
                            <div className="mt-2.5 grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                              {quest.options.map((opt, oIdx) => (
                                <div
                                  key={opt.id || oIdx}
                                  className={`px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between border ${
                                    opt.isCorrect
                                      ? 'border-emerald-300 bg-emerald-50/50 text-emerald-900 font-semibold'
                                      : 'border-slate-200 bg-slate-50/50 text-slate-700'
                                  }`}
                                >
                                  <span className="truncate">
                                    <strong className="mr-1">{opt.label || String.fromCharCode(65 + oIdx)}.</strong>
                                    {opt.text}
                                  </span>
                                  {opt.isCorrect && (
                                    <span className="text-[10px] text-emerald-700 font-bold shrink-0 ml-1">Kunci Benar ✓</span>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Question stats pills */}
                        <div className="flex flex-col items-end shrink-0 gap-1 text-right">
                          <div className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200">
                            <span className="text-[10px] text-slate-400 block uppercase font-bold">Daya Serap</span>
                            <span className="font-black text-sm text-slate-900 font-mono">{successRate}%</span>
                          </div>
                          <span className="text-[10px] text-slate-500">
                            {correctAttempts}/{totalAttempts || 0} Benar • {avgPoints}/{quest.points} pt
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

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
                        <div>
                          <p className="text-sm font-semibold text-slate-900">
                            {i + 1}. {res.questionTitle}
                          </p>
                          
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
