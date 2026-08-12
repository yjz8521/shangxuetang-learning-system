import assert from "node:assert/strict";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", { headers: { accept: "text/html" } }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders the finished learning dashboard", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<html lang="zh-CN">/);
  assert.match(html, /<title>商学堂｜经济学 × 会计学长期学习系统<\/title>/);
  assert.match(html, /今天，继续把知识变成判断力/);
  assert.match(html, /Day 1/);
  assert.match(html, /稀缺：一切经济问题的起点/);
  assert.match(html, /单元测验/);
  assert.match(html, /52 周核心/);
  assert.doesNotMatch(html, /codex-preview|Building your site|Your site is taking shape/i);
});

test("exposes the requested learning-system entry points", async () => {
  const html = await (await render()).text();
  for (const label of [
    "学习首页",
    "学习路径",
    "今日课程",
    "课程地图",
    "间隔复习",
    "错题本",
    "单元测验",
    "知识与工具",
    "新闻分析",
    "学习数据",
  ]) {
    assert.match(html, new RegExp(label));
  }
});
