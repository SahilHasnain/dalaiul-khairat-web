export function getTodayPartNumbers(date = new Date()): number[] {
  const weekday = date.getDay();
  if (weekday === 1) return [1, 8];
  if (weekday === 0) return [7];
  return [weekday + 1];
}

export function normalizeSearchText(value: string) {
  return value
    .toLocaleLowerCase()
    .normalize("NFD")
    .replace(/[\u064B-\u065F\u0670]/g, "")
    .replace(/\p{M}/gu, "")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}
