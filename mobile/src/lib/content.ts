import contentJson from '../../data/dalail-content.json';

export type ReaderLine = { number: number; texts: Record<string, string> };
export type DalailPart = {
  number: number;
  day: string;
  title: string;
  description: string;
  lines: ReaderLine[];
};
export type DalailDua = {
  id: number;
  slug: string;
  title: string;
  titleArabic: string;
  lines: ReaderLine[];
};
export type DalailContent = {
  title: string;
  fullTitle: string;
  parts: DalailPart[];
  duas: DalailDua[];
};

const content = contentJson as DalailContent;
export const DALAIL_TITLE = content.title;
export const PARTS = content.parts;
export const DUAS = content.duas;

export function getPart(number: number) {
  return PARTS.find((part) => part.number === number);
}

export function getDua(slug: string) {
  return DUAS.find((dua) => dua.slug === slug);
}

export function getPartTitle(part: DalailPart) {
  return part.number === 8 ? 'Monday · Cycle closing portion' : `${part.day} · Part ${part.number}`;
}

export type SearchHit = {
  id: string;
  kind: 'part' | 'dua';
  parentId: string | number;
  lineNumber: number;
  title: string;
  subtitle: string;
  text: string;
};

export function searchDalail(query: string): SearchHit[] {
  const normalized = query.toLocaleLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
  if (!normalized) return [];
  const terms = normalized.split(/\s+/);
  const results: SearchHit[] = [];
  const collections = [
    ...PARTS.map((part) => ({ kind: 'part' as const, parentId: part.number, title: getPartTitle(part), subtitle: part.title, lines: part.lines })),
    ...DUAS.map((dua) => ({ kind: 'dua' as const, parentId: dua.slug, title: dua.title, subtitle: 'Dua', lines: dua.lines })),
  ];

  for (const collection of collections) {
    for (const line of collection.lines) {
      const text = line.texts.trans ?? '';
      const haystack = `${collection.title} ${collection.subtitle} ${text}`.toLocaleLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      if (text && terms.every((term) => haystack.includes(term))) {
        results.push({
          id: `${collection.kind}:${collection.parentId}:${line.number}`,
          kind: collection.kind,
          parentId: collection.parentId,
          lineNumber: line.number,
          title: collection.title,
          subtitle: collection.subtitle,
          text: text.length > 190 ? `${text.slice(0, 187).trim()}…` : text,
        });
        if (results.length >= 80) return results;
      }
    }
  }
  return results;
}
