import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

/**
 * Pieces for /art. One markdown file per piece: the frontmatter is the card,
 * the body is the essay. Adding work later means dropping in a file — no
 * component edits.
 */
const art = defineCollection({
    loader: glob({ pattern: "**/*.md", base: "./src/content/art" }),
    schema: ({ image }) =>
        z.object({
            title: z.string(),
            /** Code is a first-class medium here, alongside photo and music. */
            kind: z.enum(["code", "photo", "music"]),
            date: z.coerce.date(),
            /** One line for the card. The essay lives in the body. */
            blurb: z.string(),
            /** Omit while drafting — the card falls back to a placeholder. */
            image: image().optional(),
            /** Shot-on / instrument / language, shown as the card's meta. */
            medium: z.string().optional(),
            /** Listen-here links for music, source links for code. */
            links: z
                .array(z.object({ label: z.string(), url: z.string().url() }))
                .default([]),
            /** Hidden everywhere until you flip it. */
            draft: z.boolean().default(false),
        }),
});

export const collections = { art };
