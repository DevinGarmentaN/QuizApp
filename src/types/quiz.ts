export type QuestionType =
  | 'single_choice'
  | 'multiple_choice'
  | 'true_false'
  | 'short_answer'
  | 'essay'
  | 'matching'
  | 'fill_blank';

export interface OptionItem {
  id: string;
  label?: string; // A, B, C, D, E
  text: string;
  isCorrect: boolean;
  explanation?: string;
  points?: number;
}

export interface MatchingPair {
  id: string;
  leftText: string;
  rightText: string;
}

export interface Question {
  id: string;
  type: QuestionType;
  title: string;
  description?: string;
  points: number;
  isRequired: boolean;
  options: OptionItem[];
  matchingPairs?: MatchingPair[];
  correctAnswers?: string[]; // for short_answer or fill_blank (allowed variations)
  caseSensitive?: boolean;
  explanation?: string;
  hint?: string;
  shuffleOptions?: boolean;
  pageId: string;
  imageUrl?: string;
}

export interface QuizPage {
  id: string;
  pageNumber: number;
  title: string;
  description?: string;
}

export type QuizStatus = 'in_design' | 'published' | 'closed';

export interface QuizSettings {
  title: string;
  description: string;
  category: string;
  author: string;
  status: QuizStatus;
  timeLimitMinutes: number; // 0 = no limit
  passingPercentage: number; // e.g. 70
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  allowReviewAnswers: boolean;
  showScoreImmediately: boolean;
  showCorrectAnswersOnResult: boolean;
  showExplanations: boolean;
  requireRegistration: {
    name: boolean;
    email: boolean;
    studentId: boolean;
    className: boolean;
  };
  accessCodeRequired: boolean;
  accessCode: string;
  maxAttempts: number;
  customMessagePass: string;
  customMessageFail: string;
  themeColor: string;
  headerBannerUrl?: string;
}

export interface Quiz {
  id: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
  settings: QuizSettings;
  pages: QuizPage[];
  questions: Question[];
}

export interface RespondentInfo {
  name: string;
  email?: string;
  studentId?: string;
  className?: string;
}

export interface QuestionResult {
  questionId: string;
  questionTitle: string;
  type: QuestionType;
  userAnswer: any;
  correctAnswerText: string;
  isCorrect: boolean;
  score: number;
  maxScore: number;
  explanation?: string;
}

export interface QuizSubmission {
  id: string;
  quizId: string;
  quizTitle: string;
  respondent: RespondentInfo;
  startedAt: string;
  submittedAt: string;
  durationSeconds: number;
  totalScore: number;
  maxScore: number;
  percentage: number;
  isPassed: boolean;
  results: QuestionResult[];
}
