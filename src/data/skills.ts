export interface Skill {
    name: string;
    /** A simple-icons name, or a full `set:name` icon id. */
    icon: string;
    color: string;
    /** Repos in these languages count as evidence for the skill. */
    languages: string[];
    body: string;
    /** Repos named outright as evidence. */
    repos: string[];
    extra?: { name: string; url: string };
}

export const skills: Skill[] = [
 {name:'Python',icon:'python',color:'#3572a5',languages:['Python'],body:'I build and maintain published Python libraries: async networking in aioudp, configurable HTML-to-Markdown conversion in unmarkd, and developer tooling in pyt2 and idae. That work includes API design, documentation, packaging, CI, and release automation.',repos:['aioudp','unmarkd','pyt2','idae','FADAIG']},
 {name:'TypeScript',icon:'typescript',color:'#3178c6',languages:['TypeScript'],body:'I use TypeScript for full-stack products, including Billion and Quillium. My work spans interfaces, application architecture, editor state, revisions, annotations, and API integrations.',repos:['Quillium']},
 {name:'JavaScript',icon:'javascript',color:'#8a7300',languages:['JavaScript'],body:'JavaScript is part of my web development toolkit, from browser interactions to application interfaces.',repos:[]},
 {name:'Rust',icon:'rust',color:'#9b5638',languages:['Rust'],body:'My Rust work includes rust-but-lisp, a transpiler that turns Lisp-style expressions into Rust. I also use Tauri to package desktop tools, including a WebGL audio visualizer and a robotics scouting app.',repos:['rust-but-lisp']},
 {name:'Java',icon:'openjdk',color:'#b15c15',languages:['Java'],body:'Java is part of my programming toolkit. My robotics work includes robot subsystems, simulation, control logic, and structured logging.',repos:[]},
 {name:'C++',icon:'cplusplus',color:'#326a9f',languages:['C++'],body:'C++ is part of my programming toolkit alongside competitive algorithmic programming. My hardware work includes the Arduino firmware for FADAIG, a bot that physically plays Word Hunt.',repos:['FADAIG']},
 {name:'React',icon:'react',color:'#167b99',languages:[],body:'I use React and Next.js for full-stack app development. On Billion, I worked on the frontend and application architecture, web scraping, and AI-generated video feed integration.',repos:[],extra:{name:'billion',url:'https://github.com/billion-app/billion'}},
 {name:'Svelte / SvelteKit',icon:'svelte',color:'#d64416',languages:['Svelte'],body:'My Svelte work includes LJV, a Lissajous visualizer with a WebGL2 shader pipeline, audio input, and Tauri desktop packaging.',repos:['ljv']},
 {name:'Git',icon:'git',color:'#d44832',languages:[],body:'Maintaining open-source projects means working with versioned releases, CI, and contributions from other people. My Python project template pyt2 includes an automated publishing workflow.',repos:['pyt2']},
 {name:'Docker',icon:'docker',color:'#167bb7',languages:[],body:'Docker is part of my development toolkit.',repos:[]},
 {"name": "Go", "icon": "go", "color": "#168ca0", "languages": ["Go"], "body": "I built a Go plugin backend with runtime manifest discovery, typed configuration, actions, webhook triggers, caching, and tests.", "repos": []},
 {"name": "Next.js", "icon": "nextdotjs", "color": "#172036", "languages": [], "body": "I use Next.js for full-stack apps, including Billion and Zyma. For Zyma, I shipped a client attendance platform with authentication and a reusable design system.", "repos": []},
 {"name": "Tailwind CSS", "icon": "tailwindcss", "color": "#168ca0", "languages": [], "body": "I use Tailwind CSS for styling web interfaces and reusable design systems.", "repos": []},
 {"name": "Supabase", "icon": "supabase", "color": "#25875c", "languages": [], "body": "I used Supabase with Next.js for Zyma, a client attendance platform with authentication.", "repos": []},
 {"name": "PostgreSQL", "icon": "postgresql", "color": "#416b96", "languages": [], "body": "PostgreSQL is part of my systems and data toolkit.", "repos": []},
 {"name": "SQLite", "icon": "sqlite", "color": "#246c91", "languages": [], "body": "Quillium stores writing locally in a SQLite file, supporting offline work and crash-safe storage.", "repos": ["Quillium"]},
 {"name": "GitHub Actions", "icon": "githubactions", "color": "#287ed1", "languages": [], "body": "I build CI and automated publishing workflows, including the Python project template pyt2.", "repos": ["pyt2"]},
 {"name": "WebGL", "icon": "webgl", "color": "#97413d", "languages": [], "body": "I built the WebGL2 shader pipeline for LJV, a real-time Lissajous music visualizer with audio input and desktop packaging.", "repos": ["ljv"]},
 {"name": "Tree-sitter", "icon": "lucide:network", "color": "#56814b", "languages": [], "body": "I use Tree-sitter in patchwork-cli, an AST-native Rust refactoring tool for structural code edits and agent-driven development.", "repos": ["patchwork-cli"]},
 {"name": "Playwright", "icon": "playwright", "color": "#397c3c", "languages": [], "body": "Playwright is part of my testing toolkit for browser-based applications.", "repos": []},
];
