import { ocrResponseSchema, type OcrKind, type OcrResponse } from "./schema";

const MISTRAL_URL = "https://api.mistral.ai/v1/vision";
const MODEL = "pixtral-large-latest";
const MAX_BYTES = 10 * 1024 * 1024; // 10MB

function buildPrompt(kind: OcrKind) {
  switch (kind) {
    case "menu":
      return "Extrae menú. Devuelve JSON con kind=\"menu\", text completo y items[{name,details?}].";
    case "albaran":
      return "Extrae albarán. Devuelve JSON kind=\"albaran\", text, supplier, date(YYYY-MM-DD si posible), lines[{item,qty?,unit?,price?}].";
    case "receta":
      return "Extrae receta. Devuelve JSON kind=\"receta\", text, title, ingredients[], steps[].";
    default:
      return "Extrae texto legible. Devuelve JSON kind=\"generico\" con text.";
  }
}

export async function mistralOcrFromBuffer(buf: Buffer, mime: string, kind: OcrKind): Promise<OcrResponse> {
  if (buf.byteLength === 0) throw new Error("Archivo vacío");
  if (buf.byteLength > MAX_BYTES) throw new Error("Archivo demasiado grande (max 10MB)");
  if (!mime.startsWith("image/") && mime !== "application/pdf") throw new Error("Formato no soportado");

  const apiKey = process.env.MISTRAL_API_KEY;
  if (!apiKey) throw new Error("MISTRAL_API_KEY no configurada");

  const payload = {
    model: MODEL,
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: buildPrompt(kind) },
          {
            type: "image",
            image_url: `data:${mime};base64,${buf.toString("base64")}`,
          },
        ],
      },
    ],
    temperature: 0,
  };

  const res = await fetch(MISTRAL_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Mistral error ${res.status}: ${text}`);
  }

  const json = await res.json();
  const content = json?.choices?.[0]?.message?.content;
  if (!content) throw new Error("Respuesta Mistral sin contenido");

  // Mistral devuelve string; intentar parsear JSON
  let parsed: any;
  try {
    parsed = typeof content === "string" ? JSON.parse(content) : JSON.parse(content[0]?.text ?? content);
  } catch {
    parsed = { kind: "generico", text: typeof content === "string" ? content : JSON.stringify(content) };
  }

  const result = ocrResponseSchema.parse(parsed);
  return result;
}

