import contentJson from "@/data/dalail-content.json";
import type { DalailContent, DalailPart } from "@/lib/dalail-types";
import { normalizeSearchText } from "@/lib/dalail-utils";

export type { DalailContent, DalailDua, DalailLanguage, DalailLine, DalailPart } from "@/lib/dalail-types";

export type SearchResult = {
  kind: "part" | "dua";
  href: string;
  title: string;
  subtitle: string;
  lineNumber: number;
  snippet: string;
};

const content = contentJson as DalailContent;

export const DALAIL_TITLE = content.title;
export const DALAIL_FULL_TITLE = content.fullTitle;
export const DALAIL_LANGUAGES = content.languages;
export const DALAIL_PARTS = content.parts;
export const DALAIL_DUAS = content.duas;
export const DEFAULT_TRANSLATION_KEY = "trans";

export function getPart(partNumber: number) {
  return DALAIL_PARTS.find((part) => part.number === partNumber) ?? null;
}

export function getDua(slug: string) {
  return DALAIL_DUAS.find((dua) => dua.slug === slug) ?? null;
}

export function getLanguage(key: string) {
  return DALAIL_LANGUAGES.find((language) => language.key === key) ?? DALAIL_LANGUAGES[3];
}

export function getPartLabel(part: DalailPart) {
  if (part.number === 8) return "Monday · Cycle closing portion";
  return `${part.day} · Part ${part.number}`;
}

function makeSnippet(text: string, query: string) {
  const index = normalizeSearchText(text).indexOf(normalizeSearchText(query));
  if (text.length <= 170) return text;
  const start = Math.max(0, index - 55);
  const end = Math.min(text.length, start + 170);
  return `${start > 0 ? "…" : ""}${text.slice(start, end).trim()}${end < text.length ? "…" : ""}`;
}

export function searchDalail(query: string, languageKey: string, limit = 80): SearchResult[] {
  const normalizedQuery = normalizeSearchText(query);
  if (!normalizedQuery) return [];
  const terms = normalizedQuery.split(" ");
  const results: SearchResult[] = [];

  for (const part of DALAIL_PARTS) {
    for (const line of part.lines) {
      const text = line.texts[languageKey] ?? "";
      const haystack = normalizeSearchText(`${part.day} ${part.title} ${text}`);
      if (terms.every((term) => haystack.includes(term))) {
        results.push({
          kind: "part",
          href: `/read/${part.number}#line-${line.number}`,
          title: `Part ${part.number} · ${part.day}`,
          subtitle: part.title,
          lineNumber: line.number,
          snippet: makeSnippet(text || part.title, query),
        });
      }
    }
  }

  for (const dua of DALAIL_DUAS) {
    for (const line of dua.lines) {
      const text = line.texts[languageKey] ?? "";
      const haystack = normalizeSearchText(`${dua.title} ${dua.titleArabic} ${text}`);
      if (terms.every((term) => haystack.includes(term))) {
        results.push({
          kind: "dua",
          href: `/dua/${dua.slug}#line-${line.number}`,
          title: dua.title,
          subtitle: "Dua",
          lineNumber: line.number,
          snippet: makeSnippet(text || dua.title, query),
        });
      }
    }
  }

  return results.slice(0, limit);
}
