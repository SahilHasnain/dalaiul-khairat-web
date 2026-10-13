export type PartProgress = {
  partNumber: number;
  lineNumber: number;
  updatedAt: string;
};

export type SavedBookmark = {
  id: string;
  kind: "part" | "dua";
  parentId: number | string;
  lineNumber: number;
  label: string;
  createdAt: string;
};

const PROGRESS_KEY = "dalail-web:progress:v1";
const BOOKMARKS_KEY = "dalail-web:bookmarks:v1";
const COMPLETIONS_KEY = "dalail-web:completions:v1";

export function getSavedProgress(): PartProgress | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = window.localStorage.getItem(PROGRESS_KEY);
    return stored ? JSON.parse(stored) as PartProgress : null;
  } catch {
    return null;
  }
}

export function saveProgress(partNumber: number, lineNumber: number) {
  if (typeof window === "undefined") return;
  const progress = { partNumber, lineNumber, updatedAt: new Date().toISOString() };
  window.localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
  window.dispatchEvent(new CustomEvent("dalail-progress-change"));
}

export function getBookmarks(): SavedBookmark[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = window.localStorage.getItem(BOOKMARKS_KEY);
    const bookmarks = stored ? JSON.parse(stored) as SavedBookmark[] : [];
    return Array.isArray(bookmarks) ? bookmarks : [];
  } catch {
    return [];
  }
}

export function toggleBookmark(bookmark: Omit<SavedBookmark, "id" | "createdAt">) {
  if (typeof window === "undefined") return false;
  const bookmarks = getBookmarks();
  const key = `${bookmark.kind}:${bookmark.parentId}:${bookmark.lineNumber}`;
  const existingIndex = bookmarks.findIndex((item) => item.id === key);
  if (existingIndex >= 0) bookmarks.splice(existingIndex, 1);
  else bookmarks.push({ ...bookmark, id: key, createdAt: new Date().toISOString() });
  window.localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks));
  window.dispatchEvent(new CustomEvent("dalail-bookmarks-change"));
  return existingIndex < 0;
}

export function isBookmarked(kind: SavedBookmark["kind"], parentId: number | string, lineNumber: number) {
  const id = `${kind}:${parentId}:${lineNumber}`;
  return getBookmarks().some((bookmark) => bookmark.id === id);
}

function getLocalDateKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function getCompletedPartsForToday(date = new Date()): number[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = window.localStorage.getItem(COMPLETIONS_KEY);
    const completions = stored ? JSON.parse(stored) as Record<string, number[]> : {};
    return completions[getLocalDateKey(date)] ?? [];
  } catch {
    return [];
  }
}

export function togglePartCompletion(partNumber: number, date = new Date()) {
  if (typeof window === "undefined") return false;
  const stored = window.localStorage.getItem(COMPLETIONS_KEY);
  const completions = stored ? JSON.parse(stored) as Record<string, number[]> : {};
  const dateKey = getLocalDateKey(date);
  const today = completions[dateKey] ?? [];
  completions[dateKey] = today.includes(partNumber)
    ? today.filter((number) => number !== partNumber)
    : [...today, partNumber];
  window.localStorage.setItem(COMPLETIONS_KEY, JSON.stringify(completions));
  window.dispatchEvent(new CustomEvent("dalail-completions-change"));
  return completions[dateKey].includes(partNumber);
}
