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
  MessageSquare
} from 'lucide-react';

export const QuizConfiguration: React.FC = () => {
  const { activeQuiz, updateQuizSettings } = useQuiz();
  const [saveToast, setSaveToast] = useState(false);

  if (!activeQuiz) return null;

  const s = activeQuiz.settings;

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

  const showSavedFeedback = () => {
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2000);
  };

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-8">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <Settings className="w-5 h-5 text-indigo-600" />
            Konfigurasi & Pengaturan Ujian
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Atur batas waktu, ambang batas kelulusan, keamanan akses, dan tampilan hasil evaluasi.
          </p>
        </div>

        {saveToast && (
          <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold animate-in fade-in">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>Tersimpan Otomatis</span>
          </div>
        )}
      </div>

      {/* Settings Sections */}
      <div className="space-y-6">

        {/* Section 1: Informasi Dasar */}
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-6 space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
              1. Informasi Umum Kuis
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Judul Ujian / Kuis
              </label>
              <input
                type="text"
                value={s.title}
                onChange={(e) => handleUpdate('title', e.target.value)}
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 font-medium bg-white"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Deskripsi & Petunjuk Pengerjaan
              </label>
              <textarea
                value={s.description}
                onChange={(e) => handleUpdate('description', e.target.value)}
                rows={2}
                className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Kategori / Mata Pelajaran
              </label>
              <input
                type="text"
                value={s.category}
                onChange={(e) => handleUpdate('category', e.target.value)}
                placeholder="Contoh: Basis Data, Matematika, Biologi"
                className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nama Pengajar / Pembuat Soal
              </label>
              <input
                type="text"
                value={s.author}
                onChange={(e) => handleUpdate('author', e.target.value)}
                className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Waktu & Penilaian */}
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-6 space-y-4">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-600" />
              2. Batas Waktu & Kriteria Kelulusan
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Durasi Waktu Pengerjaan
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="360"
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
                className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4"
              />
            </div>

            {s.accessCodeRequired && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 max-w-sm">
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  Kunci Akses / Password Token:
                </label>
                <input
                  type="text"
                  value={s.accessCode}
                  onChange={(e) => handleUpdate('accessCode', e.target.value.toUpperCase())}
                  placeholder="Contoh: UJIAN2026"
                  className="w-full px-3 py-1.5 text-xs font-mono font-bold tracking-wider uppercase border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white"
                />
              </div>
            )}
          </div>
        </div>

        {/* Section 4: Pengacakan & Navigasi */}
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-6 space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Shuffle className="w-4 h-4 text-indigo-600" />
              4. Pengacakan Soal & Kebijakan Hasil
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
                <span className="text-xs font-semibold text-slate-800 block">Acak Urutan Nomor Soal (Shuffle Questions)</span>
                <span className="text-[11px] text-slate-500">Mencegah siswa mencontek dengan urutan nomor soal yang berbeda untuk tiap peserta.</span>
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

      </div>

    </div>
  );
};
