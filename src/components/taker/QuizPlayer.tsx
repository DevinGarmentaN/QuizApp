import React, { useState, useEffect, useMemo } from 'react';
import { useQuiz } from '../../context/QuizContext';
import { Quiz, Question, QuizSubmission, QuestionResult, RespondentInfo } from '../../types/quiz';
import { QuizLeaderboard } from './QuizLeaderboard';
import confetti from 'canvas-confetti';
import { 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Award, 
  ChevronLeft, 
  ChevronRight, 
  Flag, 
  ArrowLeft, 
  Printer, 
  RotateCcw, 
  Check, 
  HelpCircle,
  Sparkles,
  ShieldCheck,
  Send,
  Trophy,
  FileText,
  Users,
  ZoomIn,
  X,
  Image as ImageIcon
} from 'lucide-react';

interface QuizPlayerProps {
  quizId: string;
  onExit: () => void;
}

export const QuizPlayer: React.FC<QuizPlayerProps> = ({ quizId, onExit }) => {
  const { quizzes, submissions, submitQuizResult, currentUser } = useQuiz();

  const quiz = useMemo(() => quizzes.find((q) => q.id === quizId) || quizzes[0], [quizzes, quizId]);

  // Phase: 'register' | 'taking' | 'result'
  const [phase, setPhase] = useState<'register' | 'taking' | 'result'>('register');
  const [resultTab, setResultTab] = useState<'leaderboard' | 'review'>('leaderboard');

  // Respondent info
  const [respondent, setRespondent] = useState<RespondentInfo>({
    name: '',
    email: '',
    studentId: '',
    className: '',
  });
  const [enteredToken, setEnteredToken] = useState('');
  const [tokenError, setTokenError] = useState('');

  // Test state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, any>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Record<string, boolean>>({});
  const [startTime, setStartTime] = useState<number>(0);
  const [timeRemainingSeconds, setTimeRemainingSeconds] = useState<number>(0);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [completedSubmission, setCompletedSubmission] = useState<QuizSubmission | null>(null);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);

  // Shuffled questions and options prepared on start
  const preparedQuestions = useMemo(() => {
    if (!quiz) return [];
    let qList = [...quiz.questions];
    if (quiz.settings.shuffleQuestions) {
      qList = qList.sort(() => Math.random() - 0.5);
    }
    return qList.map((q) => {
      if ((q.type === 'single_choice' || q.type === 'multiple_choice') && (q.shuffleOptions || quiz.settings.shuffleOptions)) {
        return {
          ...q,
          options: [...q.options].sort(() => Math.random() - 0.5),
        };
      }
      return q;
    });
  }, [quiz, phase]);

  // Timer countdown
  useEffect(() => {
    if (phase !== 'taking' || !quiz.settings.timeLimitMinutes || quiz.settings.timeLimitMinutes <= 0) {
      return;
    }

    const timer = setInterval(() => {
      setTimeRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleFinalSubmit(true); // Auto submit on timeout
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [phase, quiz]);

  const handleStartTest = (e: React.FormEvent) => {
    e.preventDefault();

    if (quiz.settings.requireRegistration.name && !respondent.name.trim()) {
      alert('Mohon masukkan nama lengkap Anda.');
      return;
    }

    if (quiz.settings.accessCodeRequired) {
      if (enteredToken.trim().toUpperCase() !== quiz.settings.accessCode.trim().toUpperCase()) {
        setTokenError('Kode akses ujian tidak valid. Silakan hubungi pengawas/dosen.');
        return;
      }
    }

    setStartTime(Date.now());
    if (quiz.settings.timeLimitMinutes > 0) {
      setTimeRemainingSeconds(quiz.settings.timeLimitMinutes * 60);
    }
    setPhase('taking');
    setCurrentIndex(0);
  };

  const handleAnswerChange = (questionId: string, answer: any) => {
    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  const toggleFlag = (questionId: string) => {
    setFlaggedQuestions((prev) => ({
      ...prev,
      [questionId]: !prev[questionId],
    }));
  };

  const handleFinalSubmit = (forced = false) => {
    if (!forced && !confirm('Apakah Anda yakin ingin mengumpulkan lembar ujian ini sekarang?')) {
      return;
    }

    setIsSubmitModalOpen(false);
    const endTime = Date.now();
    const durationSeconds = Math.max(1, Math.round((endTime - startTime) / 1000));

    let totalScore = 0;
    let maxScore = 0;
    const questionResults: QuestionResult[] = [];

    preparedQuestions.forEach((q) => {
      const qPoints = q.points || 10;
      maxScore += qPoints;
      const userAns = userAnswers[q.id];
      let isCorrect = false;
      let earnedScore = 0;
      let correctAnswerText = '';

      if (q.type === 'single_choice' || q.type === 'true_false') {
        const correctOpt = q.options.find((o) => o.isCorrect);
        correctAnswerText = correctOpt ? `${correctOpt.label ? correctOpt.label + '. ' : ''}${correctOpt.text}` : '';
        isCorrect = userAns !== undefined && userAns === correctOpt?.id;
        earnedScore = isCorrect ? qPoints : 0;
      } else if (q.type === 'multiple_choice') {
        const correctIds = q.options.filter((o) => o.isCorrect).map((o) => o.id);
        correctAnswerText = q.options.filter((o) => o.isCorrect).map((o) => o.text).join(', ');
        const userSelectedIds: string[] = Array.isArray(userAns) ? userAns : [];
        const isMatch =
          correctIds.length === userSelectedIds.length &&
          correctIds.every((id) => userSelectedIds.includes(id));
        isCorrect = isMatch;
        earnedScore = isCorrect ? qPoints : 0;
      } else if (q.type === 'short_answer') {
        const acceptable = q.correctAnswers || [];
        correctAnswerText = acceptable.join(' / ');
        const userText = typeof userAns === 'string' ? userAns.trim() : '';
        if (q.caseSensitive) {
          isCorrect = acceptable.some((ans) => ans.trim() === userText);
        } else {
          isCorrect = acceptable.some((ans) => ans.trim().toLowerCase() === userText.toLowerCase());
        }
        earnedScore = isCorrect ? qPoints : 0;
      } else if (q.type === 'matching' && q.matchingPairs) {
        correctAnswerText = q.matchingPairs.map((p) => `${p.leftText} ➔ ${p.rightText}`).join('; ');
        const userMatches = typeof userAns === 'object' && userAns !== null ? userAns : {};
        let matchedCount = 0;
        q.matchingPairs.forEach((pair) => {
          if (userMatches[pair.id] === pair.rightText) {
            matchedCount++;
          }
        });
        isCorrect = matchedCount === q.matchingPairs.length;
        earnedScore = Math.round((matchedCount / q.matchingPairs.length) * qPoints);
      } else if (q.type === 'essay') {
        // Essay gets default passing for review
        correctAnswerText = 'Menunggu penilaian pengajar';
        isCorrect = true;
        earnedScore = qPoints;
      }

      totalScore += earnedScore;

      // Label user answer text
      let displayUserAns = userAns;
      if (q.type === 'single_choice' || q.type === 'true_false') {
        const foundOpt = q.options.find((o) => o.id === userAns);
        displayUserAns = foundOpt ? `${foundOpt.label ? foundOpt.label + '. ' : ''}${foundOpt.text}` : '(Tidak Dijawab)';
      }

      questionResults.push({
        questionId: q.id,
        questionTitle: q.title,
        type: q.type,
        userAnswer: displayUserAns,
        correctAnswerText,
        isCorrect,
        score: earnedScore,
        maxScore: qPoints,
        explanation: q.explanation,
        imageUrl: q.imageUrl,
      });
    });

    const percentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 100;
    const isPassed = percentage >= (quiz.settings.passingPercentage || 70);

    const submission: QuizSubmission = {
      id: 'sub-' + Date.now(),
      quizId: quiz.id,
      quizTitle: quiz.settings.title,
      respondent,
      startedAt: new Date(startTime).toISOString(),
      submittedAt: new Date(endTime).toISOString(),
      durationSeconds,
      totalScore,
      maxScore,
      percentage,
      isPassed,
      results: questionResults,
    };

    submitQuizResult(submission);
    setCompletedSubmission(submission);
    setPhase('result');

    if (isPassed) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  };

  const formatTimer = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // 1. REGISTRATION PHASE
  if (phase === 'register') {
    return (
      <div className="min-h-screen bg-slate-50 py-10 px-4 flex items-center justify-center relative">
        {/* Instructor Test Mode Banner (Only rendered when logged-in Lecturer is testing) */}
        {currentUser && (
          <div className="fixed top-4 right-4 z-50 bg-slate-900/90 backdrop-blur-xs text-white text-xs px-3.5 py-2 rounded-xl shadow-lg border border-slate-700 flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-semibold hidden sm:inline">Pratinjau Dosen: {currentUser.name}</span>
            <span className="font-semibold sm:hidden">Mode Dosen</span>
            <button
              type="button"
              onClick={onExit}
              className="ml-1 px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-[11px] font-bold text-white transition cursor-pointer"
            >
              Keluar ke Dashboard
            </button>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95">
          
          {/* Header Banner */}
          <div className="bg-slate-900 text-white p-6 text-center border-b border-slate-800">
            <div className="inline-flex p-3 rounded-2xl bg-indigo-600/30 border border-indigo-500/30 mb-3">
              <Award className="w-8 h-8 text-indigo-400" />
            </div>
            <h1 className="text-xl font-black">{quiz.settings.title}</h1>
            <p className="text-xs text-slate-300 mt-1 line-clamp-2">
              {quiz.settings.description || 'Silakan lengkapi formulir pendaftaran untuk memulai ujian.'}
            </p>
          </div>

          {/* Registration Form */}
          <form onSubmit={handleStartTest} className="p-6 space-y-4 text-slate-800">
            
            {/* Meta tags */}
            <div className="flex items-center justify-around py-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600">
              <div className="text-center">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Jumlah Soal</span>
                <span className="font-bold text-slate-900">{quiz.questions.length} Butir</span>
              </div>
              <div className="h-6 w-px bg-slate-200" />
              <div className="text-center">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Waktu</span>
                <span className="font-bold text-slate-900">
                  {quiz.settings.timeLimitMinutes > 0 ? `${quiz.settings.timeLimitMinutes} Menit` : 'Tanpa Batas'}
                </span>
              </div>
              <div className="h-6 w-px bg-slate-200" />
              <div className="text-center">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Passing Grade</span>
                <span className="font-bold text-emerald-600">{quiz.settings.passingPercentage}%</span>
              </div>
            </div>

            {/* Inputs */}
            {quiz.settings.requireRegistration.name && (
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Nama Lengkap Peserta <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={respondent.name}
                  onChange={(e) => setRespondent({ ...respondent, name: e.target.value })}
                  placeholder="Contoh: Ahmad Fauzi"
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white"
                />
              </div>
            )}

            {quiz.settings.requireRegistration.studentId && (
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  NIM / Nomor Induk Mahasiswa
                </label>
                <input
                  type="text"
                  value={respondent.studentId}
                  onChange={(e) => setRespondent({ ...respondent, studentId: e.target.value })}
                  placeholder="Contoh: 2105120401"
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white"
                />
              </div>
            )}

            {quiz.settings.requireRegistration.email && (
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Alamat Email (Untuk Bukti Hasil)
                </label>
                <input
                  type="email"
                  value={respondent.email}
                  onChange={(e) => setRespondent({ ...respondent, email: e.target.value })}
                  placeholder="Contoh: ahmad@student.ac.id"
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white"
                />
              </div>
            )}

            {quiz.settings.requireRegistration.className && (
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Kelas / Rombel
                </label>
                <input
                  type="text"
                  value={respondent.className}
                  onChange={(e) => setRespondent({ ...respondent, className: e.target.value })}
                  placeholder="Contoh: TI-2024-A"
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white"
                />
              </div>
            )}

            {quiz.settings.accessCodeRequired && (
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Token / Kode Akses Ujian <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={enteredToken}
                  onChange={(e) => {
                    setEnteredToken(e.target.value.toUpperCase());
                    setTokenError('');
                  }}
                  placeholder="Masukkan token dari pengawas"
                  className="w-full px-3.5 py-2 text-sm font-mono uppercase tracking-widest border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white"
                />
                {tokenError && (
                  <p className="text-xs text-rose-600 mt-1 font-medium">{tokenError}</p>
                )}
              </div>
            )}

            {/* Actions: Start Quiz Button */}
            <div className="pt-4 space-y-3">
              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md hover:shadow-lg transition transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Mulai Ujian Sekarang</span>
                <span className="text-sm">➔</span>
              </button>
              <p className="text-[11px] text-center text-slate-400">
                Pastikan data identitas di atas sudah terisi lengkap dan benar sebelum memulai pengerjaan.
              </p>
            </div>

          </form>

        </div>
      </div>
    );
  }

  // 2. LIVE TAKING TEST PHASE
  const currentQ = preparedQuestions[currentIndex];
  const answeredCount = Object.keys(userAnswers).filter((k) => userAnswers[k] !== undefined && userAnswers[k] !== '').length;
  const isTimeCritical = timeRemainingSeconds > 0 && timeRemainingSeconds <= 120;

  if (phase === 'taking' && currentQ) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        
        {/* Sticky Top Bar */}
        <header className="bg-slate-900 text-white sticky top-0 z-30 shadow-md border-b border-slate-800">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
            <div className="flex items-center space-x-3 truncate">
              <span className="font-black text-indigo-400 text-base">FlexiTest</span>
              <span className="text-slate-600">|</span>
              <h2 className="text-xs sm:text-sm font-bold truncate text-slate-200">
                {quiz.settings.title}
              </h2>
            </div>

            {/* Right: Timer & Progress */}
            <div className="flex items-center space-x-3 shrink-0">
              {quiz.settings.timeLimitMinutes > 0 && (
                <div
                  className={`flex items-center space-x-1.5 px-3 py-1 rounded-full font-mono text-xs font-bold ${
                    isTimeCritical
                      ? 'bg-rose-500 text-white animate-pulse'
                      : 'bg-slate-800 text-indigo-300 border border-indigo-900/60'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>{formatTimer(timeRemainingSeconds)}</span>
                </div>
              )}

              <button
                onClick={() => setIsSubmitModalOpen(true)}
                className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition"
              >
                Kumpulkan Ujian
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-800 h-1">
            <div
              className="bg-indigo-500 h-1 transition-all duration-300"
              style={{
                width: `${(answeredCount / preparedQuestions.length) * 100}%`,
              }}
            />
          </div>
        </header>

        {/* Main Content Body */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 flex-1 w-full grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Question Card (Left 3 columns) */}
          <div className="lg:col-span-3 space-y-4">
            
            <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-6 sm:p-8 space-y-6">
              
              {/* Question Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-900 border border-indigo-100 text-xs font-bold">
                    Soal No. {currentIndex + 1} dari {preparedQuestions.length}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    Bobot: {currentQ.points} poin
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => toggleFlag(currentQ.id)}
                  className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition ${
                    flaggedQuestions[currentQ.id]
                      ? 'bg-amber-100 text-amber-900 border border-amber-300'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                  }`}
                >
                  <Flag className={`w-3.5 h-3.5 ${flaggedQuestions[currentQ.id] ? 'fill-amber-600 text-amber-600' : ''}`} />
                  <span>{flaggedQuestions[currentQ.id] ? 'Ragu-ragu' : 'Tandai Ragu'}</span>
                </button>
              </div>

              {/* Question Title & Media */}
              <div className="space-y-3">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-relaxed">
                  {currentQ.title}
                </h3>
                {currentQ.description && (
                  <p className="text-xs text-slate-500 italic">
                    {currentQ.description}
                  </p>
                )}

                {/* Question Image Attachment */}
                {currentQ.imageUrl && (
                  <div className="relative group/img rounded-xl overflow-hidden border border-slate-200 bg-slate-50 p-2 inline-block max-w-full">
                    <img
                      src={currentQ.imageUrl}
                      alt="Gambar Soal"
                      className="max-h-72 sm:max-h-80 w-auto rounded-lg object-contain cursor-zoom-in"
                      onClick={() => setZoomedImage(currentQ.imageUrl || null)}
                    />
                    <button
                      type="button"
                      onClick={() => setZoomedImage(currentQ.imageUrl || null)}
                      className="absolute bottom-4 right-4 bg-slate-900/80 hover:bg-slate-900 text-white text-[11px] font-semibold px-2.5 py-1.5 rounded-lg shadow-md flex items-center gap-1.5 backdrop-blur-xs transition"
                    >
                      <ZoomIn className="w-3.5 h-3.5" />
                      <span>Perbesar Gambar</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Question Answer Controls */}
              <div className="pt-2">
                
                {/* Single Choice / True-False */}
                {(currentQ.type === 'single_choice' || currentQ.type === 'true_false') && (
                  <div className="space-y-2.5">
                    {currentQ.options.map((opt, oIdx) => {
                      const isSelected = userAnswers[currentQ.id] === opt.id;
                      return (
                        <label
                          key={opt.id}
                          className={`flex items-center space-x-3 p-3.5 rounded-xl border cursor-pointer transition ${
                            isSelected
                              ? 'border-indigo-600 bg-indigo-50/70 text-indigo-950 shadow-xs ring-1 ring-indigo-500'
                              : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50 text-slate-800'
                          }`}
                        >
                          <input
                            type="radio"
                            name={`question-${currentQ.id}`}
                            checked={isSelected}
                            onChange={() => handleAnswerChange(currentQ.id, opt.id)}
                            className="hidden"
                          />
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center border font-bold text-xs shrink-0 ${
                              isSelected
                                ? 'border-indigo-600 bg-indigo-600 text-white'
                                : 'border-slate-300 bg-white text-slate-600'
                            }`}
                          >
                            {opt.label || String.fromCharCode(65 + oIdx)}
                          </div>
                          <span className="text-sm font-medium leading-normal flex-1">
                            {opt.text}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                )}

                {/* Multiple Choice (Checkboxes) */}
                {currentQ.type === 'multiple_choice' && (
                  <div className="space-y-2.5">
                    {currentQ.options.map((opt, oIdx) => {
                      const currentSelected: string[] = userAnswers[currentQ.id] || [];
                      const isSelected = currentSelected.includes(opt.id);
                      return (
                        <label
                          key={opt.id}
                          className={`flex items-center space-x-3 p-3.5 rounded-xl border cursor-pointer transition ${
                            isSelected
                              ? 'border-indigo-600 bg-indigo-50/70 text-indigo-950 shadow-xs ring-1 ring-indigo-500'
                              : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50 text-slate-800'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {
                              const next = isSelected
                                ? currentSelected.filter((id) => id !== opt.id)
                                : [...currentSelected, opt.id];
                              handleAnswerChange(currentQ.id, next);
                            }}
                            className="hidden"
                          />
                          <div
                            className={`w-5 h-5 rounded flex items-center justify-center border text-xs font-bold shrink-0 ${
                              isSelected
                                ? 'border-indigo-600 bg-indigo-600 text-white'
                                : 'border-slate-300 bg-white'
                            }`}
                          >
                            {isSelected && <Check className="w-3.5 h-3.5" />}
                          </div>
                          <span className="text-sm font-medium leading-normal flex-1">
                            {opt.text}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                )}

                {/* Short Answer Input */}
                {currentQ.type === 'short_answer' && (
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Tuliskan Jawaban Anda Singkat:
                    </label>
                    <input
                      type="text"
                      value={userAnswers[currentQ.id] || ''}
                      onChange={(e) => handleAnswerChange(currentQ.id, e.target.value)}
                      placeholder="Ketik jawaban di sini..."
                      className="w-full px-4 py-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white"
                      autoFocus
                    />
                  </div>
                )}

                {/* Matching Pairs */}
                {currentQ.type === 'matching' && currentQ.matchingPairs && (
                  <div className="space-y-3">
                    <p className="text-xs text-slate-500">
                      Pilihlah pasangan yang paling tepat untuk masing-masing item di sebelah kiri:
                    </p>
                    <div className="space-y-2.5">
                      {currentQ.matchingPairs.map((pair, pIdx) => {
                        const currentMatches = userAnswers[currentQ.id] || {};
                        return (
                          <div
                            key={pair.id}
                            className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200 items-center"
                          >
                            <div className="text-xs font-bold text-slate-800">
                              {pIdx + 1}. {pair.leftText}
                            </div>
                            <select
                              value={currentMatches[pair.id] || ''}
                              onChange={(e) => {
                                handleAnswerChange(currentQ.id, {
                                  ...currentMatches,
                                  [pair.id]: e.target.value,
                                });
                              }}
                              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500"
                            >
                              <option value="">-- Pilih Pasangan --</option>
                              {currentQ.matchingPairs?.map((optPair) => (
                                <option key={optPair.id} value={optPair.rightText}>
                                  {optPair.rightText}
                                </option>
                              ))}
                            </select>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Essay */}
                {currentQ.type === 'essay' && (
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Uraian Jawaban Lengkap:
                    </label>
                    <textarea
                      rows={5}
                      value={userAnswers[currentQ.id] || ''}
                      onChange={(e) => handleAnswerChange(currentQ.id, e.target.value)}
                      placeholder="Jelaskan secara komprehensif jawaban Anda..."
                      className="w-full px-4 py-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white"
                    />
                  </div>
                )}

              </div>

              {/* Navigation buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                  disabled={currentIndex === 0}
                  className="px-4 py-2 rounded-lg border border-slate-300 hover:bg-slate-100 disabled:opacity-30 text-xs font-bold text-slate-700 flex items-center gap-1.5 transition"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Sebelumnya</span>
                </button>

                {currentIndex < preparedQuestions.length - 1 ? (
                  <button
                    type="button"
                    onClick={() => setCurrentIndex((prev) => Math.min(preparedQuestions.length - 1, prev + 1))}
                    className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition"
                  >
                    <span>Berikutnya</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsSubmitModalOpen(true)}
                    className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Selesai & Kumpulkan</span>
                  </button>
                )}
              </div>

            </div>

          </div>

          {/* Question Navigator Sidebar (Right 1 column) */}
          <div className="space-y-4">
            
            <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-5 space-y-4">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Navigasi Nomor Soal
              </h4>

              {/* Number Buttons Grid */}
              <div className="grid grid-cols-5 gap-2">
                {preparedQuestions.map((q, idx) => {
                  const isAnswered = userAnswers[q.id] !== undefined && userAnswers[q.id] !== '';
                  const isFlagged = flaggedQuestions[q.id];
                  const isCurrent = currentIndex === idx;

                  return (
                    <button
                      key={q.id}
                      onClick={() => setCurrentIndex(idx)}
                      className={`h-9 rounded-lg font-bold text-xs flex items-center justify-center transition border ${
                        isCurrent
                          ? 'ring-2 ring-indigo-500 border-indigo-600 font-extrabold'
                          : ''
                      } ${
                        isFlagged
                          ? 'bg-amber-100 border-amber-300 text-amber-900'
                          : isAnswered
                          ? 'bg-emerald-600 border-emerald-700 text-white'
                          : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="border-t border-slate-100 pt-3 space-y-1.5 text-[11px] text-slate-500 font-medium">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded bg-emerald-600 inline-block" />
                  <span>Sudah Terjawab ({answeredCount})</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded bg-amber-100 border border-amber-300 inline-block" />
                  <span>Ragu-ragu ({Object.values(flaggedQuestions).filter(Boolean).length})</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded bg-slate-100 border border-slate-300 inline-block" />
                  <span>Belum Dijawab ({preparedQuestions.length - answeredCount})</span>
                </div>
              </div>
            </div>

            {/* Respondent Info Summary */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-xs text-slate-600 space-y-1">
              <span className="text-slate-400 block font-semibold text-[10px] uppercase">Peserta:</span>
              <div className="font-bold text-slate-800">{respondent.name || 'Anonim'}</div>
              {respondent.studentId && <div>NIM: {respondent.studentId}</div>}
            </div>

          </div>

        </div>

        {/* Submit Confirmation Modal */}
        {isSubmitModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 text-slate-800">
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-2">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-lg">Konfirmasi Pengumpulan Ujian</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Pastikan Anda telah memeriksa seluruh butir soal sebelum mengirimkan lembar ujian.
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
                <div className="flex justify-between">
                  <span>Total Soal:</span>
                  <span className="font-bold">{preparedQuestions.length}</span>
                </div>
                <div className="flex justify-between text-emerald-700">
                  <span>Soal Terjawab:</span>
                  <span className="font-bold">{answeredCount}</span>
                </div>
                <div className="flex justify-between text-rose-600">
                  <span>Soal Belum Terjawab:</span>
                  <span className="font-bold">{preparedQuestions.length - answeredCount}</span>
                </div>
                <div className="flex justify-between text-amber-700">
                  <span>Ditandai Ragu:</span>
                  <span className="font-bold">{Object.values(flaggedQuestions).filter(Boolean).length}</span>
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsSubmitModalOpen(false)}
                  className="flex-1 px-4 py-2 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition"
                >
                  Kembali Periksa
                </button>
                <button
                  type="button"
                  onClick={() => handleFinalSubmit(true)}
                  className="flex-1 px-4 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-xs transition"
                >
                  Kumpulkan Sekarang
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Lightbox Zoom Modal */}
        {zoomedImage && (
          <div
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4"
            onClick={() => setZoomedImage(null)}
          >
            <div className="relative max-w-4xl max-h-[90vh] bg-slate-900 rounded-2xl overflow-hidden p-2 border border-slate-700 shadow-2xl flex flex-col items-center">
              <button
                type="button"
                onClick={() => setZoomedImage(null)}
                className="absolute top-3 right-3 text-white/80 hover:text-white bg-slate-800/80 hover:bg-slate-800 p-2 rounded-full backdrop-blur-xs transition z-10"
              >
                <X className="w-5 h-5" />
              </button>
              <img
                src={zoomedImage}
                alt="Gambar Soal Diperbesar"
                className="max-h-[82vh] max-w-full object-contain rounded-lg"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>
        )}

      </div>
    );
  }

  // 3. RESULTS & CERTIFICATE PHASE
  if (phase === 'result' && completedSubmission) {
    return (
      <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto space-y-6">
          
          {/* Result Banner Card */}
          <div className="bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden">
            
            <div
              className={`p-8 text-center text-white ${
                completedSubmission.isPassed
                  ? 'bg-slate-900 border-b-4 border-emerald-500'
                  : 'bg-slate-900 border-b-4 border-rose-500'
              }`}
            >
              <div className="inline-flex p-3.5 rounded-2xl bg-white/10 mb-3 border border-white/10">
                {completedSubmission.isPassed ? (
                  <Award className="w-12 h-12 text-emerald-400" />
                ) : (
                  <AlertCircle className="w-12 h-12 text-rose-400" />
                )}
              </div>
              <h1 className="text-2xl font-black">
                {completedSubmission.isPassed ? 'Selamat, Anda Lulus!' : 'Hasil Evaluasi Ujian'}
              </h1>
              <p className="text-xs text-slate-300 mt-1 max-w-md mx-auto">
                {completedSubmission.isPassed
                  ? quiz.settings.customMessagePass || 'Anda telah memenuhi kualifikasi passing score yang ditetapkan.'
                  : quiz.settings.customMessageFail || 'Nilai Anda belum mencapai target passing score. Terus semangat belajar!'}
              </p>
            </div>

            {/* Score & Metrics Row */}
            <div className="p-6 sm:p-8 space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[11px] font-bold text-slate-400 uppercase">Nilai Akhir</span>
                  <div className="text-3xl font-black text-slate-900 mt-1 font-mono">
                    {completedSubmission.percentage}%
                  </div>
                  <span className="text-[11px] text-slate-500">Skor {completedSubmission.totalScore}/{completedSubmission.maxScore}</span>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[11px] font-bold text-slate-400 uppercase">Passing Grade</span>
                  <div className="text-3xl font-black text-slate-700 mt-1 font-mono">
                    {quiz.settings.passingPercentage}%
                  </div>
                  <span className={`text-[11px] font-bold ${completedSubmission.isPassed ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {completedSubmission.isPassed ? 'Memenuhi Standar' : 'Belum Memenuhi'}
                  </span>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[11px] font-bold text-slate-400 uppercase">Durasi Waktu</span>
                  <div className="text-3xl font-black text-slate-800 mt-1 font-mono">
                    {Math.floor(completedSubmission.durationSeconds / 60)}m {completedSubmission.durationSeconds % 60}s
                  </div>
                  <span className="text-[11px] text-slate-500">Waktu pengerjaan</span>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[11px] font-bold text-slate-400 uppercase">Status</span>
                  <div className={`text-2xl font-black mt-1 ${completedSubmission.isPassed ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {completedSubmission.isPassed ? 'LULUS' : 'TIDAK LULUS'}
                  </div>
                  <span className="text-[11px] text-slate-500">{new Date(completedSubmission.submittedAt).toLocaleDateString('id-ID')}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between border-t border-slate-100 pt-5 flex-wrap gap-3">
                {currentUser ? (
                  <button
                    onClick={onExit}
                    className="px-4 py-2 rounded-lg border border-slate-300 hover:bg-slate-100 text-xs font-bold text-slate-700 flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Kembali ke Dashboard Editor (Dosen)</span>
                  </button>
                ) : (
                  <div className="text-xs text-slate-500 font-medium">
                    Hasil pengerjaan ujian Anda telah tersimpan secara resmi.
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => window.print()}
                    className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Cetak Lembar Hasil / Sertifikat</span>
                  </button>

                  <button
                    onClick={() => {
                      setPhase('register');
                      setUserAnswers({});
                      setFlaggedQuestions({});
                    }}
                    className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Ulangi Tes</span>
                  </button>
                </div>
              </div>

            </div>

          </div>

          {/* Result Sub-Navigation Tabs */}
          <div className="flex items-center justify-center sm:justify-start gap-2 border-b border-slate-200 pb-2">
            <button
              onClick={() => setResultTab('leaderboard')}
              className={`px-4 py-2 text-xs font-bold rounded-xl flex items-center gap-2 transition ${
                resultTab === 'leaderboard'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Trophy className="w-4 h-4" />
              <span>Daftar Peringkat Kelas (Leaderboard)</span>
            </button>

            {quiz.settings.showCorrectAnswersOnResult && (
              <button
                onClick={() => setResultTab('review')}
                className={`px-4 py-2 text-xs font-bold rounded-xl flex items-center gap-2 transition ${
                  resultTab === 'review'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Pembahasan & Kunci Jawaban</span>
              </button>
            )}
          </div>

          {/* TAB 1: LEADERBOARD PERINGKAT KELAS */}
          {resultTab === 'leaderboard' && (
            <QuizLeaderboard
              quizId={quiz.id}
              currentSubmissionId={completedSubmission.id}
              submissions={submissions}
              passingPercentage={quiz.settings.passingPercentage}
            />
          )}

          {/* TAB 2: QUESTION REVIEW BREAKDOWN */}
          {resultTab === 'review' && quiz.settings.showCorrectAnswersOnResult && (
            <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-6 sm:p-8 space-y-6">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <FileText className="w-4.5 h-4.5 text-indigo-600" />
                  Pembahasan & Evaluasi Per Butir Soal
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Tinjau jawaban yang telah Anda pilih beserta kunci jawaban dan penjelasan dosen/pengajar.
                </p>
              </div>

              <div className="space-y-4">
                {completedSubmission.results.map((res, idx) => (
                  <div
                    key={res.questionId || idx}
                    className={`p-4 rounded-xl border transition ${
                      res.isCorrect
                        ? 'border-emerald-200 bg-emerald-50/40'
                        : 'border-rose-200 bg-rose-50/40'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start space-x-2.5">
                        {res.isCorrect ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                        ) : (
                          <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                        )}
                        <div className="space-y-1.5 flex-1">
                          <p className="text-sm font-semibold text-slate-900">
                            {idx + 1}. {res.questionTitle}
                          </p>

                          {res.imageUrl && (
                            <div className="pt-1">
                              <img
                                src={res.imageUrl}
                                alt="Gambar Soal"
                                className="max-h-40 rounded-lg border border-slate-200 object-contain bg-white p-1 cursor-zoom-in"
                                onClick={() => setZoomedImage(res.imageUrl || null)}
                              />
                            </div>
                          )}

                          <div className="text-xs space-y-1 pt-1">
                            <div className="flex items-baseline gap-1.5">
                              <span className="text-slate-500 font-medium">Jawaban Anda:</span>
                              <span className={`font-bold ${res.isCorrect ? 'text-emerald-800' : 'text-rose-800'}`}>
                                {typeof res.userAnswer === 'object' ? JSON.stringify(res.userAnswer) : String(res.userAnswer || '(Tidak Dijawab)')}
                              </span>
                            </div>

                            {!res.isCorrect && res.correctAnswerText && (
                              <div className="flex items-baseline gap-1.5 text-emerald-800 font-medium">
                                <span>Kunci Jawaban Benar:</span>
                                <span className="font-bold">{res.correctAnswerText}</span>
                              </div>
                            )}

                            {res.explanation && (
                              <div className="mt-2 p-2.5 bg-white rounded-lg border border-slate-200 text-[11px] text-slate-700">
                                <span className="font-bold text-indigo-900">Pembahasan: </span>
                                {res.explanation}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-white border border-slate-200 shrink-0 text-slate-700 shadow-2xs">
                        {res.score}/{res.maxScore} pt
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Lightbox Zoom Modal in Result Phase */}
        {zoomedImage && (
          <div
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4"
            onClick={() => setZoomedImage(null)}
          >
            <div className="relative max-w-4xl max-h-[90vh] bg-slate-900 rounded-2xl overflow-hidden p-2 border border-slate-700 shadow-2xl flex flex-col items-center">
              <button
                type="button"
                onClick={() => setZoomedImage(null)}
                className="absolute top-3 right-3 text-white/80 hover:text-white bg-slate-800/80 hover:bg-slate-800 p-2 rounded-full backdrop-blur-xs transition z-10"
              >
                <X className="w-5 h-5" />
              </button>
              <img
                src={zoomedImage}
                alt="Gambar Soal Diperbesar"
                className="max-h-[82vh] max-w-full object-contain rounded-lg"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>
        )}

      </div>
    );
  }

  return null;
};
