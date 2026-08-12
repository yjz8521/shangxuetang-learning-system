import type {
  ChoiceQuestion,
  ReviewRecord,
  StudyState,
} from "./types";

export const STORAGE_KEY = "shangxue-study-state-v1";
export const REVIEW_INTERVALS = [1, 3, 7, 14, 30] as const;

export const defaultState: StudyState = {
  currentDay: 1,
  completedDays: [],
  sectionProgress: {},
  answers: {},
  mistakes: [],
  reviews: [],
  favorites: [],
  reflections: {},
  sessions: [],
  reviewsCompleted: 0,
  reviewHistory: {},
  newsDrafts: [],
  lessonStartedAt: {},
  unitQuizAnswers: {},
  unitQuizCaseResponses: {},
  unitQuizResults: {},
  language: "zh-CN",
};

export function mergeStored(value: unknown): StudyState {
  if (!value || typeof value !== "object") return defaultState;
  const stored = value as Partial<StudyState>;
  return {
    ...defaultState,
    ...stored,
    reviews: (stored.reviews ?? []).map((review) => ({
      ...review,
      startedAt: review.startedAt ?? dateAtDayOffset(review.dueAt, -1),
    })),
    sessions: (stored.sessions ?? []).map((session) => ({
      ...session,
      plannedMinutes: session.plannedMinutes ?? session.minutes,
    })),
  };
}

export function dateAtDayOffset(baseDate: string | Date, days: number) {
  const date = new Date(baseDate);
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + days);
  return date.toISOString();
}

export function nextReviewDate(
  review: Pick<ReviewRecord, "startedAt">,
  stage: number,
  result: "remembered" | "hard" | "forgotten",
  now = new Date(),
) {
  if (stage >= REVIEW_INTERVALS.length) return dateAtDayOffset(now, 3650);
  if (result === "forgotten") return dateAtDayOffset(now, 1);

  const target = new Date(
    dateAtDayOffset(review.startedAt, REVIEW_INTERVALS[stage]),
  );
  const tomorrow = new Date(dateAtDayOffset(now, 1));
  return (target > tomorrow ? target : tomorrow).toISOString();
}

export function practiceStats(
  lessons: Array<{ questions: ChoiceQuestion[] }>,
  answers: Record<string, number>,
) {
  const questions = lessons.flatMap((lesson) => lesson.questions);
  const answered = questions.filter((question) => answers[question.id] !== undefined);
  const correct = answered.filter(
    (question) => answers[question.id] === question.answer,
  ).length;
  return {
    questionsAnswered: answered.length,
    correct,
    accuracy: answered.length ? Math.round((correct / answered.length) * 100) : null,
  };
}

export function calculateStreak(sessions: StudyState["sessions"]) {
  const dates = new Set(sessions.map((session) => session.date));
  if (!dates.size) return 0;
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);
  const today = cursor.toISOString().slice(0, 10);
  if (!dates.has(today)) cursor.setDate(cursor.getDate() - 1);
  let count = 0;
  while (dates.has(cursor.toISOString().slice(0, 10))) {
    count += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return count;
}

export function levelForDays(days: number) {
  if (days >= 300) return { name: "Business Decision Maker", label: "商业决策者", level: 5 };
  if (days >= 180) return { name: "Analyst", label: "分析者", level: 4 };
  if (days >= 90) return { name: "Applied", label: "应用者", level: 3 };
  if (days >= 30) return { name: "Core", label: "核心学习者", level: 2 };
  return { name: "Foundations", label: "基础构建者", level: 1 };
}
