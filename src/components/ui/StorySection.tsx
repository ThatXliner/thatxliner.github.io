import { useRef } from "react";
import { Icon } from "@iconify/react";
import { motion, useScroll, useSpring } from "motion/react";
import { ScrollReveal } from "./ScrollReveal";

interface Chapter {
  era: string;
  title: string;
  body: string;
  icon: string;
  links?: { label: string; url: string }[];
}

const chapters: Chapter[] = [
  {
    era: "Roots",
    title: "Open source first",
    body: "I learned to build by shipping Python libraries to real users on PyPI: async networking with aioudp, HTML-to-Markdown conversion with unmarkd, and developer tooling like idae and pyt2. Shipping them taught me the whole craft around the code, from documentation and CI to semver and issue triage.",
    icon: "simple-icons:python",
    links: [
      { label: "aioudp", url: "https://github.com/ThatXliner/aioudp" },
      { label: "unmarkd", url: "https://github.com/ThatXliner/unmarkd" },
    ],
  },
  {
    era: "Teams",
    title: "Engineering with other people",
    body: "FRC Team 3256 taught me what building under pressure with a real team feels like, across elevator subsystems, 3D simulation, anti-tip logic, and scouting apps. Seven awards over two seasons came out of that work.",
    icon: "simple-icons:first",
    links: [{ label: "Team 3256", url: "https://github.com/Team3256" }],
  },
  {
    era: "Leadership",
    title: "Running the show",
    body: "As CEO of VC Assist I led a student-run non-profit serving my school's digital infrastructure, and I founded the VCSD software development club, where I wrote curriculum and shipped teaching tools like restlock-holmes.",
    icon: "lucide:users",
    links: [
      { label: "VC Assist", url: "https://vcassist.org" },
      { label: "VCSD Club", url: "https://vcsdclub.org" },
    ],
  },
  {
    era: "Proof",
    title: "Testing it in competition",
    body: "I placed 3rd in the 2025 Congressional App Challenge for CA-19, finished in the top 2% of picoCTF 2026, and earned USACO Silver. The App Challenge entry mattered most, because it became the seed of what I'm building now.",
    icon: "lucide:trophy",
  },
  {
    era: "Now",
    title: "Building products of my own",
    body: "That award-winning app grew into Billion, a civic-intelligence platform heading to iOS and Android. Alongside it I'm building Quillium, a version-control-for-prose writing app, and I'm all in on both.",
    icon: "lucide:rocket",
    links: [
      { label: "Billion", url: "https://www.billion-news.app/" },
      { label: "Quillium", url: "https://quillium.bryanhu.com/" },
    ],
  },
];

function ChapterCard({ chapter, index }: { chapter: Chapter; index: number }) {
  const isLeft = index % 2 === 0;
  return (
    <div className="relative md:grid md:grid-cols-2 md:gap-16">
      {/* node on the spine */}
      <motion.div
        initial={{ scale: 0 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="absolute left-4 md:left-1/2 top-8 -translate-x-1/2 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-gray-950 shadow-[0_0_18px_rgba(160,210,255,0.35)]"
      >
        <Icon icon={chapter.icon} className="w-4 h-4 text-sky-300" />
      </motion.div>

      <ScrollReveal
        animation={isLeft ? "slideRight" : "slideLeft"}
        className={`pl-12 md:pl-0 ${isLeft ? "md:col-start-1 md:text-right" : "md:col-start-2"}`}
      >
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 md:p-8 hover:border-white/20 transition-colors backdrop-blur-sm">
          <span className="text-xs uppercase tracking-[0.25em] text-sky-300/70">
            {chapter.era}
          </span>
          <h3 className="mt-1 text-xl md:text-2xl font-bold text-white">
            {chapter.title}
          </h3>
          <p className="mt-3 text-sm md:text-base text-gray-400 leading-relaxed">
            {chapter.body}
          </p>
          {chapter.links && (
            <div
              className={`mt-4 flex flex-wrap gap-2 ${isLeft ? "md:justify-end" : ""}`}
            >
              {chapter.links.map((link) => (
                <a
                  key={link.label}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-white/5 text-gray-300 border border-white/10 hover:border-white/25 hover:text-white transition-colors"
                >
                  {link.label}
                  <Icon icon="lucide:arrow-up-right" className="w-3 h-3" />
                </a>
              ))}
            </div>
          )}
        </div>
      </ScrollReveal>
    </div>
  );
}

export default function StorySection() {
  const containerRef = useRef<HTMLDivElement>(null);
  // The spine draws itself as you read down the timeline.
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 70%", "end 55%"],
  });
  const spineProgress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 26,
    restDelta: 0.001,
  });

  return (
    <div ref={containerRef} className="relative max-w-4xl mx-auto">
      {/* faint track */}
      <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px -translate-x-1/2 bg-white/5" />
      {/* the spine */}
      <motion.div
        style={{ scaleY: spineProgress }}
        className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px -translate-x-1/2 origin-top bg-gradient-to-b from-sky-400/60 via-purple-400/50 to-amber-400/60 shadow-[0_0_12px_rgba(160,210,255,0.4)]"
      />
      <div className="space-y-12 md:space-y-16 py-4">
        {chapters.map((chapter, i) => (
          <ChapterCard key={chapter.era} chapter={chapter} index={i} />
        ))}
      </div>
    </div>
  );
}
