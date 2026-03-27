export const resume = {
  name: "Bryan Hu",
  email: "thatxliner@gmail.com",
  github: "ThatXliner",
  linkedin: "thatxliner",
  website: "bryanhu.com",
  tagline:
    "Full-stack developer, freelance photographer, camera operator, musician, and passionate creator.",

  skills: {
    languages: ["Python", "TypeScript", "JavaScript", "Rust", "Java", "C++"],
    frameworks: ["React / Next.js", "Svelte / SvelteKit"],
    tools: ["Git", "Docker"],
  },

  awards: [
    {
      label: "USACO Silver",
      description: "USA Computing Olympiad, competitive algorithmic programming",
      url: "https://usaco.org/",
    },
    {
      label: "picoCTF 2026 — 174th / 8,747",
      description: "Carnegie Mellon's national cybersecurity CTF covering binary exploitation, reverse engineering, cryptography, and web security",
      url: "https://picoctf.org/",
    },
  ],

  frcAwards: [
    {
      label: "Creativity Award — Daly Division (Champs)",
      year: 2025,
    },
    {
      label: "Excellence in Engineering — Contra Costa Regional",
      year: 2025,
    },
    {
      label: "Innovation in Control — Ventura County Regional",
      year: 2025,
    },
    {
      label: "Engineering Inspiration — San Francisco Regional",
      year: 2025,
    },
    {
      label: "Judges' Award — Capital City Classic",
      year: 2025,
    },
    {
      label: "Regional Finalists — Silicon Valley Regional",
      year: 2024,
    },
    {
      label: "Engineering Inspiration — Arizona Valley Regional",
      year: 2024,
    },
  ],

  projects: [
    {
      name: "aioudp",
      tagline: "Websockets-inspired async/await API for UDP in Python",
      language: "Python",
      stars: 18,
      tags: ["asyncio", "networking", "PyPI"],
      url: "https://github.com/ThatXliner/aioudp",
      learned: "asyncio internals, socket programming, API design, Python packaging & documentation",
      whatIDid: "Designed the async/await socket API, wrote ReadTheDocs documentation, published to PyPI",
    },
    {
      name: "unmarkd",
      tagline: "Configurable HTML-to-Markdown converter on PyPI",
      language: "Python",
      stars: 16,
      tags: ["markdown", "HTML", "PyPI"],
      url: "https://github.com/ThatXliner/unmarkd",
      learned: "HTML parsing, extensible OOP design, tree traversal, open source maintenance",
      whatIDid: "Built the HTML-to-Markdown conversion engine with BeautifulSoup4, designed subclass-based extension API, published to PyPI",
    },
    {
      name: "pyt2",
      tagline: "Python project template with CI/CD, linting, and auto-publish",
      language: "Jinja",
      stars: 14,
      tags: ["devtools", "template", "CI/CD"],
      url: "https://github.com/ThatXliner/pyt2",
      learned: "CI/CD pipelines, GitHub Actions, Python toolchain, release automation, Trusted Publishers",
      whatIDid: "Designed the Copier template structure, configured multi-platform GitHub Actions CI, set up automated PyPI publishing via Trusted Publishers",
    },
    {
      name: "idae",
      tagline: "PEP 723 script runner with auto virtual-env management",
      language: "Python",
      stars: 11,
      tags: ["PEP 723", "devtools", "PyPI"],
      url: "https://github.com/ThatXliner/idae",
      learned: "PEP standards process, virtual environment internals, subprocess management, caching strategies",
      whatIDid: "Implemented PEP 723 metadata parsing, built the cached venv creation and management system, published to PyPI",
    },
    {
      name: "billion",
      tagline: "AI video feed app — 3rd Place, Congressional App Challenge 2025",
      language: "TypeScript",
      stars: 3,
      tags: ["AI", "Next.js", "award"],
      url: "https://github.com/billion-app/billion",
      award: "3rd Place CAC 2025",
      learned: "Next.js app architecture, AI API integration, full-stack TypeScript, collaborating under a deadline",
      whatIDid: "Built the AI-generated video feed integration and web scraping pipeline, contributed to frontend and app architecture",
    },
    {
      name: "FADAIG",
      tagline: "Arduino + USB HID bot that physically plays GamePigeon Word Hunt",
      language: "Python",
      stars: 7,
      tags: ["Arduino", "hardware", "automation"],
      url: "https://github.com/ThatXliner/FADAIG",
      learned: "USB HID protocol, Arduino firmware, hardware-software bridging, graph/trie algorithms",
      whatIDid: "Wrote the word-grid solver algorithm, programmed the Arduino Leonardo firmware, bridged Python control software to USB HID input",
    },
    {
      name: "Quillium",
      tagline: "AI writing app with Codex suggestions, versioning, and annotations",
      language: "TypeScript",
      tags: ["AI", "writing", "editor"],
      url: "https://github.com/ThatXliner/Quillium",
      learned: "Real-time collaborative editing, LLM API integration, complex state management, product design",
      whatIDid: "Designed and built the editor core, integrated OpenAI Codex suggestions, implemented the revision/versioning system and annotation features",
    },
    {
      name: "LJV",
      tagline: "60fps Lissajous curve visualizer via WebGL2, packaged with Tauri",
      language: "Svelte",
      stars: 2,
      tags: ["WebGL", "Tauri", "audio"],
      url: "https://github.com/ThatXliner/ljv",
      learned: "WebGL2 shaders, audio processing APIs, Tauri desktop packaging, real-time graphics",
      whatIDid: "Wrote the WebGL2 shader pipeline with additive blending trail effects, wired audio input to curve parameters, packaged as a native desktop app with Tauri",
    },
  ],

  contributions: [
    {
      name: "VC Assist",
      role: "CEO",
      description:
        "Student-run non-profit enhancing digital educational infrastructure at Valley Christian Schools. Built and maintained the full-stack platform (frontend, backend, web scrapers); later led a full frontend rewrite to improve performance and UX.",
      url: "https://vcassist.org",
      learned: "Non-profit leadership, full-stack architecture, web scraping at scale, frontend performance",
      whatIDid: "Built the original full-stack platform including frontend, backend, and web scrapers; later led a complete frontend rewrite",
    },
    {
      name: "VCSD Club",
      role: "Founder",
      description:
        "Founded the Valley Christian HS Software Development Club from scratch. Designed the club website, authored curriculum, and shipped restlock-holmes — an interactive game teaching REST APIs to beginners.",
      url: "https://vcsdclub.org",
      learned: "Curriculum design, teaching REST concepts, Svelte, founding and running a student organization",
      whatIDid: "Founded the club, built the club website, authored beginner curriculum, shipped restlock-holmes — an interactive REST API teaching game",
    },
    {
      name: "FRC Team 3256",
      role: "Programmer",
      description:
        "Robot programming for 2024–2025 seasons: elevator subsystem, 3D simulation for driver practice, anti-tip logic, controller mapping, structured logging, and a competition scouting app built with Tauri 2.0.",
      url: "https://github.com/Team3256",
      learned: "Java robotics frameworks (WPILib), real-time control systems, 3D simulation, cross-platform desktop apps with Tauri",
      whatIDid: "Implemented elevator subsystem, built 3D robot simulation for driver practice, added anti-tip logic and controller mapping, set up structured logging infrastructure, shipped competition scouting app in Tauri 2.0",
    },
  ],

  music: [
    {
      instrument: "Piano",
      years: 9,
      highlight: "Solo Pianist",
      awards: [
        "CM Level 10, State Honors",
        "USOMC Intermediate Baroque — 3rd Place, 2023",
      ],
    },
    {
      instrument: "Trombone",
      years: 8,
      highlight: "HS Band & Jazz Band",
      awards: ["2nd Place — Folsom Jazz Festival, 2025"],
    },
  ],

  production: [
    {
      title: "Camera Operator",
      detail: "Canon C200s",
      context: "School assemblies & productions",
    },
    {
      title: "Camera Switcher",
      detail: "Live switching",
      context: "School assemblies & church services",
    },
    {
      title: "Post Production",
      detail: "Final Cut Pro, Logic Pro, Darktable",
      context: "Editing, Music Production, Color Grading",
    },
  ],
};
