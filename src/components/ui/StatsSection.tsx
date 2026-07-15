import { useEffect, useRef } from "react";
import { Icon } from "@iconify/react";
import {
  motion,
  useInView,
  useMotionValue,
  useSpring,
  useReducedMotion,
} from "motion/react";
import { StaggerContainer, StaggerItem } from "./ScrollReveal";

export interface Stat {
  value: number;
  label: string;
  sublabel?: string;
  icon: string;
  prefix?: string;
  suffix?: string;
  href?: string;
}

function CountUp({
  value,
  prefix = "",
  suffix = "",
}: {
  value: number;
  prefix?: string;
  suffix?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const reducedMotion = useReducedMotion();
  const motionValue = useMotionValue(0);
  const spring = useSpring(motionValue, {
    stiffness: 55,
    damping: 18,
    restDelta: 0.5,
  });

  useEffect(() => {
    if (!inView) return;
    if (reducedMotion) {
      motionValue.jump(value);
      spring.jump(value);
      return;
    }
    motionValue.set(value);
  }, [inView, value, reducedMotion, motionValue, spring]);

  useEffect(() => {
    return spring.on("change", (latest) => {
      if (ref.current) {
        ref.current.textContent = `${prefix}${Math.round(latest).toLocaleString()}${suffix}`;
      }
    });
  }, [spring, prefix, suffix]);

  return <span ref={ref}>{`${prefix}0${suffix}`}</span>;
}

function StatTile({ stat }: { stat: Stat }) {
  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mx", `${e.clientX - rect.left}px`);
    e.currentTarget.style.setProperty("--my", `${e.clientY - rect.top}px`);
  };

  const inner = (
    <motion.div
      onMouseMove={onMouseMove}
      whileHover={{ y: -3 }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
      className="relative flex h-full flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] px-6 py-9 text-center hover:border-white/20 transition-colors overflow-hidden group"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background:
            "radial-gradient(360px circle at var(--mx, 50%) var(--my, 0%), rgba(125,211,252,0.055), transparent 65%)",
        }}
      />
      <Icon icon={stat.icon} className="w-6 h-6 mb-4 text-sky-300/80" />
      <div className="text-4xl font-bold leading-none text-white tabular-nums">
        <CountUp value={stat.value} prefix={stat.prefix} suffix={stat.suffix} />
      </div>
      <div className="mt-2.5 text-sm font-medium text-gray-300">
        {stat.label}
      </div>
      {stat.sublabel && (
        <div className="mt-1 text-xs text-gray-500">{stat.sublabel}</div>
      )}
    </motion.div>
  );

  return (
    <StaggerItem className="h-full">
      {stat.href ? (
        <a
          href={stat.href}
          target="_blank"
          rel="noopener noreferrer"
          className="block h-full"
        >
          {inner}
        </a>
      ) : (
        inner
      )}
    </StaggerItem>
  );
}

export default function StatsSection({ stats }: { stats: Stat[] }) {
  return (
    <div className="max-w-5xl mx-auto">
      <StaggerContainer
        stagger={0.08}
        className="grid grid-cols-2 md:grid-cols-3 gap-4"
      >
        {stats.map((stat) => (
          <StatTile key={stat.label} stat={stat} />
        ))}
      </StaggerContainer>
    </div>
  );
}
