import { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
  type MotionValue,
} from "motion/react";

// A section title whose words materialize one by one, scrubbed directly to
// scroll position — scrolling back down replays it in reverse.
function Word({
  word,
  progress,
  range,
}: {
  word: string;
  progress: MotionValue<number>;
  range: [number, number];
}) {
  const opacity = useTransform(progress, range, [0.1, 1]);
  const y = useTransform(progress, range, [10, 0]);
  const blur = useTransform(progress, range, ["blur(4px)", "blur(0px)"]);
  return (
    <motion.span
      style={{ opacity, y, filter: blur }}
      className="inline-block whitespace-pre will-change-transform"
    >
      {word}{" "}
    </motion.span>
  );
}

export default function ScrubTitle({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const reducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.95", "start 0.55"],
  });

  if (reducedMotion) {
    return <span className={className}>{text}</span>;
  }

  const words = text.split(" ");
  return (
    <span ref={ref} className={className} aria-label={text}>
      {words.map((word, i) => {
        const start = (i / words.length) * 0.7;
        return (
          <Word
            key={`${word}-${i}`}
            word={word}
            progress={scrollYProgress}
            range={[start, start + 0.3]}
          />
        );
      })}
    </span>
  );
}
