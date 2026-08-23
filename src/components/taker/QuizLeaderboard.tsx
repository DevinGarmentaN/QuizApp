import React, { useState, useMemo } from 'react';
import { QuizSubmission } from '../../types/quiz';
import { 
  Trophy, 
  Medal, 
  Crown, 
  Search, 
  Users, 
  Award, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  TrendingUp, 
  Filter,
  ArrowUpDown,
  Sparkles
} from 'lucide-react';

interface QuizLeaderboardProps {
  quizId: string;
  currentSubmissionId?: string;
  submissions: QuizSubmission[];
  passingPercentage: number;
}

export const QuizLeaderboard: React.FC<QuizLeaderboardProps> = ({
  quizId,
  currentSubmissionId,
  submissions,
  passingPercentage,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc'); // Highest score first or lowest first

  // Filter submissions for this quiz
  const quizSubmissions = useMemo(() => {
    return submissions.filter((s) => s.quizId === quizId);
  }, [submissions, quizId]);

  // Unique classes for filtering
  const availableClasses = useMemo(() => {
    const classes = new Set<string>();
    quizSubmissions.forEach((s) => {
      if (s.respondent.className) {
        classes.add(s.respondent.className);
      }
    });
    return Array.from(classes);
  }, [quizSubmissions]);

  // Ranked submissions (sorted by percentage desc, then by duration asc, then by submittedAt asc)
  const rankedSubmissions = useMemo(() => {
    const list = [...quizSubmissions].sort((a, b) => {
      if (b.percentage !== a.percentage) {
        return b.percentage - a.percentage;
      }
      // If score is tied, shorter duration ranks higher
      if (a.durationSeconds !== b.durationSeconds) {
        return a.durationSeconds - b.durationSeconds;
      }
      // If duration is also tied, earlier submission ranks higher
      return new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime();
    });

    return list.map((sub, index) => ({
      ...sub,
      rank: index + 1,
    }));
  }, [quizSubmissions]);

  // Current user's rank info
  const currentUserRankInfo = useMemo(() => {
    if (!currentSubmissionId) return null;
    return rankedSubmissions.find((s) => s.id === currentSubmissionId) || null;
  }, [rankedSubmissions, currentSubmissionId]);

  // Filtered list based on search and class filter
  const displayedSubmissions = useMemo(() => {
    let filtered = rankedSubmissions;

    if (selectedClass !== 'all') {
      filtered = filtered.filter((s) => s.respondent.className === selectedClass);
    }

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.respondent.name.toLowerCase().includes(term) ||
          (s.respondent.studentId && s.respondent.studentId.toLowerCase().includes(term)) ||
          (s.respondent.className && s.respondent.className.toLowerCase().includes(term))
      );
    }

    if (sortOrder === 'asc') {
      return [...filtered].reverse();
    }

    return filtered;
  }, [rankedSubmissions, selectedClass, searchTerm, sortOrder]);

  // Summary statistics
  const stats = useMemo(() => {
    if (quizSubmissions.length === 0) {
      return { total: 0, highest: 0, lowest: 0, average: 0, passRate: 0 };
    }
    const scores = quizSubmissions.map((s) => s.percentage);
    const highest = Math.max(...scores);
    const lowest = Math.min(...scores);
    const average = Math.round(scores.reduce((acc, curr) => acc + curr, 0) / scores.length);
    const passedCount = quizSubmissions.filter((s) => s.isPassed).length;
    const passRate = Math.round((passedCount / quizSubmissions.length) * 100);

    return {
      total: quizSubmissions.length,
      highest,
      lowest,
      average,
      passRate,
    };
  }, [quizSubmissions]);

  // Top 3 Podium
  const topThree = useMemo(() => {
    return rankedSubmissions.slice(0, 3);
  }, [rankedSubmissions]);

  const formatDuration = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins}m ${s < 10 ? '0' : ''}${s}s`;
  };

  if (quizSubmissions.length === 0) {
    return (
      <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200">
        <Users className="w-8 h-8 text-slate-400 mx-auto mb-2" />
        <p className="text-sm font-semibold text-slate-700">Belum ada data peringkat</p>
        <p className="text-xs text-slate-500 mt-1">Daftar peringkat akan terisi otomatis setelah mahasiswa menyelesaikan ujian.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Current User Rank Spotlight Banner */}
      {currentUserRankInfo && (
        <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl border shadow-inner ${
              currentUserRankInfo.rank === 1
                ? 'bg-amber-400/20 text-amber-300 border-amber-400/40'
                : currentUserRankInfo.rank === 2
                ? 'bg-slate-200/20 text-slate-200 border-slate-300/40'
                : currentUserRankInfo.rank === 3
                ? 'bg-amber-700/20 text-amber-400 border-amber-600/40'
                : 'bg-indigo-600/20 text-indigo-300 border-indigo-500/30'
            }`}>
              {currentUserRankInfo.rank <= 3 ? (
                <Crown className="w-7 h-7" />
              ) : (
                <span>#{currentUserRankInfo.rank}</span>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 uppercase tracking-wider">
                  Posisi Anda di Kelas
                </span>
                <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md uppercase ${
                  currentUserRankInfo.isPassed ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                }`}>
                  {currentUserRankInfo.isPassed ? 'Lulus' : 'Belum Lulus'}
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white mt-1">
                Peringkat ke-<span className="text-indigo-400">{currentUserRankInfo.rank}</span> dari {rankedSubmissions.length} Mahasiswa
              </h3>
              <p className="text-xs text-slate-400">
                Nilai Akhir: <strong className="text-white">{currentUserRankInfo.percentage}%</strong> ({currentUserRankInfo.totalScore}/{currentUserRankInfo.maxScore} poin) • Durasi: {formatDuration(currentUserRankInfo.durationSeconds)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <div className="text-right sm:border-l sm:border-slate-800 sm:pl-4">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Status Kelas</span>
              <span className="text-xs font-semibold text-slate-200">
                Top {Math.round((currentUserRankInfo.rank / rankedSubmissions.length) * 100)}% Mahasiswa
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Class Statistics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Peserta</span>
            <Users className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{stats.total}</div>
          <p className="text-[11px] text-slate-400 mt-0.5">Mahasiswa selesai</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Top Nilai Kelas</span>
            <Trophy className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">{stats.highest}%</div>
          <p className="text-[11px] text-slate-400 mt-0.5">Nilai tertinggi kelas</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Rata-Rata Kelas</span>
            <TrendingUp className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">{stats.average}%</div>
          <p className="text-[11px] text-slate-400 mt-0.5">Rentang: {stats.lowest}% - {stats.highest}%</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Kelulusan Kelas</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-600 font-mono">{stats.passRate}%</div>
          <p className="text-[11px] text-slate-400 mt-0.5">Passing grade: {passingPercentage}%</p>
        </div>
      </div>

      {/* Top 3 Podium (Visual Ranking) */}
      {topThree.length > 0 && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-500" />
              Podium Nilai Tertinggi Kelas (Top 3)
            </h3>
            <span className="text-xs text-slate-400 font-medium">Berdasarkan Akurasi Skor & Kecepatan</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Rank 1 */}
            {topThree[0] && (
              <div className={`p-4 rounded-xl border relative overflow-hidden flex flex-col justify-between ${
                topThree[0].id === currentSubmissionId
                  ? 'border-amber-400 bg-amber-50/40 ring-2 ring-amber-400/50'
                  : 'border-amber-200 bg-amber-50/20'
              }`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-lg bg-amber-400 text-slate-950 font-black flex items-center justify-center shadow-xs">
                      1
                    </div>
                    <span className="text-xs font-black text-amber-700 uppercase tracking-wider">Juara 1 🥇</span>
                  </div>
                  <Crown className="w-5 h-5 text-amber-500" />
                </div>

                <div className="mt-3">
                  <p className="font-black text-sm text-slate-900 truncate">
                    {topThree[0].respondent.name}
                    {topThree[0].id === currentSubmissionId && (
                      <span className="ml-1 text-[11px] font-bold text-indigo-600">(Anda)</span>
                    )}
                  </p>
                  <p className="text-[11px] text-slate-500 truncate">
                    {topThree[0].respondent.studentId || '-'} {topThree[0].respondent.className ? `• ${topThree[0].respondent.className}` : ''}
                  </p>
                </div>

                <div className="mt-3 pt-2.5 border-t border-amber-200/60 flex items-center justify-between text-xs">
                  <span className="text-lg font-black text-slate-900 font-mono">{topThree[0].percentage}%</span>
                  <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    {formatDuration(topThree[0].durationSeconds)}
                  </span>
                </div>
              </div>
            )}

            {/* Rank 2 */}
            {topThree[1] && (
              <div className={`p-4 rounded-xl border relative overflow-hidden flex flex-col justify-between ${
                topThree[1].id === currentSubmissionId
                  ? 'border-slate-400 bg-slate-100/60 ring-2 ring-slate-400/50'
                  : 'border-slate-200 bg-slate-50/50'
              }`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-lg bg-slate-300 text-slate-900 font-black flex items-center justify-center shadow-xs">
                      2
                    </div>
                    <span className="text-xs font-black text-slate-600 uppercase tracking-wider">Juara 2 🥈</span>
                  </div>
                  <Medal className="w-5 h-5 text-slate-400" />
                </div>

                <div className="mt-3">
                  <p className="font-black text-sm text-slate-900 truncate">
                    {topThree[1].respondent.name}
                    {topThree[1].id === currentSubmissionId && (
                      <span className="ml-1 text-[11px] font-bold text-indigo-600">(Anda)</span>
                    )}
                  </p>
                  <p className="text-[11px] text-slate-500 truncate">
                    {topThree[1].respondent.studentId || '-'} {topThree[1].respondent.className ? `• ${topThree[1].respondent.className}` : ''}
                  </p>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-200 flex items-center justify-between text-xs">
                  <span className="text-lg font-black text-slate-900 font-mono">{topThree[1].percentage}%</span>
                  <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    {formatDuration(topThree[1].durationSeconds)}
                  </span>
                </div>
              </div>
            )}

            {/* Rank 3 */}
            {topThree[2] && (
              <div className={`p-4 rounded-xl border relative overflow-hidden flex flex-col justify-between ${
                topThree[2].id === currentSubmissionId
                  ? 'border-amber-600 bg-amber-100/30 ring-2 ring-amber-600/50'
                  : 'border-amber-200/70 bg-amber-50/10'
              }`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-lg bg-amber-600 text-white font-black flex items-center justify-center shadow-xs">
                      3
                    </div>
                    <span className="text-xs font-black text-amber-800 uppercase tracking-wider">Juara 3 🥉</span>
                  </div>
                  <Medal className="w-5 h-5 text-amber-700" />
                </div>

                <div className="mt-3">
                  <p className="font-black text-sm text-slate-900 truncate">
                    {topThree[2].respondent.name}
                    {topThree[2].id === currentSubmissionId && (
                      <span className="ml-1 text-[11px] font-bold text-indigo-600">(Anda)</span>
                    )}
                  </p>
                  <p className="text-[11px] text-slate-500 truncate">
                    {topThree[2].respondent.studentId || '-'} {topThree[2].respondent.className ? `• ${topThree[2].respondent.className}` : ''}
                  </p>
                </div>

                <div className="mt-3 pt-2.5 border-t border-amber-200/50 flex items-center justify-between text-xs">
                  <span className="text-lg font-black text-slate-900 font-mono">{topThree[2].percentage}%</span>
                  <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    {formatDuration(topThree[2].durationSeconds)}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Complete Ranking List Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        
        {/* Table Controls & Filter Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50/50">
          <div>
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Award className="w-4 h-4 text-indigo-600" />
              Tabel Peringkat Lengkap Mahasiswa ({displayedSubmissions.length} Data)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Urutan berdasarkan nilai persentase tertinggi ke terendah, lalu durasi tercepat.
            </p>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-48">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cari nama / NIM..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-hidden"
              />
            </div>

            {/* Class Filter */}
            {availableClasses.length > 1 && (
              <div className="relative">
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-hidden"
                >
                  <option value="all">Semua Kelas</option>
                  {availableClasses.map((cls) => (
                    <option key={cls} value={cls}>
                      Kelas {cls}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Toggle Sort Desc / Asc */}
            <button
              onClick={() => setSortOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'))}
              className="p-1.5 text-slate-600 hover:bg-slate-200/60 bg-white border border-slate-300 rounded-lg transition"
              title={sortOrder === 'desc' ? 'Urutan: Tertinggi ke Terendah' : 'Urutan: Terendah ke Tertinggi'}
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Table Container */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-100/75 text-slate-700 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-center w-14">Pos</th>
                <th className="px-4 py-3">Nama Mahasiswa</th>
                <th className="px-4 py-3 text-center">NIM / ID</th>
                <th className="px-4 py-3 text-center">Kelas</th>
                <th className="px-4 py-3 text-center">Nilai Akhir</th>
                <th className="px-4 py-3 text-center">Durasi</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-right">Waktu Selesai</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {displayedSubmissions.map((sub) => {
                const isCurrentUser = sub.id === currentSubmissionId;
                const isRank1 = sub.rank === 1;
                const isRank2 = sub.rank === 2;
                const isRank3 = sub.rank === 3;

                return (
                  <tr
                    key={sub.id}
                    className={`transition ${
                      isCurrentUser
                        ? 'bg-indigo-50/80 font-medium hover:bg-indigo-50 border-l-4 border-l-indigo-600'
                        : 'hover:bg-slate-50/70'
                    }`}
                  >
                    {/* Rank Position */}
                    <td className="px-4 py-3.5 text-center whitespace-nowrap">
                      {isRank1 ? (
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-amber-400 text-slate-950 font-black text-xs shadow-2xs">
                          1
                        </span>
                      ) : isRank2 ? (
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-slate-300 text-slate-900 font-black text-xs shadow-2xs">
                          2
                        </span>
                      ) : isRank3 ? (
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-amber-600 text-white font-black text-xs shadow-2xs">
                          3
                        </span>
                      ) : (
                        <span className="font-bold text-slate-500">#{sub.rank}</span>
                      )}
                    </td>

                    {/* Name & Indicator */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-slate-900">{sub.respondent.name}</span>
                        {isCurrentUser && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-indigo-600 text-white">
                            Anda
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-400 block">{sub.respondent.email || '-'}</span>
                    </td>

                    {/* Student ID */}
                    <td className="px-4 py-3.5 text-center font-mono text-[11px] text-slate-700 whitespace-nowrap">
                      {sub.respondent.studentId || '-'}
                    </td>

                    {/* Class */}
                    <td className="px-4 py-3.5 text-center whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-semibold border border-slate-200">
                        {sub.respondent.className || 'Reguler'}
                      </span>
                    </td>

                    {/* Score */}
                    <td className="px-4 py-3.5 text-center whitespace-nowrap">
                      <div className="inline-flex flex-col items-center">
                        <span className="font-black text-sm text-slate-900 font-mono">
                          {sub.percentage}%
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {sub.totalScore}/{sub.maxScore}
                        </span>
                      </div>
                    </td>

                    {/* Duration */}
                    <td className="px-4 py-3.5 text-center font-mono text-[11px] text-slate-600 whitespace-nowrap">
                      {formatDuration(sub.durationSeconds)}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3.5 text-center whitespace-nowrap">
                      <span
                        className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          sub.isPassed
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {sub.isPassed ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Lulus</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3 text-rose-600" />
                            <span>Tidak Lulus</span>
                          </>
                        )}
                      </span>
                    </td>

                    {/* Submitted At */}
                    <td className="px-4 py-3.5 text-right font-mono text-[11px] text-slate-400 whitespace-nowrap">
                      {new Date(sub.submittedAt).toLocaleTimeString('id-ID', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}{' '}
                      WIB
                    </td>
                  </tr>
                );
              })}

              {displayedSubmissions.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-slate-400">
                    Tidak ditemukan data mahasiswa yang sesuai dengan pencarian.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info */}
        <div className="p-3.5 bg-slate-50 border-t border-slate-200 text-slate-500 text-[11px] flex flex-wrap items-center justify-between gap-2">
          <span>
            Passing Grade Kuis: <strong className="text-slate-800">{passingPercentage}%</strong>
          </span>
          <span>
            Menampilkan {displayedSubmissions.length} dari total {rankedSubmissions.length} mahasiswa
          </span>
        </div>

      </div>

    </div>
  );
};
