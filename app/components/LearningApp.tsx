"use client";

import {
  BarChart3,
  Bell,
  BookOpen,
  BriefcaseBusiness,
  Calculator,
  CalendarDays,
  ChevronRight,
  CircleHelp,
  FileSearch,
  FileQuestion,
  GraduationCap,
  Home,
  Languages,
  LayoutDashboard,
  LibraryBig,
  LineChart,
  Menu,
  NotebookPen,
  PanelLeftClose,
  RotateCcw,
  Search,
  X,
} from "lucide-react";
import Image from "next/image";
import { useMemo, useState } from "react";
import { lessons } from "../data/lessons";
import { calculateStreak, levelForDays, useStudyState } from "../lib/study-state";
import { practiceStats } from "../lib/study-core";
import type { PathId, ViewId } from "../lib/types";
import {
  AnalyticsView,
  AssessmentsView,
  CurriculumView,
  DashboardView,
  MistakesView,
  NewsLabView,
  PathsView,
  ReviewsView,
  SearchView,
  ToolkitView,
} from "./Views";
import { LessonPlayer } from "./LessonPlayer";
import { LanguageBridge } from "./LanguageBridge";

export type StudyController = ReturnType<typeof useStudyState>;

const mainNav: Array<{
  id: ViewId;
  label: string;
  icon: typeof Home;
}> = [
  { id: "dashboard", label: "学习首页", icon: LayoutDashboard },
  { id: "paths", label: "学习路径", icon: GraduationCap },
  { id: "lesson", label: "今日课程", icon: BookOpen },
  { id: "curriculum", label: "课程地图", icon: CalendarDays },
  { id: "reviews", label: "间隔复习", icon: RotateCcw },
  { id: "mistakes", label: "错题本", icon: NotebookPen },
  { id: "assessments", label: "单元测验", icon: FileQuestion },
];

const resourceNav: Array<{
  id: ViewId;
  label: string;
  icon: typeof Home;
}> = [
  { id: "toolkit", label: "知识与工具", icon: LibraryBig },
  { id: "news", label: "新闻分析", icon: FileSearch },
  { id: "analytics", label: "学习数据", icon: BarChart3 },
];

const viewLabels: Record<ViewId, string> = {
  dashboard: "学习首页",
  paths: "学习路径",
  lesson: "今日课程",
  curriculum: "完整课程地图",
  reviews: "间隔复习",
  mistakes: "错题本",
  assessments: "单元测验",
  toolkit: "知识与工具",
  news: "现实新闻分析",
  analytics: "学习数据",
  search: "全站搜索",
};

export const pathMeta: Record<
  PathId,
  { label: string; short: string; color: string; icon: typeof Home }
> = {
  economics: { label: "经济学", short: "经济", color: "blue", icon: LineChart },
  accounting: { label: "会计学", short: "会计", color: "teal", icon: Calculator },
  business: { label: "综合商业应用", short: "商业", color: "amber", icon: BriefcaseBusiness },
};

export function LearningApp() {
  const study = useStudyState();
  const [view, setView] = useState<ViewId>("dashboard");
  const [lessonDay, setLessonDay] = useState(1);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCompact, setSidebarCompact] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [helpOpen, setHelpOpen] = useState(false);
  const [appRoot, setAppRoot] = useState<HTMLDivElement | null>(null);

  const activeDay = Math.min(Math.max(study.state.currentDay, 1), lessons.length);
  const activeLesson = lessons.find((lesson) => lesson.day === lessonDay) ?? lessons[activeDay - 1];
  const streak = calculateStreak(study.state.sessions);
  const level = levelForDays(study.state.completedDays.length);

  const stats = useMemo(() => {
    const totalMinutes = study.state.sessions.reduce(
      (sum, session) => sum + session.minutes,
      0,
    );
    const { questionsAnswered, correct, accuracy } = practiceStats(
      lessons,
      study.state.answers,
    );
    const pathProgress = (path: PathId) => {
      const pathLessons = lessons.filter((lesson) => lesson.path === path);
      const completed = pathLessons.filter((lesson) =>
        study.state.completedDays.includes(lesson.day),
      ).length;
      return pathLessons.length ? Math.round((completed / pathLessons.length) * 100) : 0;
    };
    return {
      totalMinutes,
      questionsAnswered,
      correct,
      accuracy,
      economicsProgress: pathProgress("economics"),
      accountingProgress: pathProgress("accounting"),
      businessProgress: pathProgress("business"),
    };
  }, [study.state]);

  function navigate(next: ViewId) {
    if (next === "lesson") setLessonDay(activeDay);
    setView(next);
    setSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function openLesson(day: number) {
    setLessonDay(Math.min(Math.max(day, 1), lessons.length));
    setView("lesson");
    setSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function submitSearch(query: string) {
    setSearchQuery(query);
    setView("search");
    setSidebarOpen(false);
  }

  const sharedProps = {
    study,
    stats,
    streak,
    level,
    openLesson,
    navigate,
  };

  return (
    <div ref={setAppRoot} className={`app-shell ${sidebarCompact ? "sidebar-compact" : ""}`}>
      <LanguageBridge root={appRoot} language={study.state.language} />
      <a className="skip-link" href="#main-content">跳到主要内容</a>
      <aside className={`sidebar ${sidebarOpen ? "mobile-open" : ""}`} aria-label="主导航">
        <div className="brand-row">
          <button className="brand" type="button" onClick={() => navigate("dashboard")} aria-label="返回学习首页">
            <Image className="brand-lockup" src="/shangxuetang-brand.png" alt="" width={200} height={80} priority />
            <Image className="brand-icon" src="/favicon.png" alt="" width={192} height={192} />
          </button>
          <button className="mobile-close" type="button" onClick={() => setSidebarOpen(false)} aria-label="关闭导航">
            <X size={20} />
          </button>
        </div>

        <nav className="nav-groups">
          <div className="nav-group">
            <span className="nav-label">学习</span>
            {mainNav.map((item) => {
              const Icon = item.icon;
              const count = item.id === "reviews" ? study.dueReviews.length : item.id === "mistakes" ? study.state.mistakes.filter((m) => !m.resolved).length : 0;
              return (
                <button
                  key={item.id}
                  type="button"
                  className={`nav-item ${view === item.id ? "active" : ""}`}
                  onClick={() => navigate(item.id)}
                  aria-current={view === item.id ? "page" : undefined}
                  title={item.label}
                >
                  <Icon size={19} />
                  <span>{item.label}</span>
                  {count > 0 && <em>{count}</em>}
                </button>
              );
            })}
          </div>
          <div className="nav-group">
            <span className="nav-label">应用与资源</span>
            {resourceNav.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  className={`nav-item ${view === item.id ? "active" : ""}`}
                  onClick={() => navigate(item.id)}
                  aria-current={view === item.id ? "page" : undefined}
                  title={item.label}
                >
                  <Icon size={19} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </nav>

        <div className="sidebar-program">
          <div className="program-topline">
            <span>年度计划</span><strong>{study.state.completedDays.length}/365 天</strong>
          </div>
          <div className="mini-progress" aria-label={`年度计划完成 ${Math.round(study.state.completedDays.length / 3.65)}%`}>
            <span style={{ width: `${Math.min(100, study.state.completedDays.length / 3.65)}%` }} />
          </div>
          <small>52 周核心 · 可扩展至 78 周</small>
        </div>

        <button className="collapse-button" type="button" onClick={() => setSidebarCompact((value) => !value)} aria-label={sidebarCompact ? "展开侧边栏" : "收起侧边栏"}>
          <PanelLeftClose size={18} /> <span>{sidebarCompact ? "展开" : "收起菜单"}</span>
        </button>
      </aside>

      {sidebarOpen && <button className="sidebar-backdrop" type="button" aria-label="关闭导航" onClick={() => setSidebarOpen(false)} />}

      <div className="app-main">
        <header className={`topbar ${view === "dashboard" ? "dashboard-topbar" : ""}`}>
          <div className="topbar-left">
            <button className="menu-button" type="button" onClick={() => setSidebarOpen(true)} aria-label="打开导航">
              <Menu size={22} />
            </button>
            <div className="breadcrumb">
              <span>我的课程</span><ChevronRight size={14} /><strong>{viewLabels[view]}</strong>
            </div>
          </div>
          <form className="global-search" onSubmit={(event) => { event.preventDefault(); submitSearch(searchQuery); }} role="search">
            <Search size={18} />
            <input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="搜索课程、公式、科目或术语…" aria-label="全站搜索" />
            <kbd>Ctrl K</kbd>
          </form>
          <div className="topbar-actions">
            <button
              className="icon-button language-button"
              type="button"
              onClick={study.toggleLanguage}
              title={study.state.language === "zh-CN" ? "切换为繁体中文" : "切换为简体中文"}
              aria-label={study.state.language === "zh-CN" ? "当前为简体中文，切换为繁体中文" : "当前为繁体中文，切换为简体中文"}
            >
              <Languages size={19} /><span>{study.state.language === "zh-CN" ? "简" : "繁"}</span>
            </button>
            <button className="icon-button notification-button" type="button" onClick={() => navigate("reviews")} aria-label={`${study.dueReviews.length} 项到期复习`}>
              <Bell size={19} />
              {study.dueReviews.length > 0 && <span className="notification-dot" />}
            </button>
            <button className="level-chip" type="button" onClick={() => navigate("analytics")}>
              <span className="level-avatar">L{level.level}</span>
              <span><small>当前等级</small><strong>{level.label}</strong></span>
            </button>
          </div>
        </header>

        <main id="main-content" className="page-content" tabIndex={-1}>
          {view === "dashboard" && <DashboardView {...sharedProps} />}
          {view === "paths" && <PathsView {...sharedProps} />}
          {view === "lesson" && (
            <LessonPlayer
              lesson={activeLesson}
              study={study}
              openLesson={openLesson}
              navigate={navigate}
            />
          )}
          {view === "curriculum" && <CurriculumView {...sharedProps} />}
          {view === "reviews" && <ReviewsView {...sharedProps} />}
          {view === "mistakes" && <MistakesView {...sharedProps} />}
          {view === "assessments" && <AssessmentsView {...sharedProps} />}
          {view === "toolkit" && <ToolkitView {...sharedProps} />}
          {view === "news" && <NewsLabView {...sharedProps} />}
          {view === "analytics" && <AnalyticsView {...sharedProps} />}
          {view === "search" && <SearchView {...sharedProps} query={searchQuery} setQuery={setSearchQuery} />}
        </main>

        <nav className="mobile-bottom-nav" aria-label="移动端导航">
          {[
            { id: "dashboard" as const, label: "首页", icon: Home },
            { id: "paths" as const, label: "路径", icon: GraduationCap },
            { id: "lesson" as const, label: "学习", icon: BookOpen },
            { id: "reviews" as const, label: "复习", icon: RotateCcw },
            { id: "toolkit" as const, label: "资源", icon: LibraryBig },
          ].map((item) => {
            const Icon = item.icon;
            return <button key={item.id} type="button" className={view === item.id ? "active" : ""} onClick={() => navigate(item.id)}><Icon size={20} /><span>{item.label}</span></button>;
          })}
        </nav>
      </div>

      <button className="help-fab" type="button" onClick={() => setHelpOpen((value) => !value)} aria-expanded={helpOpen} aria-label="学习帮助">
        <CircleHelp size={21} />
      </button>
      {helpOpen && (
        <div className="help-popover">
          <button type="button" onClick={() => setHelpOpen(false)} aria-label="关闭"><X size={16} /></button>
          <span className="eyebrow">学习原则</span>
          <h3>先判断，再看解释</h3>
          <p>不要急着记答案。先用自己的话作出判断，再检查因果链；答错会自动进入 1、3、7、14、30 天复习。</p>
          <button className="text-link" type="button" onClick={() => { navigate("lesson"); setHelpOpen(false); }}>开始今日课程 <ChevronRight size={15} /></button>
        </div>
      )}
    </div>
  );
}

export type SharedViewProps = {
  study: StudyController;
  stats: {
    totalMinutes: number;
    questionsAnswered: number;
    correct: number;
    accuracy: number | null;
    economicsProgress: number;
    accountingProgress: number;
    businessProgress: number;
  };
  streak: number;
  level: { name: string; label: string; level: number };
  openLesson: (day: number) => void;
  navigate: (view: ViewId) => void;
};
