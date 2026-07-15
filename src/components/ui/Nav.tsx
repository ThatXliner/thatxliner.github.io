import { useEffect, useState } from "react";
import { motion, useScroll, useSpring } from "motion/react";

const links = [
  { label: "Building", href: "#building" },
  { label: "Stats", href: "#stats" },
  { label: "Story", href: "#story", hideOnMobile: true },
  { label: "Code", href: "#code" },
  { label: "Creative", href: "#creative", hideOnMobile: true },
  { label: "Contact", href: "#contact" },
];

export default function Nav() {
  const [active, setActive] = useState<string | null>(null);
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, {
    stiffness: 220,
    damping: 40,
    restDelta: 0.001,
  });

  useEffect(() => {
    const sections = links
      .map((link) => document.querySelector(link.href))
      .filter((el): el is Element => el !== null);

    // A section is "active" while it occupies the middle band of the viewport.
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(`#${entry.target.id}`);
        }
      },
      { rootMargin: "-35% 0px -55% 0px" },
    );
    sections.forEach((section) => observer.observe(section));

    // Above the first section = nothing active.
    const clearWhenAtTop = () => {
      if (window.scrollY < window.innerHeight * 0.4) setActive(null);
    };
    window.addEventListener("scroll", clearWhenAtTop, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", clearWhenAtTop);
    };
  }, []);

  return (
    <div className="fixed top-0 z-99 w-full backdrop-blur-md">
      <nav className="text-sm sm:text-base md:text-lg lg:text-xl inter-thin tracking-[0.1em] md:tracking-[0.2em] text-center w-full flex justify-center items-center gap-2 sm:gap-4 md:gap-8 lg:gap-12 py-3 md:py-5">
        {links.map((link) => {
          const isActive = active === link.href;
          return (
            <a
              key={link.href}
              href={link.href}
              className={`relative transition-all duration-300 px-1.5 sm:px-3 md:px-6 py-1 hover:text-white hover:drop-shadow-[0_0_120px_rgba(255,255,255,0.6)] ${
                isActive ? "text-white" : "text-white/60"
              } ${link.hideOnMobile ? "hidden sm:block" : ""}`}
            >
              {link.label}
              {isActive && (
                <motion.span
                  layoutId="nav-active"
                  transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  className="absolute inset-x-1.5 sm:inset-x-3 md:inset-x-6 -bottom-0.5 h-px bg-gradient-to-r from-transparent via-sky-300 to-transparent"
                />
              )}
            </a>
          );
        })}
      </nav>
      {/* reading-progress hairline */}
      <motion.div
        style={{ scaleX: progress }}
        className="h-px w-full origin-left bg-gradient-to-r from-sky-400 via-purple-400 to-amber-400"
      />
    </div>
  );
}
