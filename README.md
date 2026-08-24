# 商学堂：经济学 × 会计学 × 商业应用

面向国际贸易学生、小型公司经营者与投资学习者的中文长期学习系统。课程按每天 60–90 分钟设计，从零基础逐步连接经济学、会计学、国际贸易、公司经营、财务报表与投资分析。

公开网站：[商学堂学习系统](https://shangxuetang-business-learning.fcr4xsmyyb.chatgpt.site/)

## 当前完成范围

- Day 1–14：完整可学习正文，不是标题占位。
- 两个单元测验：每个单元 10 道综合选择题、1 道模拟商业案例、答案解析与掌握度。
- 52 周核心课程地图；另有第 53–78 周扩展包结构。
- 三条路径：经济学、会计学、综合商业应用。
- 苏格拉底模式、错题本、收藏、全站搜索、新闻分析模板和学习数据页。
- 课程阅读字号优化，支持简体中文／繁体中文切换，并在浏览器本机保存语言选择。
- 1、3、7、14、30 天绝对复习节点。
- 浏览器本机保存进度、反思、测验、错题、复习和新闻草稿。

目前只有前 14 天具备完整每日正文。Day 15–365 仍是课程地图与可扩展数据结构，不能把它描述成已经完成的 365 天课程。

## Windows 运行方法

需要 Node.js 22.13 或更新版本。

```powershell
cd "C:\Users\yjz85\Documents\Codex\2026-08-12\referenced-chatgpt-conversation-this-is-an"
npm ci
npm run dev
```

浏览器打开终端显示的本机地址，通常是：

```text
http://localhost:3000/
```

正式检查：

```powershell
npm run typecheck
npm run lint
npm test
```

`npm test` 会重新构建网站，并检查首页、14 天课程字段、两个单元测验、52 周地图、正确率口径与复习节点。

## 主要文件

```text
app/
├─ components/
│  ├─ LearningApp.tsx     # 导航、页面切换、全站统计
│  ├─ LessonPlayer.tsx    # 每日五阶段课程播放器
│  ├─ Views.tsx           # Dashboard、路径、测验、复习、错题等页面
│  └─ ConceptCanvas.tsx   # 教学图表与互动控制
├─ data/
│  ├─ lessons.ts          # Day 1–14 完整课程
│  ├─ assessments.ts      # 第一、第二单元测验与案例
│  ├─ curriculum.ts       # 52 周课程地图和 53–78 周扩展包
│  └─ resources.ts        # 公式、科目、术语、知识域和新闻分析框架
├─ lib/
│  ├─ types.ts            # 课程、测验、复习和学习记录类型
│  ├─ study-core.ts       # 可测试的统计、复习日期和默认状态逻辑
│  └─ study-state.ts      # localStorage、错题、复习和完成课程动作
├─ globals.css            # 桌面和手机响应式样式
└─ page.tsx               # 网站入口
tests/
├─ rendered-html.test.mjs
└─ study-core.test.ts
```

## 每日课程数据结构

`app/data/lessons.ts` 中每一课都通过 `makeLesson` 建立。主要字段：

```ts
{
  day: 15,
  week: 3,
  path: "economics", // economics | accounting | business
  title: "课程标题",
  subtitle: "这一课解决什么问题",
  duration: 75,
  difficulty: "基础",
  tags: ["主题一", "主题二"],
  objectives: ["目标一", "目标二", "目标三"],
  prerequisites: ["前置知识"],
  socratic: {
    question: "先判断的问题",
    options: ["选项 A", "选项 B"],
    answer: "正确选项文字"
  },
  core: [
    { heading: "核心概念", paragraphs: ["解释正文"] }
  ],
  intuition: "直觉解释",
  formula: [{ expression: "公式", explanation: "适用条件" }],
  // 会计课可改用 entries 写分录
  example: {
    title: "案例标题",
    label: "模拟公司 · 模拟数据",
    scenario: "情境",
    steps: ["分析步骤"],
    conclusion: "结论与限制"
  },
  applications: ["现实应用"],
  misconceptions: [{ myth: "误区", correction: "纠正" }],
  questions: [
    {
      id: "d15-q1",
      prompt: "题目",
      options: ["A", "B", "C", "D"],
      answer: 0,
      explanation: "解析",
      concept: "知识点"
    }
  ],
  summary: ["今日总结"],
  extension: "延伸思考",
  reviewPreview: "未来复习时要提取什么"
}
```

默认学习计划由 `makeLesson` 统一加入：8 分钟复习、25 分钟概念、18 分钟案例、18 分钟练习、6 分钟总结，共 75 分钟。若某课需要调整，可传入 60–90 分钟内的 `duration`，并同步修改计划生成逻辑或为该课提供独立计划。

## 新增 Day 15 之后课程

1. 在 `app/data/lessons.ts` 的数组末尾增加一个完整课程对象。
2. 确保 `day` 连续、题目 `id` 全站唯一、案例明确标注“模拟”。
3. 每课至少保留三道练习；每个单元另外在 `app/data/assessments.ts` 提供 10–20 道测验和案例题。
4. 在 `app/data/curriculum.ts` 对应周次保持主题与每日课程一致。
5. 执行 `npm test`；测试会检查课程时长、必需字段、周次与测验数量。

## 扩展到完整 365 天

建议按“每次完成一个 4 周学习块”的方式扩写，不要一次生成大量只有标题的课程：

1. 每 4 周约 28 天：前三周新课，第 4 周综合考试、案例与复盘。
2. 每天保持五阶段和 60–90 分钟总时长。
3. 每周同时连接经济学、会计学和商业应用，避免三条路径彼此孤立。
4. 每个 4 周块完成后，再开放下一块；同时扩充公式表、科目表、术语和知识地图关系。
5. Day 365 用于结业考试、毕业项目答辩与个人能力地图，不用新增知识点填满天数。

## 学习数据与隐私

默认使用浏览器 `localStorage`，键名为：

```text
shangxue-study-state-v1
```

保存内容包括课程进度、实际学习时长、答案、反思、错题、复习节点、收藏、单元测验和新闻草稿。数据只在当前浏览器／设备中；清除浏览器资料可能丢失。可在“学习数据”页面导出 JSON 备份。

## 内容可靠性约定

- 模拟公司、订单、报价与财报数字必须明确标注为教学模拟。
- 新闻分析页不会联网，也不会假装验证用户贴入的新闻。
- 学习时间使用从打开课程到完成课程的实际经过时间，同时保留计划时长。
- 案例文字答案不由系统假装自动评分；系统显示评分检查点与参考分析，掌握度只按可客观判分的选择题计算。
