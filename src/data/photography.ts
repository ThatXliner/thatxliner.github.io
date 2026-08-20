import type { ImageMetadata } from "astro";

import betweenInnings from "@/assets/photography/between-innings.jpg";
import cagedLight from "@/assets/photography/caged-light.webp";
import canopy from "@/assets/photography/canopy.webp";
import counterService from "@/assets/photography/counter-service.webp";
import firmament from "@/assets/photography/firmament.webp";
import forestPassing from "@/assets/photography/forest-passing.webp";
import gateInFog from "@/assets/photography/gate-in-fog.webp";
import homeward from "@/assets/photography/homeward.webp";
import lullAtZephyrCove from "@/assets/photography/lull-at-zephyr-cove.webp";
import marketStreet from "@/assets/photography/market-street.webp";
import moonOverTheHills from "@/assets/photography/moon-over-the-hills.webp";
import northbound from "@/assets/photography/northbound.webp";
import roadToSunset from "@/assets/photography/road-to-sunset.webp";
import rosewater from "@/assets/photography/rosewater.webp";
import steamAtTheCurb from "@/assets/photography/steam-at-the-curb.webp";
import throughTheWindow from "@/assets/photography/through-the-window.webp";
import underTheLamps from "@/assets/photography/under-the-lamps.jpg";
import winterMoon from "@/assets/photography/winter-moon.webp";

export interface Photograph {
    title: string;
    alt: string;
    date: string;
    camera: "Canon EOS 40D" | "Canon EOS R7";
    image: ImageMetadata;
    /** Reserved for future links to project-specific portfolios. */
    project?: string;
}

export const photographs: Photograph[] = [
    {
        title: "Firmament",
        alt: "A dense field of stars and the Milky Way crossing a dark night sky",
        date: "August 2026",
        camera: "Canon EOS R7",
        image: firmament,
    },
    {
        title: "Canopy",
        alt: "Shafts of sunlight cutting through a dense redwood canopy",
        date: "August 2026",
        camera: "Canon EOS 40D",
        image: canopy,
    },
    {
        title: "Caged Light",
        alt: "A glowing bulb enclosed by a black wire shade",
        date: "November 2025",
        camera: "Canon EOS 40D",
        image: cagedLight,
    },
    {
        title: "Forest, Passing",
        alt: "An abstract motion-blurred view of light between tree trunks",
        date: "August 2026",
        camera: "Canon EOS 40D",
        image: forestPassing,
    },
    {
        title: "Gate in Fog",
        alt: "The Golden Gate Bridge disappearing into fog, seen from a bus",
        date: "August 2026",
        camera: "Canon EOS 40D",
        image: gateInFog,
    },
    {
        title: "Through the Window",
        alt: "A San Francisco street framed by a dark bus window",
        date: "August 2026",
        camera: "Canon EOS 40D",
        image: throughTheWindow,
    },
    {
        title: "Moon over the Hills",
        alt: "A full moon rising above dark rolling hills and a row of houses",
        date: "December 2025",
        camera: "Canon EOS 40D",
        image: moonOverTheHills,
    },
    {
        title: "The Lull at Zephyr Cove",
        alt: "A paddlewheel boat and its reflection resting on the still gray water of Zephyr Cove",
        date: "December 2025",
        camera: "Canon EOS 40D",
        image: lullAtZephyrCove,
    },
    {
        title: "Rosewater",
        alt: "A vivid pink and orange sunset reflected across a lake, framed by silhouetted trees",
        date: "July 2026",
        camera: "Canon EOS R7",
        image: rosewater,
    },
    {
        title: "Homeward",
        alt: "A lone figure walking along a dark hillside beneath a glowing pink and violet sunset",
        date: "July 2026",
        camera: "Canon EOS R7",
        image: homeward,
    },
    {
        title: "Between Innings",
        alt: "A young spectator in a black hood sits on striped stadium bleachers while looking sideways",
        date: "July 2026",
        camera: "Canon EOS R7",
        image: betweenInnings,
    },
    {
        title: "Market Street",
        alt: "An orange historic streetcar waiting on Market Street",
        date: "July 2026",
        camera: "Canon EOS R7",
        image: marketStreet,
    },
    {
        title: "Counter Service",
        alt: "Diners gathered beneath red pendant lights at a food counter",
        date: "July 2026",
        camera: "Canon EOS R7",
        image: counterService,
    },
    {
        title: "Under the Lamps",
        alt: "A man in a wide-brimmed hat and glasses passing beneath glowing market lights",
        date: "July 2026",
        camera: "Canon EOS R7",
        image: underTheLamps,
    },
    {
        title: "Steam at the Curb",
        alt: "Steam rising around workers and a streetcar at an intersection",
        date: "July 2026",
        camera: "Canon EOS R7",
        image: steamAtTheCurb,
    },
    {
        title: "Northbound",
        alt: "Railway tracks converging toward the horizon between two platforms",
        date: "July 2026",
        camera: "Canon EOS R7",
        image: northbound,
    },
    {
        title: "Winter Moon",
        alt: "A pale moon suspended above a snow-covered mountain ridge at dusk",
        date: "January 2026",
        camera: "Canon EOS 40D",
        image: winterMoon,
    },
    {
        title: "Road to Sunset",
        alt: "A snowy mountain road curving toward an orange sunset between bare trees",
        date: "January 2026",
        camera: "Canon EOS 40D",
        image: roadToSunset,
    },
];
