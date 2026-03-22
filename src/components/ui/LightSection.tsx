import { useEffect, useRef, type ReactNode } from "react";
import { motion, useScroll, useTransform, useMotionValueEvent } from "motion/react";

export default function LightSection({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "start 0.3"],
  });

  // Warm parchment palette
  const bg = useTransform(
    scrollYProgress,
    [0, 1],
    ["rgb(23, 23, 23)", "rgb(245, 241, 234)"],
  );
  const textColor = useTransform(
    scrollYProgress,
    [0, 1],
    ["rgb(255, 255, 255)", "rgb(41, 37, 30)"],
  );
  const mutedColor = useTransform(
    scrollYProgress,
    [0, 1],
    ["rgb(156, 163, 175)", "rgb(120, 113, 100)"],
  );
  const borderColor = useTransform(
    scrollYProgress,
    [0, 1],
    ["rgba(255,255,255,0.1)", "rgba(60,50,30,0.12)"],
  );

  // Apply background to body so the entire page transitions
  useMotionValueEvent(bg, "change", (latest) => {
    document.body.style.backgroundColor = latest;
  });

  // Clean up on unmount
  useEffect(() => {
    return () => {
      document.body.style.backgroundColor = "";
    };
  }, []);

  return (
    <motion.div
      ref={ref}
      style={
        {
          color: textColor,
          "--section-text": textColor,
          "--section-muted": mutedColor,
          "--section-border": borderColor,
        } as any
      }
      className={`transition-none ${className ?? ""}`}
    >
      {children}
    </motion.div>
  );
}
