import assert from "node:assert/strict";
import test from "node:test";
import { unitAssessments } from "../app/data/assessments.ts";
import { curriculumWeeks } from "../app/data/curriculum.ts";
import { lessons } from "../app/data/lessons.ts";
import {
  mergeStored,
  nextReviewDate,
  practiceStats,
  REVIEW_INTERVALS,
} from "../app/lib/study-core.ts";
import { convertChineseText } from "../app/lib/language.ts";

test("publishes seventy substantive 60–90 minute lessons across ten weeks", () => {
  assert.equal(lessons.length, 70);
  assert.deepEqual(lessons.map((lesson) => lesson.day), Array.from({ length: 70 }, (_, index) => index + 1));
  for (const week of [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]) {
    assert.equal(
      lessons.filter((lesson) => lesson.week === week).length,
      7,
      `week ${week} must hold exactly seven lessons (Day ${(week - 1) * 7 + 1}–${week * 7})`,
    );
  }
  for (const lesson of lessons) {
    assert.equal(lesson.week, Math.ceil(lesson.day / 7));
    assert.ok(lesson.duration >= 60 && lesson.duration <= 90);
    assert.equal(lesson.schedule.reduce((sum, stage) => sum + stage.minutes, 0), lesson.duration);
    assert.ok(lesson.objectives.length >= 3);
    assert.ok(lesson.prerequisites.length >= 1);
    assert.ok(lesson.core.length >= 3);
    assert.ok(lesson.applications.length >= 3);
    assert.ok(lesson.misconceptions.length >= 2);
    assert.ok(lesson.questions.length >= 3);
    assert.equal(lesson.reflectionPrompts.length, 3);
    assert.match(lesson.example.label, /模拟/);
  }
});

test("provides ten complete unit assessments with ten questions and a case", () => {
  assert.equal(unitAssessments.length, 10);
  const ids = new Set<string>();
  for (const assessment of unitAssessments) {
    assert.equal(assessment.questions.length, 10);
    assert.ok(assessment.caseStudy.prompt.length > 40);
    assert.equal(assessment.caseStudy.rubric.length, 3);
    assert.match(assessment.caseStudy.label, /模拟/);
    for (const question of assessment.questions) {
      assert.ok(!ids.has(question.id));
      ids.add(question.id);
    }
  }
});

test("maps fifty-two weeks and schedules each fourth week for review", () => {
  assert.equal(curriculumWeeks.length, 52);
  assert.deepEqual(
    curriculumWeeks.filter((week) => week.review).map((week) => week.week),
    Array.from({ length: 13 }, (_, index) => (index + 1) * 4),
  );
});

test("practice accuracy ignores Socratic answers", () => {
  const firstQuestion = lessons[0].questions[0];
  const stats = practiceStats(lessons, {
    [firstQuestion.id]: firstQuestion.answer,
    "d1-socratic": 0,
  });
  assert.deepEqual(stats, { questionsAnswered: 1, correct: 1, accuracy: 100 });
});

test("review dates use absolute 1, 3, 7, 14, 30-day nodes", () => {
  assert.deepEqual(REVIEW_INTERVALS, [1, 3, 7, 14, 30]);
  const review = { startedAt: "2026-01-01T12:00:00" };
  const due = nextReviewDate(review, 1, "remembered", new Date("2026-01-02T12:00:00"));
  const dueDate = new Date(due);
  assert.deepEqual(
    [dueDate.getFullYear(), dueDate.getMonth() + 1, dueDate.getDate()],
    [2026, 1, 4],
  );
});

test("older local records receive every current state collection", () => {
  const merged = mergeStored({ currentDay: 3 });
  assert.equal(merged.currentDay, 3);
  assert.deepEqual(merged.lessonStartedAt, {});
  assert.deepEqual(merged.unitQuizAnswers, {});
  assert.deepEqual(merged.unitQuizCaseResponses, {});
  assert.deepEqual(merged.unitQuizResults, {});
});

test("converts simplified and traditional Chinese with the selected language", () => {
  const simplified = "经济学与会计学：学习、应用与选择";
  const traditional = "經濟學與會計學：學習、應用與選擇";
  assert.equal(convertChineseText(simplified, "zh-TW"), traditional);
  assert.equal(convertChineseText(traditional, "zh-CN"), simplified);
});
