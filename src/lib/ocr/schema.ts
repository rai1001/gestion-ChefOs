import { z } from "zod";

export const ocrBaseSchema = z.object({
  text: z.string(),
  confidence: z.number().min(0).max(1).optional(),
});

export const menuItemSchema = z.object({
  name: z.string(),
  details: z.string().optional(),
});

export const menuOcrSchema = ocrBaseSchema.extend({
  kind: z.literal("menu"),
  items: z.array(menuItemSchema).default([]),
});

export const albaranLineSchema = z.object({
  item: z.string(),
  qty: z.number().optional(),
  unit: z.string().optional(),
  price: z.number().optional(),
});

export const albaranOcrSchema = ocrBaseSchema.extend({
  kind: z.literal("albaran"),
  supplier: z.string().optional(),
  date: z.string().optional(),
  lines: z.array(albaranLineSchema).default([]),
});

export const recetaOcrSchema = ocrBaseSchema.extend({
  kind: z.literal("receta"),
  title: z.string().optional(),
  ingredients: z.array(z.string()).default([]),
  steps: z.array(z.string()).default([]),
  table: z
    .array(
      z.object({
        producto: z.string(),
        unidad: z.string().optional(),
        cantidad_bruta: z.number().optional(),
        cantidad_neta: z.number().optional(),
        desperdicio_pct: z.number().optional(),
        precio_unitario: z.number().optional(),
      })
    )
    .default([]),
});

export const genericOcrSchema = ocrBaseSchema.extend({
  kind: z.literal("generico"),
});

export const ocrResponseSchema = z.discriminatedUnion("kind", [
  menuOcrSchema,
  albaranOcrSchema,
  recetaOcrSchema,
  genericOcrSchema,
]);

export type OcrResponse = z.infer<typeof ocrResponseSchema>;
export type OcrKind = OcrResponse["kind"];
