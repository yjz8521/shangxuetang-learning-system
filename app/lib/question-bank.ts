import type { BankQuestion, Lesson, PathId, QuestionKind } from "./types";

const PATHS: PathId[] = ["economics", "accounting", "business"];
const KINDS: QuestionKind[] = ["recall", "apply", "analyze"];
export const QUESTIONS_PER_UNIT = 10;

/**
 * 題庫層的唯一品質守門：結構性規則全部在這裡，
 * 回傳問題清單（空陣列 = 通過）。語義品質由測試與獨立解題審查把關。
 */
export function validateQuestionBank(bank: BankQuestion[], lessons: Lesson[]): string[] {
  const issues: string[] = [];
  const lessonIds = new Set(
    lessons.flatMap((lesson) => lesson.questions.map((question) => question.id)),
  );
  const seenIds = new Set<string>();
  const seenPrompts = new Set<string>();

  bank.forEach((question, index) => {
    const where = `#${index} (${question.id || "無 id"})`;
    if (!question.id) issues.push(`${where} id 為空`);
    if (seenIds.has(question.id)) issues.push(`${where} id 在題庫內重複`);
    seenIds.add(question.id);
    if (lessonIds.has(question.id)) issues.push(`${where} id 與課內練習題衝突`);
    const promptKey = question.prompt.trim();
    if (!promptKey) issues.push(`${where} 题干為空`);
    if (seenPrompts.has(promptKey)) issues.push(`${where} 题干與其他題重複`);
    seenPrompts.add(promptKey);
    if (!question.concept?.trim()) issues.push(`${where} 缺少知識點標籤`);
    if (!question.explanation?.trim()) issues.push(`${where} 缺少解析`);
    if (!PATHS.includes(question.path)) issues.push(`${where} path 非法：${question.path}`);
    if (!KINDS.includes(question.kind)) issues.push(`${where} kind 非法：${question.kind}`);
    if (!Number.isInteger(question.week) || question.week < 1 || question.week > 52) {
      issues.push(`${where} week 必須是 1–52 的整數：${question.week}`);
    }
    if (!Array.isArray(question.options) || question.options.length !== 4) {
      issues.push(`${where} 選項必須恰好 4 個`);
    } else if (question.options.some((option) => !option?.trim())) {
      issues.push(`${where} 存在空選項`);
    }
    if (!Number.isInteger(question.answer) || question.answer < 0 || question.answer > 3) {
      issues.push(`${where} answer 必須是 0–3 的整數：${question.answer}`);
    }
  });

  return issues;
}

/**
 * 按週確定性組卷：題池依 id 排序後均勻取 10 題，再對每題做
 * 確定性位置旋轉——authoring 慣例是「正確選項放第 0 欄」，
 * 這裡依 id 雜湊把它轉到 0–3 某個位置，防止「全选 A」攻略。
 * 相同輸入永遠得到相同輸出（無隨機數），測驗可重現、測試可斷言。
 */
export function composeUnitAssessmentQuestions(
  week: number,
  bank: BankQuestion[],
): BankQuestion[] {
  const pool = bank
    .filter((question) => question.week === week)
    .sort((left, right) => (left.id < right.id ? -1 : left.id > right.id ? 1 : 0));

  const count = Math.min(QUESTIONS_PER_UNIT, pool.length);
  const picked: BankQuestion[] = [];
  const used = new Set<number>();
  for (let position = 0; position < count; position += 1) {
    let index = Math.round((position * (pool.length - 1)) / Math.max(count - 1, 1));
    while (used.has(index)) index = (index + 1) % pool.length;
    used.add(index);
    picked.push(rotatedForPosition(pool[index]));
  }
  return picked;
}

/** 依 id 穩定雜湊決定正確答案落點；其餘選項保持 authoring 時的相對順序。 */
function rotatedForPosition(question: BankQuestion): BankQuestion {
  const target = hashCode(question.id) % question.options.length;
  if (target === question.answer) return { ...question };
  const correct = question.options[question.answer];
  const rest = question.options.filter((_, index) => index !== question.answer);
  const options = [...rest];
  options.splice(target, 0, correct);
  return { ...question, options, answer: target };
}

function hashCode(value: string): number {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) % 997;
  }
  return hash;
}
