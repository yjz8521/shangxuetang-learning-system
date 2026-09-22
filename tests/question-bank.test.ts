import assert from "node:assert/strict";
import test from "node:test";
import { unitAssessments } from "../app/data/assessments.ts";
import { lessons } from "../app/data/lessons.ts";
import { bankQuestions } from "../app/data/questionBank.ts";
import {
  composeUnitAssessmentQuestions,
  validateQuestionBank,
} from "../app/lib/question-bank.ts";

const lessonQuestionIds = new Set(
  lessons.flatMap((lesson) => lesson.questions.map((question) => question.id)),
);

test("question bank passes every schema quality check", () => {
  assert.deepEqual(validateQuestionBank(bankQuestions, lessons), []);
});

test("bank questions never reuse lesson practice question ids", () => {
  for (const question of bankQuestions) {
    assert.ok(
      !lessonQuestionIds.has(question.id),
      `id ${question.id} collides with a lesson question`,
    );
  }
});

test("every published unit week holds at least ten bank questions on all three paths", () => {
  for (const week of [1, 2, 3, 4, 5, 6, 7, 8]) {
    const pool = bankQuestions.filter((question) => question.week === week);
    assert.ok(pool.length >= 10, `week ${week} has only ${pool.length} bank questions`);
    for (const path of ["economics", "accounting", "business"] as const) {
      assert.ok(
        pool.filter((question) => question.path === path).length >= 2,
        `week ${week} path ${path} has fewer than two bank questions`,
      );
    }
  }
});

test("unit assessments draw only unseen bank questions, never lesson practice", () => {
  for (const assessment of unitAssessments) {
    for (const question of assessment.questions) {
      assert.ok(
        !lessonQuestionIds.has(question.id),
        `assessment ${assessment.id} leaks lesson question ${question.id}`,
      );
      assert.ok(
        bankQuestions.some((item) => item.id === question.id),
        `assessment ${assessment.id} uses unknown question ${question.id}`,
      );
    }
  }
});

test("assessment composition is deterministic and ten questions wide", () => {
  const first = composeUnitAssessmentQuestions(1, bankQuestions);
  const second = composeUnitAssessmentQuestions(1, bankQuestions);
  assert.equal(first.length, 10);
  assert.deepEqual(
    first.map((question) => question.id),
    second.map((question) => question.id),
  );
  assert.deepEqual(
    first.map((question) => question.options),
    second.map((question) => second.find((item) => item.id === question.id)!.options),
  );
});

test("composed assessments do not leak a constant answer position", () => {
  const positions = [1, 2, 3, 4, 5, 6, 7, 8]
    .flatMap((week) => composeUnitAssessmentQuestions(week, bankQuestions))
    .map((question) => question.answer);
  assert.equal(positions.length, 80);
  assert.ok(
    new Set(positions).size >= 3,
    `answer index spread too narrow: ${positions.join(",")}`,
  );
  const maxShare = Math.max(
    ...[0, 1, 2, 3].map((index) => positions.filter((position) => position === index).length),
  );
  assert.ok(maxShare <= 32, `one answer position holds ${maxShare}/80 questions`);
});

test("authored bank options keep the correct answer first and never reference letters", () => {
  for (const question of bankQuestions) {
    assert.equal(
      question.answer,
      0,
      `題庫 authoring 慣例要求正確選項放第 0 欄（位置洗牌由組卷器負責）：${question.id}`,
    );
    assert.ok(
      !/[ABCD]/.test(question.explanation),
      `解析不得出現裸 A/B/C/D 字母（那是選項位置指稱，洗牌後會錯位）：${question.id}`,
    );
  }
});

test("bank pools mix recall, apply and analyze question kinds", () => {
  for (const week of [1, 2, 3, 4, 5, 6, 7, 8]) {
    const kinds = new Set(
      bankQuestions.filter((question) => question.week === week).map((question) => question.kind),
    );
    for (const kind of ["recall", "apply", "analyze"] as const) {
      assert.ok(kinds.has(kind), `week ${week} has no ${kind} questions`);
    }
  }
});

test("every bank explanation justifies why the answer holds", () => {
  for (const question of bankQuestions) {
    assert.ok(
      question.explanation.includes("因為"),
      `question ${question.id} explanation lacks a 因為 justification`,
    );
  }
});
