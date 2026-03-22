import { motion } from "motion/react";

const BAR_COUNT = 24;

export default function AudioVisualizer({ className }: { className?: string }) {
  return (
    <div
      className={`flex items-end justify-center gap-[3px] h-12 ${className ?? ""}`}
      aria-hidden="true"
    >
      {Array.from({ length: BAR_COUNT }).map((_, i) => {
        const baseHeight = 0.25 + 0.5 * Math.sin((i / BAR_COUNT) * Math.PI);
        const duration = 0.8 + Math.random() * 0.6;
        const delay = Math.random() * 0.5;

        return (
          <motion.span
            key={i}
            className="w-[3px] rounded-full bg-gradient-to-t from-white/10 to-white/30"
            style={{ height: `${baseHeight * 100}%` }}
            animate={{
              scaleY: [1, 0.3 + Math.random() * 0.7, 1, 0.4 + Math.random() * 0.6, 1],
            }}
            transition={{
              duration,
              delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        );
      })}
    </div>
  );
}
