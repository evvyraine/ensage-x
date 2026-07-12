import { z } from "zod"

export const shareInput = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("text"),
    title: z.string().trim().max(160).optional(),
    content: z.string().min(1).max(2_000_000),
    language: z.string().max(40).default("text"),
  }),
  z.object({
    kind: z.literal("link"),
    title: z.string().trim().max(160).optional(),
    url: z
      .url()
      .refine(
        (v) => ["http:", "https:"].includes(new URL(v).protocol),
        "Only HTTP(S) links are allowed"
      ),
  }),
])

export const createShareInput = z.object({
  share: shareInput,
  visibility: z.enum(["private", "unlisted", "public"]).default("unlisted"),
  collectionId: z.uuid().nullable().optional(),
  password: z.string().min(8).max(128).optional(),
  expiresInHours: z.number().int().min(1).max(8760).nullable().default(null),
})
