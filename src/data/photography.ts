import type { ImageMetadata } from "astro";

import aboveTheFence from "@/assets/photography/above-the-fence.webp";
import afterTheGathering from "@/assets/photography/after-the-gathering.webp";
import afternoonWall from "@/assets/photography/afternoon-wall.webp";
import allegro from "@/assets/photography/allegro.webp";
import atTheServiceWindow from "@/assets/photography/at-the-service-window.webp";
import atTheWaterline from "@/assets/photography/at-the-waterline.webp";
import beforeTheGame from "@/assets/photography/before-the-game.webp";
import betweenBuildings from "@/assets/photography/between-buildings.webp";
import betweenInnings from "@/assets/photography/between-innings.jpg";
import cagedLight from "@/assets/photography/caged-light.webp";
import canopy from "@/assets/photography/canopy.webp";
import catsCradle from "@/assets/photography/cats-cradle.webp";
import counterService from "@/assets/photography/counter-service.webp";
import cypressMoon from "@/assets/photography/cypress-moon.webp";
import draw from "@/assets/photography/draw.webp";
import fallenCone from "@/assets/photography/fallen-cone.webp";
import fallenLight from "@/assets/photography/fallen-light.webp";
import findingAHold from "@/assets/photography/finding-a-hold.webp";
import fineAdjustment from "@/assets/photography/fine-adjustment.webp";
import firmament from "@/assets/photography/firmament.webp";
import forestPassing from "@/assets/photography/forest-passing.webp";
import fromCover from "@/assets/photography/from-cover.webp";
import gateInFog from "@/assets/photography/gate-in-fog.webp";
import ghostPlay from "@/assets/photography/ghost-play.webp";
import homeward from "@/assets/photography/homeward.webp";
import intoTheSun from "@/assets/photography/into-the-sun.webp";
import lightThroughTheRedwoods from "@/assets/photography/light-through-the-redwoods.webp";
import longShadows from "@/assets/photography/long-shadows.webp";
import lowOverTheWater from "@/assets/photography/low-over-the-water.webp";
import lullAtZephyrCove from "@/assets/photography/lull-at-zephyr-cove.webp";
import marketStreet from "@/assets/photography/market-street.webp";
import moonOverTheHills from "@/assets/photography/moon-over-the-hills.webp";
import northbound from "@/assets/photography/northbound.webp";
import offBalance from "@/assets/photography/off-balance.webp";
import offDuty from "@/assets/photography/off-duty.webp";
import oldLimbs from "@/assets/photography/old-limbs.webp";
import oneFrondInLight from "@/assets/photography/one-frond-in-light.webp";
import openArms from "@/assets/photography/open-arms.webp";
import passingUnderTheMoon from "@/assets/photography/passing-under-the-moon.webp";
import reach from "@/assets/photography/reach.webp";
import roadToSunset from "@/assets/photography/road-to-sunset.webp";
import rosewater from "@/assets/photography/rosewater.webp";
import sidelineKit from "@/assets/photography/sideline-kit.webp";
import steamAtTheCurb from "@/assets/photography/steam-at-the-curb.webp";
import steeple from "@/assets/photography/steeple.webp";
import takingAim from "@/assets/photography/taking-aim.webp";
import throughTheWindow from "@/assets/photography/through-the-window.webp";
import togetherThroughTheTrees from "@/assets/photography/together-through-the-trees.webp";
import twoKindsOfLight from "@/assets/photography/two-kinds-of-light.webp";
import underPressure from "@/assets/photography/under-pressure.webp";
import underTheLamps from "@/assets/photography/under-the-lamps.jpg";
import winterMoon from "@/assets/photography/winter-moon.webp";
import yellowArc from "@/assets/photography/yellow-arc.webp";
import yellowPayload from "@/assets/photography/yellow-payload.webp";

export interface Photograph {
    title: string;
    alt: string;
    date: string;
    camera: "Canon EOS 40D" | "Canon EOS R7";
    image: ImageMetadata;
    featured: boolean;
    /** Reserved for future links to project-specific portfolios. */
    project?: string;
}

export const photographs: Photograph[] = [
    {
        title: "Ghost Play",
        alt: "Football players become pale overlapping streaks under stadium lights.",
        date: "October 2026",
        camera: "Canon EOS R7",
        featured: false,
        image: ghostPlay,
    },
    {
        title: "Under Pressure",
        alt: "A quarterback in blue looks for a pass between two defenders in black and white.",
        date: "October 2026",
        camera: "Canon EOS R7",
        featured: true,
        image: underPressure,
    },
    {
        title: "Allegro",
        alt: "Motion-blurred hands play a piano, reflected in its polished black surface.",
        date: "July 2026",
        camera: "Canon EOS 40D",
        featured: true,
        image: allegro,
    },
    {
        title: "Cat’s Cradle",
        alt: "White string forms a web between two open hands.",
        date: "August 2026",
        camera: "Canon EOS 40D",
        featured: false,
        image: catsCradle,
    },
    {
        title: "One Frond in Light",
        alt: "A luminous green fern frond hangs above a shaded path among tall trees.",
        date: "August 2026",
        camera: "Canon EOS 40D",
        featured: false,
        image: oneFrondInLight,
    },
    {
        title: "Open Arms",
        alt: "A helmeted rider hangs above the trees with both arms extended against blue sky.",
        date: "August 2026",
        camera: "Canon EOS 40D",
        featured: false,
        image: openArms,
    },
    {
        title: "Into the Sun",
        alt: "A suspended rider follows a diagonal cable toward bright sun and lens flare.",
        date: "August 2026",
        camera: "Canon EOS 40D",
        featured: false,
        image: intoTheSun,
    },
    {
        title: "Finding a Hold",
        alt: "A climber in an orange helmet reaches up a wall patterned by leaf shadows.",
        date: "August 2026",
        camera: "Canon EOS 40D",
        featured: false,
        image: findingAHold,
    },
    {
        title: "Reach",
        alt: "Seen from below, a climber stretches an arm upward beside sunlit leaves.",
        date: "August 2026",
        camera: "Canon EOS 40D",
        featured: true,
        image: reach,
    },
    {
        title: "Together Through the Trees",
        alt: "A group walks away along a sunlit forest path, with a red jacket tied around one waist.",
        date: "August 2026",
        camera: "Canon EOS 40D",
        featured: false,
        image: togetherThroughTheTrees,
    },
    {
        title: "After the Gathering",
        alt: "Warm string lights illuminate the timber roof of an empty pavilion.",
        date: "September 2026",
        camera: "Canon EOS R7",
        featured: false,
        image: afterTheGathering,
    },
    {
        title: "Light Through the Redwoods",
        alt: "A starburst lamp cuts through dark trees beside a forest path at night.",
        date: "September 2026",
        camera: "Canon EOS R7",
        featured: false,
        image: lightThroughTheRedwoods,
    },
    {
        title: "Fine Adjustment",
        alt: "Hands turn a screwdriver on the wheel assembly of a small robot.",
        date: "August 2026",
        camera: "Canon EOS R7",
        featured: false,
        image: fineAdjustment,
    },
    {
        title: "Between Buildings",
        alt: "A person seen from behind walks beside angular campus architecture in black and white.",
        date: "August 2026",
        camera: "Canon EOS R7",
        featured: false,
        image: betweenBuildings,
    },
    {
        title: "Above the Fence",
        alt: "A tall cross rises above a black iron fence beneath a gray sky.",
        date: "August 2026",
        camera: "Canon EOS R7",
        featured: true,
        image: aboveTheFence,
    },
    {
        title: "Afternoon Wall",
        alt: "A tree and its shadow interrupt a sunlit pale brick wall.",
        date: "August 2026",
        camera: "Canon EOS R7",
        featured: false,
        image: afternoonWall,
    },
    {
        title: "At the Waterline",
        alt: "A back-facing figure stands in foamy surf as wind lifts their hair.",
        date: "August 2026",
        camera: "Canon EOS R7",
        featured: false,
        image: atTheWaterline,
    },
    {
        title: "Low Over the Water",
        alt: "A flock of pelicans flies low above a gray ocean.",
        date: "August 2026",
        camera: "Canon EOS R7",
        featured: false,
        image: lowOverTheWater,
    },
    {
        title: "Off Duty",
        alt: "A pale blue lifeguard tower stands on a nearly empty beach at dusk.",
        date: "August 2026",
        camera: "Canon EOS R7",
        featured: false,
        image: offDuty,
    },
    {
        title: "Fallen Light",
        alt: "Sunlight illuminates a fallen redwood trunk in a shadowed forest.",
        date: "September 2026",
        camera: "Canon EOS R7",
        featured: true,
        image: fallenLight,
    },
    {
        title: "Draw",
        alt: "A masked archer draws a padded arrow in a shaded woodland clearing.",
        date: "September 2026",
        camera: "Canon EOS R7",
        featured: false,
        image: draw,
    },
    {
        title: "Taking Aim",
        alt: "A person in a full protective mask aims a padded arrow beside an inflatable barrier.",
        date: "September 2026",
        camera: "Canon EOS R7",
        featured: false,
        image: takingAim,
    },
    {
        title: "From Cover",
        alt: "A masked archer leans out from an inflatable barrier with a bow drawn.",
        date: "September 2026",
        camera: "Canon EOS R7",
        featured: false,
        image: fromCover,
    },
    {
        title: "Passing Under the Moon",
        alt: "A white car blurs beneath a bright moon and a starburst streetlight.",
        date: "September 2026",
        camera: "Canon EOS R7",
        featured: false,
        image: passingUnderTheMoon,
    },
    {
        title: "Old Limbs",
        alt: "Cut branches protrude from a deeply textured tree trunk at night.",
        date: "September 2026",
        camera: "Canon EOS R7",
        featured: false,
        image: oldLimbs,
    },
    {
        title: "Two Kinds of Light",
        alt: "The moon and two glowing streetlights rise above rooftops at blue hour.",
        date: "September 2026",
        camera: "Canon EOS R7",
        featured: true,
        image: twoKindsOfLight,
    },
    {
        title: "Cypress Moon",
        alt: "A round moon hangs above two slender cypress trees against a pink evening sky.",
        date: "September 2026",
        camera: "Canon EOS R7",
        featured: false,
        image: cypressMoon,
    },
    {
        title: "Yellow Payload",
        alt: "A bright yellow ball rests inside a compact metal robot.",
        date: "August 2026",
        camera: "Canon EOS R7",
        featured: false,
        image: yellowPayload,
    },
    {
        title: "Before the Game",
        alt: "A bank of stadium lamps glows against a pale evening sky.",
        date: "October 2026",
        camera: "Canon EOS R7",
        featured: false,
        image: beforeTheGame,
    },
    {
        title: "Yellow Arc",
        alt: "Two color-guard performers bend beneath sweeping yellow flags.",
        date: "October 2026",
        camera: "Canon EOS R7",
        featured: false,
        image: yellowArc,
    },
    {
        title: "Sideline Kit",
        alt: "A long camera lens hangs beside a photographer’s legs at a football field.",
        date: "October 2026",
        camera: "Canon EOS R7",
        featured: false,
        image: sidelineKit,
    },
    {
        title: "Off Balance",
        alt: "A football player tumbles onto the field as other players converge, in black and white.",
        date: "October 2026",
        camera: "Canon EOS R7",
        featured: true,
        image: offBalance,
    },
    {
        title: "At the Service Window",
        alt: "A vendor reaches through a brightly framed service window to hand an item to a customer.",
        date: "September 2026",
        camera: "Canon EOS R7",
        featured: true,
        image: atTheServiceWindow,
    },
    {
        title: "Long Shadows",
        alt: "Long tree shadows stretch across cracked pavement in low sunlight.",
        date: "August 2026",
        camera: "Canon EOS R7",
        featured: false,
        image: longShadows,
    },
    {
        title: "Steeple",
        alt: "A sunlit church steeple rises into a blue sky between dark rooflines and leaves.",
        date: "August 2026",
        camera: "Canon EOS R7",
        featured: true,
        image: steeple,
    },
    {
        title: "Fallen Cone",
        alt: "A battered orange traffic cone lies folded beside a concrete curb.",
        date: "August 2026",
        camera: "Canon EOS R7",
        featured: false,
        image: fallenCone,
    },
    {
        title: "Firmament",
        alt: "A dense field of stars and the Milky Way crossing a dark night sky",
        date: "August 2026",
        camera: "Canon EOS R7",
        featured: false,
        image: firmament,
    },
    {
        title: "Canopy",
        alt: "Shafts of sunlight cutting through a dense redwood canopy",
        date: "August 2026",
        camera: "Canon EOS 40D",
        featured: false,
        image: canopy,
    },
    {
        title: "Caged Light",
        alt: "A glowing bulb enclosed by a black wire shade",
        date: "November 2025",
        camera: "Canon EOS 40D",
        featured: false,
        image: cagedLight,
    },
    {
        title: "Forest, Passing",
        alt: "An abstract motion-blurred view of light between tree trunks",
        date: "August 2026",
        camera: "Canon EOS 40D",
        featured: true,
        image: forestPassing,
    },
    {
        title: "Gate in Fog",
        alt: "The Golden Gate Bridge disappearing into fog, seen from a bus",
        date: "August 2026",
        camera: "Canon EOS 40D",
        featured: true,
        image: gateInFog,
    },
    {
        title: "Through the Window",
        alt: "A San Francisco street framed by a dark bus window",
        date: "August 2026",
        camera: "Canon EOS 40D",
        featured: false,
        image: throughTheWindow,
    },
    {
        title: "Moon over the Hills",
        alt: "A full moon rising above dark rolling hills and a row of houses",
        date: "December 2025",
        camera: "Canon EOS 40D",
        featured: true,
        image: moonOverTheHills,
    },
    {
        title: "The Lull at Zephyr Cove",
        alt: "A paddlewheel boat and its reflection resting on the still gray water of Zephyr Cove",
        date: "December 2025",
        camera: "Canon EOS 40D",
        featured: true,
        image: lullAtZephyrCove,
    },
    {
        title: "Rosewater",
        alt: "A vivid pink and orange sunset reflected across a lake, framed by silhouetted trees",
        date: "July 2026",
        camera: "Canon EOS R7",
        featured: true,
        image: rosewater,
    },
    {
        title: "Homeward",
        alt: "A lone figure walking along a dark hillside beneath a glowing pink and violet sunset",
        date: "July 2026",
        camera: "Canon EOS R7",
        featured: true,
        image: homeward,
    },
    {
        title: "Between Innings",
        alt: "A young spectator in a black hood sits on striped stadium bleachers while looking sideways",
        date: "July 2026",
        camera: "Canon EOS R7",
        featured: true,
        image: betweenInnings,
    },
    {
        title: "Market Street",
        alt: "An orange historic streetcar waiting on Market Street",
        date: "July 2026",
        camera: "Canon EOS R7",
        featured: false,
        image: marketStreet,
    },
    {
        title: "Counter Service",
        alt: "Diners gathered beneath red pendant lights at a food counter",
        date: "July 2026",
        camera: "Canon EOS R7",
        featured: false,
        image: counterService,
    },
    {
        title: "Under the Lamps",
        alt: "A man in a wide-brimmed hat and glasses passing beneath glowing market lights",
        date: "July 2026",
        camera: "Canon EOS R7",
        featured: true,
        image: underTheLamps,
    },
    {
        title: "Steam at the Curb",
        alt: "Steam rising around workers and a streetcar at an intersection",
        date: "July 2026",
        camera: "Canon EOS R7",
        featured: false,
        image: steamAtTheCurb,
    },
    {
        title: "Northbound",
        alt: "Railway tracks converging toward the horizon between two platforms",
        date: "July 2026",
        camera: "Canon EOS R7",
        featured: true,
        image: northbound,
    },
    {
        title: "Winter Moon",
        alt: "A pale moon suspended above a snow-covered mountain ridge at dusk",
        date: "January 2026",
        camera: "Canon EOS 40D",
        featured: false,
        image: winterMoon,
    },
    {
        title: "Road to Sunset",
        alt: "A snowy mountain road curving toward an orange sunset between bare trees",
        date: "January 2026",
        camera: "Canon EOS 40D",
        featured: true,
        image: roadToSunset,
    },
];
