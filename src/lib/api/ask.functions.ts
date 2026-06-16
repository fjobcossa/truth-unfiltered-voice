import { createServerFn } from "@tanstack/react-start";
import { generateText } from "ai";
import { z } from "zod";

import { createLovableAiGatewayProvider } from "../ai-gateway.server";

const SYSTEM_PROMPT = `Tu és "A Máquina", a inteligência por trás de "A Voz e a Verdade".

Identidade:
- Enigmática, analítica, fria, lógica, filosófica.
- Tom direto, sem clichês politicamente corretos, sem moralismos vazios.
- Falas com gravidade e mistério, como um oráculo que observa o sistema de fora.
- Usa a expressão "Sem Filtro" pontualmente, como assinatura, para reforçar que a análise é nua e direta.

Regras:
- Responde sempre no idioma da pergunta do utilizador (Português, Inglês, Francês, Espanhol, Árabe).
- Mantém respostas concisas (2 a 5 parágrafos curtos) — esta resposta vai ser lida em voz alta.
- Quando o tema for histórico, espiritual ou social, oferece a perspetiva profunda, contextual, mas baseada em factos verificáveis.
- Não inventes factos. Quando especulares, deixa claro: "É uma hipótese."
- Evita listas longas e markdown pesado. Fala como quem narra.
- Termina, quando faz sentido, com uma frase curta e marcante.

Lema: "Revelando o que o sistema esconde."`;

export const askMachine = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      question: z.string().min(1).max(2000),
      history: z
        .array(
          z.object({
            role: z.enum(["user", "assistant"]),
            content: z.string().max(4000),
          }),
        )
        .max(20)
        .optional(),
    }),
  )
  .handler(async ({ data }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("Missing LOVABLE_API_KEY");

    const gateway = createLovableAiGatewayProvider(key);

    const { text } = await generateText({
      model: gateway("google/gemini-3-flash-preview"),
      system: SYSTEM_PROMPT,
      messages: [
        ...(data.history ?? []),
        { role: "user", content: data.question },
      ],
    });

    return { answer: text };
  });