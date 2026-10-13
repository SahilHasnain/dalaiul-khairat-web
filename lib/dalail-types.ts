export type DalailLanguage = {
  name: string;
  code: string;
  key: string;
  direction: "ltr" | "rtl";
  order: number;
};

export type DalailLine = {
  number: number;
  texts: Record<string, string>;
};

export type DalailPart = {
  number: number;
  day: string;
  title: string;
  description: string;
  lines: DalailLine[];
};

export type DalailDua = {
  id: number;
  slug: string;
  title: string;
  titleArabic: string;
  lines: DalailLine[];
};

export type DalailContent = {
  title: string;
  fullTitle: string;
  languages: DalailLanguage[];
  parts: DalailPart[];
  duas: DalailDua[];
};
