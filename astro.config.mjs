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

  // Inter remains the site's working face. Cormorant is reserved for the
  // photography title, where a single editorial gesture is intentional.
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
    {
      name: "Cormorant Garamond",
      cssVariable: "--font-serif",
      provider: fontProviders.google(),
      weights: ["500"],
      styles: ["italic"],
      subsets: ["latin"],
      fallbacks: ["Iowan Old Style", "Baskerville", "Times New Roman", "serif"],
    },
  ],
});
