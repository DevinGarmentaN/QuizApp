import React from 'react';
import { useQuiz } from '../../context/QuizContext';
import { 
  FileEdit, 
  Settings, 
  Share2, 
  BarChart2, 
  Eye, 
  Printer,
  CheckCircle2,
  Clock,
  HelpCircle
} from 'lucide-react';

interface QuizSubNavbarProps {
  onPrintClick: () => void;
}

export const QuizSubNavbar: React.FC<QuizSubNavbarProps> = ({ onPrintClick }) => {
  const { activeQuiz, activeTab, setActiveTab, submissions } = useQuiz();

  if (!activeQuiz) return null;

  const quizSubmissionsCount = submissions.filter((s) => s.quizId === activeQuiz.id).length;

  interface NavTabItem {
    id: 'create' | 'configure' | 'publish' | 'analyze';
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number;
  }

  const tabs: NavTabItem[] = [
    { id: 'create', label: 'Create', icon: FileEdit },
    { id: 'configure', label: 'Configure', icon: Settings },
    { id: 'publish', label: 'Publish', icon: Share2 },
    { 
      id: 'analyze', 
      label: 'Analyze', 
      icon: BarChart2, 
      badge: quizSubmissionsCount > 0 ? quizSubmissionsCount : undefined 
    },
  ];

  const getStatusDisplay = () => {
    switch (activeQuiz.settings.status) {
      case 'published':
        return { label: 'Published / Aktif', color: 'text-emerald-700 bg-emerald-100 border-emerald-300' };
      case 'closed':
        return { label: 'Ditutup', color: 'text-rose-700 bg-rose-100 border-rose-300' };
      case 'in_design':
      default:
        return { label: 'In Design', color: 'text-slate-700 bg-slate-200 border-slate-300' };
    }
  };

  const status = getStatusDisplay();

  return (
    <div className="bg-slate-900 border-b border-slate-800 text-white shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Row 1: Primary FlexiQuiz tabs & actions */}
        <div className="flex items-center justify-between h-12 flex-wrap gap-2">
          {/* Main Mode Tabs */}
          <nav className="flex space-x-1" aria-label="Tabs">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-t-lg text-xs sm:text-sm font-semibold transition ${
                    isActive
                      ? 'bg-slate-50 text-slate-900 shadow-xs border-t-2 border-indigo-600'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                  <span>{tab.label}</span>
                  {tab.badge !== undefined && (
                    <span className={`text-xs px-1.5 py-0.2 rounded-full font-mono ${
                      isActive ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-slate-200'
                    }`}>
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right utility buttons: Print & Preview */}
          <div className="flex items-center space-x-2">
            <button
              onClick={onPrintClick}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition border border-slate-700"
              title="Cetak lembar ujian atau kunci jawaban"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>

            <button
              onClick={() => setActiveTab('preview')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'preview'
                  ? 'bg-indigo-600 text-white shadow-xs font-bold'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Preview</span>
            </button>
          </div>
        </div>

      </div>

      {/* Info Sub-strip */}
      <div className="bg-slate-950 text-slate-300 text-xs py-1.5 px-4 sm:px-6 lg:px-8 border-t border-slate-800/80">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2 truncate">
            <span className="font-semibold text-slate-400">Quiz:</span>
            <span className="truncate text-slate-200 font-medium">{activeQuiz.settings.title}</span>
          </div>

          <div className="flex items-center space-x-4 shrink-0 text-xs">
            <div className="flex items-center space-x-1.5">
              <span className="font-medium text-slate-400">Status:</span>
              <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${status.color}`}>
                {status.label}
              </span>
            </div>
            <div className="hidden md:flex items-center space-x-3 text-slate-400 font-mono text-[11px]">
              <span>{activeQuiz.questions.length} Pertanyaan</span>
              <span>•</span>
              <span>{activeQuiz.questions.reduce((acc, q) => acc + (q.points || 0), 0)} Poin Total</span>
              {activeQuiz.settings.timeLimitMinutes > 0 && (
                <>
                  <span>•</span>
                  <span>{activeQuiz.settings.timeLimitMinutes} Menit</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
