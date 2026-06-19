import { useEffect, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  Menu,
  Palette,
  History,
  Crown,
  Settings,
  ScrollText,
  MessageSquare,
  Trash2,
} from "lucide-react";
import { THEMES, type ThemeId, applyTheme, loadTheme } from "@/lib/themes";
import {
  type BgState,
  loadBg,
  saveBg,
  applyBg,
  resetBg,
  fileToDataUrl,
  DEFAULT_BG,
} from "@/lib/background";
import { loadHistory, clearHistory, type HistoryEntry } from "@/lib/history";

type Props = {
  onAskText: (q: string) => void;
  onReplay: (entry: HistoryEntry) => void;
};

export function MenuDrawer({ onAskText, onReplay }: Props) {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<"root" | "text" | "history" | "themes" | "plans" | "settings" | "legal">(
    "root",
  );
  const [theme, setTheme] = useState<ThemeId>("oraculo");
  const [bg, setBg] = useState<BgState>(DEFAULT_BG);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [textQ, setTextQ] = useState("");

  useEffect(() => {
    setTheme(loadTheme());
    setBg(loadBg());
  }, []);
  useEffect(() => {
    if (open) setHistory(loadHistory());
  }, [open, view]);

  const sections = [
    { id: "text", label: "Pergunta por Texto", icon: MessageSquare },
    { id: "history", label: "Histórico", icon: History },
    { id: "themes", label: "Temas", icon: Palette },
    { id: "plans", label: "Planos & Subscrições", icon: Crown },
    { id: "settings", label: "Configurações", icon: Settings },
    { id: "legal", label: "Informações Legais", icon: ScrollText },
  ] as const;

  const updateBg = (next: BgState) => {
    setBg(next);
    applyBg(next);
    saveBg(next);
  };

  return (
    <Sheet open={open} onOpenChange={(v) => { setOpen(v); if (!v) setView("root"); }}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full text-foreground/80 hover:bg-primary/10 hover:text-primary"
          aria-label="Abrir menu"
        >
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="w-[90vw] sm:max-w-sm border-l border-primary/20 bg-sidebar text-sidebar-foreground"
      >
        <SheetHeader>
          <SheetTitle className="font-display tracking-widest text-primary">
            {view === "root" ? "MENU" : sections.find((s) => s.id === view)?.label ?? "MENU"}
          </SheetTitle>
        </SheetHeader>

        {view !== "root" && (
          <Button
            variant="ghost"
            size="sm"
            className="mt-2 text-muted-foreground"
            onClick={() => setView("root")}
          >
            ← Voltar
          </Button>
        )}

        <div className="mt-4 space-y-2 overflow-y-auto pb-12 max-h-[calc(100vh-8rem)]">
          {view === "root" &&
            sections.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setView(id as typeof view)}
                className="flex w-full items-center gap-3 rounded-lg border border-primary/10 bg-card/40 px-4 py-3 text-left transition hover:border-primary/40 hover:bg-primary/5"
              >
                <Icon className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium tracking-wide">{label}</span>
              </button>
            ))}

          {view === "text" && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!textQ.trim()) return;
                onAskText(textQ.trim());
                setTextQ("");
                setOpen(false);
              }}
              className="space-y-3"
            >
              <textarea
                value={textQ}
                onChange={(e) => setTextQ(e.target.value)}
                placeholder="Escreva sua pergunta aqui..."
                rows={5}
                className="w-full rounded-lg border border-primary/20 bg-background/60 p-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
              />
              <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                Perguntar à Máquina
              </Button>
            </form>
          )}

          {view === "history" && (
            <>
              {history.length === 0 && (
                <p className="text-sm text-muted-foreground">Sem perguntas ainda. Carrega no orbe e fala.</p>
              )}
              {history.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    clearHistory();
                    setHistory([]);
                  }}
                  className="text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="mr-1 h-4 w-4" /> Limpar
                </Button>
              )}
              {history.map((h) => (
                <button
                  key={h.id}
                  onClick={() => {
                    onReplay(h);
                    setOpen(false);
                  }}
                  className="block w-full rounded-lg border border-primary/10 bg-card/40 p-3 text-left hover:border-primary/40"
                >
                  <p className="line-clamp-2 text-sm font-medium text-foreground">{h.question}</p>
                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{h.answer}</p>
                  <p className="mt-1 text-[10px] uppercase tracking-widest text-primary/60">
                    {new Date(h.createdAt).toLocaleString()}
                  </p>
                </button>
              ))}
            </>
          )}

          {view === "themes" && (
            <div className="space-y-5">
              <div>
                <p className="mb-2 text-[11px] uppercase tracking-widest text-primary/70">
                  Tema base
                </p>
                <div className="grid grid-cols-1 gap-2">
                  {THEMES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    setTheme(t.id);
                    applyTheme(t.id);
                  }}
                  className={`flex items-center gap-3 rounded-lg border p-3 text-left transition ${
                    theme === t.id
                      ? "border-primary bg-primary/10"
                      : "border-primary/10 bg-card/40 hover:border-primary/40"
                  }`}
                >
                  <div className="flex gap-1">
                    {t.swatch.map((c, i) => (
                      <span
                        key={i}
                        className="h-6 w-6 rounded-full border border-white/10"
                        style={{ background: c }}
                      />
                    ))}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.desc}</p>
                  </div>
                </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-2 text-[11px] uppercase tracking-widest text-primary/70">
                  Fundo personalizado
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {(["theme", "color", "image"] as const).map((m) => (
                    <button
                      key={m}
                      onClick={() => updateBg({ ...bg, mode: m })}
                      className={`rounded-lg border p-2 text-xs transition ${
                        bg.mode === m
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-primary/15 text-muted-foreground hover:border-primary/40"
                      }`}
                    >
                      {m === "theme" ? "Padrão" : m === "color" ? "Cor" : "Foto"}
                    </button>
                  ))}
                </div>

                {bg.mode === "color" && (
                  <div className="mt-3 flex items-center gap-3 rounded-lg border border-primary/15 p-3">
                    <input
                      type="color"
                      value={bg.color}
                      onChange={(e) => updateBg({ ...bg, color: e.target.value })}
                      className="h-10 w-14 cursor-pointer rounded border border-primary/30 bg-transparent"
                      aria-label="Cor de fundo"
                    />
                    <div className="text-xs">
                      <p className="font-medium text-foreground">{bg.color.toUpperCase()}</p>
                      <p className="text-muted-foreground">Aplicada a toda a app</p>
                    </div>
                  </div>
                )}

                {bg.mode === "image" && (
                  <div className="mt-3 space-y-3">
                    <label className="flex cursor-pointer items-center justify-center rounded-lg border border-dashed border-primary/40 p-4 text-center text-xs text-primary hover:bg-primary/5">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                          const f = e.target.files?.[0];
                          if (!f) return;
                          const url = await fileToDataUrl(f);
                          updateBg({ ...bg, image: url });
                        }}
                      />
                      {bg.image ? "Trocar fotografia" : "Carregar da galeria"}
                    </label>
                    {bg.image && (
                      <div className="relative h-28 overflow-hidden rounded-lg border border-primary/30">
                        <img
                          src={bg.image}
                          alt="Pré-visualização do fundo"
                          className="h-full w-full object-cover"
                        />
                      </div>
                    )}
                    <div>
                      <div className="mb-1 flex justify-between text-[10px] uppercase tracking-widest text-muted-foreground">
                        <span>Opacidade</span>
                        <span>{Math.round(bg.opacity * 100)}%</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={1}
                        step={0.05}
                        value={bg.opacity}
                        onChange={(e) =>
                          updateBg({ ...bg, opacity: Number(e.target.value) })
                        }
                        className="w-full accent-[var(--primary)]"
                      />
                    </div>
                  </div>
                )}

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setBg(resetBg())}
                  className="mt-3 w-full text-muted-foreground hover:text-foreground"
                >
                  Repor fundo padrão
                </Button>
              </div>
            </div>
          )}

          {view === "plans" && (
            <div className="space-y-3">
              <div className="rounded-lg border border-primary/20 bg-card/40 p-4">
                <p className="text-xs uppercase tracking-widest text-muted-foreground">Plano atual</p>
                <p className="font-display text-xl text-primary">GRATUITO</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Perguntas, respostas, voz e histórico ilimitados.
                </p>
              </div>
              <div className="rounded-lg border border-primary/30 bg-gradient-to-br from-primary/10 to-transparent p-4">
                <p className="font-display text-lg">Premium 40 dias</p>
                <p className="text-2xl font-bold">200 MT <span className="text-sm text-muted-foreground">/ 2.99 USD</span></p>
                <p className="mt-2 text-xs text-muted-foreground">Gera vídeos das respostas com IA.</p>
                <Button className="mt-3 w-full bg-primary text-primary-foreground hover:bg-primary/90" disabled>
                  Em breve
                </Button>
              </div>
              <div className="rounded-lg border border-primary/30 bg-gradient-to-br from-primary/10 to-transparent p-4">
                <p className="font-display text-lg">Premium Anual</p>
                <p className="text-2xl font-bold">1200 MT <span className="text-sm text-muted-foreground">/ 18 USD</span></p>
                <p className="mt-2 text-xs text-muted-foreground">365 dias de vídeos por IA.</p>
                <Button className="mt-3 w-full bg-primary text-primary-foreground hover:bg-primary/90" disabled>
                  Em breve
                </Button>
              </div>
            </div>
          )}

          {view === "settings" && (
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>Configurações avançadas (idioma, voz, música de fundo, notificações) chegam numa próxima fase.</p>
              <p>A deteção de idioma é automática.</p>
            </div>
          )}

          {view === "legal" && (
            <div className="space-y-2 text-sm">
              <p className="text-muted-foreground">
                <strong className="text-foreground">Autor:</strong> Faustino Job Cossa
              </p>
              <p className="text-muted-foreground">© Todos os direitos reservados.</p>
              <p className="text-muted-foreground">Política de Privacidade — em preparação.</p>
              <p className="text-muted-foreground">Termos de Utilização — em preparação.</p>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}