"use client";

import { useEffect } from "react";
import { convertChineseText, type SiteLanguage } from "../lib/language";

const translatableAttributes = ["aria-label", "placeholder", "title", "alt"];

function isEditableText(node: Text) {
  const element = node.parentElement;
  return Boolean(element?.closest("input, textarea, [contenteditable='true'], [data-language-exempt]"));
}

function translateElement(element: Element, language: SiteLanguage) {
  if (element.closest("[data-language-exempt]")) return;
  for (const attribute of translatableAttributes) {
    const value = element.getAttribute(attribute);
    if (!value) continue;
    const converted = convertChineseText(value, language);
    if (converted !== value) element.setAttribute(attribute, converted);
  }
}

function translateNode(node: Node, language: SiteLanguage) {
  if (node.nodeType === Node.TEXT_NODE) {
    const text = node as Text;
    if (isEditableText(text)) return;
    const value = text.nodeValue ?? "";
    const converted = convertChineseText(value, language);
    if (converted !== value) text.nodeValue = converted;
    return;
  }

  if (node.nodeType !== Node.ELEMENT_NODE) return;
  const element = node as Element;
  translateElement(element, language);
  element.childNodes.forEach((child) => translateNode(child, language));
}

export function LanguageBridge({ root, language }: { root: HTMLElement | null; language: SiteLanguage }) {
  useEffect(() => {
    document.documentElement.lang = language;
    if (!root) return;

    const translate = (node: Node) => translateNode(node, language);
    translate(root);

    const observer = new MutationObserver((records) => {
      for (const record of records) {
        if (record.type === "childList") record.addedNodes.forEach(translate);
        if (record.type === "characterData") translate(record.target);
        if (record.type === "attributes") translateElement(record.target as Element, language);
      }
    });

    observer.observe(root, {
      subtree: true,
      childList: true,
      characterData: true,
      attributes: true,
      attributeFilter: translatableAttributes,
    });

    return () => observer.disconnect();
  }, [language, root]);

  return null;
}
