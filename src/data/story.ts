/** What's stitched into the stop's badge on the rug in /room. */
export type StopIcon = "music" | "code" | "school" | "club" | "robot" | "app" | "flag";

export interface Stop {
    year: string;
    icon: StopIcon;
    title: string;
    body: string;
    awards: string[];
    /** Set when the awards were the team's, not mine alone. */
    team?: boolean;
    link?: string;
    linkText?: string;
}

/** "How I got here": the homepage's path, and the rug in /room. */
export const stops: Stop[] = [
    { icon: "music", year: "2017–18", title: "First, the music.", body: "I started piano in 2017 and trombone in 2018, later performing solo and in concert and jazz bands.", awards: [] },
    { icon: "code", year: "2018–20", title: "My first lines of code.", body: "I started programming in fourth grade and began taking it seriously in 2020.", awards: [] },
    { icon: "school", year: "2022–23", title: "Building for my school.", body: "I joined VC Assist in eighth grade and later became CEO. I built the full-stack platform for my school’s digital infrastructure and later led a frontend rewrite.", awards: [] },
    { icon: "club", year: "2023–24", title: "A place to build together.", body: "In freshman year, I founded the VCSD software development club, built its website, wrote the curriculum, and made restlock-holmes to teach beginners about REST APIs.", awards: [] },
    { icon: "robot", year: "2024–25", title: "Code met the real world.", body: "On FRC Team 3256, I worked on the elevator subsystem, driver simulation, anti-tip logic, structured logging, and scouting tools.", awards: [], team: true },
    { icon: "app", year: "2025", title: "An entry became a product.", body: "My Congressional App Challenge entry grew into Billion. I kept building beyond the competition to make government decisions easier to follow.", awards: ["3rd place · Congressional App Challenge, CA-19"], link: "/products/billion", linkText: "The story behind Billion" },
    { icon: "flag", year: "2026", title: "A different kind of challenge.", body: "picoCTF put my problem-solving to work across reverse engineering, cryptography, binary exploitation, and web security.", awards: ["picoCTF · 174th of 8,747"] },
];

/** Honours that don't belong to one stop on the path. */
export const alongTheWay = ["Certificate of Merit Level 10, State Honors · Piano"];
