import React, { useState, useEffect } from 'react';
import { QuizProvider, useQuiz } from './context/QuizContext';
import { TopNavbar } from './components/layout/TopNavbar';
import { QuizSubNavbar } from './components/layout/QuizSubNavbar';
import { QuizBuilder } from './components/editor/QuizBuilder';
import { QuizConfiguration } from './components/configure/QuizConfiguration';
import { QuizPublish } from './components/publish/QuizPublish';
import { QuizAnalyze } from './components/analyze/QuizAnalyze';
import { QuizPreview } from './components/preview/QuizPreview';
import { QuizPlayer } from './components/taker/QuizPlayer';
import { QuizPrintView } from './components/print/QuizPrintView';
import { AiQuizGeneratorModal } from './components/editor/AiQuizGeneratorModal';
import { NewQuizModal } from './components/dashboard/NewQuizModal';
import { LoginPage } from './components/auth/LoginPage';

const MainAppContent: React.FC = () => {
  const { 
    activeTab, 
    appMode, 
    setAppMode, 
    takingQuizId, 
    setTakingQuizId, 
    activeQuizId, 
    setActiveQuizId,
    quizzes,
    currentUser 
  } = useQuiz();

  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isNewQuizModalOpen, setIsNewQuizModalOpen] = useState(false);
  const [isPrintViewOpen, setIsPrintViewOpen] = useState(false);

  // Check URL hash and query params for direct shared link e.g. /#quiz=quiz-id or /?quiz=quiz-id
  useEffect(() => {
    const handleUrlQuizCheck = () => {
      const hash = window.location.hash;
      const urlParams = new URLSearchParams(window.location.search);
      const queryQuizId = urlParams.get('quiz') || urlParams.get('id');

      let targetId: string | null = null;
      if (hash.startsWith('#quiz=')) {
        targetId = hash.replace('#quiz=', '');
      } else if (queryQuizId) {
        targetId = queryQuizId;
      }

      if (targetId) {
        setTakingQuizId(targetId);
        setAppMode('taker');
      }
    };

    handleUrlQuizCheck();
    window.addEventListener('hashchange', handleUrlQuizCheck);
    window.addEventListener('popstate', handleUrlQuizCheck);
    return () => {
      window.removeEventListener('hashchange', handleUrlQuizCheck);
      window.removeEventListener('popstate', handleUrlQuizCheck);
    };
  }, [setTakingQuizId, setAppMode]);

  // If in Student / Live Test Taking Mode
  if (appMode === 'taker' && takingQuizId) {
    return (
      <QuizPlayer
        quizId={takingQuizId}
        onExit={() => {
          setAppMode('admin');
          setTakingQuizId(null);
          if (window.location.hash.startsWith('#quiz=')) {
            window.location.hash = '';
          }
          if (window.location.search.includes('quiz=') || window.location.search.includes('id=')) {
            window.history.replaceState({}, document.title, window.location.pathname);
          }
        }}
      />
    );
  }

  // If in Print Mode
  if (isPrintViewOpen) {
    return <QuizPrintView onClose={() => setIsPrintViewOpen(false)} />;
  }

  // If not logged in as Instructor/Teacher, show Login Portal
  if (!currentUser) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen bg-[#f5f7f9] flex flex-col font-sans">
      
      {/* Top Application Navbar */}
      <TopNavbar
        onOpenAiModal={() => setIsAiModalOpen(true)}
        onOpenNewQuizModal={() => setIsNewQuizModalOpen(true)}
      />

      {/* Secondary FlexiQuiz Sub Navbar */}
      <QuizSubNavbar onPrintClick={() => setIsPrintViewOpen(true)} />

      {/* Main Tab Content View */}
      <main className="flex-1 pb-16">
        {activeTab === 'create' && (
          <QuizBuilder onOpenAiModal={() => setIsAiModalOpen(true)} />
        )}
        {activeTab === 'configure' && <QuizConfiguration />}
        {activeTab === 'publish' && <QuizPublish />}
        {activeTab === 'analyze' && <QuizAnalyze />}
        {activeTab === 'preview' && <QuizPreview />}
      </main>

      {/* FlexiQuiz Style Footer */}
      <footer className="bg-slate-900 text-slate-400 text-xs py-6 border-t border-slate-800 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center space-y-2">
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-slate-300">
            <a href="#terms" className="hover:text-indigo-400 transition">Terms and Conditions</a>
            <a href="#cookie" className="hover:text-indigo-400 transition">Cookie Policy</a>
            <a href="#privacy" className="hover:text-indigo-400 transition">Privacy</a>
            <a href="#help" className="hover:text-indigo-400 transition">Help</a>
            <a href="#blog" className="hover:text-indigo-400 transition">Blog</a>
            <a href="#contact" className="hover:text-indigo-400 transition">Contact Us</a>
          </div>
          <p className="text-slate-400 text-[11px]">
            © {new Date().getFullYear()} - FlexiTest Platform. Platform Pembuatan Kuis & Ujian Online Interaktif.
          </p>
        </div>
      </footer>

      {/* Modals */}
      <AiQuizGeneratorModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
      />

      <NewQuizModal
        isOpen={isNewQuizModalOpen}
        onClose={() => setIsNewQuizModalOpen(false)}
      />

    </div>
  );
};

export default function App() {
  return (
    <QuizProvider>
      <MainAppContent />
    </QuizProvider>
  );
}
