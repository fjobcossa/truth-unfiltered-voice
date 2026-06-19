export type ThemeId = "oraculo" | "ciano-branco" | "ciano-preto";

export const THEMES: { id: ThemeId; name: string; desc: string; swatch: string[] }[] = [
  { id: "oraculo", name: "Oráculo", desc: "Preto + Ciano Neon", swatch: ["#000000", "#00FFFF"] },
  { id: "ciano-branco", name: "Ciano Luminoso", desc: "Ciano Neon + Branco", swatch: ["#FFFFFF", "#00FFFF"] },
  { id: "ciano-preto", name: "Ciano Profundo", desc: "Ciano Neon + Preto", swatch: ["#00FFFF", "#000000"] },
];

export const THEME_KEY = "vv.theme";

export function applyTheme(id: ThemeId) {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute("data-theme", id);
  try {
    localStorage.setItem(THEME_KEY, id);
  } catch {}
}

export function loadTheme(): ThemeId {
  if (typeof window === "undefined") return "oraculo";
  try {
    const v = localStorage.getItem(THEME_KEY) as ThemeId | null;
    if (v && THEMES.some((t) => t.id === v)) return v;
  } catch {}
  return "oraculo";
}