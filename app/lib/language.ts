import OpenCC from "opencc-js";

export type SiteLanguage = "zh-CN" | "zh-TW";

const toTraditional = OpenCC.Converter({ from: "cn", to: "tw" });
const toSimplified = OpenCC.Converter({ from: "tw", to: "cn" });

export function convertChineseText(text: string, language: SiteLanguage) {
  return language === "zh-TW" ? toTraditional(text) : toSimplified(text);
}
