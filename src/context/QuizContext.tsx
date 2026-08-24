import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  getDocs,
  writeBatch
} from 'firebase/firestore';
import { db, ensureAuth } from '../lib/firebase';
import { Quiz, Question, QuizPage, QuizSettings, QuizSubmission, QuestionType, OptionItem, AuthUser } from '../types/quiz';
import { DEFAULT_DATABASE_QUIZ, SAMPLE_MULTI_TYPE_QUIZ } from '../data/defaultQuizzes';

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
  isCloudSynced: boolean;
  
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
  addQuestion: (quizId: string, pageId: string, type?: QuestionType, initialData?: Partial<Question>) => string;
  addMultipleQuestions: (quizId: string, newQuestions: Question[]) => void;
  updateQuestion: (quizId: string, questionId: string, data: Partial<Question>) => void;
  deleteQuestion: (quizId: string, questionId: string) => void;
  duplicateQuestion: (quizId: string, questionId: string) => void;
  moveQuestion: (quizId: string, questionId: string, direction: 'up' | 'down') => void;
  reorderQuestions: (quizId: string, newQuestions: Question[]) => void;
  
  // Submissions
  submitQuizResult: (submission: QuizSubmission) => Promise<void>;
  deleteSubmission: (submissionId: string) => Promise<void>;
  clearQuizSubmissions: (quizId: string) => Promise<void>;
  
  // Reset & Imports
  resetToDefaultData: () => void;
  clearAppCache: () => void;
  importQuizJson: (jsonString: string) => boolean;
}

const STORAGE_KEY_QUIZZES = 'flexitest_quizzes_v2';
const STORAGE_KEY_AUTH = 'flexitest_auth_user_v1';
const STORAGE_KEY_ACTIVE_QUIZ = 'flexitest_active_quiz_id_v2';
const DUMMY_SUBMISSION_IDS = new Set(['sub-1', 'sub-2', 'sub-3', 'sub-4', 'sub-5', 'sub-6']);

// Helper to sanitize data by removing undefined fields for Firebase Firestore
const sanitizeForFirestore = <T,>(obj: T): T => {
  return JSON.parse(
    JSON.stringify(obj, (_, val) => (val === undefined ? null : val))
  );
};

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

  const [submissions, setSubmissions] = useState<QuizSubmission[]>([]);
  const [activeQuizId, setActiveQuizIdState] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ACTIVE_QUIZ);
      if (saved) return saved;
    } catch (e) {}
    return DEFAULT_DATABASE_QUIZ.id;
  });

  const setActiveQuizId = (id: string) => {
    setActiveQuizIdState(id);
    try {
      localStorage.setItem(STORAGE_KEY_ACTIVE_QUIZ, id);
    } catch (e) {}
  };

  const [activeTab, setActiveTab] = useState<'create' | 'configure' | 'publish' | 'analyze' | 'preview'>('create');
  const [appMode, setAppMode] = useState<'admin' | 'taker'>('admin');
  const [takingQuizId, setTakingQuizId] = useState<string | null>(null);
  const [isCloudSynced, setIsCloudSynced] = useState<boolean>(false);

  // Initialize Anonymous Firebase Auth
  useEffect(() => {
    ensureAuth();
  }, []);

  // Sync Submissions from Cloud Firestore in Real-time across all devices!
  useEffect(() => {
    const submissionsRef = collection(db, 'submissions');
    const q = query(submissionsRef, orderBy('submittedAt', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const cloudSubmissions: QuizSubmission[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as QuizSubmission;
          if (data && !DUMMY_SUBMISSION_IDS.has(data.id)) {
            cloudSubmissions.push(data);
          }
        });
        setSubmissions(cloudSubmissions);
        setIsCloudSynced(true);
      },
      (error) => {
        console.error('Real-time submissions sync error:', error);
        // Fallback gracefully to read collection directly if index sorting encounters issue
        getDocs(submissionsRef).then((snap) => {
          const fallbackList: QuizSubmission[] = [];
          snap.forEach((d) => {
            const data = d.data() as QuizSubmission;
            if (data && !DUMMY_SUBMISSION_IDS.has(data.id)) {
              fallbackList.push(data);
            }
          });
          fallbackList.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
          setSubmissions(fallbackList);
          setIsCloudSynced(true);
        }).catch((err) => {
          console.warn('Fallback submissions query failed:', err);
        });
      }
    );

    return () => unsubscribe();
  }, []);

  // Sync Quizzes from Cloud Firestore so quizzes created or edited appear instantly on all devices
  useEffect(() => {
    const quizzesRef = collection(db, 'quizzes');
    let isInitialLoad = true;

    const unsubscribe = onSnapshot(
      quizzesRef,
      (snapshot) => {
        if (!snapshot.empty) {
          const cloudQuizzes: Quiz[] = [];
          snapshot.forEach((docSnap) => {
            const qData = docSnap.data() as Quiz;
            if (qData && qData.id) {
              cloudQuizzes.push(qData);
            }
          });
          if (cloudQuizzes.length > 0) {
            // Sort by updatedAt descending so newly edited quizzes stay on top
            cloudQuizzes.sort((a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime());
            setQuizzes(cloudQuizzes);

            // Keep activeQuizId valid
            setActiveQuizIdState((currentId) => {
              if (cloudQuizzes.some((q) => q.id === currentId)) {
                return currentId;
              }
              return cloudQuizzes[0].id;
            });
          }
        } else if (isInitialLoad) {
          // If Firestore quizzes collection is empty, seed initial default quizzes to cloud
          const seedBatch = async () => {
            try {
              await setDoc(doc(db, 'quizzes', DEFAULT_DATABASE_QUIZ.id), sanitizeForFirestore(DEFAULT_DATABASE_QUIZ));
              await setDoc(doc(db, 'quizzes', SAMPLE_MULTI_TYPE_QUIZ.id), sanitizeForFirestore(SAMPLE_MULTI_TYPE_QUIZ));
            } catch (err) {
              console.warn('Error seeding default quizzes to Firestore:', err);
            }
          };
          seedBatch();
        }
        isInitialLoad = false;
      },
      (error) => {
        console.warn('Quizzes sync warning:', error);
      }
    );

    return () => unsubscribe();
  }, []);

  // Sync to local storage as fallback
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_QUIZZES, JSON.stringify(quizzes));
    } catch (e) {
      console.error('Failed to save quizzes', e);
    }
  }, [quizzes]);

  // Helper to persist quiz update to Cloud Firestore safely
  const persistQuizToCloud = async (quizToSave: Quiz) => {
    try {
      await ensureAuth();
      const sanitized = sanitizeForFirestore(quizToSave);
      await setDoc(doc(db, 'quizzes', quizToSave.id), sanitized, { merge: true });
    } catch (e) {
      console.error('Could not persist quiz to Firestore:', e);
    }
  };

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
    persistQuizToCloud(newQuiz);
    return newId;
  };

  const updateQuizSettings = (quizId: string, settingsUpdate: Partial<QuizSettings>) => {
    setQuizzes((prev) =>
      prev.map((q) => {
        if (q.id === quizId) {
          const updated: Quiz = {
            ...q,
            updatedAt: new Date().toISOString(),
            settings: { ...q.settings, ...settingsUpdate },
          };
          persistQuizToCloud(updated);
          return updated;
        }
        return q;
      })
    );
  };

  const deleteQuiz = async (quizId: string) => {
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

    try {
      await deleteDoc(doc(db, 'quizzes', quizId));
    } catch (e) {
      console.warn('Error deleting quiz from cloud:', e);
    }
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
    persistQuizToCloud(cloned);
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
        const updated: Quiz = {
          ...q,
          pages: [...q.pages, newPage],
          updatedAt: new Date().toISOString(),
        };
        persistQuizToCloud(updated);
        return updated;
      })
    );
  };

  const updatePage = (quizId: string, pageId: string, data: Partial<QuizPage>) => {
    setQuizzes((prev) =>
      prev.map((q) => {
        if (q.id !== quizId) return q;
        const updated: Quiz = {
          ...q,
          pages: q.pages.map((p) => (p.id === pageId ? { ...p, ...data } : p)),
          updatedAt: new Date().toISOString(),
        };
        persistQuizToCloud(updated);
        return updated;
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
        const updated: Quiz = {
          ...q,
          pages: remainingPages.map((p, idx) => ({ ...p, pageNumber: idx + 1 })),
          questions: updatedQuestions,
          updatedAt: new Date().toISOString(),
        };
        persistQuizToCloud(updated);
        return updated;
      })
    );
  };

  const addQuestion = (
    quizId: string,
    pageId: string,
    type: QuestionType = 'single_choice',
    initialData?: Partial<Question>
  ) => {
    const newQuestionId = initialData?.id || 'q-' + Date.now();
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

    const questionType = initialData?.type || type;
    const newQuestion: Question = {
      id: newQuestionId,
      type: questionType,
      title: initialData?.title || 'Tuliskan teks pertanyaan di sini...',
      description: initialData?.description || '',
      points: initialData?.points !== undefined ? Number(initialData.points) : 10,
      isRequired: initialData?.isRequired !== undefined ? initialData.isRequired : true,
      pageId,
      explanation: initialData?.explanation || '',
      hint: initialData?.hint || '',
      shuffleOptions: initialData?.shuffleOptions ?? false,
      caseSensitive: initialData?.caseSensitive ?? false,
      options: initialData?.options && initialData.options.length > 0 ? initialData.options : defaultOptions,
      matchingPairs:
        questionType === 'matching'
          ? (initialData?.matchingPairs || [
              { id: 'm1', leftText: 'Konsep A', rightText: 'Definisi A' },
              { id: 'm2', leftText: 'Konsep B', rightText: 'Definisi B' },
              { id: 'm3', leftText: 'Konsep C', rightText: 'Definisi C' },
            ])
          : undefined,
      correctAnswers:
        questionType === 'short_answer' || questionType === 'fill_blank'
          ? (initialData?.correctAnswers || ['jawaban benar'])
          : undefined,
    };

    setQuizzes((prev) =>
      prev.map((q) => {
        if (q.id !== quizId) return q;
        const updated: Quiz = {
          ...q,
          questions: [...q.questions, newQuestion],
          updatedAt: new Date().toISOString(),
        };
        persistQuizToCloud(updated);
        return updated;
      })
    );

    return newQuestionId;
  };

  const addMultipleQuestions = (quizId: string, newQuestions: Question[]) => {
    setQuizzes((prev) =>
      prev.map((q) => {
        if (q.id !== quizId) return q;
        const updated: Quiz = {
          ...q,
          questions: [...q.questions, ...newQuestions],
          updatedAt: new Date().toISOString(),
        };
        persistQuizToCloud(updated);
        return updated;
      })
    );
  };

  const updateQuestion = (quizId: string, questionId: string, data: Partial<Question>) => {
    setQuizzes((prev) =>
      prev.map((q) => {
        if (q.id !== quizId) return q;
        const updated: Quiz = {
          ...q,
          questions: q.questions.map((quest) => (quest.id === questionId ? { ...quest, ...data } : quest)),
          updatedAt: new Date().toISOString(),
        };
        persistQuizToCloud(updated);
        return updated;
      })
    );
  };

  const deleteQuestion = (quizId: string, questionId: string) => {
    setQuizzes((prev) =>
      prev.map((q) => {
        if (q.id !== quizId) return q;
        const updated: Quiz = {
          ...q,
          questions: q.questions.filter((quest) => quest.id !== questionId),
          updatedAt: new Date().toISOString(),
        };
        persistQuizToCloud(updated);
        return updated;
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
        const updated: Quiz = {
          ...q,
          questions: newQuestions,
          updatedAt: new Date().toISOString(),
        };
        persistQuizToCloud(updated);
        return updated;
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

        const updated: Quiz = {
          ...q,
          questions: newQuestions,
          updatedAt: new Date().toISOString(),
        };
        persistQuizToCloud(updated);
        return updated;
      })
    );
  };

  const reorderQuestions = (quizId: string, newQuestions: Question[]) => {
    setQuizzes((prev) =>
      prev.map((q) => {
        if (q.id !== quizId) return q;
        const updated: Quiz = {
          ...q,
          questions: newQuestions,
          updatedAt: new Date().toISOString(),
        };
        persistQuizToCloud(updated);
        return updated;
      })
    );
  };

  // Submit Result directly to Firebase Cloud Firestore for instant cross-device synchronization
  const submitQuizResult = async (submission: QuizSubmission) => {
    // 1. Optimistic local update
    setSubmissions((prev) => [submission, ...prev.filter((s) => s.id !== submission.id)]);

    // 2. Persist to Firestore
    try {
      await ensureAuth();
      const sanitized = sanitizeForFirestore(submission);
      const submissionDocRef = doc(db, 'submissions', submission.id);
      await setDoc(submissionDocRef, sanitized);
    } catch (err) {
      console.error('Error submitting quiz result to Firebase Firestore:', err);
    }
  };

  const deleteSubmission = async (submissionId: string) => {
    setSubmissions((prev) => prev.filter((s) => s.id !== submissionId));
    try {
      await deleteDoc(doc(db, 'submissions', submissionId));
    } catch (err) {
      console.error('Error deleting submission from Firestore:', err);
    }
  };

  const clearQuizSubmissions = async (quizId: string) => {
    const targetSubmissions = submissions.filter((s) => s.quizId === quizId);
    setSubmissions((prev) => prev.filter((s) => s.quizId !== quizId));

    try {
      const batch = writeBatch(db);
      targetSubmissions.forEach((sub) => {
        const ref = doc(db, 'submissions', sub.id);
        batch.delete(ref);
      });
      await batch.commit();
    } catch (err) {
      console.error('Error clearing quiz submissions from Firestore:', err);
    }
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
      name: PRIMARY_INSTRUCTOR.name,
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
    setActiveQuizId(DEFAULT_DATABASE_QUIZ.id);
    setActiveTab('create');
  };

  const clearAppCache = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
      if ('caches' in window) {
        caches.keys().then((names) => {
          names.forEach((name) => caches.delete(name));
        });
      }
    } catch (e) {
      console.warn('Cache clearing error:', e);
    }
    setQuizzes([DEFAULT_DATABASE_QUIZ, SAMPLE_MULTI_TYPE_QUIZ]);
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
        persistQuizToCloud(imported);
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
        isCloudSynced,
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
        addMultipleQuestions,
        updateQuestion,
        deleteQuestion,
        duplicateQuestion,
        moveQuestion,
        reorderQuestions,
        submitQuizResult,
        deleteSubmission,
        clearQuizSubmissions,
        resetToDefaultData,
        clearAppCache,
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
