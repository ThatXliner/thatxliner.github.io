import type { ImageMetadata } from "astro";

import cardcutter from "@/assets/apps/cardcutter.png";
import chess2 from "@/assets/apps/chess2.png";
import chineseFont from "@/assets/apps/chinese-font.png";
import coredumped from "@/assets/apps/coredumped.png";
import easyvpn from "@/assets/apps/easyvpn.png";
import fadaig from "@/assets/apps/fadaig.png";
import grindion from "@/assets/apps/grindion.png";
import hologram from "@/assets/apps/hologram.png";
import ljv from "@/assets/apps/ljv.png";
import nerdlens from "@/assets/apps/nerdlens.png";
import sweepr from "@/assets/apps/sweepr.png";
import temppromax from "@/assets/apps/temppromax.png";
import wuzursched from "@/assets/apps/wuzursched.png";

export interface App {
    name: string;
    tagline: string;
    /** Where it runs, in the user's terms — not the tech stack. */
    platform: string;
    language: string;
    /**
     * Where to try it. Omitted for hardware projects, which have nothing to
     * open — those cards link to the source instead.
     */
    url?: string;
    repo: string;
    /** Screenshot of the running app. Omitted where there's nothing to shoot. */
    image?: ImageMetadata;
    /** How to frame the screenshot when the card crops it. */
    focus?: string;
    /** Set when a thing is no longer running, e.g. "Retired". Flags the card. */
    status?: string;
}

// Only shipped, publicly usable things live here. Developer-facing packages,
// tools, and experiments live in data/libraries.ts. Everything listed is a
// public repo; nothing private is surfaced, linked, or alluded to.
export const apps: App[] = [
    {
        name: "NerdLens",
        tagline:
            "Turn an iPhone and a cardboard viewer into a wired external display for your Mac. No headset, no cloud.",
        platform: "iOS + Cardboard",
        language: "Unity",
        url: "https://bryanhu.com/NerdLens/",
        repo: "https://github.com/ThatXliner/NerdLens",
        image: nerdlens,
    },
    {
        name: "Hologram",
        tagline:
            "A keyboard-first culling workspace for photographers: RAW+JPEG control and deep EXIF, with none of the cloud.",
        platform: "macOS",
        language: "Svelte",
        url: "https://bryanhu.com/Hologram/",
        repo: "https://github.com/ThatXliner/Hologram",
        image: hologram,
    },
    {
        name: "easyVPN",
        tagline:
            "Turns a Mac you already own into a censorship-resistant gateway for people you trust. Set it up once, share one link.",
        platform: "macOS",
        language: "Rust",
        url: "https://bryanhu.com/easyVPN/",
        repo: "https://github.com/ThatXliner/easyVPN",
        image: easyvpn,
    },
    {
        name: "Card Cutter",
        tagline:
            "Formats debate evidence with proper citations and multi-level highlighting, so you can cut cards instead of fighting Word.",
        platform: "Web",
        language: "Svelte",
        url: "https://cardcutter.vercel.app/",
        repo: "https://github.com/ThatXliner/cardcutter",
        image: cardcutter,
    },
    {
        name: "temppromax",
        tagline:
            "A temperature monitor for Apple Silicon that reads PMU sensors over the HID Event System — no sudo, no daemon, no entitlements.",
        platform: "macOS",
        language: "Swift",
        url: "https://bryanhu.com/temppromax/",
        repo: "https://github.com/ThatXliner/temppromax",
        image: temppromax,
    },
    {
        name: "FADAIG",
        tagline:
            "An Arduino Leonardo pretending to be a mouse so it can win iMessage Word Hunt for you. Ethically dubious, technically sound.",
        platform: "Arduino",
        language: "Python",
        // Hardware project — there's nothing to open, so no url.
        repo: "https://github.com/ThatXliner/FADAIG",
        image: fadaig,
    },
    {
        name: "Grindion",
        tagline:
            "A pixel-art chain brawler on a shared board, where greed is a route: chain monsters, choose your payoff, and spend everything getting out.",
        platform: "Web",
        language: "Svelte",
        // In progress — no public build to link yet.
        repo: "https://github.com/ThatXliner/Grindion",
        image: grindion,
        status: "In progress",
    },
    {
        name: "VideoGrapher",
        tagline:
            "Object tracking for physics video analysis, with lens-distortion calibration and exportable position data. Built for one lab, finished, and left alone.",
        platform: "Desktop",
        language: "Python",
        repo: "https://github.com/ThatXliner/videographer",
    },
    {
        name: "sweepr",
        tagline:
            "Minesweeper, reimagined — the 90s classic plus a battle-royale mode and a 1v1 stamina marathon.",
        platform: "Web",
        language: "Svelte",
        url: "https://lyners-sweepr.vercel.app",
        repo: "https://github.com/ThatXliner/sweepr",
        image: sweepr,
    },
    {
        name: "Chess 2",
        tagline:
            "A twist on a thousand-year-old game",
        platform: "Web",
        language: "Svelte",
        url: "https://thatxliner.github.io/chess2/",
        repo: "https://github.com/ThatXliner/chess2",
        image: chess2,
    },
    {
        name: "coredumped",
        tagline:
            "A roguelike that runs in a real terminal emulator in your browser, with a Lisp-scriptable dungeon.",
        platform: "Web",
        language: "Rust",
        url: "https://bryanhu.com/coredumped/",
        repo: "https://github.com/ThatXliner/coredumped",
        image: coredumped,
    },
    {
        name: "Literal Chinese Font",
        tagline:
            "A font that swaps Chinese characters for their English meanings, so you can read a sentence you can't read.",
        platform: "Web",
        language: "Python",
        url: "https://bryanhu.com/chinese-font/",
        repo: "https://github.com/ThatXliner/chinese-font",
        image: chineseFont,
    },
    {
        name: "wuzursched",
        tagline:
            "Share a room link, everyone drops in their availability, and the overlap falls out. No accounts.",
        platform: "Web",
        language: "Svelte",
        url: "https://wuzursched.vercel.app",
        repo: "https://github.com/ThatXliner/wuzursched",
        image: wuzursched,
    },
    {
        name: "ljv",
        tagline:
            "Draws music as Lissajous curves — feed it a track and watch the waveform become geometry.",
        platform: "Web",
        language: "JavaScript",
        url: "https://thatxliner.github.io/ljv/",
        repo: "https://github.com/ThatXliner/ljv",
        image: ljv,
        // Loads to an empty canvas until you pick a file, so frame the controls.
        focus: "object-left",
    },
    {
        name: "qbot",
        tagline:
            "Runs quiz bowl practice inside Discord — buzzers, scoring, and question sets, no proctor required.",
        platform: "Discord",
        language: "Rust",
        url: "https://discord.com/oauth2/authorize?client_id=1404873488312828066",
        repo: "https://github.com/ThatXliner/qbot",
        // No screenshot: the install flow is a Discord OAuth page, which says
        // nothing about the bot. The card falls back to a typographic tile.
    },
    {
        name: "Slashtilities",
        tagline:
            "A slash-command Discord utility bot, back when slash commands were new. It died with Heroku's free tier, and it was fun while it lasted.",
        platform: "Discord",
        language: "Python",
        // Deliberately no url: the bot no longer runs, so an "Open" link that
        // looks like you can add it would be a lie.
        repo: "https://github.com/ThatXliner/slashtilities",
        status: "Retired",
    },
];
