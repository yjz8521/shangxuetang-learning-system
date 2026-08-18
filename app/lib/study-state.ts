"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type {
  ChoiceQuestion,
  LessonSectionId,
  MistakeRecord,
  ReflectionRecord,
  StudyState,
  UnitAssessment,
} from "./types";
import {
  dateAtDayOffset,
  defaultState,
  mergeStored,
  nextReviewDate,
  REVIEW_INTERVALS,
  STORAGE_KEY,
} from "./study-core";

export { calculateStreak, levelForDays, REVIEW_INTERVALS, STORAGE_KEY } from "./study-core";

export function useStudyState() {
  const [state, setState] = useState<StudyState>(defaultState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      try {
        const stored = window.localStorage.getItem(STORAGE_KEY);
        if (stored) setState(mergeStored(JSON.parse(stored)));
      } catch {
        // A corrupt local record should never block the learner from opening the site.
      }
      setHydrated(true);
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [hydrated, state]);

  const update = useCallback((recipe: (current: StudyState) => StudyState) => {
    setState((current) => recipe(current));
  }, []);

  const startLesson = useCallback((day: number) => {
    update((current) => {
      const key = String(day);
      if (current.lessonStartedAt[key]) return current;
      return {
        ...current,
        lessonStartedAt: {
          ...current.lessonStartedAt,
          [key]: new Date().toISOString(),
        },
      };
    });
  }, [update]);

  const markSection = useCallback(
    (day: number, section: LessonSectionId) => {
      update((current) => {
        const key = String(day);
        const existing = current.sectionProgress[key] ?? [];
        if (existing.includes(section)) return current;
        return {
          ...current,
          sectionProgress: {
            ...current.sectionProgress,
            [key]: [...existing, section],
          },
        };
      });
    },
    [update],
  );

  const answerQuestion = useCallback(
    (day: number, question: ChoiceQuestion, selected: number) => {
      update((current) => {
        const isCorrect = selected === question.answer;
        const withoutQuestion = current.mistakes.filter(
          (item) => item.questionId !== question.id,
        );
        let mistakes = withoutQuestion;

        if (!isCorrect) {
          const previous = current.mistakes.find(
            (item) => item.questionId === question.id,
          );
          const record: MistakeRecord = {
            questionId: question.id,
            day,
            prompt: question.prompt,
            selected: question.options[selected],
            correct: question.options[question.answer],
            explanation: question.explanation,
            concept: question.concept,
            stage: 0,
            dueAt: dateAtDayOffset(new Date(), REVIEW_INTERVALS[0]),
            attempts: (previous?.attempts ?? 0) + 1,
            resolved: false,
          };
          mistakes = [...withoutQuestion, record];
        }

        const reviews = isCorrect
          ? current.reviews
          : [
              ...current.reviews.filter((item) => item.id !== question.id),
              {
                id: question.id,
                concept: question.concept,
                prompt: question.prompt,
                answer: question.options[question.answer],
                explanation: question.explanation,
                sourceDay: day,
                stage: 0,
                startedAt: new Date().toISOString(),
                dueAt: dateAtDayOffset(new Date(), 1),
                retained: false,
              },
            ];
        return {
          ...current,
          answers: { ...current.answers, [question.id]: selected },
          mistakes,
          reviews,
        };
      });
    },
    [update],
  );

  const completeReview = useCallback(
    (reviewId: string, result: "remembered" | "hard" | "forgotten") => {
      update((current) => {
        const target = current.reviews.find((item) => item.id === reviewId);
        if (!target) return current;
        const nextStage =
          result === "remembered"
            ? Math.min(target.stage + 1, REVIEW_INTERVALS.length)
            : result === "hard"
              ? target.stage
              : 0;
        const dueAt = result === "hard"
          ? dateAtDayOffset(new Date(), 1)
          : nextReviewDate(target, nextStage, result);
        let mistakes = current.mistakes.map((item) => {
          if (item.questionId !== reviewId) return item;
          return {
            ...item,
            stage: nextStage,
            dueAt,
            resolved: nextStage >= REVIEW_INTERVALS.length,
          };
        });
        if (result === "forgotten" && !mistakes.some((item) => item.questionId === reviewId)) {
          mistakes = [...mistakes, {
            questionId: reviewId,
            day: target.sourceDay,
            prompt: target.prompt,
            selected: "复习时未能回忆",
            correct: target.answer,
            explanation: target.explanation,
            concept: target.concept,
            stage: 0,
            dueAt: dateAtDayOffset(new Date(), 1),
            attempts: 1,
            resolved: false,
          }];
        }
        return {
          ...current,
          reviewsCompleted: current.reviewsCompleted + 1,
          reviewHistory: {
            ...current.reviewHistory,
            [`${reviewId}-${Date.now()}`]: result,
          },
          mistakes,
          reviews: current.reviews.map((item) => item.id === reviewId ? {
            ...item,
            stage: nextStage,
            dueAt,
            lastResult: result,
            retained: nextStage >= REVIEW_INTERVALS.length,
          } : item),
        };
      });
    },
    [update],
  );

  const saveReflection = useCallback(
    (day: number, reflection: ReflectionRecord) => {
      update((current) => ({
        ...current,
        reflections: { ...current.reflections, [String(day)]: reflection },
      }));
    },
    [update],
  );

  const answerUnitQuiz = useCallback((questionId: string, selected: number) => {
    update((current) => ({
      ...current,
      unitQuizAnswers: {
        ...current.unitQuizAnswers,
        [questionId]: selected,
      },
    }));
  }, [update]);

  const saveUnitQuizCase = useCallback((assessmentId: string, response: string) => {
    update((current) => ({
      ...current,
      unitQuizCaseResponses: {
        ...current.unitQuizCaseResponses,
        [assessmentId]: response,
      },
    }));
  }, [update]);

  const submitUnitQuiz = useCallback((assessment: UnitAssessment) => {
    update((current) => {
      const submittedAt = new Date();
      const assessmentIds = new Set(assessment.questions.map((question) => question.id));
      const wrong = assessment.questions.filter(
        (question) => current.unitQuizAnswers[question.id] !== question.answer,
      );
      const correct = assessment.questions.length - wrong.length;
      const percentage = Math.round((correct / assessment.questions.length) * 100);
      const mastery = percentage >= 90
        ? "掌握稳固"
        : percentage >= 70
          ? "基本掌握"
          : "需要补强";
      const previousMistakes = new Map(
        current.mistakes.map((item) => [item.questionId, item]),
      );
      const newMistakes = wrong.map((question) => ({
        questionId: question.id,
        day: assessment.week * 7,
        prompt: question.prompt,
        selected: question.options[current.unitQuizAnswers[question.id]] ?? "未作答",
        correct: question.options[question.answer],
        explanation: question.explanation,
        concept: question.concept,
        stage: 0,
        dueAt: dateAtDayOffset(submittedAt, 1),
        attempts: (previousMistakes.get(question.id)?.attempts ?? 0) + 1,
        resolved: false,
      }));
      const newReviews = wrong.map((question) => ({
        id: question.id,
        concept: question.concept,
        prompt: question.prompt,
        answer: question.options[question.answer],
        explanation: question.explanation,
        sourceDay: assessment.week * 7,
        startedAt: submittedAt.toISOString(),
        stage: 0,
        dueAt: dateAtDayOffset(submittedAt, 1),
        retained: false,
      }));

      return {
        ...current,
        mistakes: [
          ...current.mistakes.filter((item) => !assessmentIds.has(item.questionId)),
          ...newMistakes,
        ],
        reviews: [
          ...current.reviews.filter((item) => !assessmentIds.has(item.id)),
          ...newReviews,
        ],
        unitQuizResults: {
          ...current.unitQuizResults,
          [assessment.id]: {
            score: correct,
            total: assessment.questions.length,
            mastery,
            caseCompleted: Boolean(current.unitQuizCaseResponses[assessment.id]?.trim()),
            submittedAt: submittedAt.toISOString(),
          },
        },
      };
    });
  }, [update]);

  const resetUnitQuiz = useCallback((assessment: UnitAssessment) => {
    update((current) => {
      const questionIds = new Set(assessment.questions.map((question) => question.id));
      return {
        ...current,
        unitQuizAnswers: Object.fromEntries(
          Object.entries(current.unitQuizAnswers).filter(([id]) => !questionIds.has(id)),
        ),
        unitQuizResults: Object.fromEntries(
          Object.entries(current.unitQuizResults).filter(([id]) => id !== assessment.id),
        ),
      };
    });
  }, [update]);

  const completeDay = useCallback(
    (day: number, duration: number, questions: ChoiceQuestion[]) => {
      update((current) => {
        if (current.completedDays.includes(day)) return current;
        const correct = questions.filter(
          (question) => current.answers[question.id] === question.answer,
        ).length;
        const completedAt = new Date();
        const today = completedAt.toISOString().slice(0, 10);
        const startedAt = current.lessonStartedAt[String(day)];
        const measuredMinutes = startedAt
          ? Math.max(1, Math.round((completedAt.getTime() - new Date(startedAt).getTime()) / 60000))
          : 1;
        const existingReviewIds = new Set(current.reviews.map((item) => item.id));
        const newReviews = questions
          .filter((question) => !existingReviewIds.has(question.id))
          .map((question) => ({
            id: question.id,
            concept: question.concept,
            prompt: question.prompt,
            answer: question.options[question.answer],
            explanation: question.explanation,
            sourceDay: day,
            startedAt: completedAt.toISOString(),
            stage: 0,
            dueAt: dateAtDayOffset(completedAt, 1),
            retained: false,
          }));
        return {
          ...current,
          completedDays: [...current.completedDays, day].sort((a, b) => a - b),
          currentDay: Math.min(Math.max(current.currentDay, day + 1), 365),
          sessions: [
            ...current.sessions,
            { date: today, day, minutes: measuredMinutes, plannedMinutes: duration, correct, total: questions.length },
          ],
          reviews: [...current.reviews, ...newReviews],
        };
      });
    },
    [update],
  );

  const toggleFavorite = useCallback(
    (id: string) => {
      update((current) => ({
        ...current,
        favorites: current.favorites.includes(id)
          ? current.favorites.filter((item) => item !== id)
          : [...current.favorites, id],
      }));
    },
    [update],
  );

  const dueMistakes = useMemo(() => {
    const now = new Date();
    now.setHours(23, 59, 59, 999);
    return state.mistakes.filter(
      (item) => !item.resolved && new Date(item.dueAt) <= now,
    );
  }, [state.mistakes]);

  const dueReviews = useMemo(() => {
    const now = new Date();
    now.setHours(23, 59, 59, 999);
    return state.reviews
      .filter((item) => !item.retained && new Date(item.dueAt) <= now)
      .sort((a, b) => new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime());
  }, [state.reviews]);

  const resetProgress = useCallback(() => {
    setState(defaultState);
  }, []);

  const toggleLanguage = useCallback(() => {
    update((current) => ({
      ...current,
      language: current.language === "zh-CN" ? "zh-TW" : "zh-CN",
    }));
  }, [update]);

  return {
    state,
    hydrated,
    setState,
    markSection,
    startLesson,
    answerQuestion,
    completeReview,
    saveReflection,
    answerUnitQuiz,
    saveUnitQuizCase,
    submitUnitQuiz,
    resetUnitQuiz,
    completeDay,
    toggleFavorite,
    dueMistakes,
    dueReviews,
    resetProgress,
    toggleLanguage,
  };
}
