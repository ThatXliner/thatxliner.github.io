import type { Project } from "@/components/ui/ProjectCard";

// Featured open-source work. Billion and Quillium live in the Ventures
// section — don't re-list them here.
export const projects: Project[] = [
  {
    name: "aioudp",
    tagline: "Async UDP for Python",
    description:
      "A **websockets|https://websockets.readthedocs.io/**-inspired **async/await** API for **UDP** in Python. Provides a clean, high-level interface for UDP communication with full **asyncio|https://docs.python.org/3/library/asyncio.html** support. Published on **PyPI|https://pypi.org/project/aioudp/** with complete documentation on **ReadTheDocs|https://aioudp.readthedocs.io/**.",
    url: "https://github.com/ThatXliner/aioudp",
    language: "Python",
    languageColor: "#3572A5",
    stars: 18,
    tags: ["asyncio", "networking", "PyPI"],
    icon: "logos:python",
  },
  {
    name: "unmarkd",
    tagline: "HTML to Markdown, reversed",
    description:
      "An extremely configurable **HTML-to-Markdown** converter built on **BeautifulSoup4|https://www.crummy.com/software/BeautifulSoup/**. Highly extensible via subclassing — customize tag conversion, code block language detection, list formatting, and more. Published on **PyPI|https://pypi.org/project/unmarkd/**.",
    url: "https://github.com/ThatXliner/unmarkd",
    language: "Python",
    languageColor: "#3572A5",
    stars: 16,
    tags: ["markdown", "HTML", "PyPI"],
    icon: "lucide:file-text",
  },
  {
    name: "pyt2",
    tagline: "Opinionated Python project template",
    description:
      "A comprehensive Python project template using **Copier|https://copier.readthedocs.io/**. Ships with Poetry, pre-commit, **Ruff|https://docs.astral.sh/ruff/**, MyPy, Hypothesis testing, multi-platform GitHub Actions CI, automated **PyPI publishing|https://docs.pypi.org/trusted-publishers/** via Trusted Publishers, and Sphinx docs.",
    url: "https://github.com/ThatXliner/pyt2",
    language: "Jinja",
    languageColor: "#a52a22",
    stars: 14,
    tags: ["devtools", "template", "CI/CD"],
    icon: "lucide:layout-template",
  },
  {
    name: "idae",
    tagline: "PEP 723 script runner",
    description:
      "Run standalone Python scripts that declare their dependencies inline via **PEP 723|https://peps.python.org/pep-0723/** metadata comments. Automatically creates **cached virtual environments**, installs dependencies, and executes the script. Published on **PyPI|https://pypi.org/project/idae/**.",
    url: "https://github.com/ThatXliner/idae",
    language: "Python",
    languageColor: "#3572A5",
    stars: 11,
    tags: ["PEP 723", "devtools", "PyPI"],
    icon: "lucide:play",
  },
  {
    name: "FADAIG",
    tagline: "For Absolutely Destroying An iMessage Game",
    description:
      "A hardware/software bot that physically plays the GamePigeon Word Hunt game. An **Arduino Leonardo|https://docs.arduino.cc/hardware/leonardo/** connected to an iPhone solves the word grid algorithmically and inputs swipe gestures via **USB HID|https://en.wikipedia.org/wiki/USB_human_interface_device_class** — bridging software and hardware for maximum overkill.",
    url: "https://github.com/ThatXliner/FADAIG",
    language: "Python",
    languageColor: "#3572A5",
    stars: 7,
    tags: ["Arduino", "hardware", "automation"],
    icon: "simple-icons:arduino",
  },
  {
    name: "LJV",
    tagline: "Lissajous music visualizer",
    description:
      "A real-time music visualizer that creates **Lissajous curves|https://en.wikipedia.org/wiki/Lissajous_curve** from audio files. Uses **WebGL2|https://developer.mozilla.org/en-US/docs/Web/API/WebGL2RenderingContext** for hardware-accelerated 60fps rendering with additive blending trail effects. Packaged as a native desktop app via **Tauri|https://tauri.app/**.",
    url: "https://github.com/ThatXliner/ljv",
    language: "Svelte",
    languageColor: "#ff3e00",
    stars: 2,
    tags: ["WebGL", "Tauri", "audio"],
    icon: "lucide:audio-waveform",
  },
  {
    name: "obsidian-supergraph",
    tagline: "Card-based graph view for Obsidian",
    description:
      "An **Obsidian|https://obsidian.md/** plugin providing a zoomable graph view that shows note titles and snippet previews as cards. Features smart zoom levels, drag-and-drop, click-to-open, auto-updating, and link visualization.",
    url: "https://github.com/ThatXliner/obsidian-supergraph",
    language: "TypeScript",
    languageColor: "#3178c6",
    stars: 2,
    tags: ["Obsidian", "plugin", "graph"],
    icon: "lucide:network",
  },
  {
    name: "Slashtilities",
    tagline: "Discord utility bot (retired)",
    description:
      "A slash command-based **Discord|https://discord.com/** utility bot. Built with **discord.py|https://discordpy.readthedocs.io/** providing various utility commands. Now retired.",
    url: "https://github.com/ThatXliner/slashtilities",
    language: "Python",
    languageColor: "#3572A5",
    tags: ["Discord", "bot", "retired"],
    icon: "simple-icons:discord",
  },
];
