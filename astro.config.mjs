// @ts-check
import { defineConfig, fontProviders } from "astro/config";

import tailwindcss from "@tailwindcss/vite";

import icon from "astro-icon";

import sitemap from "@astrojs/sitemap";

// https://astro.build/config
export default defineConfig({
  site: "https://bryanhu.com",
  vite: {
    plugins: [tailwindcss()],
  },

  integrations: [icon(), sitemap()],

  // One typeface, doing every job. Restraint is the point: hierarchy comes
  // from size, weight and tracking, not from a second family. Inter is the
  // closest freely-licensed analogue to SF Pro, including the tight optical
  // tracking that display sizes need.
  fonts: [
    {
      name: "Inter",
      cssVariable: "--font-sans",
      provider: fontProviders.google(),
      weights: ["400 700"],
      styles: ["normal"],
      subsets: ["latin"],
      fallbacks: [
        "-apple-system",
        "BlinkMacSystemFont",
        "Segoe UI",
        "Helvetica Neue",
        "sans-serif",
      ],
    },
  ],
});
