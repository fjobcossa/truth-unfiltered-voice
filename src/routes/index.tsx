import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Mic, MicOff, Video, Square, Volume2 } from "lucide-react";

import { askMachine } from "@/lib/api/ask.functions";
import { startListening, speak, stopSpeaking } from "@/lib/voice";
import { applyTheme, loadTheme } from "@/lib/themes";
import { saveEntry, type HistoryEntry } from "@/lib/history";
import { MenuDrawer } from "@/components/menu-drawer";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "A Voz e a Verdade — Revelando o que o sistema esconde" },
      {
        name: "description",
        content:
          "A Voz e a Verdade: assistente de IA enigmática para ouvir, perguntar e descobrir mistérios da história, espiritualidade e sociedade. Sem Filtro.",
      },
      { property: "og:title", content: "A Voz e a Verdade" },
      { property: "og:description", content: "Revelando o que o sistema esconde." },
    ],
  }),
  component: Index,
});

function Index() {
  const ask = useServerFn(askMachine);

  type Status = "idle" | "listening" | "thinking" | "speaking" | "error";
  const [status, setStatus] = useState<Status>("idle");
  const [transcript, setTranscript] = useState("");
  const [answer, setAnswer] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [lang, setLang] = useState("pt-PT");
  const recRef = useRef<any>(null);

  useEffect(() => {
    applyTheme(loadTheme());
    // Auto-detect language from browser
    const nav = navigator.language || "pt-PT";
    const lower = nav.toLowerCase();
    if (lower.startsWith("en")) setLang("en-US");
    else if (lower.startsWith("fr")) setLang("fr-FR");
    else if (lower.startsWith("es")) setLang("es-ES");
    else if (lower.startsWith("ar")) setLang("ar-SA");
    else setLang("pt-PT");

    // Prime voices list
    if ("speechSynthesis" in window) window.speechSynthesis.getVoices();
  }, []);

  const submitQuestion = async (question: string) => {
    setStatus("thinking");
    setTranscript(question);
    setAnswer("");
    setErrorMsg(null);
    try {
      const res = await ask({ data: { question } });
      const text = res.answer || "...";
      setAnswer(text);
      const entry = saveEntry({ question, answer: text, lang });
      setStatus("speaking");
      speak(text, lang, () => setStatus("idle"));
      return entry;
    } catch (err: any) {
      console.error(err);
      setErrorMsg("A Máquina silenciou-se. Tenta novamente.");
      setStatus("error");
    }
  };

  const startVoice = () => {
    if (status === "listening") {
      recRef.current?.stop?.();
      return;
    }
    stopSpeaking();
    setErrorMsg(null);
    setTranscript("");
    setAnswer("");
    setStatus("listening");
    recRef.current = startListening(lang, {
      onResult: (text, isFinal) => {
        setTranscript(text);
        if (isFinal) {
          recRef.current?.stop?.();
          submitQuestion(text);
        }
      },
      onEnd: () => {
        setStatus((s) => (s === "listening" ? "idle" : s));
      },
      onError: (msg) => {
        setErrorMsg(msg);
        setStatus("error");
      },
    });
  };

  const stopAll = () => {
    recRef.current?.stop?.();
    stopSpeaking();
    setStatus("idle");
  };

  const statusText = {
    idle: "PRONTO PARA OUVIR...",
    listening: "A OUVIR...",
    thinking: "A MÁQUINA PROCESSA...",
    speaking: "A REVELAR...",
    error: "FALHA NA TRANSMISSÃO",
  }[status];

  return (
    <div className="starfield relative flex min-h-screen flex-col overflow-hidden">
      {/* Top bar */}
      <header className="relative z-20 flex items-center justify-between px-5 pt-5 sm:px-8">
        <div className="h-10 w-10" aria-hidden />
        <div className="text-center">
          <h1 className="title-glow font-display text-xl font-black tracking-[0.28em] text-primary sm:text-2xl">
            A VOZ E A VERDADE
          </h1>
          <p className="mt-1 text-[10px] uppercase tracking-[0.35em] text-muted-foreground sm:text-xs">
            Revelando o que o sistema esconde
          </p>
        </div>
        <MenuDrawer
          onAskText={(q) => submitQuestion(q)}
          onReplay={(entry: HistoryEntry) => {
            setTranscript(entry.question);
            setAnswer(entry.answer);
            setStatus("speaking");
            speak(entry.answer, entry.lang, () => setStatus("idle"));
          }}
        />
      </header>

      {/* Center orb */}
      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 pb-40">
        <button
          onClick={startVoice}
          disabled={status === "thinking"}
          aria-label={status === "listening" ? "Parar" : "Falar com A Máquina"}
          className="group relative flex h-64 w-64 items-center justify-center rounded-full sm:h-80 sm:w-80 disabled:cursor-not-allowed"
        >
          {/* outer rotating dashed ring */}
          <span className="orb-spin absolute inset-0" />
          <span className="orb-spin absolute inset-4" style={{ animationDuration: "40s", animationDirection: "reverse" }} />

          {/* expanding rings when listening/speaking */}
          {(status === "listening" || status === "speaking") && (
            <>
              <span className="orb-ring absolute inset-6 rounded-full" />
              <span className="orb-ring absolute inset-6 rounded-full" style={{ animationDelay: "0.6s" }} />
              <span className="orb-ring absolute inset-6 rounded-full" style={{ animationDelay: "1.2s" }} />
              <span className="orb-ring absolute inset-6 rounded-full" style={{ animationDelay: "1.8s" }} />
            </>
          )}

          {/* core */}
          <span className="orb-core relative flex h-40 w-40 items-center justify-center rounded-full sm:h-48 sm:w-48">
            {status === "thinking" ? (
              <div className="flex items-end gap-1.5">
                {[0, 1, 2, 3, 4].map((i) => (
                  <span
                    key={i}
                    className="wave-bar h-10 w-1.5"
                    style={{ animationDelay: `${i * 0.12}s` }}
                  />
                ))}
              </div>
            ) : status === "speaking" ? (
              <Volume2 className="h-14 w-14 text-primary-foreground" />
            ) : status === "listening" ? (
              <MicOff className="h-14 w-14 text-primary-foreground" />
            ) : (
              <Mic className="h-14 w-14 text-primary-foreground transition group-hover:scale-110" />
            )}
          </span>
        </button>

        <p className="mt-10 font-display text-sm tracking-[0.4em] text-primary sm:text-base">
          {statusText}
        </p>

        {transcript && (
          <div className="mt-6 max-w-xl rounded-xl border border-primary/20 bg-card/40 p-4 text-center text-sm text-foreground/90 backdrop-blur-sm">
            <p className="text-[10px] uppercase tracking-widest text-primary/70">A tua pergunta</p>
            <p className="mt-1 italic">"{transcript}"</p>
          </div>
        )}

        {answer && (
          <div className="mt-4 max-h-64 max-w-xl overflow-y-auto rounded-xl border border-primary/30 bg-card/60 p-5 text-left text-sm leading-relaxed text-foreground/95 shadow-[0_0_40px_-15px] shadow-primary/40 backdrop-blur-sm">
            <p className="text-[10px] uppercase tracking-widest text-primary">A Máquina responde</p>
            <p className="mt-2 whitespace-pre-wrap">{answer}</p>
          </div>
        )}

        {errorMsg && (
          <p className="mt-6 max-w-md text-center text-sm text-destructive">{errorMsg}</p>
        )}

        {(status === "speaking" || status === "listening") && (
          <Button
            onClick={stopAll}
            variant="ghost"
            size="sm"
            className="mt-4 text-muted-foreground hover:text-foreground"
          >
            <Square className="mr-2 h-3 w-3" /> Silenciar
          </Button>
        )}
      </main>

      {/* Fixed bottom: video CTA */}
      <footer className="fixed inset-x-0 bottom-0 z-20 border-t border-primary/20 bg-background/85 px-5 py-4 backdrop-blur-lg sm:px-8">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 text-primary">
              <Video className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-semibold text-foreground">Ver resposta em vídeo</p>
              <p className="text-[11px] text-muted-foreground">
                Transforme qualquer resposta em vídeo com IA.
              </p>
            </div>
          </div>
          <Button
            size="sm"
            variant="outline"
            disabled
            className="border-primary/40 text-primary opacity-80"
          >
            Premium
          </Button>
        </div>
      </footer>
    </div>
  );
}
