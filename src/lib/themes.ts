export type ThemeId = "oraculo" | "dourado" | "violeta" | "matrix" | "branco";

export const THEMES: { id: ThemeId; name: string; desc: string; swatch: string[] }[] = [
  { id: "oraculo", name: "Oráculo", desc: "Preto + Ciano Neon", swatch: ["#000000", "#00FFFF"] },
  { id: "dourado", name: "Dourado Imperial", desc: "Preto + Dourado", swatch: ["#000000", "#D4AF37"] },
  { id: "violeta", name: "Violeta Místico", desc: "Preto + Roxo", swatch: ["#0a0014", "#A855F7"] },
  { id: "matrix", name: "Verde Matrix", desc: "Preto + Verde Neon", swatch: ["#000000", "#00FF41"] },
  { id: "branco", name: "Branco Elegante", desc: "Branco + Azul Escuro", swatch: ["#ffffff", "#1E3A8A"] },
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