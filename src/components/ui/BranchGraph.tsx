import { motion } from "motion/react";

// A prose "version graph": a trunk that forks into draft branches, one of
// which merges back — Quillium's branch-based revision model, drawn on scroll.
const TRUNK = "M 20 200 C 120 200 180 200 380 200";
const BRANCHES = [
  { d: "M 90 200 C 140 200 150 140 200 140 C 250 140 260 200 310 200", color: "#fbbf24", delay: 0.5, merges: true },
  { d: "M 130 200 C 180 200 190 260 240 260 C 290 260 330 250 372 236", color: "#c084fc", delay: 0.8, merges: false },
  { d: "M 200 140 C 235 140 240 96 280 96 C 315 96 345 108 372 124", color: "#a78bfa", delay: 1.2, merges: false },
];
const DOTS = [
  { x: 20, y: 200, color: "#e5e7eb", delay: 0.3 },
  { x: 90, y: 200, color: "#fbbf24", delay: 0.6 },
  { x: 200, y: 140, color: "#fbbf24", delay: 1.0 },
  { x: 130, y: 200, color: "#c084fc", delay: 0.9 },
  { x: 240, y: 260, color: "#c084fc", delay: 1.3 },
  { x: 280, y: 96, color: "#a78bfa", delay: 1.6 },
  { x: 310, y: 200, color: "#e5e7eb", delay: 1.5 },
  { x: 380, y: 200, color: "#e5e7eb", delay: 1.9 },
];

const drawTransition = (delay: number) => ({
  pathLength: { duration: 1.1, delay, ease: "easeInOut" as const },
  opacity: { duration: 0.2, delay },
});

export default function BranchGraph({ className }: { className?: string }) {
  return (
    <motion.svg
      viewBox="0 0 400 340"
      fill="none"
      aria-hidden="true"
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
    >
      <motion.path
        d={TRUNK}
        stroke="#e5e7eb"
        strokeOpacity={0.6}
        strokeWidth={2.5}
        strokeLinecap="round"
        variants={{
          hidden: { pathLength: 0, opacity: 0 },
          visible: {
            pathLength: 1,
            opacity: 1,
            transition: drawTransition(0.1),
          },
        }}
      />
      {BRANCHES.map((branch) => (
        <motion.path
          key={branch.d}
          d={branch.d}
          stroke={branch.color}
          strokeOpacity={0.75}
          strokeWidth={2.5}
          strokeLinecap="round"
          variants={{
            hidden: { pathLength: 0, opacity: 0 },
            visible: {
              pathLength: 1,
              opacity: 1,
              transition: drawTransition(branch.delay),
            },
          }}
        />
      ))}
      {DOTS.map((dot) => (
        <motion.circle
          key={`${dot.x}-${dot.y}`}
          cx={dot.x}
          cy={dot.y}
          r={6}
          fill="#0a0a0a"
          stroke={dot.color}
          strokeWidth={2.5}
          variants={{
            hidden: { scale: 0, opacity: 0 },
            visible: {
              scale: 1,
              opacity: 1,
              transition: {
                type: "spring",
                stiffness: 320,
                damping: 18,
                delay: dot.delay,
              },
            },
          }}
          style={{ transformOrigin: `${dot.x}px ${dot.y}px` }}
        />
      ))}
      {/* soft pulse behind the merge commit */}
      <motion.circle
        cx={310}
        cy={200}
        r={6}
        fill="none"
        stroke="#fbbf24"
        strokeWidth={1.5}
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: [0, 0.6, 0],
            scale: [1, 2.6, 2.6],
            transition: {
              delay: 2.2,
              duration: 2.4,
              repeat: Infinity,
              repeatDelay: 1.6,
            },
          },
        }}
        style={{ transformOrigin: "310px 200px" }}
      />
    </motion.svg>
  );
}
