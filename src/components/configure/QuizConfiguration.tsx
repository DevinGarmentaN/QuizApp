import React, { useState } from 'react';
import { useQuiz } from '../../context/QuizContext';
import { 
  Settings, 
  Clock, 
  Award, 
  KeyRound, 
  Users, 
  Shuffle, 
  Eye, 
  CheckCircle, 
  AlertCircle, 
  Save,
  MessageSquare,
  Trash2,
  AlertTriangle
} from 'lucide-react';

export const QuizConfiguration: React.FC = () => {
  const { 
    activeQuiz, 
    quizzes, 
    updateQuizSettings, 
    submissions, 
    clearQuizSubmissions, 
    deleteQuiz,
    persistQuizToCloud
  } = useQuiz();
  
  const [saveToast, setSaveToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('Pengaturan tersimpan otomatis');
  const [isSavingCloud, setIsSavingCloud] = useState(false);
  const [isClearDataModalOpen, setIsClearDataModalOpen] = useState(false);
  const [isDeleteQuizModalOpen, setIsDeleteQuizModalOpen] = useState(false);

  if (!activeQuiz) return null;

  const s = activeQuiz.settings;
  const quizSubmissionsCount = submissions.filter((sub) => sub.quizId === activeQuiz.id).length;

  const showSavedFeedback = (msg = 'Pengaturan tersimpan otomatis') => {
    setToastMessage(msg);
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2500);
  };

  const handleManualSave = async () => {
    setIsSavingCloud(true);
    await persistQuizToCloud(activeQuiz);
    setIsSavingCloud(false);
    showSavedFeedback('Konfigurasi berhasil disimpan & disinkronkan ke Cloud');
  };

  const handleUpdate = (field: string, value: any) => {
    updateQuizSettings(activeQuiz.id, { [field]: value });
    showSavedFeedback();
  };

  const handleNestedUpdate = (parent: 'requireRegistration', field: string, value: boolean) => {
    updateQuizSettings(activeQuiz.id, {
      [parent]: {
        ...s[parent],
        [field]: value,
      },
    });
    showSavedFeedback();
  };

  const handleConfirmClearData = () => {
    clearQuizSubmissions(activeQuiz.id);
    setIsClearDataModalOpen(false);
    showSavedFeedback('Semua data respon siswa berhasil dihapus.');
  };

  const handleConfirmDeleteQuiz = () => {
    deleteQuiz(activeQuiz.id);
    setIsDeleteQuizModalOpen(false);
  };

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-8 relative">
      
      {/* Toast Save Feedback */}
      {saveToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-xl border border-slate-700 flex items-center space-x-2 text-xs font-semibold animate-in fade-in slide-in-from-bottom-3">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <Settings className="w-5 h-5 text-indigo-600" />
            Konfigurasi & Pengaturan Ujian
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Atur passing grade, durasi waktu, autentikasi peserta, token keamanan, dan opsi evaluasi.
          </p>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <button
            type="button"
            onClick={handleManualSave}
            disabled={isSavingCloud}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center space-x-2 cursor-pointer active:scale-95"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSavingCloud ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
          </button>
        </div>
      </div>

      {/* Settings Sections */}
      <div className="space-y-6">

        {/* Section 1: Informasi Dasar Kuis */}
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-6 space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
              1. Informasi Dasar Ujian
            </h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Judul Kuis / Mata Kuliah
              </label>
              <input
                type="text"
                value={s.title}
                onChange={(e) => handleUpdate('title', e.target.value)}
                className="w-full px-3.5 py-2 text-sm font-semibold border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Kategori / Fakultas
                </label>
                <input
                  type="text"
                  value={s.category}
                  onChange={(e) => handleUpdate('category', e.target.value)}
                  className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Dosen / Pengajar Pembuat Soal
                </label>
                <input
                  type="text"
                  value={s.author}
                  onChange={(e) => handleUpdate('author', e.target.value)}
                  className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-slate-50"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Deskripsi / Petunjuk Pengerjaan
              </label>
              <textarea
                value={s.description}
                onChange={(e) => handleUpdate('description', e.target.value)}
                rows={3}
                className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Waktu, Bobot & Kelulusan */}
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-6 space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-600" />
              2. Batas Waktu & Parameter Kelulusan
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Batas Waktu Pengerjaan
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="180"
                  value={s.timeLimitMinutes}
                  onChange={(e) => handleUpdate('timeLimitMinutes', Number(e.target.value))}
                  className="w-24 px-3 py-1.5 text-sm font-bold border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
                <span className="text-xs text-slate-600">Menit (0 = Bebas)</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Timer hitung mundur otomatis muncul di sisi siswa.</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Passing Grade (Ambang Kelulusan)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={s.passingPercentage}
                  onChange={(e) => handleUpdate('passingPercentage', Number(e.target.value))}
                  className="w-24 px-3 py-1.5 text-sm font-bold border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
                <span className="text-xs text-slate-600">% Nilai</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Peserta lulus jika persentase skor ≥ target.</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Batas Kesempatan Mencoba
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={s.maxAttempts}
                  onChange={(e) => handleUpdate('maxAttempts', Number(e.target.value))}
                  className="w-24 px-3 py-1.5 text-sm font-bold border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
                <span className="text-xs text-slate-600">Kali Pengerjaan</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Membatasi frekuensi tes ulang per siswa.</p>
            </div>
          </div>
        </div>

        {/* Section 3: Registrasi Peserta & Keamanan */}
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-6 space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-600" />
              3. Data Identitas Peserta & Token Keamanan
            </h3>
          </div>

          <div className="space-y-3">
            <label className="block text-xs font-bold text-slate-700">
              Formulir Identitas yang Wajib Diisi Peserta Sebelum Mulai:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { id: 'name', label: 'Nama Lengkap' },
                { id: 'email', label: 'Email Siswa' },
                { id: 'studentId', label: 'NIM / Nomor Induk' },
                { id: 'className', label: 'Kelas / Jurusan' },
              ].map((item) => (
                <label
                  key={item.id}
                  className={`flex items-center space-x-2.5 p-3 rounded-xl border cursor-pointer transition ${
                    s.requireRegistration[item.id as keyof typeof s.requireRegistration]
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-950 font-bold ring-1 ring-indigo-500'
                      : 'border-slate-200 bg-slate-50 text-slate-600'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={s.requireRegistration[item.id as keyof typeof s.requireRegistration]}
                    onChange={(e) => handleNestedUpdate('requireRegistration', item.id, e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-xs">{item.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Access Code PIN */}
          <div className="pt-2 border-t border-slate-100 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-700">Wajibkan Kode Akses / PIN Ujian</span>
                <p className="text-[11px] text-slate-400">Hanya siswa yang memiliki token ini yang dapat mengerjakan tes.</p>
              </div>
              <input
                type="checkbox"
                checked={s.accessCodeRequired}
                onChange={(e) => handleUpdate('accessCodeRequired', e.target.checked)}
                className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4 cursor-pointer"
              />
            </div>

            {s.accessCodeRequired && (
              <div className="bg-indigo-50/50 p-3 rounded-xl border border-indigo-100 flex items-center space-x-3">
                <KeyRound className="w-4 h-4 text-indigo-600 shrink-0" />
                <div className="flex-1">
                  <label className="block text-[11px] font-bold text-indigo-900 mb-0.5">
                    Kode Akses / PIN Ujian (Huruf/Angka):
                  </label>
                  <input
                    type="text"
                    value={s.accessCode || ''}
                    onChange={(e) => handleUpdate('accessCode', e.target.value.toUpperCase())}
                    placeholder="Contoh: BD2026 atau SQL101"
                    className="w-full max-w-xs px-3 py-1.5 text-xs font-mono font-bold uppercase tracking-wider bg-white border border-indigo-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Section 4: Pengacakan & Tampilan Hasil */}
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-6 space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Shuffle className="w-4 h-4 text-indigo-600" />
              4. Tata Letak Soal & Transparansi Hasil
            </h3>
          </div>

          <div className="space-y-3">
            <label className="flex items-center space-x-3 p-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 cursor-pointer transition">
              <input
                type="checkbox"
                checked={s.shuffleQuestions}
                onChange={(e) => handleUpdate('shuffleQuestions', e.target.checked)}
                className="rounded text-indigo-600 focus:ring-indigo-500"
              />
              <div>
                <span className="text-xs font-semibold text-slate-800 block">Acak Urutan Soal (Shuffle Questions)</span>
                <span className="text-[11px] text-slate-500">Mencegah kecurangan antar siswa yang bersebelahan.</span>
              </div>
            </label>

            <label className="flex items-center space-x-3 p-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 cursor-pointer transition">
              <input
                type="checkbox"
                checked={s.shuffleOptions}
                onChange={(e) => handleUpdate('shuffleOptions', e.target.checked)}
                className="rounded text-indigo-600 focus:ring-indigo-500"
              />
              <div>
                <span className="text-xs font-semibold text-slate-800 block">Acak Urutan Pilihan Ganda (Shuffle Options)</span>
                <span className="text-[11px] text-slate-500">Pilihan A, B, C, D akan diacak secara dinamis.</span>
              </div>
            </label>

            <label className="flex items-center space-x-3 p-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 cursor-pointer transition">
              <input
                type="checkbox"
                checked={s.showScoreImmediately}
                onChange={(e) => handleUpdate('showScoreImmediately', e.target.checked)}
                className="rounded text-indigo-600 focus:ring-indigo-500"
              />
              <div>
                <span className="text-xs font-semibold text-slate-800 block">Tampilkan Nilai / Skor Langsung Setelah Submit</span>
                <span className="text-[11px] text-slate-500">Siswa dapat langsung melihat total perolehan nilai saat selesai.</span>
              </div>
            </label>

            <label className="flex items-center space-x-3 p-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 cursor-pointer transition">
              <input
                type="checkbox"
                checked={s.showCorrectAnswersOnResult}
                onChange={(e) => handleUpdate('showCorrectAnswersOnResult', e.target.checked)}
                className="rounded text-indigo-600 focus:ring-indigo-500"
              />
              <div>
                <span className="text-xs font-semibold text-slate-800 block">Tampilkan Kunci Jawaban & Pembahasan Lengkap</span>
                <span className="text-[11px] text-slate-500">Membantu proses pembelajaran mandiri siswa di halaman hasil.</span>
              </div>
            </label>
          </div>
        </div>

        {/* Section 5: Pesan Kustom Kelulusan */}
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-6 space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-indigo-600" />
              5. Pesan Kustom Pada Lembar Hasil
            </h3>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-emerald-800 mb-1">
                Pesan Saat Siswa Lulus (Passed)
              </label>
              <textarea
                value={s.customMessagePass}
                onChange={(e) => handleUpdate('customMessagePass', e.target.value)}
                rows={2}
                className="w-full px-3.5 py-2 text-xs border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-500 bg-emerald-50/30"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-rose-800 mb-1">
                Pesan Saat Siswa Belum Lulus (Failed)
              </label>
              <textarea
                value={s.customMessageFail}
                onChange={(e) => handleUpdate('customMessageFail', e.target.value)}
                rows={2}
                className="w-full px-3.5 py-2 text-xs border border-rose-300 rounded-lg focus:ring-2 focus:ring-rose-500 bg-rose-50/30"
              />
            </div>
          </div>
        </div>

        {/* Section 6: Zona Bahaya & Pengelolaan Data (Danger Zone) */}
        <div className="bg-white rounded-xl shadow-xs border border-rose-200 p-6 space-y-4">
          <div className="border-b border-rose-100 pb-3 flex items-center justify-between">
            <h3 className="text-sm font-bold text-rose-800 uppercase tracking-wider flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              6. Zona Pengelolaan Data & Hapus Kuis
            </h3>
          </div>

          <div className="space-y-4">
            {/* Clear Responses Data */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-rose-50/50 rounded-xl border border-rose-200">
              <div>
                <span className="text-xs font-bold text-slate-900 block">Hapus Seluruh Data Respon Siswa</span>
                <span className="text-[11px] text-slate-500">
                  Saat ini terdapat <strong>{quizSubmissionsCount} data pengerjaan</strong> untuk kuis ini.
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsClearDataModalOpen(true)}
                disabled={quizSubmissionsCount === 0}
                className="px-3.5 py-2 rounded-xl bg-white border border-rose-300 hover:bg-rose-100 text-rose-700 disabled:opacity-50 text-xs font-bold flex items-center space-x-1.5 transition cursor-pointer self-start sm:self-auto shrink-0 active:scale-95"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Hapus Data Respon ({quizSubmissionsCount})</span>
              </button>
            </div>

            {/* Delete entire quiz */}
            {quizzes.length > 1 && (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-rose-50/50 rounded-xl border border-rose-200">
                <div>
                  <span className="text-xs font-bold text-slate-900 block">Hapus Kuis Ini Secara Permanen</span>
                  <span className="text-[11px] text-slate-500">
                    Menghapus kuis &ldquo;{activeQuiz.settings.title}&rdquo; beserta seluruh soal dan pengaturannya.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsDeleteQuizModalOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center space-x-1.5 transition cursor-pointer self-start sm:self-auto shrink-0 active:scale-95"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Hapus Kuis</span>
                </button>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Confirmation Modal: Clear Data */}
      {isClearDataModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 text-slate-800">
            <div className="p-6">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mb-4">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1">
                Hapus Seluruh Data Respon Siswa?
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Tindakan ini akan menghapus <strong>{quizSubmissionsCount} data pengerjaan</strong> siswa pada kuis ini. Seluruh rekap skor pada tab Laporan akan menjadi kosong.
              </p>

              <div className="mt-6 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsClearDataModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleConfirmClearData}
                  className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition cursor-pointer active:scale-95"
                >
                  Ya, Hapus Data
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal: Delete Quiz */}
      {isDeleteQuizModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 text-slate-800">
            <div className="p-6">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mb-4">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1">
                Hapus Kuis Ini Secara Permanen?
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Anda akan menghapus kuis <strong>&ldquo;{activeQuiz.settings.title}&rdquo;</strong>. Seluruh soal dan data pengerjaan tidak dapat dikembalikan.
              </p>

              <div className="mt-6 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsDeleteQuizModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDeleteQuiz}
                  className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition cursor-pointer active:scale-95"
                >
                  Ya, Hapus Kuis Ini
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
