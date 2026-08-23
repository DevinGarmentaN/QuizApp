import React, { useState } from 'react';
import { useQuiz } from '../../context/QuizContext';
import { DEMO_INSTRUCTORS } from '../../context/QuizContext';
import { 
  GraduationCap, 
  Lock, 
  Mail, 
  User, 
  Building2, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  KeyRound, 
  FileText, 
  BarChart3, 
  Layers, 
  ShieldCheck,
  HelpCircle,
  Trophy
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, registerUser, demoLogin, quizzes, setTakingQuizId, setAppMode } = useQuiz();

  const [authMode, setAuthMode] = useState<'login' | 'register' | 'student'>('login');
  
  // Login fields with Devin Garmenta Nuriansyah defaults
  const [email, setEmail] = useState('devinnuriansyah@gmail.com');
  const [password, setPassword] = useState('12345678');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  
  // Register fields
  const [regName, setRegName] = useState('Devin Garmenta Nuriansyah, S.Kom., M.Kom');
  const [regEmail, setRegEmail] = useState('devinnuriansyah@gmail.com');
  const [regPassword, setRegPassword] = useState('12345678');
  const [regRole, setRegRole] = useState<'dosen' | 'guru' | 'instruktur' | 'admin'>('dosen');
  const [regInstitution, setRegInstitution] = useState('Fakultas Ilmu Komputer');
  
  // Student quick test field
  const [selectedQuizId, setSelectedQuizId] = useState<string>(quizzes[0]?.id || '');
  const [studentAccessCode, setStudentAccessCode] = useState('');
  
  // Feedback states
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    
    if (!email.trim()) {
      setErrorMessage('Silakan masukkan alamat email akun Anda.');
      return;
    }
    if (!password) {
      setErrorMessage('Silakan masukkan kata sandi.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const success = login(email.trim(), password);
      setIsLoading(false);
      if (!success) {
        setErrorMessage('Gagal masuk. Kata sandi salah (Gunakan: 12345678) atau periksa kembali email Anda.');
      }
    }, 400);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!regName.trim()) {
      setErrorMessage('Silakan masukkan nama lengkap beserta gelar.');
      return;
    }
    if (!regEmail.trim() || !regEmail.includes('@')) {
      setErrorMessage('Silakan masukkan alamat email yang valid.');
      return;
    }
    if (!regPassword || regPassword.length < 4) {
      setErrorMessage('Kata sandi minimal 4 karakter.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      registerUser(regName.trim(), regEmail.trim(), regRole, regInstitution.trim());
      setIsLoading(false);
    }, 400);
  };

  const handleQuickStudentAccess = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedQuizId) return;

    setTakingQuizId(selectedQuizId);
    setAppMode('taker');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8 font-sans relative overflow-hidden">
      
      {/* Subtle geometric background decoration */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e1b4b_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-900/15 rounded-full blur-3xl pointer-events-none" />

      {/* Main Authentication Card */}
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl border border-slate-800/80 overflow-hidden relative z-10 grid grid-cols-1 lg:grid-cols-12 min-h-[640px]">
        
        {/* Left Side / Brand & Highlights Panel (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900 text-white p-8 sm:p-10 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-800">
          <div>
            {/* Brand Logo */}
            <div className="flex items-center space-x-3 mb-8">
              <div className="w-11 h-11 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-2xl shadow-md border border-indigo-400/30">
                F
              </div>
              <div>
                <span className="text-xl font-black tracking-tight text-white">
                  Flexi<span className="text-indigo-400">Test</span>
                </span>
                <p className="text-[11px] text-slate-400 font-medium">Portal Pembuat Soal & Ujian Online</p>
              </div>
            </div>

            {/* Headline */}
            <h1 className="text-xl sm:text-2xl font-bold text-slate-100 tracking-tight leading-snug mb-3">
              Platform Manajemen Kuis & Evaluasi Pembelajaran Kelas
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed mb-8">
              Rancang kuis interaktif, integrasi AI generator soal, pantau analitik respon mahasiswa, dan tinjau peringkat kelas secara otomatis.
            </p>

            {/* Feature List */}
            <div className="space-y-3.5">
              <div className="flex items-start space-x-3 text-xs text-slate-300">
                <div className="p-1 rounded-md bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 shrink-0 mt-0.5">
                  <Layers className="w-3.5 h-3.5" />
                </div>
                <div>
                  <strong className="text-white block">7 Variasi Format Butir Soal</strong>
                  <span>Pilihan Ganda, Benar/Salah, Isian Singkat, Menjodohkan, dan Esai Terstruktur.</span>
                </div>
              </div>

              <div className="flex items-start space-x-3 text-xs text-slate-300">
                <div className="p-1 rounded-md bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 shrink-0 mt-0.5">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <div>
                  <strong className="text-white block">AI Quiz Generator Otomatis</strong>
                  <span>Hasilkan set butir soal terstandar dari topik perkuliahan hanya dalam hitungan detik.</span>
                </div>
              </div>

              <div className="flex items-start space-x-3 text-xs text-slate-300">
                <div className="p-1 rounded-md bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 shrink-0 mt-0.5">
                  <Trophy className="w-3.5 h-3.5" />
                </div>
                <div>
                  <strong className="text-white block">Papan Peringkat & Analisis Nilai</strong>
                  <span>Pemeringkatan nilai mahasiswa real-time, ekspor CSV, dan review kunci jawaban.</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer badge */}
          <div className="mt-8 pt-6 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Sesi Terenkripsi & Aman
            </span>
            <span className="font-mono text-slate-400">v2.4.0</span>
          </div>
        </div>

        {/* Right Side / Form Panel (7 cols) */}
        <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-center bg-white">
          
          {/* Top Auth Mode Switcher */}
          <div className="flex items-center p-1 bg-slate-100 rounded-xl mb-6 border border-slate-200">
            <button
              type="button"
              onClick={() => {
                setAuthMode('login');
                setErrorMessage('');
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
                authMode === 'login'
                  ? 'bg-white text-indigo-950 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Masuk Pengajar
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode('register');
                setErrorMessage('');
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
                authMode === 'register'
                  ? 'bg-white text-indigo-950 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Daftar Baru
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode('student');
                setErrorMessage('');
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
                authMode === 'student'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-emerald-700 hover:text-emerald-800'
              }`}
            >
              Portal Mahasiswa
            </button>
          </div>

          {/* Error Message Box */}
          {errorMessage && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2">
              <span className="font-bold">Perhatian:</span>
              <span>{errorMessage}</span>
            </div>
          )}

          {/* 1. LOGIN MODE */}
          {authMode === 'login' && (
            <div>
              <div className="mb-5">
                <h2 className="text-xl font-bold text-slate-900">Masuk ke Ruang Pembuat Soal</h2>
                <p className="text-xs text-slate-500 mt-1">
                  Masuk dengan akun Dosen <strong>Devin Garmenta Nuriansyah, S.Kom., M.Kom</strong>
                </p>
              </div>

              {/* Verified Account Notice Box */}
              <div className="mb-4 p-3.5 bg-indigo-50/80 border border-indigo-200 rounded-2xl flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center space-x-1.5 text-xs font-bold text-indigo-950">
                    <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span>Akun Dosen Utama Terdaftar</span>
                  </div>
                  <p className="text-xs font-semibold text-slate-800 mt-1">
                    Devin Garmenta Nuriansyah, S.Kom., M.Kom
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Email: <code className="text-indigo-700 font-bold bg-white px-1.5 py-0.5 rounded border border-indigo-100">devinnuriansyah@gmail.com</code> • Password: <code className="text-indigo-700 font-bold bg-white px-1.5 py-0.5 rounded border border-indigo-100">12345678</code>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    demoLogin();
                  }}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shrink-0 shadow-xs transition transform active:scale-95"
                >
                  Masuk 1-Klik
                </button>
              </div>

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                {/* Email Input */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Alamat Email Pengajar / Dosen
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="devinnuriansyah@gmail.com"
                      required
                      className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white font-medium"
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-700">
                      Kata Sandi (Password)
                    </label>
                    <span className="text-[11px] font-mono text-indigo-600 font-semibold">
                      Default: 12345678
                    </span>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Masukkan kata sandi..."
                      required
                      className="w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember Me */}
                <div className="flex items-center justify-between text-xs pt-1">
                  <label className="flex items-center space-x-2 text-slate-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>Ingat sesi login dosen</span>
                  </label>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition transform active:scale-98 flex items-center justify-center gap-2 mt-2"
                >
                  <span>{isLoading ? 'Memproses Masuk...' : 'Masuk ke Dashboard Pembuat Soal'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              {/* Single Instructor Profile Card */}
              <div className="mt-5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    demoLogin();
                  }}
                  className="w-full text-left p-3 rounded-2xl border border-slate-200 hover:border-indigo-500 bg-slate-50/70 hover:bg-indigo-50/50 transition group flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3 truncate">
                    <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-xs">
                      D
                    </div>
                    <div className="truncate">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-xs text-slate-900 group-hover:text-indigo-900 truncate">
                          Devin Garmenta Nuriansyah, S.Kom., M.Kom
                        </span>
                        <span className="text-[10px] uppercase font-bold px-1.5 py-0.2 rounded bg-indigo-100 text-indigo-800 shrink-0">
                          Dosen
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400 block truncate">
                        devinnuriansyah@gmail.com • Fakultas Ilmu Komputer
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-indigo-600 group-hover:translate-x-0.5 transition shrink-0 ml-2">
                    Masuk ➔
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* 2. REGISTER MODE */}
          {authMode === 'register' && (
            <div>
              <div className="mb-4">
                <h2 className="text-xl font-bold text-slate-900">Pendaftaran Akun Pengajar Baru</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Daftarkan diri Anda untuk mulai membuat set soal kuis dan mengelola kelas.
                </p>
              </div>

              <form onSubmit={handleRegisterSubmit} className="space-y-3">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nama Lengkap & Gelar
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      placeholder="Dr. Andi Prasetyo, S.Kom., M.T."
                      required
                      className="w-full pl-10 pr-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Email Instansi / Pribadi
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="andi.prasetyo@univ.ac.id"
                      required
                      className="w-full pl-10 pr-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white"
                    />
                  </div>
                </div>

                {/* Role & Institution */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Peran / Jabatan
                    </label>
                    <select
                      value={regRole}
                      onChange={(e) => setRegRole(e.target.value as any)}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white"
                    >
                      <option value="dosen">Dosen Perguruan Tinggi</option>
                      <option value="guru">Guru Sekolah / SMK</option>
                      <option value="instruktur">Instruktur / Penguji Kursus</option>
                      <option value="admin">Administrator Kampus</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Nama Institusi / Universitas
                    </label>
                    <div className="relative">
                      <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={regInstitution}
                        onChange={(e) => setRegInstitution(e.target.value)}
                        placeholder="Universitas / Sekolah"
                        className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Buat Kata Sandi
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="Minimal 4 karakter"
                      required
                      className="w-full pl-10 pr-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white"
                    />
                  </div>
                </div>

                {/* Submit Register */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition transform active:scale-98 flex items-center justify-center gap-2 mt-3"
                >
                  <span>{isLoading ? 'Mendaftarkan Akun...' : 'Daftar & Masuk ke Dashboard'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}

          {/* 3. STUDENT QUICK EXAM PORTAL */}
          {authMode === 'student' && (
            <div>
              <div className="mb-5">
                <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold mb-2">
                  <GraduationCap className="w-4 h-4 text-emerald-600" />
                  <span>Portal Masuk Mahasiswa / Peserta Ujian</span>
                </div>
                <h2 className="text-xl font-bold text-slate-900">Mulai Pengerjaan Ujian</h2>
                <p className="text-xs text-slate-500 mt-1">
                  Mahasiswa tidak perlu login akun pengajar. Pilih kuis yang tersedia untuk langsung memulai ujian.
                </p>
              </div>

              <form onSubmit={handleQuickStudentAccess} className="space-y-4">
                {/* Select Quiz */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Pilih Kuis / Ujian Yang Akan Dikerjakan
                  </label>
                  <select
                    value={selectedQuizId}
                    onChange={(e) => setSelectedQuizId(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 bg-white font-medium text-slate-800"
                  >
                    {quizzes.map((q) => (
                      <option key={q.id} value={q.id}>
                        {q.settings.title} ({q.questions.length} Soal • {q.settings.timeLimitMinutes} Menit)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Token or Access Code if any */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Token / Kode Akses Ujian (Opsional)
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={studentAccessCode}
                      onChange={(e) => setStudentAccessCode(e.target.value)}
                      placeholder="Masukkan kode akses jika diminta pengajar..."
                      className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 bg-white"
                    />
                  </div>
                </div>

                {/* Launch Button */}
                <button
                  type="submit"
                  className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition transform active:scale-98 flex items-center justify-center gap-2 mt-2"
                >
                  <GraduationCap className="w-4 h-4" />
                  <span>Buka Lembar Ujian Mahasiswa ➔</span>
                </button>
              </form>

              <div className="mt-6 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1">
                <p className="font-bold text-slate-800">Petunjuk Pengerjaan Mahasiswa:</p>
                <p>1. Masukkan data nama, NIM, dan kelas pada halaman registrasi ujian.</p>
                <p>2. Kerjakan soal dengan teliti sebelum batas waktu berakhir.</p>
                <p>3. Papan peringkat & pembahasan akan langsung tampil setelah submit.</p>
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
