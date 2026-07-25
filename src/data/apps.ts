import type { ImageMetadata } from "astro";

import cardcutter from "@/assets/apps/cardcutter.png";
import chineseFont from "@/assets/apps/chinese-font.png";
import coredumped from "@/assets/apps/coredumped.png";
import easyvpn from "@/assets/apps/easyvpn.png";
import hologram from "@/assets/apps/hologram.png";
import istheresoftwarethat from "@/assets/apps/istheresoftwarethat.png";
import ljv from "@/assets/apps/ljv.png";
import nerdlens from "@/assets/apps/nerdlens.png";
import sweepr from "@/assets/apps/sweepr.png";
import wavelength from "@/assets/apps/wavelength.png";
import wuzursched from "@/assets/apps/wuzursched.png";

export interface App {
    name: string;
    tagline: string;
    /** Where it runs, in the user's terms — not the tech stack. */
    platform: string;
    language: string;
    /** The live app. Every entry has one; a card that links nowhere is noise. */
    url: string;
    repo: string;
    /** Screenshot of the running app. Omitted where there's nothing to shoot. */
    image?: ImageMetadata;
    /** How to frame the screenshot when the card crops it. */
    focus?: string;
}

// Only shipped, publicly usable things live here — libraries and tooling stay
// in the Open Source section on the home page. Everything listed is a public
// repo; nothing private is surfaced, linked, or alluded to.
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
        name: "Is There Software That…",
        tagline:
            "Describe what you need in plain English and get the free or open-source tool that actually does it.",
        platform: "Web",
        language: "TypeScript",
        url: "https://istheresoftwarethat-tmp.netlify.app/",
        repo: "https://github.com/ThatXliner/istheresoftwarethat.com",
        image: istheresoftwarethat,
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
        name: "Wavelength",
        tagline:
            "The party guessing game, playable over WebRTC with no server in the middle — or pass-and-play on one device.",
        platform: "Web",
        language: "Svelte",
        url: "https://thatxliner.github.io/wavelength/",
        repo: "https://github.com/ThatXliner/wavelength",
        image: wavelength,
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
];
