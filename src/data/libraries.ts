export interface Library {
    name: string;
    /** Repo name on GitHub, when it differs from the display name. */
    repoName?: string;
    tagline: string;
    /** Who it's for, in one word: Python, Rust, CLI, Obsidian… */
    ecosystem: string;
    language: string;
    repo: string;
    /** Copy-pasteable install line, where there's a published package. */
    install?: string;
    /** The registry listing (PyPI, crates.io, npm). */
    registry?: { label: string; url: string };
    /** Set when it still works but isn't being looked after, e.g. "Unmaintained". */
    status?: string;
}

export type MadeCategory = "libraries" | "tools" | "other";

export interface MadeItem extends Library {
    category: MadeCategory;
}

// Developer-facing work: things you install, import, or scaffold from. Anything
// an end user opens lives in data/apps.ts instead. Star counts are fetched live
// at build time rather than stored here, because stored ones went stale.
const made: MadeItem[] = [
    {
        name: "rust-but-lisp",
        category: "other",
        tagline:
            "Rust, but with S-expressions. A transpiler that takes Lisp in and emits real Rust out the other side.",
        ecosystem: "Rust",
        language: "Rust",
        repo: "https://github.com/ThatXliner/rust-but-lisp",
        // My most-starred repo, and you should absolutely not depend on it.
        install: "( ͡° ͜ʖ ͡°)",
    },
    {
        name: "aioudp",
        category: "libraries",
        tagline:
            "A websockets-style async/await API for UDP in Python, instead of asyncio's raw transport and protocol classes.",
        ecosystem: "Python",
        language: "Python",
        repo: "https://github.com/ThatXliner/aioudp",
        install: "pip install aioudp",
        registry: { label: "PyPI", url: "https://pypi.org/project/aioudp/" },
    },
    {
        name: "unmarkd",
        category: "libraries",
        tagline:
            "An extremely configurable HTML-to-Markdown converter — a Markdown reverser. Subclass it to control how any tag converts.",
        ecosystem: "Python",
        language: "Python",
        repo: "https://github.com/ThatXliner/unmarkd",
        install: "pip install unmarkd",
        registry: { label: "PyPI", url: "https://pypi.org/project/unmarkd/" },
    },
    {
        name: "idae",
        category: "tools",
        tagline:
            "Runs standalone Python scripts that declare their own dependencies inline via PEP 723, in cached virtual environments.",
        ecosystem: "Python",
        language: "Python",
        repo: "https://github.com/ThatXliner/idae",
        install: "pip install idae",
        registry: { label: "PyPI", url: "https://pypi.org/project/idae/" },
    },
    {
        name: "git-worm",
        category: "tools",
        tagline:
            "A git worktree manager that doesn't make you think about paths. Built on xclif.",
        ecosystem: "CLI",
        language: "Python",
        repo: "https://github.com/ThatXliner/git-worm",
        install: "pip install git-worm",
        registry: { label: "PyPI", url: "https://pypi.org/project/git-worm/" },
    },
    {
        name: "xclif",
        category: "libraries",
        tagline:
            "File-based routing for CLI subcommands — the directory tree is the command tree.",
        ecosystem: "Python",
        language: "Python",
        repo: "https://github.com/ThatXliner/xclif",
        install: "pip install xclif",
        registry: { label: "PyPI", url: "https://pypi.org/project/xclif/" },
    },
    {
        name: "patchwork-cli",
        category: "tools",
        tagline:
            "AST-native code refactoring without an LLM — but designed for one to drive. Structural edits, not string replacement.",
        ecosystem: "Rust",
        language: "Rust",
        repo: "https://github.com/ThatXliner/patchwork-cli",
        install: "cargo install patchwork-cli",
        registry: {
            label: "crates.io",
            url: "https://crates.io/crates/patchwork-cli",
        },
    },
    {
        name: "gah",
        category: "tools",
        tagline:
            "Git Add Hunk: non-interactive hunk staging, so a coding agent can stage partial changes without git add -p.",
        ecosystem: "Rust",
        language: "Rust",
        repo: "https://github.com/ThatXliner/gah",
        install: "cargo install gah",
        registry: { label: "crates.io", url: "https://crates.io/crates/gah" },
    },
    {
        name: "pyt2",
        category: "tools",
        tagline:
            "An opinionated Python project template: Copier, Ruff, MyPy, Hypothesis, multi-platform CI, and Trusted Publishing to PyPI.",
        ecosystem: "Python",
        language: "Jinja",
        repo: "https://github.com/ThatXliner/pyt2",
        install: "copier copy gh:ThatXliner/pyt2 .",
    },
    {
        name: "ztractor",
        category: "libraries",
        tagline:
            "Runs Zotero's translators outside Zotero to pull structured citation metadata off any page.",
        ecosystem: "npm",
        language: "TypeScript",
        repo: "https://github.com/ThatXliner/ztractor",
        install: "npm i ztractor",
        registry: {
            label: "npm",
            url: "https://www.npmjs.com/package/ztractor",
        },
    },
    {
        name: "obsidian-supergraph",
        category: "other",
        tagline:
            "A card-based graph view for Obsidian that shows note contents alongside their links, for actual research.",
        ecosystem: "Obsidian",
        language: "TypeScript",
        repo: "https://github.com/ThatXliner/obsidian-supergraph",
    },
    {
        name: "claude-plugins",
        category: "other",
        tagline:
            "My Claude Code plugin marketplace — add it once and every plugin below becomes installable by name.",
        ecosystem: "Claude Code",
        language: "Shell",
        repo: "https://github.com/ThatXliner/claude-plugins",
        install: "/plugin marketplace add ThatXliner/claude-plugins",
    },
    {
        name: "xtras",
        category: "other",
        tagline:
            "The Claude Code skills I actually use, packaged as a plugin. Needs the marketplace above added first.",
        ecosystem: "Claude Code",
        language: "Shell",
        repo: "https://github.com/ThatXliner/xtras",
        install: "claude plugin install xtras",
    },
    {
        name: "gitmoji-atom",
        category: "other",
        tagline:
            "Searchable gitmoji autocomplete inside Atom, so you could find the right emoji without leaving the commit box.",
        ecosystem: "Atom",
        language: "JavaScript",
        repo: "https://github.com/ThatXliner/gitmoji-atom",
        // Atom itself was sunset in 2022. The plugin didn't rot — its host
        // did — so the flag names the platform rather than blaming the code.
        status: "Atom is discontinued",
    },
    {
        name: "stacksearch",
        category: "libraries",
        tagline:
            "The first thing I ever built: an unofficial API and CLI for searching StackOverflow and the rest of StackExchange. It shipped to PyPI with docs and CI, which taught me more than the code did.",
        ecosystem: "Python",
        language: "Python",
        repo: "https://github.com/ThatXliner/stacksearch",
        install: "pip install stacksearch",
        registry: {
            label: "PyPI",
            url: "https://pypi.org/project/stacksearch/",
        },
        // Its README's own words: no longer actively maintained, occasional
        // fixes only. It still installs and works, so "unmaintained" is the
        // honest signal rather than "retired".
        status: "Unmaintained",
    },
];

export const libraries = made.filter((item) => item.category === "libraries");
export const tools = made.filter((item) => item.category === "tools");
export const other = made.filter((item) => item.category === "other");
