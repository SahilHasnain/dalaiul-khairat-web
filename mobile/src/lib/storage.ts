import AsyncStorage from '@react-native-async-storage/async-storage';

const PROGRESS_KEY = 'dalail-mobile:progress';
const COMPLETION_KEY = 'dalail-mobile:completed';
const BOOKMARKS_KEY = 'dalail-mobile:bookmarks';

export type SavedProgress = { partNumber: number; lineNumber: number; updatedAt: string };
export type SavedBookmark = {
  id: string;
  kind: 'part' | 'dua';
  parentId: string | number;
  lineNumber: number;
  title: string;
};

async function readJson<T>(key: string, fallback: T): Promise<T> {
  try {
    const value = await AsyncStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
}

export const getSavedProgress = () => readJson<SavedProgress | null>(PROGRESS_KEY, null);
export async function saveProgress(partNumber: number, lineNumber: number) {
  await AsyncStorage.setItem(PROGRESS_KEY, JSON.stringify({ partNumber, lineNumber, updatedAt: new Date().toISOString() }));
}
export const getBookmarks = () => readJson<SavedBookmark[]>(BOOKMARKS_KEY, []);
export async function toggleBookmark(bookmark: SavedBookmark) {
  const bookmarks = await getBookmarks();
  const exists = bookmarks.some((item) => item.id === bookmark.id);
  const next = exists ? bookmarks.filter((item) => item.id !== bookmark.id) : [bookmark, ...bookmarks];
  await AsyncStorage.setItem(BOOKMARKS_KEY, JSON.stringify(next));
  return next;
}
export const getCompletedParts = () => readJson<Record<string, string[]>>(COMPLETION_KEY, {});
function getTodayKey() {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
export async function togglePartComplete(partNumber: number) {
  const key = getTodayKey();
  const completed = await getCompletedParts();
  const today = completed[key] ?? [];
  const number = String(partNumber);
  const next = { ...completed, [key]: today.includes(number) ? today.filter((item) => item !== number) : [...today, number] };
  await AsyncStorage.setItem(COMPLETION_KEY, JSON.stringify(next));
  return next[key].includes(number);
}
export async function isPartCompleteToday(partNumber: number) {
  const key = getTodayKey();
  const completed = await getCompletedParts();
  return (completed[key] ?? []).includes(String(partNumber));
}
