export type HistoryEntry = {
  id: string;
  question: string;
  answer: string;
  lang: string;
  createdAt: number;
};

const KEY = "vv.history";
const MAX = 100;

export function loadHistory(): HistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

export function saveEntry(e: Omit<HistoryEntry, "id" | "createdAt">): HistoryEntry {
  const entry: HistoryEntry = {
    ...e,
    id: Math.random().toString(36).slice(2),
    createdAt: Date.now(),
  };
  const next = [entry, ...loadHistory()].slice(0, MAX);
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {}
  return entry;
}

export function clearHistory() {
  try {
    localStorage.removeItem(KEY);
  } catch {}
}