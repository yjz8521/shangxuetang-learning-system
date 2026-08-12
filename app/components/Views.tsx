"use client";

import {
  ArrowRight,
  Award,
  BarChart3,
  BookOpen,
  Bookmark,
  BookmarkCheck,
  BriefcaseBusiness,
  Calculator,
  CalendarCheck2,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleAlert,
  Clock3,
  Download,
  FileQuestion,
  FileSearch,
  Flame,
  GraduationCap,
  LibraryBig,
  Lightbulb,
  LineChart,
  LockKeyhole,
  NotebookPen,
  Play,
  RotateCcw,
  Search,
  ShieldCheck,
  Star,
  Target,
  TimerReset,
  Trash2,
  Trophy,
} from "lucide-react";
import { useState } from "react";
import { curriculumWeeks, extensionPacks, phases } from "../data/curriculum";
import { unitAssessments } from "../data/assessments";
import { lessons } from "../data/lessons";
import { knowledgeDomains, newsAnalysisLenses, resources } from "../data/resources";
import type { PathId } from "../lib/types";
import type { SharedViewProps } from "./LearningApp";
import { pathMeta } from "./LearningApp";
import { ChartLab } from "./ConceptCanvas";

function PageHeading({ eyebrow, title, description, actions }: { eyebrow?: string; title: string; description: string; actions?: React.ReactNode }) {
  return (
    <div className="page-heading">
      <div>
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {actions && <div className="page-heading-actions">{actions}</div>}
    </div>
  );
}

function ProgressBar({ value, label, tone = "teal" }: { value: number; label: string; tone?: string }) {
  return (
    <div className={`progress-wrap ${tone}`}>
      <div className="progress-label"><span>{label}</span><strong>{value}%</strong></div>
      <div className="progress-track" role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={value}>
        <span style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
      </div>
    </div>
  );
}

function MetricCard({ icon: Icon, label, value, sub, tone = "teal" }: { icon: typeof Clock3; label: string; value: string; sub: string; tone?: string }) {
  return (
    <article className="metric-card">
      <span className={`metric-icon ${tone}`}><Icon size={19} /></span>
      <div><span>{label}</span><strong>{value}</strong><small>{sub}</small></div>
    </article>
  );
}

export function DashboardView(props: SharedViewProps) {
  const { study, stats, streak, openLesson, navigate } = props;
  const day = Math.min(study.state.currentDay, lessons.length);
  const lesson = lessons[day - 1];
  const completedSections = study.state.sectionProgress[String(day)]?.length ?? 0;
  const lessonProgress = Math.round((completedSections / 5) * 100);
  const meta = pathMeta[lesson.path];
  const totalHours = stats.totalMinutes / 60;
  const todayTasks = [
    { id: "review", label: "温故与诊断", note: `${lesson.schedule[0].minutes} 分钟 · 回忆前置概念`, done: completedSections >= 1 },
    { id: "concept", label: "核心概念", note: `${lesson.schedule[1].minutes} 分钟 · ${lesson.tags.slice(0, 2).join("、")}`, done: completedSections >= 2 },
    { id: "case", label: "案例与图表", note: `${lesson.schedule[2].minutes} 分钟 · 模拟商业情境`, done: completedSections >= 3 },
    { id: "practice", label: "练习与解析", note: `${lesson.schedule[3].minutes} 分钟 · ${lesson.questions.length} 道练习`, done: completedSections >= 4 },
    { id: "summary", label: "总结与三问反思", note: `${lesson.schedule[4].minutes} 分钟 · 安排间隔复习`, done: completedSections >= 5 },
  ];

  return (
    <div className="dashboard-view">
      <section className="dashboard-hero-grid">
        <article className={`today-hero path-${meta.color}`}>
          <div className="today-hero-copy">
            <span className="dashboard-hero-eyebrow">今天，继续把知识变成判断力</span>
            <div className="hero-kicker"><span>今日课程</span><em>DAY {day}</em><span className={`path-pill ${meta.color}`}>{meta.label}</span></div>
            <h2>{lesson.title}</h2>
            <p>{lesson.subtitle}</p>
            <div className="hero-meta">
              <span><Clock3 size={16} /> {lesson.duration} 分钟</span>
              <span><BookOpen size={16} /> {lesson.core.length} 个核心模块</span>
              <span><Target size={16} /> {lesson.difficulty}</span>
            </div>
            <div className="hero-actions">
              <button className="primary-button" type="button" onClick={() => openLesson(day)}>
                <Play size={17} fill="currentColor" /> {lessonProgress ? "继续学习" : `开始 Day ${day}`} <ArrowRight size={17} />
              </button>
              <button className="secondary-button on-dark" type="button" onClick={() => navigate("curriculum")}>查看课程地图</button>
            </div>
          </div>
          <div className="today-progress-panel" aria-label={`今日进度 ${lessonProgress}%`}>
            <div className="progress-orbit" style={{ "--progress": `${lessonProgress * 3.6}deg` } as React.CSSProperties}>
              <div><strong>{lessonProgress}%</strong><span>今日进度</span></div>
            </div>
            <div className="stage-dots" aria-label="课程五阶段进度">
              {lesson.schedule.map((stage, index) => <span key={stage.label} className={index < completedSections ? "done" : index === completedSections ? "active" : ""} title={stage.label} />)}
            </div>
            <small>{completedSections}/5 学习阶段已完成</small>
          </div>
        </article>

      </section>

      <section className="metric-grid dashboard-metric-strip" aria-label="学习概览">
        <MetricCard icon={Flame} label="连续学习" value={`${streak} 天`} sub={streak ? "保持节奏" : "从今天开始"} tone="coral" />
        <MetricCard icon={Clock3} label="总学习时间" value={totalHours >= 1 ? `${totalHours.toFixed(1)} 小时` : `${stats.totalMinutes} 分钟`} sub="仅计已完成课程" tone="blue" />
        <MetricCard icon={RotateCcw} label="待复习" value={`${study.dueReviews.length}`} sub="按到期顺序处理" tone="violet" />
        <MetricCard icon={NotebookPen} label="错题" value={`${study.state.mistakes.filter((item) => !item.resolved).length}`} sub="待重新提取练习" tone="amber" />
      </section>

      <section className="dashboard-detail-grid">
        <article className="panel today-tasks-panel">
          <div className="panel-heading"><div><span className="eyebrow">TODAY&apos;S PLAN</span><h2>今日 75 分钟任务</h2></div><button className="text-link" type="button" onClick={() => openLesson(day)}>进入课程 <ChevronRight size={16} /></button></div>
          <div className="task-list dashboard-task-timeline">
            {todayTasks.map((task, index) => (
              <button key={task.id} type="button" className={`task-row ${task.done ? "done" : ""}`} onClick={() => openLesson(day)}>
                <span className="task-status">{task.done ? <Check size={16} /> : index + 1}</span>
                <span><strong>{task.label}</strong><small>{task.note}</small></span>
                <ChevronRight size={17} />
              </button>
            ))}
          </div>
        </article>

        <section className="dashboard-path-links" aria-label="三条学习路径">
          {([
            { id: "economics" as const, progress: stats.economicsProgress, day: 1 },
            { id: "accounting" as const, progress: stats.accountingProgress, day: 2 },
            { id: "business" as const, progress: stats.businessProgress, day: 7 },
          ]).map((path) => {
            const pathInfo = pathMeta[path.id];
            const Icon = pathInfo.icon;
            return <button key={path.id} type="button" className={`dashboard-path-card ${pathInfo.color}`} onClick={() => openLesson(path.day)}><span><Icon size={27} /></span><div><strong>{pathInfo.label}</strong><small>前 14 天完成率 {path.progress}%</small></div><ArrowRight size={20} /></button>;
          })}
        </section>

        <div className="dashboard-program-notes">
          <span><BookOpen size={17} /> 52 周核心课程 · 可扩展至 78 周</span>
          <span><RotateCcw size={17} /> 1 → 3 → 7 → 14 → 30 天复习</span>
          <span><ShieldCheck size={17} /> 案例与数据为教学模拟</span>
        </div>

        <article className="panel mastery-panel">
          <div className="panel-heading"><div><span className="eyebrow">MASTERY</span><h2>知识掌握快照</h2></div><button className="text-link" type="button" onClick={() => navigate("analytics")}>查看数据 <ChevronRight size={16} /></button></div>
          <div className="mastery-bars">
            <ProgressBar value={stats.questionsAnswered ? Math.round((stats.economicsProgress + (stats.accuracy ?? 0)) / 2) : 0} label="经济学思维与市场" tone="blue" />
            <ProgressBar value={stats.questionsAnswered ? Math.round((stats.accountingProgress + (stats.accuracy ?? 0)) / 2) : 0} label="会计循环与报表" tone="teal" />
            <ProgressBar value={stats.questionsAnswered ? Math.round((stats.businessProgress + (stats.accuracy ?? 0)) / 2) : 0} label="贸易与商业决策" tone="amber" />
          </div>
          {!stats.questionsAnswered && <p className="data-note"><CircleAlert size={16} /> 完成练习后才计算掌握度；尚无证据时不显示虚假的 0 分。</p>}
        </article>

        <article className="panel review-panel">
          <div className="review-panel-icon"><TimerReset size={24} /></div>
          <div><span className="eyebrow">SPACED REVIEW</span><h2>{study.dueReviews.length ? `${study.dueReviews.length} 项知识到期` : "复习队列已清空"}</h2><p>{study.dueReviews.length ? "先处理逾期与错题，再进入今日新课。" : "完成课程后会自动按 1、3、7、14、30 天安排。"}</p></div>
          <button className="secondary-button" type="button" onClick={() => navigate("reviews")}>{study.dueReviews.length ? "开始复习" : "查看复习规则"} <ArrowRight size={16} /></button>
        </article>

        <article className="panel insight-panel">
          <Lightbulb size={24} />
          <div><span className="eyebrow">今日思考</span><blockquote>“成本不是你花掉了什么，而是为了这个选择，你放弃的最佳可能。”</blockquote><small>完成 Day 1 后，用自己的一个真实选择检验这句话。</small></div>
        </article>
      </section>
    </div>
  );
}

export function PathsView({ study, stats, openLesson, navigate }: SharedViewProps) {
  const pathCards: Array<{ id: PathId; description: string; modules: string[]; progress: number; startDay: number }> = [
    { id: "economics", description: "从稀缺与选择出发，建立微观、宏观、贸易与政策分析的因果框架。", modules: ["经济学思维", "市场机制", "宏观与政策", "国际贸易"], progress: stats.economicsProgress, startDay: 1 },
    { id: "accounting", description: "从会计等式到三大报表、成本管理和盈余质量，读懂企业的商业语言。", modules: ["复式记账", "会计循环", "三大报表", "财务分析"], progress: stats.accountingProgress, startDay: 2 },
    { id: "business", description: "把经济与会计用于报价、库存、现金流、汇率、年报与股票分析。", modules: ["贸易报价", "营运资金", "风险管理", "投资分析"], progress: stats.businessProgress, startDay: 7 },
  ];

  return (
    <div>
      <PageHeading eyebrow="THREE CONNECTED PATHS" title="三条路径，训练同一种决策能力" description="路径彼此独立又相互连接。先懂市场为何变化，再看变化如何进入账簿和报表，最后做经营判断。" actions={<button className="primary-button" type="button" onClick={() => openLesson(Math.min(study.state.currentDay, 14))}>继续今日课程 <ArrowRight size={16} /></button>} />
      <section className="path-card-grid">
        {pathCards.map((path, index) => {
          const meta = pathMeta[path.id];
          const Icon = meta.icon;
          return (
            <article key={path.id} className={`path-card ${meta.color}`}>
              <div className="path-card-index">0{index + 1}</div>
              <span className={`large-path-icon ${meta.color}`}><Icon size={27} /></span>
              <span className="eyebrow">{path.id.toUpperCase()} PATH</span>
              <h2>{meta.label}</h2>
              <p>{path.description}</p>
              <div className="path-module-list">{path.modules.map((module) => <span key={module}><Check size={14} /> {module}</span>)}</div>
              <ProgressBar value={path.progress} label="前 14 天完成率" tone={meta.color} />
              <button className="secondary-button" type="button" onClick={() => openLesson(path.startDay)}>{path.progress ? "继续路径" : "从第一课开始"} <ArrowRight size={16} /></button>
            </article>
          );
        })}
      </section>

      <section className="panel path-sequence">
        <div className="panel-heading"><div><span className="eyebrow">LEARNING LOGIC</span><h2>不是三套孤立课程，而是一条完整推理链</h2></div></div>
        <div className="sequence-grid">
          <div><span className="sequence-number">01</span><LineChart /><strong>经济学</strong><p>市场、激励与政策为何变化？</p></div>
          <ChevronRight />
          <div><span className="sequence-number">02</span><Calculator /><strong>会计学</strong><p>变化如何进入交易、利润与现金？</p></div>
          <ChevronRight />
          <div><span className="sequence-number">03</span><BriefcaseBusiness /><strong>商业应用</strong><p>经营者或投资者应该怎么做？</p></div>
        </div>
      </section>

      <section className="two-week-syllabus">
        <div className="section-heading"><div><span className="eyebrow">READY NOW</span><h2>前 14 天完整课程</h2><p>以下不是标题占位：每一天都有讲解、模拟案例、图示、练习解析与反思。</p></div></div>
        <div className="lesson-card-grid">
          {lessons.map((lesson) => {
            const meta = pathMeta[lesson.path];
            const completed = study.state.completedDays.includes(lesson.day);
            return (
              <button className="lesson-mini-card" type="button" key={lesson.day} onClick={() => openLesson(lesson.day)}>
                <span className={`day-square ${meta.color}`}>D{lesson.day}</span>
                <span className="lesson-mini-copy"><small>{meta.label} · {lesson.duration} 分钟</small><strong>{lesson.title}</strong><em>{lesson.tags.slice(0, 3).join(" · ")}</em></span>
                <span className={`lesson-status ${completed ? "complete" : lesson.day === study.state.currentDay ? "current" : ""}`}>{completed ? <CheckCircle2 size={17} /> : lesson.day <= study.state.currentDay ? <Play size={15} /> : <BookOpen size={16} />}</span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="panel curriculum-callout">
        <div className="callout-icon"><CalendarCheck2 size={27} /></div>
        <div><span className="eyebrow">52-WEEK CORE</span><h2>核心课程 52 周，进阶扩展至 78 周</h2><p>每 4 周一次 18 题综合考试、案例题与复盘；最终完成模拟贸易公司董事会项目。</p></div>
        <button className="primary-button" type="button" onClick={() => navigate("curriculum")}>查看完整地图 <ArrowRight size={16} /></button>
      </section>
    </div>
  );
}

export function CurriculumView({ openLesson }: SharedViewProps) {
  const [activePhase, setActivePhase] = useState("all");
  const filtered = activePhase === "all" ? curriculumWeeks : curriculumWeeks.filter((week) => week.phase === activePhase);
  const grouped = filtered.reduce<Record<number, typeof curriculumWeeks>>((groups, week) => {
    groups[week.month] = [...(groups[week.month] ?? []), week];
    return groups;
  }, {});

  return (
    <div>
      <PageHeading eyebrow="12–18 MONTH ROADMAP" title="从零基础到商业决策者" description="52 周核心课程覆盖本科关键知识与现实应用；第 53–78 周可继续做高级贸易、会计、年报与数据决策训练。" actions={<span className="content-status"><ShieldCheck size={16} /> Day 1–14 已完整发布</span>} />
      <section className="phase-timeline">
        {phases.map((phase, index) => (
          <button key={phase.id} type="button" className={activePhase === phase.title ? "active" : ""} onClick={() => setActivePhase(activePhase === phase.title ? "all" : phase.title)}>
            <span>0{index + 1}</span><strong>{phase.title}</strong><small>第 {phase.weeks} 周</small><em>{phase.level}</em>
          </button>
        ))}
      </section>
      <div className="curriculum-legend">
        <span><i className="complete" /> 完整课程（Day 1–14）</span><span><i className="outline" /> 课程大纲（待后续填充）</span><span><i className="exam" /> 综合考试与复盘</span>
      </div>
      <section className="curriculum-months">
        {Object.entries(grouped).map(([month, weeks]) => (
          <article className="curriculum-month" key={month}>
            <div className="month-heading"><span>教学月 {String(month).padStart(2, "0")}</span><div><strong>{weeks[0].phase}</strong><small>{weeks[0].level}</small></div><em>4 周 · 约 28 天</em></div>
            <div className="week-grid">
              {weeks.map((week) => {
                const hasFullLessons = week.week <= 2;
                return (
                  <div key={week.week} className={`week-card ${week.review ? "review" : ""}`}>
                    <div className="week-card-top"><span>WEEK {String(week.week).padStart(2, "0")}</span>{week.review ? <em><Trophy size={14} /> 综合考试</em> : hasFullLessons ? <em className="published"><Check size={14} /> 已发布</em> : <em className="outline-label">课程大纲</em>}</div>
                    <h3>{week.business.split("、")[0]}</h3>
                    <dl><div><dt>经济学</dt><dd>{week.economics}</dd></div><div><dt>会计学</dt><dd>{week.accounting}</dd></div><div><dt>商业应用</dt><dd>{week.business}</dd></div></dl>
                    <div className="week-outcome"><Target size={15} /><span>{week.outcome}</span></div>
                    {hasFullLessons ? <button className="text-link" type="button" onClick={() => openLesson(week.week === 1 ? 1 : 8)}>打开完整课程 <ChevronRight size={15} /></button> : <span className="future-note"><LockKeyhole size={14} /> 数据结构已建立，正文将持续扩写</span>}
                  </div>
                );
              })}
            </div>
          </article>
        ))}
      </section>
      <section className="extension-section">
        <div className="section-heading"><div><span className="eyebrow">OPTIONAL EXTENSION</span><h2>第 53–78 周进阶包</h2><p>完成核心 52 周后，用自己的行业或公司资料继续深化。</p></div></div>
        <div className="extension-grid">{extensionPacks.map((pack) => <article key={pack.weeks}><span>{pack.weeks} 周</span><h3>{pack.title}</h3><p>{pack.topics}</p></article>)}</div>
      </section>
    </div>
  );
}

export function ReviewsView({ study, navigate }: SharedViewProps) {
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const due = study.dueReviews;
  const upcoming = study.state.reviews.filter((item) => !item.retained && !due.some((dueItem) => dueItem.id === item.id)).slice(0, 8);

  return (
    <div>
      <PageHeading eyebrow="SPACED REPETITION" title="在快要忘记时，再想起来一次" description="每个知识点按 1、3、7、14、30 天节奏出现。先回忆再翻答案，比反复阅读更能形成长期记忆。" />
      <section className="review-summary-grid">
        <MetricCard icon={RotateCcw} label="今日到期" value={`${due.length} 项`} sub="优先处理逾期与错题" tone="violet" />
        <MetricCard icon={CheckCircle2} label="累计复习" value={`${study.state.reviewsCompleted} 次`} sub="每次都留下结果" tone="teal" />
        <MetricCard icon={Trophy} label="长期保留" value={`${study.state.reviews.filter((item) => item.retained).length} 项`} sub="已通过 30 天节点" tone="amber" />
      </section>
      <section className="spacing-strip" aria-label="复习间隔">
        {[1, 3, 7, 14, 30].map((day, index) => <div key={day}><span>{index + 1}</span><strong>{day} 天</strong><small>{index === 0 ? "初次巩固" : index === 4 ? "长期保留" : "提取练习"}</small></div>)}
      </section>
      {due.length ? (
        <section className="review-cards">
          {due.map((item, index) => (
            <article key={item.id} className="review-card">
              <div className="review-card-top"><span>复习 {index + 1}/{due.length}</span><em>{item.concept} · 阶段 {item.stage + 1}/5</em></div>
              <h2>{item.prompt}</h2>
              <p className="recall-cue">先在心里说出答案，或写在纸上，再点击显示。</p>
              {!revealed[item.id] ? (
                <button className="primary-button" type="button" onClick={() => setRevealed((current) => ({ ...current, [item.id]: true }))}>显示答案</button>
              ) : (
                <div className="review-answer" aria-live="polite">
                  <span className="eyebrow">参考答案</span><h3>{item.answer}</h3><p>{item.explanation}</p>
                  <div className="review-rating"><span>这次回忆得怎样？</span><button type="button" className="forgot" onClick={() => study.completeReview(item.id, "forgotten")}>忘记了</button><button type="button" className="hard" onClick={() => study.completeReview(item.id, "hard")}>有点困难</button><button type="button" className="remembered" onClick={() => study.completeReview(item.id, "remembered")}>记得很清楚</button></div>
                </div>
              )}
            </article>
          ))}
        </section>
      ) : (
        <section className="empty-state large"><span><CalendarCheck2 size={30} /></span><h2>今天没有到期复习</h2><p>完成一课后，系统会把核心题目安排到明天；答错题会立即进入复习池。</p><button className="primary-button" type="button" onClick={() => navigate("lesson")}>去学习今日课程 <ArrowRight size={16} /></button></section>
      )}
      {upcoming.length > 0 && <section className="panel upcoming-reviews"><div className="panel-heading"><div><span className="eyebrow">UPCOMING</span><h2>即将到期</h2></div></div>{upcoming.map((item) => <div className="upcoming-row" key={item.id}><span><strong>{item.concept}</strong><small>来自 Day {item.sourceDay}</small></span><em>{new Date(item.dueAt).toLocaleDateString("zh-CN", { month: "short", day: "numeric" })}</em></div>)}</section>}
    </div>
  );
}

export function MistakesView({ study, openLesson }: SharedViewProps) {
  const [filter, setFilter] = useState("all");
  const mistakes = study.state.mistakes.filter((item) => filter === "all" || item.concept.includes(filter));
  const concepts = Array.from(new Set(study.state.mistakes.map((item) => item.concept)));
  return (
    <div>
      <PageHeading eyebrow="ERROR LOG" title="错题不是污点，是诊断证据" description="保留当时答案、正确答案和原因。完成不同日期的复习节点后，错题才会真正退出强化队列。" />
      <div className="filter-bar"><button type="button" className={filter === "all" ? "active" : ""} onClick={() => setFilter("all")}>全部 {study.state.mistakes.length}</button>{concepts.map((concept) => <button type="button" key={concept} className={filter === concept ? "active" : ""} onClick={() => setFilter(concept)}>{concept}</button>)}</div>
      {mistakes.length ? <section className="mistake-list">{mistakes.map((item) => <article className="mistake-card" key={item.questionId}><div className="mistake-top"><span className={item.resolved ? "resolved" : "unresolved"}>{item.resolved ? <CheckCircle2 size={15} /> : <CircleAlert size={15} />}{item.resolved ? "已掌握" : "需强化"}</span><em>Day {item.day} · 错误 {item.attempts} 次</em></div><h2>{item.prompt}</h2><div className="answer-comparison"><div className="wrong-answer"><span>当时答案</span><strong>{item.selected}</strong></div><div className="correct-answer"><span>正确答案</span><strong>{item.correct}</strong></div></div><p>{item.explanation}</p><div className="mistake-footer"><span><RotateCcw size={15} /> 当前复习阶段 {item.stage}/5</span><button className="text-link" type="button" onClick={() => openLesson(item.day)}>返回原课 <ChevronRight size={15} /></button></div></article>)}</section> : <section className="empty-state large"><span><NotebookPen size={30} /></span><h2>还没有错题记录</h2><p>作答后，答错题会自动保存。系统不会用“看完课程”冒充“已经掌握”。</p><button className="primary-button" type="button" onClick={() => openLesson(Math.min(study.state.currentDay, 14))}>去做练习 <ArrowRight size={16} /></button></section>}
    </div>
  );
}

export function AssessmentsView({ study }: SharedViewProps) {
  const firstPending = unitAssessments.find(
    (assessment) => !study.state.unitQuizResults[assessment.id],
  ) ?? unitAssessments[0];
  const [assessmentId, setAssessmentId] = useState(firstPending.id);
  const assessment = unitAssessments.find((item) => item.id === assessmentId) ?? unitAssessments[0];
  const result = study.state.unitQuizResults[assessment.id];
  const caseResponse = study.state.unitQuizCaseResponses[assessment.id] ?? "";
  const answeredCount = assessment.questions.filter(
    (question) => study.state.unitQuizAnswers[question.id] !== undefined,
  ).length;
  const ready = answeredCount === assessment.questions.length && caseResponse.trim().length >= 80;

  return (
    <div className="assessment-view">
      <PageHeading eyebrow="UNIT ASSESSMENT" title="每个单元，都要证明自己会判断" description="10 道综合选择题加 1 道案例分析。先独立作答，提交后才显示解析；错题自动进入错题本与复习池。" />
      <div className="assessment-tabs" role="tablist">
        {unitAssessments.map((item) => {
          const itemResult = study.state.unitQuizResults[item.id];
          return <button key={item.id} type="button" role="tab" aria-selected={assessment.id === item.id} className={assessment.id === item.id ? "active" : ""} onClick={() => setAssessmentId(item.id)}><span>第 {item.week} 单元</span><strong>{item.dayRange}</strong><small>{itemResult ? `${itemResult.score}/${itemResult.total} · ${itemResult.mastery}` : "待完成"}</small></button>;
        })}
      </div>

      <section className="assessment-hero panel">
        <div><span className="eyebrow">WEEK {assessment.week}</span><h2>{assessment.title}</h2><p>{assessment.description}</p></div>
        <div className="assessment-progress"><strong>{result ? `${result.score}/${result.total}` : `${answeredCount}/${assessment.questions.length}`}</strong><span>{result ? result.mastery : "选择题作答进度"}</span></div>
      </section>

      {result && <div className={`assessment-result ${result.mastery === "需要补强" ? "needs-work" : "passed"}`}><Trophy size={22} /><div><strong>本次选择题掌握度：{Math.round(result.score / result.total * 100)}%</strong><p>{result.mastery === "掌握稳固" ? "关键概念连接稳定，可以进入下一单元。" : result.mastery === "基本掌握" ? "基础已形成；先处理错题与到期复习，再进入下一单元。" : "建议返回相关课程、重做错题，并在 1 天后完成第一次提取复习。"}</p></div></div>}

      <section className="assessment-question-list">
        {assessment.questions.map((question, index) => {
          const selected = study.state.unitQuizAnswers[question.id];
          const correct = selected === question.answer;
          return <article className={`assessment-question panel ${result ? correct ? "correct" : "incorrect" : ""}`} key={question.id}><div className="question-number"><span>综合题 {index + 1}</span><em>{question.concept}</em></div><h2>{question.prompt}</h2><div className="question-options">{question.options.map((option, optionIndex) => <button type="button" key={option} disabled={Boolean(result)} className={`${selected === optionIndex ? "selected" : ""} ${result && optionIndex === question.answer ? "correct" : ""} ${result && selected === optionIndex && !correct ? "incorrect" : ""}`} onClick={() => study.answerUnitQuiz(question.id, optionIndex)}><span>{String.fromCharCode(65 + optionIndex)}</span>{option}{result && optionIndex === question.answer && <CheckCircle2 size={17} />}</button>)}</div>{result && <div className={`answer-explanation ${correct ? "correct" : "incorrect"}`}><strong>{correct ? "回答正确" : "需要补强"}</strong><p>{question.explanation}</p></div>}</article>;
        })}
      </section>

      <section className="assessment-case panel">
        <div className="simulation-disclosure"><ShieldCheck size={18} /><span><strong>{assessment.caseStudy.label}</strong> 公司、金额与情境均为教学模拟。</span></div>
        <span className="eyebrow">CASE ANALYSIS</span><h2>{assessment.caseStudy.title}</h2><p className="case-scenario">{assessment.caseStudy.scenario}</p><h3>{assessment.caseStudy.prompt}</h3>
        <textarea value={caseResponse} disabled={Boolean(result)} onChange={(event) => study.saveUnitQuizCase(assessment.id, event.target.value)} rows={7} placeholder="先写判断，再写依据、计算或分录，最后写出需要验证的风险。至少 80 字。" />
        <div className="case-rubric"><strong>评分检查点</strong>{assessment.caseStudy.rubric.map((item) => <span key={item}><Check size={15} /> {item}</span>)}</div>
        {result && <div className="reference-answer"><strong>参考分析</strong><p>{assessment.caseStudy.referenceAnswer}</p><small>参考答案不是唯一写法；请对照因果链、数字和会计处理是否完整。</small></div>}
      </section>

      <div className="assessment-submit panel"><div><strong>{result ? `已提交于 ${new Date(result.submittedAt).toLocaleString("zh-CN")}` : ready ? "已满足提交条件" : `还需完成 ${assessment.questions.length - answeredCount} 道选择题；案例至少 80 字（目前 ${caseResponse.trim().length} 字）`}</strong><small>掌握度按选择题正确率计算；案例保留为文字学习证据，不由系统假装自动评分。</small></div>{result ? <button className="secondary-button" type="button" onClick={() => study.resetUnitQuiz(assessment)}><RotateCcw size={16} /> 重新作答</button> : <button className="primary-button" type="button" disabled={!ready} onClick={() => study.submitUnitQuiz(assessment)}><FileQuestion size={17} /> 提交单元测验</button>}</div>
    </div>
  );
}

export function ToolkitView({ study }: SharedViewProps) {
  const [tab, setTab] = useState<"resources" | "map" | "charts" | "favorites">("resources");
  const [category, setCategory] = useState("全部");
  const [query, setQuery] = useState("");
  const filtered = resources.filter((item) => (category === "全部" || item.category === category) && `${item.title}${item.meaning}${item.example}${item.tags.join("")}`.toLowerCase().includes(query.toLowerCase()));
  return (
    <div>
      <PageHeading eyebrow="REFERENCE & LABS" title="知识与工具中心" description="需要时查公式和科目，但先理解适用条件。知识地图与互动图示帮助你看到概念之间的连接。" />
      <div className="segmented-tabs" role="tablist"><button type="button" role="tab" aria-selected={tab === "resources"} className={tab === "resources" ? "active" : ""} onClick={() => setTab("resources")}><LibraryBig size={17} /> 公式 · 科目 · 术语</button><button type="button" role="tab" aria-selected={tab === "map"} className={tab === "map" ? "active" : ""} onClick={() => setTab("map")}><GraduationCap size={17} /> 知识地图</button><button type="button" role="tab" aria-selected={tab === "charts"} className={tab === "charts" ? "active" : ""} onClick={() => setTab("charts")}><LineChart size={17} /> 互动图表</button><button type="button" role="tab" aria-selected={tab === "favorites"} className={tab === "favorites" ? "active" : ""} onClick={() => setTab("favorites")}><Star size={17} /> 收藏 {study.state.favorites.length}</button></div>
      {tab === "resources" && <><div className="resource-toolbar"><label><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索公式、会计科目或术语" /></label><div>{["全部", "经济学公式", "会计公式", "会计科目", "术语"].map((item) => <button type="button" key={item} className={category === item ? "active" : ""} onClick={() => setCategory(item)}>{item}</button>)}</div></div><section className="resource-grid">{filtered.map((item) => { const favorite = study.state.favorites.includes(item.id); return <article key={item.id} className="resource-card"><div className="resource-card-top"><span>{item.category}</span><button type="button" onClick={() => study.toggleFavorite(item.id)} aria-label={favorite ? "取消收藏" : "收藏"}>{favorite ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}</button></div><h2>{item.title}</h2>{item.expression && <div className="formula-box">{item.expression}</div>}<p>{item.meaning}</p><div className="example-line"><strong>例：</strong>{item.example}</div><div className="tag-row">{item.tags.map((tag) => <span key={tag}>{tag}</span>)}</div></article>; })}</section>{!filtered.length && <div className="empty-state"><Search size={24} /><strong>没有匹配结果</strong><span>换一个关键词试试。</span></div>}</>}
      {tab === "map" && <section className="knowledge-map"><div className="map-intro"><span className="eyebrow">KNOWLEDGE GRAPH</span><h2>五个知识域，一条决策主线</h2><p>节点顺序体现大致前置关系；点击课程路径可学习对应内容。图形之外，下方同时提供可访问的文字结构。</p></div><div className="domain-grid">{knowledgeDomains.map((domain) => <article className={`domain-card ${domain.color}`} key={domain.id}><span className="domain-number">{String(knowledgeDomains.indexOf(domain) + 1).padStart(2, "0")}</span><h3>{domain.title}</h3><div>{domain.nodes.map((node, index) => <span className={index < Math.min(2, study.state.completedDays.length) ? "learned" : ""} key={node}>{index < Math.min(2, study.state.completedDays.length) ? <CheckCircle2 size={14} /> : <span className="node-dot" />}{node}</span>)}</div></article>)}</div></section>}
      {tab === "charts" && <ChartLab />}
      {tab === "favorites" && <section>{study.state.favorites.length ? <div className="resource-grid">{resources.filter((item) => study.state.favorites.includes(item.id)).map((item) => <article className="resource-card" key={item.id}><div className="resource-card-top"><span>{item.category}</span><button type="button" onClick={() => study.toggleFavorite(item.id)} aria-label="取消收藏"><BookmarkCheck size={18} /></button></div><h2>{item.title}</h2>{item.expression && <div className="formula-box">{item.expression}</div>}<p>{item.meaning}</p><div className="example-line"><strong>例：</strong>{item.example}</div></article>)}</div> : <div className="empty-state large"><Bookmark size={30} /><h2>还没有收藏</h2><p>在公式、科目和术语卡片右上角点击书签，常用内容就会集中到这里。</p><button className="primary-button" type="button" onClick={() => setTab("resources")}>浏览资源</button></div>}</section>}
    </div>
  );
}

export function NewsLabView({ study }: SharedViewProps) {
  const [title, setTitle] = useState("");
  const [sourceText, setSourceText] = useState("");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);
  function saveDraft() {
    if (!title.trim() && !sourceText.trim()) return;
    const draft = { id: String(Date.now()), date: new Date().toISOString(), title: title || "未命名分析", sourceText, answers };
    study.setState((current) => ({ ...current, newsDrafts: [draft, ...current.newsDrafts].slice(0, 20) }));
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2200);
  }
  async function copyMarkdown() {
    const content = `# ${title || "新闻分析"}\n\n> 原文（用户提供，未由系统验证）\n\n${sourceText}\n\n${newsAnalysisLenses.map((lens) => `## ${lens.title}\n\n${answers[lens.id] || "待分析"}`).join("\n\n")}`;
    await navigator.clipboard.writeText(content);
  }
  return (
    <div>
      <PageHeading eyebrow="REAL-WORLD ANALYSIS LAB" title="把一则新闻拆成可验证的因果链" description="粘贴你正在看的经济或商业新闻，先自己分析，再用框架检查遗漏。本工具不会联网，也不会验证新闻真伪。" actions={<span className="offline-badge"><CircleAlert size={16} /> 离线分析模板</span>} />
      <section className="news-lab-grid">
        <article className="panel news-source-panel"><div className="panel-heading"><div><span className="eyebrow">SOURCE INPUT</span><h2>新闻原文</h2></div></div><label>标题<input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="例如：某国宣布调整进口关税" /></label><label>新闻内容<textarea rows={12} value={sourceText} onChange={(event) => setSourceText(event.target.value)} placeholder="在此粘贴新闻、公告或你自己的摘要。请保留来源与日期，避免把观点当事实。" /></label><div className="source-warning"><ShieldCheck size={18} /><p><strong>先做来源检查</strong><span>记录发布者、发布日期、数据日期；区分事实、观点、推论与待确认信息。</span></p></div></article>
        <article className="analysis-lenses"><div className="lens-heading"><span className="eyebrow">ANALYSIS LENSES</span><h2>七层分析框架</h2><p>不必一次写得完美。每层先写一个可证伪判断。</p></div>{newsAnalysisLenses.map((lens) => <label className="lens-card" key={lens.id}><span>{lens.title}</span><small>{lens.prompt}</small><textarea rows={3} value={answers[lens.id] ?? ""} onChange={(event) => setAnswers((current) => ({ ...current, [lens.id]: event.target.value }))} placeholder="写下你的判断、依据与待确认资料…" /></label>)}<div className="news-actions"><button className="primary-button" type="button" onClick={saveDraft}>{saved ? <Check size={17} /> : <Bookmark size={17} />}{saved ? "已保存到本机" : "保存草稿"}</button><button className="secondary-button" type="button" onClick={copyMarkdown}><Download size={17} /> 复制 Markdown</button></div><p className="local-note">草稿仅保存在当前浏览器。清除浏览器数据或更换设备可能丢失。</p></article>
      </section>
      {study.state.newsDrafts.length > 0 && <section className="panel saved-drafts"><div className="panel-heading"><div><span className="eyebrow">LOCAL DRAFTS</span><h2>最近草稿</h2></div></div>{study.state.newsDrafts.map((draft) => <button type="button" key={draft.id} onClick={() => { setTitle(draft.title); setSourceText(draft.sourceText); setAnswers(draft.answers); window.scrollTo({ top: 0, behavior: "smooth" }); }}><FileSearch size={18} /><span><strong>{draft.title}</strong><small>{new Date(draft.date).toLocaleString("zh-CN")}</small></span><ChevronRight size={17} /></button>)}</section>}
    </div>
  );
}

export function AnalyticsView({ study, stats, streak, level }: SharedViewProps) {
  const totalQuestions = lessons.flatMap((lesson) => lesson.questions);
  const domainStats = knowledgeDomains.map((domain) => {
    const terms = domain.nodes;
    const relevant = totalQuestions.filter((question) => terms.some((term) => question.concept.includes(term.slice(0, 2))) || domain.id === "business" && question.concept.includes("商业"));
    const answered = relevant.filter((q) => study.state.answers[q.id] !== undefined);
    const correct = answered.filter((q) => study.state.answers[q.id] === q.answer).length;
    return { ...domain, score: answered.length ? Math.round(correct / answered.length * 100) : null, evidence: answered.length };
  });
  const maxMinutes = Math.max(90, ...study.state.sessions.slice(-10).map((session) => session.minutes));
  function exportData() {
    const blob = new Blob([JSON.stringify(study.state, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a"); anchor.href = url; anchor.download = `商学堂学习记录-${new Date().toISOString().slice(0, 10)}.json`; anchor.click(); URL.revokeObjectURL(url);
  }
  return (
    <div>
      <PageHeading eyebrow="LEARNING EVIDENCE" title="学习数据，不用进度条冒充掌握" description="完成率、正确率、复习保持率和学习时间分别计算。证据不足时明确显示“数据不足”。" actions={<><button className="secondary-button" type="button" onClick={exportData}><Download size={16} /> 导出本机记录</button><button className="danger-outline-button" type="button" onClick={() => { if (window.confirm("确定清除当前浏览器中的全部商学堂学习记录吗？此操作无法撤销；如需保留，请先导出记录。")) study.resetProgress(); }}><Trash2 size={16} /> 重置本机进度</button></>} />
      <section className="analytics-overview"><article className="analytics-score-card"><div className="score-ring" style={{ "--progress": `${(stats.accuracy ?? 0) * 3.6}deg` } as React.CSSProperties}><div><strong>{stats.accuracy === null ? "—" : `${stats.accuracy}%`}</strong><span>练习正确率</span></div></div><div><span className="eyebrow">EVIDENCE SCORE</span><h2>{stats.accuracy === null ? "数据不足" : stats.accuracy >= 80 ? "理解稳定" : stats.accuracy >= 60 ? "正在形成" : "需要补强"}</h2><p>已回答 {stats.questionsAnswered} 题，其中 {stats.correct} 题正确。这里显示当前记录，不代表正式考试成绩。</p></div></article><div className="analytics-mini-grid"><MetricCard icon={Clock3} label="累计时间" value={`${Math.floor(stats.totalMinutes / 60)}h ${stats.totalMinutes % 60}m`} sub={`${study.state.sessions.length} 次完整课程`} tone="blue" /><MetricCard icon={Flame} label="连续学习" value={`${streak} 天`} sub="以完成课程日计算" tone="coral" /><MetricCard icon={RotateCcw} label="复习完成" value={`${study.state.reviewsCompleted} 次`} sub={`${study.state.reviews.filter((item) => item.retained).length} 项长期保留`} tone="violet" /><MetricCard icon={Award} label="当前等级" value={`Lv${level.level}`} sub={`${level.name} · ${level.label}`} tone="amber" /></div></section>
      <section className="analytics-grid"><article className="panel session-chart"><div className="panel-heading"><div><span className="eyebrow">STUDY TIME</span><h2>最近学习时间</h2></div><span>目标 60–90 分钟/日</span></div>{study.state.sessions.length ? <div className="bar-chart">{study.state.sessions.slice(-10).map((session) => <div key={`${session.date}-${session.day}`}><span className="bar-value">{session.minutes}</span><i style={{ height: `${Math.max(8, session.minutes / maxMinutes * 100)}%` }} /><small>D{session.day}</small></div>)}</div> : <div className="empty-chart"><BarChart3 size={28} /><p>完成 Day 1 后，这里会出现学习时间柱状图。</p></div>}</article><article className="panel domain-mastery"><div className="panel-heading"><div><span className="eyebrow">DOMAIN MASTERY</span><h2>知识领域掌握度</h2></div></div>{domainStats.map((domain) => <div className="domain-stat" key={domain.id}><span className={`domain-dot ${domain.color}`} /><div><strong>{domain.title}</strong><small>{domain.score === null ? "数据不足" : `${domain.evidence} 次作答证据`}</small></div><div className="progress-track"><span style={{ width: `${domain.score ?? 0}%` }} /></div><em>{domain.score === null ? "—" : `${domain.score}%`}</em></div>)}</article></section>
      <section className="panel data-definitions"><div><ShieldCheck size={22} /><span><strong>数据口径</strong><small>完成率 = 已完成课程/已发布课程；正确率 = 当前答案记录；掌握度需综合练习、间隔复习与课程覆盖。</small></span></div><div><Download size={22} /><span><strong>数据在本机</strong><small>进度、错题、收藏和草稿使用 localStorage。建议定期导出；清除浏览器数据可能丢失。</small></span></div></section>
    </div>
  );
}

export function SearchView({ query, setQuery, openLesson }: SharedViewProps & { query: string; setQuery: (query: string) => void }) {
  const normalized = query.trim().toLowerCase();
  const lessonResults = normalized ? lessons.filter((lesson) => `${lesson.title}${lesson.subtitle}${lesson.tags.join("")}${lesson.core.map((block) => block.heading + block.paragraphs.join("")).join("")}`.toLowerCase().includes(normalized)) : [];
  const resourceResults = normalized ? resources.filter((resource) => `${resource.title}${resource.meaning}${resource.example}${resource.tags.join("")}`.toLowerCase().includes(normalized)) : [];
  const weekResults = normalized ? curriculumWeeks.filter((week) => `${week.economics}${week.accounting}${week.business}${week.outcome}`.toLowerCase().includes(normalized)).slice(0, 20) : [];
  const count = lessonResults.length + resourceResults.length + weekResults.length;
  return (
    <div>
      <PageHeading eyebrow="GLOBAL SEARCH" title="搜索整个学习系统" description="可搜索前 14 天完整课程、52 周课程地图、公式、会计科目和术语。" />
      <label className="search-page-input"><Search size={22} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="例如：机会成本、应收账款、汇率、ROE…" /><kbd>Enter</kbd></label>
      {normalized ? <><div className="search-count">找到 <strong>{count}</strong> 个结果</div><section className="search-results">{lessonResults.map((lesson) => <button type="button" key={`lesson-${lesson.day}`} onClick={() => openLesson(lesson.day)}><span className="result-type lesson">完整课程</span><div><h2>Day {lesson.day} · {lesson.title}</h2><p>{lesson.subtitle}</p><small>{lesson.tags.join(" · ")}</small></div><ChevronRight size={18} /></button>)}{resourceResults.map((resource) => <article key={resource.id}><span className="result-type resource">{resource.category}</span><div><h2>{resource.title}</h2><p>{resource.meaning}</p>{resource.expression && <small>{resource.expression}</small>}</div></article>)}{weekResults.map((week) => <article key={`week-${week.week}`}><span className="result-type outline">课程地图</span><div><h2>Week {week.week} · {week.phase}</h2><p>{week.business}</p><small>{week.economics} / {week.accounting}</small></div></article>)}</section>{!count && <div className="empty-state large"><Search size={30} /><h2>没有找到“{query}”</h2><p>试试较短关键词，例如“现金流”“弹性”或“关税”。</p></div>}</> : <section className="search-suggestions"><span>热门入口</span>{["机会成本", "会计等式", "供需", "借贷记账", "弹性", "现金流", "汇率", "ROE"].map((item) => <button type="button" key={item} onClick={() => setQuery(item)}>{item}</button>)}</section>}
    </div>
  );
}
