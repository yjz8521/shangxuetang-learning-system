"use client";

import { useEffect, useRef, useState } from "react";
import type { Lesson } from "../lib/types";

type ChartType =
  | NonNullable<Lesson["visual"]>
  | "costs"
  | "ad-as"
  | "money"
  | "forex"
  | "trade";

interface ConceptCanvasProps {
  type: ChartType;
  demandShift?: number;
  supplyShift?: number;
  className?: string;
}

const palette = {
  ink: "#102a2d",
  muted: "#6d7f80",
  grid: "#dce8e6",
  teal: "#0d8b78",
  orange: "#e47745",
  blue: "#2e6fa8",
  violet: "#7459a5",
  amber: "#c99732",
};

function line(
  context: CanvasRenderingContext2D,
  points: Array<[number, number]>,
  color: string,
  width = 3,
  dash: number[] = [],
) {
  context.beginPath();
  context.setLineDash(dash);
  points.forEach(([x, y], index) =>
    index === 0 ? context.moveTo(x, y) : context.lineTo(x, y),
  );
  context.strokeStyle = color;
  context.lineWidth = width;
  context.lineCap = "round";
  context.lineJoin = "round";
  context.stroke();
  context.setLineDash([]);
}

function label(
  context: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  color = palette.ink,
  size = 13,
) {
  context.font = `600 ${size}px "Microsoft YaHei", sans-serif`;
  context.fillStyle = color;
  context.fillText(text, x, y);
}

function axes(context: CanvasRenderingContext2D, width: number, height: number) {
  context.clearRect(0, 0, width, height);
  context.fillStyle = "#fbfdfc";
  context.fillRect(0, 0, width, height);
  for (let x = 58; x < width - 20; x += 48) {
    line(context, [[x, 24], [x, height - 42]], palette.grid, 1);
  }
  for (let y = 32; y < height - 40; y += 42) {
    line(context, [[50, y], [width - 18, y]], palette.grid, 1);
  }
  line(context, [[50, 22], [50, height - 40], [width - 16, height - 40]], palette.ink, 2);
}

export function ConceptCanvas({
  type,
  demandShift = 0,
  supplyShift = 0,
  className,
}: ConceptCanvasProps) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;
    const width = canvas.width;
    const height = canvas.height;
    axes(context, width, height);
    const x0 = 50;
    const y0 = height - 40;
    const right = width - 20;
    const top = 26;

    if (type === "supply-demand" || type === "elasticity" || type === "forex") {
      const d = demandShift * 36;
      const s = supplyShift * 36;
      const demandStart: [number, number] = [x0 + 32 + d, top + 20];
      const demandEnd: [number, number] = [right - 26 + d, y0 - 20];
      const supplyStart: [number, number] = [x0 + 28 + s, y0 - 18];
      const supplyEnd: [number, number] = [right - 32 + s, top + 20];
      if (type === "elasticity") {
        line(context, [[x0 + 160, top + 12], [x0 + 250, y0 - 15]], palette.blue, 4);
        line(context, [[x0 + 55, top + 88], [right - 18, top + 140]], palette.orange, 4);
        label(context, "较缺乏弹性", x0 + 172, top + 20, palette.blue);
        label(context, "较富有弹性", right - 130, top + 127, palette.orange);
      } else {
        line(context, [demandStart, demandEnd], palette.blue, 4);
        line(context, [supplyStart, supplyEnd], palette.orange, 4);
        label(context, type === "forex" ? "外汇需求 D" : "需求 D", demandEnd[0] - 72, demandEnd[1] - 8, palette.blue);
        label(context, type === "forex" ? "外汇供给 S" : "供给 S", supplyEnd[0] - 72, supplyEnd[1] - 8, palette.orange);
        const denominator = (demandEnd[0] - demandStart[0]) - (supplyEnd[0] - supplyStart[0]);
        const t = ((supplyStart[1] - demandStart[1]) - ((supplyStart[0] - demandStart[0]) * (demandEnd[1] - demandStart[1]) / (demandEnd[0] - demandStart[0]))) /
          ((demandEnd[1] - demandStart[1]) - ((supplyEnd[1] - supplyStart[1]) * (demandEnd[0] - demandStart[0]) / (supplyEnd[0] - supplyStart[0])) || denominator || 1);
        const eqX = Math.max(x0 + 50, Math.min(right - 50, demandStart[0] + (demandEnd[0] - demandStart[0]) * t));
        const eqY = Math.max(top + 30, Math.min(y0 - 25, demandStart[1] + (demandEnd[1] - demandStart[1]) * t));
        context.beginPath();
        context.arc(eqX, eqY, 6, 0, Math.PI * 2);
        context.fillStyle = palette.teal;
        context.fill();
        line(context, [[x0, eqY], [eqX, eqY], [eqX, y0]], palette.teal, 1.5, [5, 5]);
        label(context, "均衡 E", eqX + 9, eqY - 7, palette.teal);
      }
      label(context, type === "forex" ? "汇率" : "价格 P", 4, 25);
      label(context, type === "forex" ? "外汇数量" : "数量 Q", right - 62, height - 10);
    }

    if (type === "ppf") {
      context.beginPath();
      context.moveTo(x0 + 25, top + 18);
      context.bezierCurveTo(x0 + 80, top + 40, right - 105, y0 - 105, right - 24, y0 - 15);
      context.strokeStyle = palette.teal;
      context.lineWidth = 4;
      context.stroke();
      [[135, 82], [215, 130], [320, 206]].forEach(([x, y], index) => {
        context.beginPath();
        context.arc(x, y, 6, 0, Math.PI * 2);
        context.fillStyle = index === 1 ? palette.orange : palette.teal;
        context.fill();
        label(context, ["A", "B", "C"][index], x + 10, y - 4);
      });
      label(context, "资本品", 4, 25);
      label(context, "消费品", right - 62, height - 10);
      label(context, "生产可能性边界", right - 152, y0 - 52, palette.teal);
    }

    if (type === "costs") {
      context.beginPath();
      context.moveTo(x0 + 25, top + 30);
      context.bezierCurveTo(x0 + 120, y0 - 20, right - 125, y0 - 20, right - 30, top + 32);
      context.strokeStyle = palette.blue;
      context.lineWidth = 4;
      context.stroke();
      context.beginPath();
      context.moveTo(x0 + 30, top + 62);
      context.bezierCurveTo(x0 + 105, y0 - 8, right - 130, y0 - 8, right - 28, top + 80);
      context.strokeStyle = palette.teal;
      context.lineWidth = 4;
      context.stroke();
      line(context, [[x0 + 48, y0 - 15], [right - 55, top + 28]], palette.orange, 4);
      label(context, "ATC", right - 58, top + 30, palette.blue);
      label(context, "AVC", right - 58, top + 78, palette.teal);
      label(context, "MC", right - 94, top + 48, palette.orange);
      label(context, "单位成本", 2, 25);
      label(context, "产量", right - 45, height - 10);
    }

    if (type === "ad-as") {
      line(context, [[x0 + 40, top + 22], [right - 28, y0 - 18]], palette.blue, 4);
      line(context, [[x0 + 36, y0 - 20], [right - 32, top + 20]], palette.orange, 4);
      line(context, [[right - 82, y0 - 15], [right - 82, top + 16]], palette.violet, 3);
      label(context, "AD", right - 50, y0 - 22, palette.blue);
      label(context, "SRAS", right - 75, top + 18, palette.orange);
      label(context, "LRAS", right - 120, top + 42, palette.violet);
      label(context, "物价水平", 2, 25);
      label(context, "实际产出", right - 70, height - 10);
    }

    if (type === "money") {
      line(context, [[x0 + 40, top + 24], [right - 35, y0 - 20]], palette.blue, 4);
      line(context, [[right - 135, y0 - 10], [right - 135, top + 12]], palette.orange, 4);
      label(context, "货币需求", right - 92, y0 - 28, palette.blue);
      label(context, "货币供给", right - 180, top + 34, palette.orange);
      label(context, "利率", 12, 25);
      label(context, "货币量", right - 58, height - 10);
    }

    if (type === "trade") {
      line(context, [[x0 + 40, top + 20], [right - 32, y0 - 18]], palette.blue, 4);
      line(context, [[x0 + 35, y0 - 20], [right - 40, top + 22]], palette.orange, 4);
      line(context, [[x0 + 10, top + 150], [right - 12, top + 150]], palette.teal, 3);
      line(context, [[x0 + 10, top + 105], [right - 12, top + 105]], palette.violet, 3, [7, 5]);
      label(context, "世界价格", x0 + 10, top + 144, palette.teal);
      label(context, "含关税价格", x0 + 10, top + 99, palette.violet);
      label(context, "国内需求", right - 82, y0 - 25, palette.blue);
      label(context, "国内供给", right - 88, top + 26, palette.orange);
      label(context, "价格", 12, 25);
      label(context, "数量", right - 45, height - 10);
    }

    if (type === "equation") {
      const values = [
        { label: "资产", value: 100, color: palette.teal },
        { label: "负债", value: 38, color: palette.orange },
        { label: "权益", value: 62, color: palette.blue },
      ];
      values.forEach((item, index) => {
        const x = 78 + index * 130;
        const h = item.value * 1.65;
        context.fillStyle = item.color;
        context.fillRect(x, y0 - h, 72, h);
        label(context, item.label, x + 13, y0 + 24, item.color, 14);
        label(context, String(item.value), x + 25, y0 - h - 10, item.color, 15);
      });
      label(context, "资产 100 = 负债 38 + 权益 62", 92, 30, palette.ink, 15);
    }

    if (type === "statements") {
      const boxes = [
        { x: 68, title: "利润表", sub: "收入 − 费用 = 利润", color: palette.blue },
        { x: 206, title: "资产负债表", sub: "期末财务状况", color: palette.teal },
        { x: 344, title: "现金流量表", sub: "现金为何增减", color: palette.orange },
      ];
      boxes.forEach((box) => {
        context.fillStyle = "#ffffff";
        context.strokeStyle = box.color;
        context.lineWidth = 3;
        context.beginPath();
        context.roundRect(box.x, 82, 112, 115, 12);
        context.fill();
        context.stroke();
        label(context, box.title, box.x + 15, 112, box.color, 14);
        context.font = '12px "Microsoft YaHei", sans-serif';
        context.fillStyle = palette.muted;
        const words = box.sub.split(" ");
        words.forEach((word, index) => context.fillText(word, box.x + 12, 146 + index * 18));
      });
      line(context, [[180, 138], [202, 138]], palette.ink, 2);
      line(context, [[318, 138], [340, 138]], palette.ink, 2);
      label(context, "净利润进入权益；现金变化必须与期末现金勾稽", 100, 244, palette.ink, 14);
    }

    if (type === "t-account") {
      line(context, [[width / 2, 42], [width / 2, y0 - 10]], palette.ink, 2);
      line(context, [[112, 72], [right - 65, 72]], palette.ink, 2);
      label(context, "借方 Debit", 130, 60, palette.blue, 15);
      label(context, "贷方 Credit", width / 2 + 50, 60, palette.orange, 15);
      label(context, "+ 资产 / 费用", 126, 116, palette.blue, 14);
      label(context, "− 资产 / 费用", width / 2 + 44, 116, palette.orange, 14);
      label(context, "− 负债 / 权益 / 收入", 92, 162, palette.blue, 14);
      label(context, "+ 负债 / 权益 / 收入", width / 2 + 22, 162, palette.orange, 14);
      label(context, "借贷只是左右，不等于好坏或加减", 121, 228, palette.ink, 14);
    }
  }, [type, demandShift, supplyShift]);

  return (
    <canvas
      ref={ref}
      width={520}
      height={300}
      className={className}
      role="img"
      aria-label={`教学示意图：${type}`}
    />
  );
}

export const chartOptions: Array<{ id: ChartType; title: string; note: string }> = [
  { id: "supply-demand", title: "供需与曲线移动", note: "需求右移通常推高均衡价格与数量；供给右移通常压低价格并增加数量。" },
  { id: "ppf", title: "PPF 与机会成本", note: "边界上的点有效率；边界内表示资源未充分利用；边界外在当前条件下不可达。" },
  { id: "elasticity", title: "需求弹性", note: "越平缓的需求曲线在同一坐标尺度下通常越敏感，但真正判断仍应计算百分比变化。" },
  { id: "costs", title: "企业成本曲线", note: "边际成本穿过平均变动成本与平均总成本的最低点。" },
  { id: "ad-as", title: "AD–AS", note: "总需求和短期总供给共同决定短期产出与物价；长期产出由生产能力约束。" },
  { id: "money", title: "货币市场", note: "在简化模型中，货币供给与货币需求的交点决定均衡利率。" },
  { id: "forex", title: "外汇市场", note: "先明确汇率标价方向，再判断外汇需求与供给变化。" },
  { id: "trade", title: "关税示意", note: "小国模型中，关税推高国内价格、减少进口，并产生消费者损失与无谓损失。" },
  { id: "equation", title: "会计等式", note: "交易可能同时改变等式两边或资产内部结构，但总会保持平衡。" },
  { id: "t-account", title: "T 账户", note: "借贷是账户的左、右方向；增加在哪边取决于账户类别。" },
  { id: "statements", title: "三大报表关联", note: "利润表解释经营成果，资产负债表呈现时点状况，现金流量表解释现金变化。" },
];

export function ChartLab() {
  const [type, setType] = useState<ChartType>("supply-demand");
  const [demandShift, setDemandShift] = useState(0);
  const [supplyShift, setSupplyShift] = useState(0);
  const selected = chartOptions.find((item) => item.id === type) ?? chartOptions[0];
  const interactive = type === "supply-demand" || type === "forex";

  return (
    <div className="chart-lab">
      <div className="chart-tabs" role="tablist" aria-label="教学图表">
        {chartOptions.map((option) => (
          <button
            key={option.id}
            type="button"
            role="tab"
            aria-selected={type === option.id}
            className={type === option.id ? "active" : ""}
            onClick={() => setType(option.id)}
          >
            {option.title}
          </button>
        ))}
      </div>
      <div className="chart-stage">
        <div>
          <span className="eyebrow">互动教学图示 · 非实时数据</span>
          <h3>{selected.title}</h3>
          <ConceptCanvas
            type={type}
            demandShift={demandShift}
            supplyShift={supplyShift}
            className="concept-canvas"
          />
        </div>
        <div className="chart-controls">
          <p>{selected.note}</p>
          {interactive ? (
            <>
              <label>
                需求位置：{demandShift > 0 ? "右移" : demandShift < 0 ? "左移" : "基准"}
                <input
                  type="range"
                  min="-1"
                  max="1"
                  step="1"
                  value={demandShift}
                  onChange={(event) => setDemandShift(Number(event.target.value))}
                />
              </label>
              <label>
                供给位置：{supplyShift > 0 ? "右移" : supplyShift < 0 ? "左移" : "基准"}
                <input
                  type="range"
                  min="-1"
                  max="1"
                  step="1"
                  value={supplyShift}
                  onChange={(event) => setSupplyShift(Number(event.target.value))}
                />
              </label>
              <div className="data-alternative">
                <strong>文字替代：</strong>
                需求{demandShift > 0 ? "增加" : demandShift < 0 ? "减少" : "不变"}；供给
                {supplyShift > 0 ? "增加" : supplyShift < 0 ? "减少" : "不变"}。请先判断价格与数量，再观察交点。
              </div>
            </>
          ) : (
            <div className="data-alternative">
              <strong>阅读方法：</strong>先读纵轴与横轴，再辨认曲线、移动方向与交点；最后用一句因果链解释。
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
