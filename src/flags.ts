/**
 * Feature flags for sections that aren't ready for the public site.
 *
 * A flagged-off section must disappear completely from a production build:
 * no HTML in dist/, no sitemap entry, no nav link. The enforcement lives in
 * two places, and both read from here:
 *
 *   1. the route's `getStaticPaths` returns [] so no page is emitted
 *   2. Nav.astro omits the link
 *
 * Default is on in `astro dev`, off in `astro build`. To preview a flagged
 * section in a real production build:
 *
 *     ENABLE_ART=true bun run build
 *
 * To ship it for good, change the flag here to `true` and delete the env
 * override — a permanent feature shouldn't depend on how it was built.
 */
function enabled(envVar: string): boolean {
    // import.meta.env.DEV is true under `astro dev` only. process.env is read
    // directly because this is evaluated at build time in Node, where a
    // non-PUBLIC_ variable isn't guaranteed to reach import.meta.env.
    return import.meta.env.DEV || process.env[envVar] === "true";
}

export const FEATURES = {
    /** /art — the gallery of code, photography and music. */
    art: enabled("ENABLE_ART"),
} as const;
