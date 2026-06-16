// Web Speech API helpers (browser-only).

export type SttCallbacks = {
  onResult: (text: string, isFinal: boolean) => void;
  onEnd: () => void;
  onError: (msg: string) => void;
};

type SR = any;

export function getSpeechRecognition(): SR | null {
  if (typeof window === "undefined") return null;
  const w = window as any;
  const Ctor = w.SpeechRecognition || w.webkitSpeechRecognition;
  return Ctor ? new Ctor() : null;
}

export function startListening(lang: string, cb: SttCallbacks): SR | null {
  const rec = getSpeechRecognition();
  if (!rec) {
    cb.onError("O teu navegador não suporta reconhecimento de voz. Tenta o Chrome.");
    return null;
  }
  rec.lang = lang;
  rec.continuous = false;
  rec.interimResults = true;
  rec.onresult = (e: any) => {
    let finalText = "";
    let interim = "";
    for (let i = e.resultIndex; i < e.results.length; i++) {
      const r = e.results[i];
      if (r.isFinal) finalText += r[0].transcript;
      else interim += r[0].transcript;
    }
    if (finalText) cb.onResult(finalText.trim(), true);
    else if (interim) cb.onResult(interim.trim(), false);
  };
  rec.onerror = (e: any) => cb.onError(e.error || "Erro no microfone.");
  rec.onend = cb.onEnd;
  try {
    rec.start();
  } catch (err) {
    cb.onError(String(err));
  }
  return rec;
}

export function speak(text: string, lang: string, onEnd?: () => void) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    onEnd?.();
    return;
  }
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = lang;
  u.rate = 0.95;
  u.pitch = 0.75; // grave / profunda
  u.volume = 1;

  // Tenta escolher voz masculina grave
  const voices = window.speechSynthesis.getVoices();
  const target = voices.find(
    (v) =>
      v.lang.toLowerCase().startsWith(lang.slice(0, 2).toLowerCase()) &&
      /male|man|grave|deep|antonio|diego|jorge|miguel|paulo|carlos|luca/i.test(v.name),
  ) ||
    voices.find((v) => v.lang.toLowerCase().startsWith(lang.slice(0, 2).toLowerCase())) ||
    voices[0];
  if (target) u.voice = target;

  u.onend = () => onEnd?.();
  window.speechSynthesis.speak(u);
}

export function stopSpeaking() {
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}