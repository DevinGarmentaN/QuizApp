import React, { createContext, useContext, useState, useEffect } from 'react';
import { Quiz, Question, QuizPage, QuizSettings, QuizSubmission, QuestionType, OptionItem, AuthUser } from '../types/quiz';
import { DEFAULT_DATABASE_QUIZ, SAMPLE_MULTI_TYPE_QUIZ, INITIAL_SUBMISSIONS } from '../data/defaultQuizzes';

export const PRIMARY_INSTRUCTOR: AuthUser & { password: string } = {
  id: 'user-dosen-devin',
  name: 'Devin Garmenta Nuriansyah, S.Kom., M.Kom',
  email: 'devinnuriansyah@gmail.com',
  role: 'dosen',
  institution: 'Fakultas Ilmu Komputer & Teknologi Informasi',
  password: '12345678',
  joinedAt: '2024-01-01',
};

export const DEMO_INSTRUCTORS: AuthUser[] = [
  {
    id: PRIMARY_INSTRUCTOR.id,
    name: PRIMARY_INSTRUCTOR.name,
    email: PRIMARY_INSTRUCTOR.email,
    role: PRIMARY_INSTRUCTOR.role,
    institution: PRIMARY_INSTRUCTOR.institution,
    joinedAt: PRIMARY_INSTRUCTOR.joinedAt,
  },
];

interface QuizContextType {
  quizzes: Quiz[];
  activeQuizId: string;
  activeQuiz: Quiz | undefined;
  submissions: QuizSubmission[];
  activeTab: 'create' | 'configure' | 'publish' | 'analyze' | 'preview';
  appMode: 'admin' | 'taker';
  takingQuizId: string | null;
  currentUser: AuthUser | null;
  
  // Auth Actions
  login: (email: string, password?: string) => boolean;
  registerUser: (name: string, email: string, role: 'dosen' | 'guru' | 'instruktur' | 'admin', institution?: string) => boolean;
  logout: () => void;
  demoLogin: (roleType?: 'dosen' | 'guru' | 'admin' | string) => void;
  
  // Actions
  setActiveQuizId: (id: string) => void;
  setActiveTab: (tab: 'create' | 'configure' | 'publish' | 'analyze' | 'preview') => void;
  setAppMode: (mode: 'admin' | 'taker') => void;
  setTakingQuizId: (id: string | null) => void;
  
  // Quiz CRUD
  createQuiz: (title?: string, description?: string) => string;
  updateQuizSettings: (quizId: string, settings: Partial<QuizSettings>) => void;
  deleteQuiz: (quizId: string) => void;
  duplicateQuiz: (quizId: string) => string;
  
  // Page operations
  addPage: (quizId: string, title?: string) => void;
  updatePage: (quizId: string, pageId: string, data: Partial<QuizPage>) => void;
  deletePage: (quizId: string, pageId: string) => void;
  
  // Question operations
  addQuestion: (quizId: string, pageId: string, type?: QuestionType) => string;
  updateQuestion: (quizId: string, questionId: string, data: Partial<Question>) => void;
  deleteQuestion: (quizId: string, questionId: string) => void;
  duplicateQuestion: (quizId: string, questionId: string) => void;
  moveQuestion: (quizId: string, questionId: string, direction: 'up' | 'down') => void;
  reorderQuestions: (quizId: string, newQuestions: Question[]) => void;
  
  // Submissions
  submitQuizResult: (submission: QuizSubmission) => void;
  deleteSubmission: (submissionId: string) => void;
  clearQuizSubmissions: (quizId: string) => void;
  
  // Reset & Imports
  resetToDefaultData: () => void;
  importQuizJson: (jsonString: string) => boolean;
}

const STORAGE_KEY_QUIZZES = 'flexitest_quizzes_v1';
const STORAGE_KEY_SUBMISSIONS = 'flexitest_submissions_v1';
const STORAGE_KEY_AUTH = 'flexitest_auth_user_v1';

const QuizContext = createContext<QuizContextType | undefined>(undefined);

export const QuizProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_AUTH);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load auth user from storage', e);
    }
    return null;
  });

  const [quizzes, setQuizzes] = useState<Quiz[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_QUIZZES);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load quizzes from storage', e);
    }
    return [DEFAULT_DATABASE_QUIZ, SAMPLE_MULTI_TYPE_QUIZ];
  });

  const [submissions, setSubmissions] = useState<QuizSubmission[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SUBMISSIONS);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load submissions from storage', e);
    }
    return INITIAL_SUBMISSIONS;
  });

  const [activeQuizId, setActiveQuizId] = useState<string>(DEFAULT_DATABASE_QUIZ.id);
  const [activeTab, setActiveTab] = useState<'create' | 'configure' | 'publish' | 'analyze' | 'preview'>('create');
  const [appMode, setAppMode] = useState<'admin' | 'taker'>('admin');
  const [takingQuizId, setTakingQuizId] = useState<string | null>(null);

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_QUIZZES, JSON.stringify(quizzes));
    } catch (e) {
      console.error('Failed to save quizzes', e);
    }
  }, [quizzes]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SUBMISSIONS, JSON.stringify(submissions));
    } catch (e) {
      console.error('Failed to save submissions', e);
    }
  }, [submissions]);

  const activeQuiz = quizzes.find((q) => q.id === activeQuizId) || quizzes[0];

  const createQuiz = (title = 'Kuis Baru Tanpa Judul', description = '') => {
    const newId = 'quiz-' + Date.now();
    const newQuiz: Quiz = {
      id: newId,
      slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now().toString().slice(-4),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      settings: {
        title,
        description: description || 'Deskripsi instruksi pengerjaan kuis ini.',
        category: 'Umum',
        author: currentUser?.name || PRIMARY_INSTRUCTOR.name,
        status: 'in_design',
        timeLimitMinutes: 30,
        passingPercentage: 70,
        shuffleQuestions: false,
        shuffleOptions: false,
        allowReviewAnswers: true,
        showScoreImmediately: true,
        showCorrectAnswersOnResult: true,
        showExplanations: true,
        requireRegistration: {
          name: true,
          email: true,
          studentId: true,
          className: false,
        },
        accessCodeRequired: false,
        accessCode: '',
        maxAttempts: 1,
        customMessagePass: 'Selamat atas keberhasilan Anda menyelesaikan ujian ini!',
        customMessageFail: 'Tetap semangat dan pelajari materi kembali.',
        themeColor: '#0097a7',
      },
      pages: [
        {
          id: 'page-1',
          pageNumber: 1,
          title: 'Halaman 1',
          description: '',
        },
      ],
      questions: [
        {
          id: 'q-' + Date.now(),
          type: 'single_choice',
          title: 'Pertanyaan pertama Anda disini...',
          points: 10,
          isRequired: true,
          pageId: 'page-1',
          explanation: '',
          options: [
            { id: 'opt-1', label: 'A', text: 'Pilihan Jawaban 1', isCorrect: true },
            { id: 'opt-2', label: 'B', text: 'Pilihan Jawaban 2', isCorrect: false },
            { id: 'opt-3', label: 'C', text: 'Pilihan Jawaban 3', isCorrect: false },
            { id: 'opt-4', label: 'D', text: 'Pilihan Jawaban 4', isCorrect: false },
          ],
        },
      ],
    };

    setQuizzes((prev) => [newQuiz, ...prev]);
    setActiveQuizId(newId);
    setActiveTab('create');
    return newId;
  };

  const updateQuizSettings = (quizId: string, settingsUpdate: Partial<QuizSettings>) => {
    setQuizzes((prev) =>
      prev.map((q) =>
        q.id === quizId
          ? {
              ...q,
              updatedAt: new Date().toISOString(),
              settings: { ...q.settings, ...settingsUpdate },
            }
          : q
      )
    );
  };

  const deleteQuiz = (quizId: string) => {
    if (quizzes.length <= 1) {
      return;
    }
    setQuizzes((prev) => {
      const filtered = prev.filter((q) => q.id !== quizId);
      if (activeQuizId === quizId && filtered.length > 0) {
        setActiveQuizId(filtered[0].id);
      }
      return filtered;
    });
  };

  const duplicateQuiz = (quizId: string) => {
    const source = quizzes.find((q) => q.id === quizId);
    if (!source) return '';
    const newId = 'quiz-' + Date.now();
    const cloned: Quiz = {
      ...JSON.parse(JSON.stringify(source)),
      id: newId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      settings: {
        ...source.settings,
        title: `${source.settings.title} (Salinan)`,
        status: 'in_design',
      },
    };
    setQuizzes((prev) => [cloned, ...prev]);
    setActiveQuizId(newId);
    return newId;
  };

  const addPage = (quizId: string, title?: string) => {
    setQuizzes((prev) =>
      prev.map((q) => {
        if (q.id !== quizId) return q;
        const pageNum = q.pages.length + 1;
        const newPage: QuizPage = {
          id: 'page-' + Date.now(),
          pageNumber: pageNum,
          title: title || `Halaman ${pageNum}`,
          description: '',
        };
        return {
          ...q,
          pages: [...q.pages, newPage],
          updatedAt: new Date().toISOString(),
        };
      })
    );
  };

  const updatePage = (quizId: string, pageId: string, data: Partial<QuizPage>) => {
    setQuizzes((prev) =>
      prev.map((q) => {
        if (q.id !== quizId) return q;
        return {
          ...q,
          pages: q.pages.map((p) => (p.id === pageId ? { ...p, ...data } : p)),
          updatedAt: new Date().toISOString(),
        };
      })
    );
  };

  const deletePage = (quizId: string, pageId: string) => {
    setQuizzes((prev) =>
      prev.map((q) => {
        if (q.id !== quizId) return q;
        if (q.pages.length <= 1) return q; // Keep at least 1 page
        const remainingPages = q.pages.filter((p) => p.id !== pageId);
        const fallbackPageId = remainingPages[0].id;
        // Move questions on deleted page to first page
        const updatedQuestions = q.questions.map((qu) =>
          qu.pageId === pageId ? { ...qu, pageId: fallbackPageId } : qu
        );
        return {
          ...q,
          pages: remainingPages.map((p, idx) => ({ ...p, pageNumber: idx + 1 })),
          questions: updatedQuestions,
          updatedAt: new Date().toISOString(),
        };
      })
    );
  };

  const addQuestion = (quizId: string, pageId: string, type: QuestionType = 'single_choice') => {
    const newQuestionId = 'q-' + Date.now();
    let defaultOptions: OptionItem[] = [];

    if (type === 'single_choice' || type === 'multiple_choice') {
      defaultOptions = [
        { id: `${newQuestionId}-opt1`, label: 'A', text: 'Pilihan A', isCorrect: true },
        { id: `${newQuestionId}-opt2`, label: 'B', text: 'Pilihan B', isCorrect: false },
        { id: `${newQuestionId}-opt3`, label: 'C', text: 'Pilihan C', isCorrect: false },
        { id: `${newQuestionId}-opt4`, label: 'D', text: 'Pilihan D', isCorrect: false },
      ];
    } else if (type === 'true_false') {
      defaultOptions = [
        { id: `${newQuestionId}-tf-1`, text: 'Benar (True)', isCorrect: true },
        { id: `${newQuestionId}-tf-2`, text: 'Salah (False)', isCorrect: false },
      ];
    }

    const newQuestion: Question = {
      id: newQuestionId,
      type,
      title: 'Tuliskan teks pertanyaan di sini...',
      points: 10,
      isRequired: true,
      pageId,
      explanation: '',
      options: defaultOptions,
      matchingPairs:
        type === 'matching'
          ? [
              { id: 'm1', leftText: 'Konsep A', rightText: 'Definisi A' },
              { id: 'm2', leftText: 'Konsep B', rightText: 'Definisi B' },
              { id: 'm3', leftText: 'Konsep C', rightText: 'Definisi C' },
            ]
          : undefined,
      correctAnswers: type === 'short_answer' || type === 'fill_blank' ? ['jawaban benar'] : undefined,
    };

    setQuizzes((prev) =>
      prev.map((q) => {
        if (q.id !== quizId) return q;
        return {
          ...q,
          questions: [...q.questions, newQuestion],
          updatedAt: new Date().toISOString(),
        };
      })
    );

    return newQuestionId;
  };

  const updateQuestion = (quizId: string, questionId: string, data: Partial<Question>) => {
    setQuizzes((prev) =>
      prev.map((q) => {
        if (q.id !== quizId) return q;
        return {
          ...q,
          questions: q.questions.map((quest) => (quest.id === questionId ? { ...quest, ...data } : quest)),
          updatedAt: new Date().toISOString(),
        };
      })
    );
  };

  const deleteQuestion = (quizId: string, questionId: string) => {
    setQuizzes((prev) =>
      prev.map((q) => {
        if (q.id !== quizId) return q;
        return {
          ...q,
          questions: q.questions.filter((quest) => quest.id !== questionId),
          updatedAt: new Date().toISOString(),
        };
      })
    );
  };

  const duplicateQuestion = (quizId: string, questionId: string) => {
    setQuizzes((prev) =>
      prev.map((q) => {
        if (q.id !== quizId) return q;
        const target = q.questions.find((quest) => quest.id === questionId);
        if (!target) return q;
        const newId = 'q-' + Date.now();
        const clone: Question = {
          ...JSON.parse(JSON.stringify(target)),
          id: newId,
          title: `${target.title} (Salinan)`,
          options: target.options.map((opt, i) => ({
            ...opt,
            id: `${newId}-opt${i + 1}`,
          })),
        };
        const index = q.questions.findIndex((quest) => quest.id === questionId);
        const newQuestions = [...q.questions];
        newQuestions.splice(index + 1, 0, clone);
        return {
          ...q,
          questions: newQuestions,
          updatedAt: new Date().toISOString(),
        };
      })
    );
  };

  const moveQuestion = (quizId: string, questionId: string, direction: 'up' | 'down') => {
    setQuizzes((prev) =>
      prev.map((q) => {
        if (q.id !== quizId) return q;
        const index = q.questions.findIndex((quest) => quest.id === questionId);
        if (index === -1) return q;
        if (direction === 'up' && index === 0) return q;
        if (direction === 'down' && index === q.questions.length - 1) return q;

        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        const newQuestions = [...q.questions];
        const [moved] = newQuestions.splice(index, 1);
        newQuestions.splice(targetIndex, 0, moved);

        return {
          ...q,
          questions: newQuestions,
          updatedAt: new Date().toISOString(),
        };
      })
    );
  };

  const reorderQuestions = (quizId: string, newQuestions: Question[]) => {
    setQuizzes((prev) =>
      prev.map((q) => {
        if (q.id !== quizId) return q;
        return {
          ...q,
          questions: newQuestions,
          updatedAt: new Date().toISOString(),
        };
      })
    );
  };

  const submitQuizResult = (submission: QuizSubmission) => {
    setSubmissions((prev) => [submission, ...prev]);
  };

  const deleteSubmission = (submissionId: string) => {
    setSubmissions((prev) => prev.filter((s) => s.id !== submissionId));
  };

  const clearQuizSubmissions = (quizId: string) => {
    setSubmissions((prev) => prev.filter((s) => s.quizId !== quizId));
  };

  // Sync auth to local storage
  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify(currentUser));
      } else {
        localStorage.removeItem(STORAGE_KEY_AUTH);
      }
    } catch (e) {
      console.error('Failed to save auth user', e);
    }
  }, [currentUser]);

  // Auth Operations
  const login = (email: string, password?: string): boolean => {
    const inputEmail = email.trim().toLowerCase();
    const inputPassword = password?.trim() || '';

    // Check credentials: password must be 12345678
    if (inputPassword !== PRIMARY_INSTRUCTOR.password && inputPassword !== '12345678') {
      return false;
    }

    // If matches primary instructor email or any login attempt with correct password
    if (
      inputEmail === PRIMARY_INSTRUCTOR.email.toLowerCase() ||
      inputEmail.includes('devin') ||
      inputEmail.includes('nuriansyah')
    ) {
      setCurrentUser(PRIMARY_INSTRUCTOR);
      return true;
    }

    // If user provided a specific custom name/email with correct password
    const username = email.split('@')[0] || 'Dosen';
    const formattedName = username
      .split(/[._-]/)
      .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
      .join(' ');

    const loggedUser: AuthUser = {
      id: PRIMARY_INSTRUCTOR.id,
      name: PRIMARY_INSTRUCTOR.name, // Primary requested instructor name
      email: inputEmail || PRIMARY_INSTRUCTOR.email,
      role: 'dosen',
      institution: PRIMARY_INSTRUCTOR.institution,
      joinedAt: PRIMARY_INSTRUCTOR.joinedAt,
    };

    setCurrentUser(loggedUser);
    return true;
  };

  const registerUser = (
    name: string,
    email: string,
    role: 'dosen' | 'guru' | 'instruktur' | 'admin',
    institution?: string
  ): boolean => {
    const newUser: AuthUser = {
      id: 'user-' + Date.now(),
      name: name || PRIMARY_INSTRUCTOR.name,
      email: email || PRIMARY_INSTRUCTOR.email,
      role,
      institution: institution || PRIMARY_INSTRUCTOR.institution,
      joinedAt: new Date().toISOString().split('T')[0],
    };
    setCurrentUser(newUser);
    return true;
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const demoLogin = (_roleType?: string) => {
    setCurrentUser(PRIMARY_INSTRUCTOR);
  };

  const resetToDefaultData = () => {
    setQuizzes([DEFAULT_DATABASE_QUIZ, SAMPLE_MULTI_TYPE_QUIZ]);
    setSubmissions(INITIAL_SUBMISSIONS);
    setActiveQuizId(DEFAULT_DATABASE_QUIZ.id);
    setActiveTab('create');
  };

  const importQuizJson = (jsonString: string): boolean => {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed && parsed.settings && Array.isArray(parsed.questions)) {
        const newId = 'quiz-' + Date.now();
        const imported: Quiz = {
          ...parsed,
          id: newId,
          slug: (parsed.settings.title || 'imported-quiz').toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now().toString().slice(-4),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setQuizzes((prev) => [imported, ...prev]);
        setActiveQuizId(newId);
        return true;
      }
    } catch (err) {
      console.error('Import error', err);
    }
    return false;
  };

  return (
    <QuizContext.Provider
      value={{
        quizzes,
        activeQuizId,
        activeQuiz,
        submissions,
        activeTab,
        appMode,
        takingQuizId,
        currentUser,
        login,
        registerUser,
        logout,
        demoLogin,
        setActiveQuizId,
        setActiveTab,
        setAppMode,
        setTakingQuizId,
        createQuiz,
        updateQuizSettings,
        deleteQuiz,
        duplicateQuiz,
        addPage,
        updatePage,
        deletePage,
        addQuestion,
        updateQuestion,
        deleteQuestion,
        duplicateQuestion,
        moveQuestion,
        reorderQuestions,
        submitQuizResult,
        deleteSubmission,
        clearQuizSubmissions,
        resetToDefaultData,
        importQuizJson,
      }}
    >
      {children}
    </QuizContext.Provider>
  );
};

export const useQuiz = () => {
  const context = useContext(QuizContext);
  if (!context) {
    throw new Error('useQuiz must be used within a QuizProvider');
  }
  return context;
};
