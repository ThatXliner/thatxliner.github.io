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
}

// Developer-facing work: things you install, import, or scaffold from. Anything
// an end user opens lives in data/apps.ts instead. Star counts are fetched live
// at build time rather than stored here, because stored ones went stale.
export const libraries: Library[] = [
    {
        name: "rust-but-lisp",
        tagline:
            "Rust, but with S-expressions. A proc-macro that lets you write Lisp and get real Rust out the other side.",
        ecosystem: "Rust",
        language: "Rust",
        repo: "https://github.com/ThatXliner/rust-but-lisp",
    },
    {
        name: "aioudp",
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
        tagline:
            "My command-line interface framework: declarative commands, derived from type hints.",
        ecosystem: "Python",
        language: "Python",
        repo: "https://github.com/ThatXliner/xclif",
        install: "pip install xclif",
        registry: { label: "PyPI", url: "https://pypi.org/project/xclif/" },
    },
    {
        name: "patchwork-cli",
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
        tagline:
            "Git Add Hunk, built so coding agents can stage partial changes without an interactive prompt.",
        ecosystem: "CLI",
        language: "Rust",
        repo: "https://github.com/ThatXliner/gah",
    },
    {
        name: "pyt2",
        tagline:
            "An opinionated Python project template: Copier, Ruff, MyPy, Hypothesis, multi-platform CI, and Trusted Publishing to PyPI.",
        ecosystem: "Python",
        language: "Jinja",
        repo: "https://github.com/ThatXliner/pyt2",
        install: "copier copy gh:ThatXliner/pyt2 .",
    },
    {
        name: "ztractor",
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
        tagline:
            "A card-based graph view for Obsidian that shows note contents alongside their links, for actual research.",
        ecosystem: "Obsidian",
        language: "TypeScript",
        repo: "https://github.com/ThatXliner/obsidian-supergraph",
    },
    {
        name: "obsidian-yodo",
        tagline: "Surfaces the TODOs buried across your Obsidian vault.",
        ecosystem: "Obsidian",
        language: "TypeScript",
        repo: "https://github.com/ThatXliner/obsidian-yodo",
    },
    {
        name: "xtras",
        tagline:
            "The Claude Code skills I actually use, packaged as an installable plugin.",
        ecosystem: "Claude Code",
        language: "Shell",
        repo: "https://github.com/ThatXliner/xtras",
    },
    {
        name: "temppromax",
        tagline:
            "A temperature monitor CLI that still works on modern macOS, unlike most of them.",
        ecosystem: "CLI",
        language: "Swift",
        repo: "https://github.com/ThatXliner/temppromax",
    },
    {
        name: "FADAIG",
        tagline:
            "An Arduino Leonardo pretending to be a keyboard so it can win Word Hunt for you. Ethically dubious, technically sound.",
        ecosystem: "Arduino",
        language: "Python",
        repo: "https://github.com/ThatXliner/FADAIG",
    },
    {
        name: "ipdt",
        tagline:
            "An engine for running Iterated Prisoner's Dilemma tournaments between competing strategies.",
        ecosystem: "Rust",
        language: "Rust",
        repo: "https://github.com/ThatXliner/ipdt",
    },
];
