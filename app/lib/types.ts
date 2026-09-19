export type PathId = "economics" | "accounting" | "business";

export type LessonSectionId =
  | "review"
  | "concept"
  | "case"
  | "practice"
  | "summary";

export interface ChoiceQuestion {
  id: string;
  prompt: string;
  options: string[];
  answer: number;
  explanation: string;
  concept: string;
}

export type QuestionKind = "recall" | "apply" | "analyze";

/** 獨立題庫題目：五維標籤（id／path／week／kind／concept），供組卷與復習調度使用。 */
export interface BankQuestion extends ChoiceQuestion {
  path: PathId;
  week: number;
  kind: QuestionKind;
}

export interface Lesson {
  day: number;
  week: number;
  path: PathId;
  title: string;
  subtitle: string;
  duration: number;
  difficulty: "零基础" | "基础" | "进阶";
  tags: string[];
  objectives: string[];
  prerequisites: string[];
  schedule: Array<{ label: string; minutes: number; detail: string }>;
  socratic: {
    question: string;
    options: string[];
    answer: string;
  };
  core: Array<{ heading: string; paragraphs: string[] }>;
  intuition: string;
  formula?: Array<{ expression: string; explanation: string }>;
  entries?: Array<{ debit: string; credit: string; amount: string; note: string }>;
  example: {
    title: string;
    label: string;
    scenario: string;
    steps: string[];
    conclusion: string;
  };
  applications: string[];
  misconceptions: Array<{ myth: string; correction: string }>;
  questions: ChoiceQuestion[];
  summary: string[];
  extension: string;
  reflectionPrompts: [string, string, string];
  reviewPreview: string;
  visual?: "supply-demand" | "ppf" | "equation" | "statements" | "elasticity" | "t-account";
}

export interface UnitAssessment {
  id: string;
  week: number;
  title: string;
  dayRange: string;
  description: string;
  questions: ChoiceQuestion[];
  caseStudy: {
    title: string;
    label: string;
    scenario: string;
    prompt: string;
    rubric: string[];
    referenceAnswer: string;
  };
}

export interface UnitQuizResult {
  score: number;
  total: number;
  mastery: "需要补强" | "基本掌握" | "掌握稳固";
  caseCompleted: boolean;
  submittedAt: string;
}

export interface CurriculumWeek {
  week: number;
  month: number;
  phase: string;
  level: string;
  economics: string;
  accounting: string;
  business: string;
  outcome: string;
  review?: boolean;
}

export interface MistakeRecord {
  questionId: string;
  day: number;
  prompt: string;
  selected: string;
  correct: string;
  explanation: string;
  concept: string;
  stage: number;
  dueAt: string;
  attempts: number;
  resolved: boolean;
}

export interface ReviewRecord {
  id: string;
  concept: string;
  prompt: string;
  answer: string;
  explanation: string;
  sourceDay: number;
  startedAt: string;
  stage: number;
  dueAt: string;
  lastResult?: "remembered" | "hard" | "forgotten";
  retained: boolean;
}

export interface ReflectionRecord {
  explain: string;
  unclear: string;
  apply: string;
}

export interface StudySession {
  date: string;
  day: number;
  minutes: number;
  plannedMinutes: number;
  correct: number;
  total: number;
}

import type { SiteLanguage } from "./language";

export interface StudyState {
  currentDay: number;
  completedDays: number[];
  sectionProgress: Record<string, LessonSectionId[]>;
  answers: Record<string, number>;
  mistakes: MistakeRecord[];
  reviews: ReviewRecord[];
  favorites: string[];
  reflections: Record<string, ReflectionRecord>;
  sessions: StudySession[];
  reviewsCompleted: number;
  reviewHistory: Record<string, string>;
  newsDrafts: Array<{
    id: string;
    date: string;
    title: string;
    sourceText: string;
    answers: Record<string, string>;
  }>;
  lessonStartedAt: Record<string, string>;
  unitQuizAnswers: Record<string, number>;
  unitQuizCaseResponses: Record<string, string>;
  unitQuizResults: Record<string, UnitQuizResult>;
  language: SiteLanguage;
}

export type ViewId =
  | "dashboard"
  | "paths"
  | "lesson"
  | "curriculum"
  | "reviews"
  | "mistakes"
  | "assessments"
  | "toolkit"
  | "news"
  | "analytics"
  | "search";
