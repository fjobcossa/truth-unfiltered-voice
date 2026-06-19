export type BgMode = "theme" | "color" | "image";

export type BgState = {
  mode: BgMode;
  color: string;       // hex, used when mode === "color"
  image: string | null; // data URL or http(s) URL, used when mode === "image"
  opacity: number;      // 0..1, only meaningful for "image"
};

const KEY = "vv.background";

export const DEFAULT_BG: BgState = {
  mode: "theme",
  color: "#000000",
  image: null,
  opacity: 0.5,
};

export function loadBg(): BgState {
  if (typeof window === "undefined") return DEFAULT_BG;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULT_BG;
    const parsed = JSON.parse(raw) as Partial<BgState>;
    return { ...DEFAULT_BG, ...parsed };
  } catch {
    return DEFAULT_BG;
  }
}

export function saveBg(bg: BgState) {
  try {
    localStorage.setItem(KEY, JSON.stringify(bg));
  } catch {}
}

export function applyBg(bg: BgState) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.setAttribute("data-bg-mode", bg.mode);
  root.style.setProperty("--custom-bg-color", bg.color);
  root.style.setProperty(
    "--custom-bg-image",
    bg.image ? `url("${bg.image}")` : "none",
  );
  root.style.setProperty("--custom-bg-opacity", String(bg.opacity));
}

export function resetBg(): BgState {
  applyBg(DEFAULT_BG);
  saveBg(DEFAULT_BG);
  return DEFAULT_BG;
}

// Read a File from <input type="file"> into a data URL (so it survives reloads).
export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}
