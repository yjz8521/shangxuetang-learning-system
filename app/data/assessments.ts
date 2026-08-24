import type { ChoiceQuestion, UnitAssessment } from "../lib/types";
import { lessons } from "./lessons";

const QUESTIONS_PER_UNIT = 10;

// 从某一周的题目池中，均匀抽取最多 QUESTIONS_PER_UNIT 道题。
// 不写死索引：题池有多少题都安全，横跨整周各课均匀取样，
// 题目不足 10 道时有几道取几道，绝不产生空题。
function questionsForWeek(week: number): ChoiceQuestion[] {
  const pool = lessons
    .filter((lesson) => lesson.week === week)
    .flatMap((lesson) => lesson.questions);

  if (pool.length === 0) return [];

  const count = Math.min(QUESTIONS_PER_UNIT, pool.length);

  // 在题池上均匀取 count 个位置：题池越大，间隔越大，
  // 保证抽到的题横跨整周，而不是全挤在前面几课。
  const picked: ChoiceQuestion[] = [];
  const seen = new Set<number>();
  for (let position = 0; position < count; position += 1) {
    let index = Math.round((position * (pool.length - 1)) / Math.max(count - 1, 1));
    // 均匀取样在题池很小时可能算出重复索引，往后顺移到下一个未用位置。
    while (seen.has(index)) index = (index + 1) % pool.length;
    seen.add(index);
    picked.push({
      ...pool[index],
      id: `unit-${week}-q${position + 1}`,
    });
  }

  return picked;
}

export const unitAssessments: UnitAssessment[] = [
  {
    id: "unit-1",
    week: 1,
    title: "第一单元综合测验",
    dayRange: "Day 1–7",
    description: "检验经济学思维、机会成本、PPF、会计等式、借贷记账与三大报表之间的连接。",
    questions: questionsForWeek(1),
    caseStudy: {
      title: "海桥贸易的第一笔订单",
      label: "模拟公司 · 模拟数据",
      scenario: "海桥贸易可用 100,000 元现金。一笔订单需先支付 60,000 元货款，预计销售 82,000 元，但客户将在 45 天后付款；同一时间，公司也可用这笔资金取得一笔确定的 8,000 元服务收入。",
      prompt: "请用 80 字以上说明：接单的机会成本是什么？交易会怎样影响会计等式、利润与现金？仅看预计毛利是否足够决定接单？",
      rubric: [
        "指出最佳替代方案的 8,000 元是机会成本，而非全部支出之和",
        "区分赊销形成的收入／应收账款与当期现金流",
        "至少提出一个需要验证的经营约束，例如回款、交付、坏账或现金缓冲",
      ],
      referenceAnswer: "预计会计毛利为 22,000 元，但经济利润还需扣除放弃的 8,000 元最佳替代收入。采购先使现金减少、存货增加；销售满足确认条件后会形成收入、应收账款并结转成本，利润可能增加，却不代表 45 天内收到现金。接单前还要检验现金缓冲、回款与履约风险。",
    },
  },
  {
    id: "unit-2",
    week: 2,
    title: "第二单元综合测验",
    dayRange: "Day 8–14",
    description: "检验供需均衡、弹性、账簿循环、权责发生制、调整分录与基础财报分析。",
    questions: questionsForWeek(2),
    caseStudy: {
      title: "汇率冲击后的报价与月结",
      label: "模拟公司 · 模拟数据",
      scenario: "海桥贸易以外币采购一批商品。采购成本折合 70,000 元，原报价收入 100,000 元；汇率变化令预计补货成本上升 10%，客户仍要求 60 天账期。月末还有 3,000 元已发生但未支付的仓储费。",
      prompt: "请用 80 字以上分析：成本冲击可能怎样移动供给并影响均衡？公司应如何重新判断价格、弹性、毛利与现金？月末仓储费为何需要调整分录？",
      rubric: [
        "说明成本上升通常使供给减少，并区分曲线移动与沿曲线移动",
        "结合需求弹性讨论调价、销量、毛利与应收现金压力",
        "按权责发生制确认 3,000 元仓储费用及相应应付项目",
      ],
      referenceAnswer: "采购成本上升通常使供给曲线左移；市场价格与数量的最终变化仍取决于需求。公司不能只把 10% 成本机械加价，应结合需求弹性评估调价后的销量、毛利额与 60 天应收造成的现金缺口。仓储服务已在本期发生，即使尚未付款，也应借记仓储费用、贷记应付费用 3,000 元。",
    },
  },
];
