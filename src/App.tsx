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

  // Check URL hash for direct shared link e.g. /#quiz=quiz-id
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#quiz=')) {
        const targetId = hash.replace('#quiz=', '');
        const targetQuiz = quizzes.find((q) => q.id === targetId);
        if (targetQuiz) {
          setTakingQuizId(targetId);
          setAppMode('taker');
        }
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [quizzes, setTakingQuizId, setAppMode]);

  // If in Student / Live Test Taking Mode
  if (appMode === 'taker' && takingQuizId) {
    return (
      <QuizPlayer
        quizId={takingQuizId}
        onExit={() => {
          setAppMode('admin');
          setTakingQuizId(null);
          window.location.hash = '';
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
