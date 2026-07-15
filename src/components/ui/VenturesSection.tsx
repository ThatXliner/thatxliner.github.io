import { Icon } from "@iconify/react";
import { motion, useMotionValue, useSpring } from "motion/react";
import { ScrollReveal } from "./ScrollReveal";
import GlobeScene from "./three/GlobeScene";
import BranchGraph from "./BranchGraph";

interface Venture {
  name: string;
  url: string;
  displayUrl: string;
  tagline: string;
  description: string;
  status: string;
  points: { icon: string; text: string }[];
  cta: string;
  accent: {
    text: string;
    title: string;
    chip: string;
    button: string;
    glow: string;
  };
  visual: "globe" | "branches";
}

const ventures: Venture[] = [
  {
    name: "Billion",
    url: "https://www.billion-news.app/",
    displayUrl: "billion-news.app",
    tagline: "Civic intelligence for every American",
    description:
      "Most people find out what their government did only after it has already changed their lives. Billion fixes that with browsable summaries of bills, executive orders, and court rulings, where every claim links to a verifiable source.",
    status: "Early access · iOS & Android coming soon",
    points: [
      {
        icon: "lucide:scale",
        text: "Dual-Lens view: progressive and conservative takes, side by side",
      },
      {
        icon: "lucide:vote",
        text: "Track your ballot and see who's actually on it",
      },
      {
        icon: "lucide:link",
        text: "Every summary cites primary, verifiable sources",
      },
    ],
    cta: "Get early access",
    accent: {
      text: "text-sky-300",
      title: "group-hover:text-sky-300",
      chip: "bg-sky-500/10 text-sky-300 border-sky-500/20",
      button:
        "bg-sky-500/90 hover:bg-sky-400 text-white shadow-lg shadow-sky-500/25",
      glow: "from-sky-500/20",
    },
    visual: "globe",
  },
  {
    name: "Quillium",
    url: "https://quillium.bryanhu.com/",
    displayUrl: "quillium.bryanhu.com",
    tagline: "The writing app for people who rewrite",
    description:
      "Quillium is version control for prose: you draft alternative versions of a sentence or a whole passage as branches inside one document, and every iteration stays visible until you decide what survives. It's local-first, crash-safe, and yours.",
    status: "In active development",
    points: [
      {
        icon: "lucide:git-branch",
        text: "Branch-based revisions: every version stays in your document",
      },
      {
        icon: "lucide:hard-drive",
        text: "Local-only SQLite storage; no internet required",
      },
      {
        icon: "lucide:message-square-quote",
        text: "Comments and feedback anchored to the exact text",
      },
    ],
    cta: "Explore Quillium",
    accent: {
      text: "text-amber-300",
      title: "group-hover:text-amber-300",
      chip: "bg-amber-500/10 text-amber-300 border-amber-500/20",
      button:
        "bg-amber-500/90 hover:bg-amber-400 text-gray-950 shadow-lg shadow-amber-500/25",
      glow: "from-amber-500/15",
    },
    visual: "branches",
  },
];

function VentureVisual({ venture }: { venture: Venture }) {
  if (venture.visual === "globe") {
    return (
      <div className="relative h-64 md:h-full min-h-64">
        <GlobeScene />
      </div>
    );
  }
  return (
    <div className="relative h-64 md:h-full min-h-64 flex items-center justify-center">
      <BranchGraph className="w-full max-w-sm h-full" />
    </div>
  );
}

function VentureCard({ venture, index }: { venture: Venture; index: number }) {
  const reversed = index % 2 === 1;

  // Subtle 3D tilt toward the cursor + a spotlight that follows it.
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const springRotateX = useSpring(rotateX, { stiffness: 180, damping: 22 });
  const springRotateY = useSpring(rotateY, { stiffness: 180, damping: 22 });

  const onMouseMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    rotateY.set((px - 0.5) * 1.6);
    rotateX.set((0.5 - py) * 1.6);
    e.currentTarget.style.setProperty("--mx", `${e.clientX - rect.left}px`);
    e.currentTarget.style.setProperty("--my", `${e.clientY - rect.top}px`);
  };
  const onMouseLeave = () => {
    rotateX.set(0);
    rotateY.set(0);
  };

  return (
    <ScrollReveal animation="fadeUp" delay={0.1}>
      <motion.a
        href={venture.url}
        target="_blank"
        rel="noopener noreferrer"
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
        style={{
          rotateX: springRotateX,
          rotateY: springRotateY,
          transformPerspective: 1400,
        }}
        whileHover={{ y: -4 }}
        transition={{ type: "spring", stiffness: 300, damping: 24 }}
        className="group relative block overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] backdrop-blur-sm hover:border-white/20 transition-colors"
      >
        {/* cursor spotlight */}
        <div
          className="pointer-events-none absolute inset-0 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{
            background:
              "radial-gradient(650px circle at var(--mx, 50%) var(--my, 30%), rgba(255,255,255,0.045), transparent 60%)",
          }}
        />
        {/* accent glow that follows the card theme */}
        <div
          className={`pointer-events-none absolute -top-32 ${reversed ? "-right-32" : "-left-32"} h-72 w-72 rounded-full bg-gradient-to-br ${venture.accent.glow} to-transparent blur-3xl opacity-60 group-hover:opacity-100 transition-opacity duration-500`}
        />

        <div
          className={`relative grid md:grid-cols-2 gap-6 md:gap-10 p-8 md:p-12 ${reversed ? "md:[direction:rtl]" : ""}`}
        >
          <div className="[direction:ltr] flex flex-col justify-center">
            <div className="flex items-center gap-3 mb-4 flex-wrap">
              <h3
                className={`text-3xl md:text-4xl font-bold text-white transition-colors ${venture.accent.title}`}
              >
                {venture.name}
              </h3>
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${venture.accent.chip}`}
              >
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-60" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-current" />
                </span>
                {venture.status}
              </span>
            </div>

            <p className={`text-lg font-medium mb-3 ${venture.accent.text}`}>
              {venture.tagline}
            </p>
            <p className="text-gray-300 leading-relaxed mb-6">
              {venture.description}
            </p>

            <ul className="space-y-2.5 mb-8">
              {venture.points.map((point) => (
                <li
                  key={point.text}
                  className="flex items-start gap-2.5 text-sm text-gray-400"
                >
                  <Icon
                    icon={point.icon}
                    className={`w-4 h-4 mt-0.5 shrink-0 ${venture.accent.text}`}
                  />
                  {point.text}
                </li>
              ))}
            </ul>

            <div className="flex items-center gap-4 flex-wrap">
              <span
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 group-hover:scale-105 ${venture.accent.button}`}
              >
                {venture.cta}
                <Icon
                  icon="lucide:arrow-up-right"
                  className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </span>
              <span className="text-xs text-gray-500 font-mono">
                {venture.displayUrl}
              </span>
            </div>
          </div>

          <VentureVisual venture={venture} />
        </div>
      </motion.a>
    </ScrollReveal>
  );
}

export default function VenturesSection() {
  return (
    <div className="w-full max-w-5xl mx-auto space-y-10">
      {ventures.map((venture, i) => (
        <VentureCard key={venture.name} venture={venture} index={i} />
      ))}
    </div>
  );
}
