"use client";

import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Bookmark,
  BookmarkCheck,
  BrainCircuit,
  BriefcaseBusiness,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  Clock3,
  GraduationCap,
  Lightbulb,
  ListChecks,
  MessageCircleQuestion,
  NotebookPen,
  RotateCcw,
  Sparkles,
  Target,
  Trophy,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { LessonSectionId, ViewId } from "../lib/types";
import type { Lesson } from "../lib/types";
import type { StudyController } from "./LearningApp";
import { pathMeta } from "./LearningApp";
import { lessons } from "../data/lessons";
import { unitAssessments } from "../data/assessments";
import { ConceptCanvas } from "./ConceptCanvas";

const sectionIds: LessonSectionId[] = ["review", "concept", "case", "practice", "summary"];
const sectionIcons = [RotateCcw, BookOpen, BriefcaseBusiness, ListChecks, NotebookPen];

export function LessonPlayer({ lesson, study, openLesson, navigate }: { lesson: Lesson; study: StudyController; openLesson: (day: number) => void; navigate: (view: ViewId) => void }) {
  const { startLesson } = study;
  const completedSections = study.state.sectionProgress[String(lesson.day)] ?? [];
  const initialIndex = Math.min(completedSections.length, 4);
  const [sectionIndex, setSectionIndex] = useState(initialIndex);
  const [socraticChoice, setSocraticChoice] = useState<number | null>(null);
  const [socraticSubmitted, setSocraticSubmitted] = useState(false);
  const [reflection, setReflection] = useState(() => study.state.reflections[String(lesson.day)] ?? { explain: "", unclear: "", apply: "" });
  const [completionMessage, setCompletionMessage] = useState("");
  const meta = pathMeta[lesson.path];
  const favorited = study.state.favorites.includes(`lesson-${lesson.day}`);
  const answeredCount = lesson.questions.filter((question) => study.state.answers[question.id] !== undefined).length;
  const progress = Math.round((completedSections.length / 5) * 100);
  const reflectionComplete = Boolean(reflection.explain.trim() && reflection.unclear.trim() && reflection.apply.trim());
  const lessonComplete = study.state.completedDays.includes(lesson.day);

  useEffect(() => {
    startLesson(lesson.day);
  }, [lesson.day, startLesson]);

  const socraticQuestion = useMemo(() => ({
    id: `d${lesson.day}-socratic`,
    prompt: lesson.socratic.question,
    options: lesson.socratic.options,
    answer: Math.max(0, lesson.socratic.options.indexOf(lesson.socratic.answer)),
    explanation: `正确判断：${lesson.socratic.answer}。${lesson.intuition}`,
    concept: lesson.tags[0],
  }), [lesson]);

  function continueTo(next: number) {
    study.markSection(lesson.day, sectionIds[sectionIndex]);
    setSectionIndex(Math.min(4, next));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function submitSocratic() {
    if (socraticChoice === null) return;
    study.answerQuestion(lesson.day, socraticQuestion, socraticChoice);
    setSocraticSubmitted(true);
  }

  function finishLesson() {
    if (answeredCount < lesson.questions.length) {
      setCompletionMessage("请先完成所有练习题；每次判断都会帮助系统安排复习。");
      return;
    }
    if (!reflectionComplete) {
      setCompletionMessage("请先完成三个反思问题。写下不懂的地方也是有效学习证据。");
      return;
    }
    study.saveReflection(lesson.day, reflection);
    study.markSection(lesson.day, "summary");
    study.completeDay(lesson.day, lesson.duration, lesson.questions);
    setCompletionMessage("课程已完成。核心题目将在明天进入第一次间隔复习；学习记录采用本次实际开启至完成的时长。 ");
  }

  function changeSection(index: number) {
    setSectionIndex(index);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className={`lesson-player path-${meta.color}`}>
      <div className="lesson-topline">
        <button className="back-link" type="button" onClick={() => navigate("dashboard")}><ArrowLeft size={17} /> 返回学习首页</button>
        <div className="lesson-top-actions">
          <span><Clock3 size={16} /> 计划 {lesson.duration} 分钟</span>
          <button type="button" className={favorited ? "favorite active" : "favorite"} onClick={() => study.toggleFavorite(`lesson-${lesson.day}`)}>{favorited ? <BookmarkCheck size={17} /> : <Bookmark size={17} />}{favorited ? "已收藏" : "收藏课程"}</button>
        </div>
      </div>

      <header className="lesson-header">
        <div className="lesson-header-copy">
          <div className="lesson-kicker"><span>DAY {lesson.day}</span><em className={`path-pill ${meta.color}`}>{meta.label}</em><small>第 {lesson.week} 周 · {lesson.difficulty}</small></div>
          <h1>{lesson.title}</h1>
          <p>{lesson.subtitle}</p>
          <div className="lesson-tag-row">{lesson.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
        </div>
        <div className="lesson-progress-box">
          <div><span>课程进度</span><strong>{progress}%</strong></div>
          <div className="progress-track"><span style={{ width: `${progress}%` }} /></div>
          <small>{completedSections.length}/5 个学习阶段</small>
        </div>
      </header>

      <div className="lesson-layout">
        <aside className="lesson-section-nav" aria-label="课程阶段">
          <span className="eyebrow">今日学习流程</span>
          {lesson.schedule.map((item, index) => {
            const Icon = sectionIcons[index];
            const done = completedSections.includes(sectionIds[index]);
            return (
              <button type="button" key={item.label} className={`${index === sectionIndex ? "active" : ""} ${done ? "done" : ""}`} onClick={() => changeSection(index)}>
                <span>{done ? <Check size={16} /> : <Icon size={17} />}</span>
                <div><strong>{item.label}</strong><small>{item.minutes} 分钟</small></div>
                {index === sectionIndex && <ChevronRight size={15} />}
              </button>
            );
          })}
          <div className="lesson-time-plan">
            <Clock3 size={18} /><div><strong>目标 60–90 分钟</strong><small>计划时长 {lesson.duration} 分钟；完成时记录本次实际学习时长。</small></div>
          </div>
        </aside>

        <article className="lesson-content">
          {sectionIndex === 0 && (
            <section className="lesson-section">
              <SectionHeading number="01" eyebrow="RECALL & DIAGNOSE" title="温故与诊断" description={lesson.schedule[0].detail} />
              <div className="objectives-grid">
                <div><span className="section-icon teal"><Target size={21} /></span><h3>学习目标</h3><ul>{lesson.objectives.map((objective) => <li key={objective}><Check size={15} /> {objective}</li>)}</ul></div>
                <div><span className="section-icon blue"><GraduationCap size={21} /></span><h3>前置知识</h3><ul>{lesson.prerequisites.map((item) => <li key={item}><ChevronRight size={15} /> {item}</li>)}</ul></div>
              </div>
              <div className="socratic-card">
                <div className="socratic-label"><MessageCircleQuestion size={19} /><span>苏格拉底模式 · 先判断，再看解释</span></div>
                <h2>{lesson.socratic.question}</h2>
                <p>先依据直觉选择。答错不会扣分，而会成为后续复习线索。</p>
                <div className="socratic-options">
                  {lesson.socratic.options.map((option, index) => (
                    <button key={option} type="button" className={`${socraticChoice === index ? "selected" : ""} ${socraticSubmitted ? index === socraticQuestion.answer ? "correct" : socraticChoice === index ? "incorrect" : "" : ""}`} onClick={() => !socraticSubmitted && setSocraticChoice(index)} disabled={socraticSubmitted}>
                      <span>{String.fromCharCode(65 + index)}</span>{option}{socraticSubmitted && index === socraticQuestion.answer && <CheckCircle2 size={18} />}
                    </button>
                  ))}
                </div>
                {!socraticSubmitted ? <button className="primary-button" type="button" onClick={submitSocratic} disabled={socraticChoice === null}>提交判断</button> : <div className={`socratic-feedback ${socraticChoice === socraticQuestion.answer ? "correct" : "incorrect"}`} aria-live="polite"><strong>{socraticChoice === socraticQuestion.answer ? "判断正确" : "先保留这个错误，它很有价值"}</strong><p>{socraticQuestion.explanation}</p>{socraticChoice !== socraticQuestion.answer && <small>这道判断已进入错题本，并安排明日复习。</small>}</div>}
              </div>
              <SectionFooter onNext={() => continueTo(1)} next="进入核心概念" />
            </section>
          )}

          {sectionIndex === 1 && (
            <section className="lesson-section">
              <SectionHeading number="02" eyebrow="CORE CONCEPT" title="核心概念" description={lesson.schedule[1].detail} />
              {lesson.core.map((block, index) => <div className="content-block" key={block.heading}><span className="content-block-number">{String(index + 1).padStart(2, "0")}</span><div><h2>{block.heading}</h2>{block.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div></div>)}
              <div className="intuition-box"><span><Lightbulb size={21} /></span><div><strong>直觉解释</strong><p>{lesson.intuition}</p></div></div>
              {lesson.formula && <div className="formula-section"><span className="eyebrow">FORMULA</span><h2>公式与判断方式</h2>{lesson.formula.map((item) => <div className="lesson-formula" key={item.expression}><strong>{item.expression}</strong><p>{item.explanation}</p></div>)}</div>}
              {lesson.entries && <div className="entry-section"><span className="eyebrow">JOURNAL ENTRY</span><h2>会计分录</h2><div className="entry-table" role="table" aria-label="会计分录"><div role="row" className="entry-head"><span>借方科目</span><span>贷方科目</span><span>金额</span><span>说明</span></div>{lesson.entries.map((entry, index) => <div role="row" key={`${entry.debit}-${index}`}><span><em>借</em>{entry.debit}</span><span><em>贷</em>{entry.credit}</span><strong>{entry.amount}</strong><small>{entry.note}</small></div>)}</div></div>}
              <SectionFooter onBack={() => changeSection(0)} onNext={() => continueTo(2)} next="进入案例与图表" />
            </section>
          )}

          {sectionIndex === 2 && (
            <section className="lesson-section">
              <SectionHeading number="03" eyebrow="CASE & VISUAL" title="案例与图表" description={lesson.schedule[2].detail} />
              <div className="simulation-disclosure"><Sparkles size={18} /><span><strong>{lesson.example.label}</strong> 本案例、公司名称与数字均为教学模拟，不代表任何现实公司或市场事实。</span></div>
              <div className="case-study">
                <div className="case-heading"><span>案例</span><div><small>海桥贸易教学案例库</small><h2>{lesson.example.title}</h2></div></div>
                <p className="case-scenario">{lesson.example.scenario}</p>
                <ol>{lesson.example.steps.map((step) => <li key={step}><span>{String(lesson.example.steps.indexOf(step) + 1).padStart(2, "0")}</span><p>{step}</p></li>)}</ol>
                <div className="case-conclusion"><strong>经营结论</strong><p>{lesson.example.conclusion}</p></div>
              </div>
              {lesson.visual && <div className="lesson-visual"><div><span className="eyebrow">TEACHING VISUAL</span><h2>把因果关系画出来</h2><p>先读坐标或结构，再解释变化方向。图中数值均为教学示意。</p></div><ConceptCanvas type={lesson.visual} className="concept-canvas" /></div>}
              <div className="applications-section"><span className="eyebrow">BUSINESS & SOCIETY</span><h2>如何用于商业与社会</h2><div>{lesson.applications.map((item, index) => <article key={item}><span>0{index + 1}</span><p>{item}</p></article>)}</div></div>
              <SectionFooter onBack={() => changeSection(1)} onNext={() => continueTo(3)} next="开始练习" />
            </section>
          )}

          {sectionIndex === 3 && (
            <section className="lesson-section">
              <SectionHeading number="04" eyebrow="PRACTICE" title="练习与答案解析" description={`${lesson.schedule[3].detail} · 已完成 ${answeredCount}/${lesson.questions.length} 题`} />
              <div className="practice-intro"><BrainCircuit size={21} /><p>每题必须先作答，才会显示答案与解析。答错会自动进入错题本与复习池。</p></div>
              <div className="question-list">
                {lesson.questions.map((question, questionIndex) => {
                  const selected = study.state.answers[question.id];
                  const answered = selected !== undefined;
                  const correct = selected === question.answer;
                  return (
                    <div className={`question-card ${answered ? correct ? "answered-correct" : "answered-incorrect" : ""}`} key={question.id}>
                      <div className="question-number"><span>题目 {questionIndex + 1}</span><em>{question.concept}</em></div>
                      <h2>{question.prompt}</h2>
                      <div className="question-options">
                        {question.options.map((option, index) => (
                          <button type="button" key={option} disabled={answered} className={`${answered && index === question.answer ? "correct" : ""} ${answered && selected === index && index !== question.answer ? "incorrect" : ""}`} onClick={() => study.answerQuestion(lesson.day, question, index)}><span>{String.fromCharCode(65 + index)}</span>{option}{answered && index === question.answer && <CheckCircle2 size={17} />}</button>
                        ))}
                      </div>
                      {answered && <div className={`answer-explanation ${correct ? "correct" : "incorrect"}`} aria-live="polite"><strong>{correct ? <><CheckCircle2 size={17} /> 回答正确</> : <><CircleAlert size={17} /> 回答不正确</>}</strong><p>{question.explanation}</p>{!correct && <small>已加入错题本，并安排明日第一次复习。</small>}</div>}
                    </div>
                  );
                })}
              </div>
              <SectionFooter onBack={() => changeSection(2)} onNext={() => continueTo(4)} next="总结与反思" disabled={answeredCount < lesson.questions.length} />
            </section>
          )}

          {sectionIndex === 4 && (
            <section className="lesson-section">
              <SectionHeading number="05" eyebrow="SUMMARIZE & REFLECT" title="总结与间隔复习" description={lesson.schedule[4].detail} />
              <div className="summary-card"><span className="eyebrow">TODAY&apos;S TAKEAWAYS</span><h2>今天必须带走的结论</h2><ul>{lesson.summary.map((item) => <li key={item}><Check size={16} />{item}</li>)}</ul></div>
              <div className="misconceptions"><span className="eyebrow">COMMON PITFALLS</span><h2>常见误区</h2>{lesson.misconceptions.map((item) => <div key={item.myth}><span><CircleAlert size={17} /></span><div><strong>误区：{item.myth}</strong><p>{item.correction}</p></div></div>)}</div>
              <div className="extension-prompt"><Lightbulb size={21} /><div><strong>延伸思考</strong><p>{lesson.extension}</p></div></div>
              <div className="reflection-section"><span className="eyebrow">THREE QUESTIONS</span><h2>用自己的话完成今日反思</h2><p>反思不是抄总结。它让你区分“看懂了”和“能解释、会应用”。</p><div className="reflection-grid"><label><span>01</span><strong>{lesson.reflectionPrompts[0]}</strong><textarea rows={4} value={reflection.explain} onChange={(event) => setReflection((current) => ({ ...current, explain: event.target.value }))} placeholder="例如：我能不看资料解释…" /></label><label><span>02</span><strong>{lesson.reflectionPrompts[1]}</strong><textarea rows={4} value={reflection.unclear} onChange={(event) => setReflection((current) => ({ ...current, unclear: event.target.value }))} placeholder="写下具体卡点；没有也要写出最不确定处…" /></label><label><span>03</span><strong>{lesson.reflectionPrompts[2]}</strong><textarea rows={4} value={reflection.apply} onChange={(event) => setReflection((current) => ({ ...current, apply: event.target.value }))} placeholder="联系你的学习、投资或小公司经营…" /></label></div></div>
              <div className="review-preview"><RotateCcw size={22} /><div><strong>复习安排</strong><p>{lesson.reviewPreview}</p><span>1 天 → 3 天 → 7 天 → 14 天 → 30 天</span></div></div>
              {completionMessage && <div className={`completion-message ${lessonComplete ? "success" : "warning"}`} aria-live="polite">{lessonComplete ? <Trophy size={20} /> : <CircleAlert size={20} />}<p>{completionMessage}</p></div>}
              <div className="lesson-completion-actions"><button className="secondary-button" type="button" onClick={() => changeSection(3)}><ChevronLeft size={16} /> 返回练习</button>{lessonComplete ? <>{unitAssessments.some((assessment) => assessment.week === lesson.week) && lesson.day % 7 === 0 ? <button className="primary-button" type="button" onClick={() => navigate("assessments")}>进入第 {lesson.week} 单元测验 <ArrowRight size={16} /></button> : lesson.day < lessons.length ? <button className="primary-button" type="button" onClick={() => openLesson(lesson.day + 1)}>进入 Day {lesson.day + 1} <ArrowRight size={16} /></button> : <button className="primary-button" type="button" onClick={() => navigate("curriculum")}>查看长期课程地图 <ArrowRight size={16} /></button>}</> : <button className="primary-button complete-button" type="button" onClick={finishLesson}><CheckCircle2 size={17} /> 完成 Day {lesson.day}</button>}</div>
            </section>
          )}
        </article>

        <aside className="lesson-side-notes">
          <div><span className="eyebrow">本课目标</span>{lesson.objectives.map((item) => <p key={item}><Target size={14} /> {item}</p>)}</div>
          <div><span className="eyebrow">关键术语</span><div className="side-tags">{lesson.tags.map((tag) => <span key={tag}>{tag}</span>)}</div></div>
          <div className="sim-note"><Sparkles size={18} /><p><strong>案例声明</strong>所有公司、金额与交易为模拟资料，仅用于教学。</p></div>
        </aside>
      </div>

      <div className="lesson-pagination">
        <button type="button" disabled={lesson.day === 1} onClick={() => openLesson(lesson.day - 1)}><ChevronLeft size={17} /><span><small>上一课</small><strong>{lesson.day > 1 ? `Day ${lesson.day - 1}` : "这是第一课"}</strong></span></button>
        <span>Day {lesson.day} / {lessons.length}</span>
        <button type="button" disabled={lesson.day === lessons.length} onClick={() => openLesson(lesson.day + 1)}><span><small>下一课</small><strong>{lesson.day < lessons.length ? `Day ${lesson.day + 1}` : "已到完整课程末尾"}</strong></span><ChevronRight size={17} /></button>
      </div>
    </div>
  );
}

function SectionHeading({ number, eyebrow, title, description }: { number: string; eyebrow: string; title: string; description: string }) {
  return <header className="lesson-section-heading"><span className="section-watermark">{number}</span><div><span className="eyebrow">{eyebrow}</span><h2>{title}</h2><p>{description}</p></div></header>;
}

function SectionFooter({ onBack, onNext, next, disabled = false }: { onBack?: () => void; onNext: () => void; next: string; disabled?: boolean }) {
  return <footer className="section-footer">{onBack ? <button className="secondary-button" type="button" onClick={onBack}><ChevronLeft size={16} /> 上一步</button> : <span />}<button className="primary-button" type="button" onClick={onNext} disabled={disabled}>{next} <ArrowRight size={16} /></button></footer>;
}
