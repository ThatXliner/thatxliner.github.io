import { Icon } from "@iconify/react";
import {
  ScrollReveal,
  StaggerContainer,
  StaggerItem,
} from "./ScrollReveal";

const gear = [
  { name: "Canon EOS 40D", type: "Body" },
  { name: "EF 70-200mm f/4L IS USM", type: "Telephoto" },
  { name: "Tamron 35mm f/1.4 SP Di USD", type: "Prime" },
  { name: "EF STM 28-105mm", type: "Kit Lens" },
  { name: "EF 50mm f/1.8 II", type: "Nifty Fifty" },
];

const productionExperience = [
  {
    title: "Camera Operator",
    detail: "Canon C200s",
    context: "School assemblies & productions",
    icon: "lucide:video",
  },
  {
    title: "Camera Switcher",
    detail: "Live switching",
    context: "School assemblies & church services",
    icon: "lucide:monitor",
  },
];

const musicBackground = [
  {
    instrument: "Piano",
    years: 9,
    highlight: "CM Level 10",
    award: "CM Level 10 — Piano",
    icon: "lucide:piano",
  },
  {
    instrument: "Trombone",
    years: 8,
    highlight: "HS Band & Jazz Band",
    award: "2nd Place — Folsom Jazz Festival",
    icon: "lucide:music",
  },
];

const card =
  "rounded-2xl border border-white/10 bg-white/[0.04] hover:border-white/15 transition-colors";

export default function CreativeSection({ c200Src }: { c200Src?: string }) {
  return (
    <div className="w-full max-w-5xl mx-auto space-y-28">
      {/* ── Photography & Production ── */}
      <div>
        <ScrollReveal>
          <h2 className="text-3xl font-bold mb-3">
            Photography & Production
          </h2>
          <p className="text-base text-gray-400 mb-12 max-w-xl">
            Freelance photographer and production crew member — behind both
            the camera and the switcher.
          </p>
        </ScrollReveal>

        {/* Production Experience — featured with C200 image */}
        <ScrollReveal animation="fadeUp" delay={0.1}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-3xl mb-14">
            {c200Src && (
              <div
                className={`${card} p-10 flex items-center justify-center`}
              >
                <img
                  src={c200Src}
                  alt="Canon C200 cinema camera"
                  className="max-h-64 object-contain select-none"
                  draggable={false}
                />
              </div>
            )}
            <div className="flex flex-col gap-4">
              {productionExperience.map((exp) => (
                <div
                  key={exp.title}
                  className={`${card} p-6 flex-1 flex items-start gap-4`}
                >
                  <Icon
                    icon={exp.icon}
                    className="w-6 h-6 mt-0.5 shrink-0 text-gray-500"
                  />
                  <div>
                    <h3 className="text-lg font-semibold">{exp.title}</h3>
                    <p className="text-sm text-gray-400 mt-1">
                      {exp.detail}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {exp.context}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>

        {/* Gear */}
        <ScrollReveal animation="fadeUp" delay={0.15}>
          <h3 className="text-lg font-semibold mb-4">My Gear</h3>
          <div className="flex flex-wrap gap-3">
            {gear.map((item) => (
              <span
                key={item.name}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm"
              >
                {item.name}
                <span className="text-xs text-gray-500">{item.type}</span>
              </span>
            ))}
          </div>
        </ScrollReveal>
      </div>

      {/* ── Music ── */}
      <div>
        <ScrollReveal>
          <h2 className="text-3xl font-bold mb-3">
            Music
          </h2>
          <p className="text-base text-gray-400 mb-12 max-w-xl">
            Pianist, trombonist, and composer.
          </p>
        </ScrollReveal>

        {/* Instruments */}
        <StaggerContainer
          stagger={0.15}
          className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-2xl mb-14"
        >
          {musicBackground.map((m) => (
            <StaggerItem key={m.instrument}>
              <div className={`${card} p-7`}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Icon
                      icon={m.icon}
                      className="w-6 h-6 text-gray-500"
                    />
                    <h3 className="text-xl font-bold">{m.instrument}</h3>
                  </div>
                  <div className="text-right">
                    <span className="text-3xl font-bold text-white/70">
                      {m.years}
                    </span>
                    <p className="text-xs uppercase tracking-wider text-gray-500">
                      years
                    </p>
                  </div>
                </div>
                <p className="text-sm text-gray-400">
                  {m.highlight}
                </p>
                {m.award && (
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/[0.06]">
                    <Icon icon="lucide:award" className="w-4 h-4 shrink-0 text-gray-500" />
                    <p className="text-sm">{m.award}</p>
                  </div>
                )}
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>

        {/* Streaming Links — standalone CTA */}
        <ScrollReveal animation="fadeUp" delay={0.1}>
          <div className="text-center space-y-6 pt-6">
            <p className="text-2xl font-bold">
              Listen to my music
            </p>
            <div className="flex justify-center gap-4 flex-wrap">
              <a
                href="https://open.spotify.com/artist/3CfXIgxCs9Sv7eVgZzqSEj"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 rounded-full bg-[#1DB954] px-7 py-3.5 text-base font-medium text-white hover:bg-[#1ed760] transition-colors"
              >
                <Icon icon="simple-icons:spotify" className="w-5 h-5" />
                Spotify
              </a>
              <a
                href="https://music.apple.com/us/artist/bryan-hu/1751789628"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 rounded-full bg-[#FC3C44] px-7 py-3.5 text-base font-medium text-white hover:bg-[#fd5158] transition-colors"
              >
                <Icon icon="simple-icons:applemusic" className="w-5 h-5" />
                Apple Music
              </a>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </div>
  );
}
