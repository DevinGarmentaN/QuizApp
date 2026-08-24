import React, { useState } from 'react';
import { useQuiz } from '../../context/QuizContext';
import { 
  Share2, 
  Copy, 
  Check, 
  QrCode, 
  Globe, 
  ExternalLink, 
  Lock, 
  Unlock, 
  ShieldAlert, 
  PlayCircle,
  Code,
  Sparkles,
  Download
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

export const QuizPublish: React.FC = () => {
  const { activeQuiz, updateQuizSettings, setTakingQuizId, setAppMode } = useQuiz();
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedEmbed, setCopiedEmbed] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);

  if (!activeQuiz) return null;

  const currentOrigin = window.location.origin;
  const shareableUrl = `${currentOrigin}/#quiz=${activeQuiz.id}`;
  const embedSnippet = `<iframe src="${shareableUrl}" width="100%" height="800" frameborder="0"></iframe>`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareableUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyEmbed = () => {
    navigator.clipboard.writeText(embedSnippet);
    setCopiedEmbed(true);
    setTimeout(() => setCopiedEmbed(false), 2000);
  };

  const handleLaunchLiveTest = () => {
    setTakingQuizId(activeQuiz.id);
    setAppMode('taker');
  };

  const handleStatusChange = (newStatus: 'in_design' | 'published' | 'closed') => {
    updateQuizSettings(activeQuiz.id, { status: newStatus });
  };

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-8">
      
      {/* Header */}
      <div>
        <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
          <Share2 className="w-5 h-5 text-indigo-600" />
          Publikasi & Bagikan Kuis
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Bagikan link ujian kepada siswa melalui tautan langsung, kode QR di proyektor kelas, atau sematkan ke LMS.
        </p>
      </div>

      {/* Status Controller Card */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-6 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center space-x-3">
            <div className={`w-3.5 h-3.5 rounded-full ${
              activeQuiz.settings.status === 'published' 
                ? 'bg-emerald-500 ring-4 ring-emerald-100' 
                : activeQuiz.settings.status === 'closed'
                ? 'bg-rose-500 ring-4 ring-rose-100'
                : 'bg-amber-500 ring-4 ring-amber-100'
            }`} />
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Status Kuis Saat Ini:</span>
              <h3 className="text-base font-bold text-slate-900">
                {activeQuiz.settings.status === 'published' 
                  ? 'Published (Terbuka untuk Peserta)' 
                  : activeQuiz.settings.status === 'closed'
                  ? 'Closed (Pendaftaran Ditutup)'
                  : 'In Design / Draft (Hanya Pengajar)'}
              </h3>
            </div>
          </div>

          {/* Quick status switch buttons */}
          <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
            <button
              onClick={() => handleStatusChange('in_design')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${
                activeQuiz.settings.status === 'in_design'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Draft
            </button>
            <button
              onClick={() => handleStatusChange('published')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${
                activeQuiz.settings.status === 'published'
                  ? 'bg-emerald-600 text-white shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Published
            </button>
            <button
              onClick={() => handleStatusChange('closed')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${
                activeQuiz.settings.status === 'closed'
                  ? 'bg-rose-600 text-white shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tutup
            </button>
          </div>
        </div>
      </div>

      {/* Share Link & QR Code Box */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-6 space-y-6">
        
        {/* Link Share */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
            Tautan Pengerjaan Ujian (Direct Test Link)
          </label>
          <div className="flex items-center gap-2">
            <div className="flex-1 flex items-center bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-700 font-mono text-xs overflow-x-auto">
              <Globe className="w-4 h-4 text-indigo-600 shrink-0 mr-2" />
              <span className="truncate">{shareableUrl}</span>
            </div>

            <button
              onClick={handleCopyLink}
              className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition shrink-0 ${
                copiedLink
                  ? 'bg-emerald-600 text-white'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'
              }`}
            >
              {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copiedLink ? 'Tersalin!' : 'Salin Link'}</span>
            </button>

            <button
              onClick={() => setShowQrModal(true)}
              className="p-2 rounded-lg border border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-700 transition"
              title="Tampilkan QR Code"
            >
              <QrCode className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Live Student Simulation Launcher */}
        <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-xs shrink-0">
              <PlayCircle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-emerald-950 uppercase tracking-wider">
                Simulasi Kerjakan Sebagai Siswa
              </h4>
              <p className="text-xs text-emerald-800">
                Uji coba alur pengerjaan kuis, timer waktu, dan lembar hasil secara langsung.
              </p>
            </div>
          </div>

          <button
            onClick={handleLaunchLiveTest}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold shadow-xs transition transform active:scale-95 flex items-center space-x-1.5"
          >
            <span>Mulai Ujian Sekarang</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Embed code section */}
        <div className="border-t border-slate-100 pt-5 space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Code className="w-4 h-4 text-slate-500" />
              <span>Sematkan ke Web / LMS (HTML Embed)</span>
            </label>
            <button
              onClick={handleCopyEmbed}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1"
            >
              {copiedEmbed ? 'Kode Tersalin' : 'Salin Kode Embed'}
            </button>
          </div>
          <pre className="p-3 bg-slate-900 text-slate-200 rounded-xl text-xs font-mono overflow-x-auto border border-slate-800">
            {embedSnippet}
          </pre>
        </div>

      </div>

      {/* QR Code Modal Popup */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full text-center space-y-4 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <h3 className="font-bold text-slate-800 text-sm">Scan QR Code Ujian</h3>
            <p className="text-xs text-slate-500">
              Tampilkan di proyektor atau bagikan kepada siswa untuk akses langsung dari ponsel.
            </p>

            <div className="p-4 bg-white border border-slate-200 rounded-xl inline-block shadow-xs">
              <QRCodeSVG value={shareableUrl} size={190} level="H" includeMargin />
            </div>

            <div className="text-xs font-semibold text-slate-700 truncate px-2">
              {activeQuiz.settings.title}
            </div>

            <div className="flex items-center justify-center space-x-2 pt-2">
              <button
                onClick={() => setShowQrModal(false)}
                className="px-4 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition"
              >
                Tutup
              </button>
              <button
                onClick={handleCopyLink}
                className="px-4 py-1.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-xs transition"
              >
                Salin Link
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
