export interface Project {
    name: string;
    /** Repo name on GitHub — used to look up the live star count. */
    repoName: string;
    tagline: string;
    /** Supports `**bold**` emphasis markers. */
    description: string;
    url: string;
    language: string;
    languageColor: string;
}

/**
 * Three, not eight. The home page shows the highest-impact work and sends
 * people to The List for everything else — a grid of eight flattened the
 * strong entries into the weak ones.
 *
 * Chosen on measured reach rather than taste, each leading a different axis:
 * rust-but-lisp on attention (149 stars, ~8x anything else), unmarkd on usage
 * (~1,000 PyPI downloads a month), aioudp on both (~650 a month, most-starred
 * of the libraries). Star counts render live; see Work.astro.
 */
export const projects: Project[] = [
    {
        name: "rust-but-lisp",
        repoName: "rust-but-lisp",
        tagline: "Rust, in S-expressions",
        description:
            "A **transpiler** that lets you write Rust as **Lisp**. S-expressions go in, real compiled Rust comes out. It is the least useful thing here and by far the most widely shared.",
        url: "https://github.com/ThatXliner/rust-but-lisp",
        language: "Rust",
        languageColor: "#dea584",
    },
    {
        name: "unmarkd",
        repoName: "unmarkd",
        tagline: "HTML to Markdown, reversed",
        description:
            "An extremely configurable **HTML-to-Markdown** converter built on **BeautifulSoup**. Subclass it to control how any tag converts — code fences, language detection, list style. The most-downloaded thing I've published.",
        url: "https://github.com/ThatXliner/unmarkd",
        language: "Python",
        languageColor: "#3572A5",
    },
    {
        name: "aioudp",
        repoName: "aioudp",
        tagline: "Async UDP for Python",
        description:
            "A **websockets**-style **async/await** API for UDP, instead of asyncio's raw transport and protocol classes. Published on **PyPI** with full documentation on **ReadTheDocs**.",
        url: "https://github.com/ThatXliner/aioudp",
        language: "Python",
        languageColor: "#3572A5",
    },
];
