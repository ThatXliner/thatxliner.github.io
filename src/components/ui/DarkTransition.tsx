import { useRef, useEffect } from "react";
import { useScroll, useTransform, useMotionValueEvent } from "motion/react";

/** Restores the body background from parchment back to dark as this element scrolls into view. */
export default function DarkTransition() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "start 0.5"],
  });

  const bg = useTransform(
    scrollYProgress,
    [0, 1],
    ["rgb(245, 241, 234)", "rgb(23, 23, 23)"],
  );

  useMotionValueEvent(bg, "change", (latest) => {
    document.body.style.backgroundColor = latest;
  });

  useEffect(() => {
    return () => {
      document.body.style.backgroundColor = "";
    };
  }, []);

  return <div ref={ref} className="h-0 w-full" />;
}
