import { Icon } from "@iconify/react";
import {
  ScrollReveal,
  StaggerContainer,
  StaggerItem,
} from "./ScrollReveal";

const gear = [
  { name: "Canon EOS 40D", type: "Body", icon: "lucide:camera" },
  { name: "EF 70-200mm f/4L IS USM", type: "Telephoto", icon: "lucide:circle-dot" },
  { name: "Tamron 35mm f/1.4 SP Di USD", type: "Prime", icon: "lucide:circle-dot" },
  { name: "EF STM 28-105mm", type: "Kit Lens", icon: "lucide:circle-dot" },
  { name: "EF 50mm f/1.8 II", type: "Nifty Fifty", icon: "lucide:circle-dot" },
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
    icon: "lucide:piano",
  },
  {
    instrument: "Trombone",
    years: 8,
    highlight: "HS Band & Jazz Band",
    icon: "lucide:music",
  },
];

const awards = [
  {
    title: "CM Level 10 — Piano",
    org: "Certificate of Merit",
    icon: "lucide:award",
  },
  {
    title: "2nd Place — Folsom Jazz Festival",
    org: "Jazz Band",
    icon: "lucide:trophy",
  },
];

export default function CreativeSection() {
  return (
    <div className="w-full max-w-6xl mx-auto space-y-28">
      {/* ── Photography & Production ── */}
      <div>
        <ScrollReveal>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-gray-700" />
            <span className="text-xs uppercase tracking-[0.3em] text-gray-500 font-medium">
              Photography & Production
            </span>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent to-gray-700" />
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <p className="text-center text-gray-400 text-sm mb-12 max-w-lg mx-auto">
            Freelance photographer and production crew member with experience behind both the camera and the switcher.
          </p>
        </ScrollReveal>

        {/* Gear Grid */}
        <ScrollReveal animation="fadeUp" delay={0.15}>
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Icon icon="lucide:aperture" className="w-5 h-5 text-gray-400" />
            My Gear
          </h3>
        </ScrollReveal>

        <StaggerContainer stagger={0.08} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-12">
          {gear.map((item) => (
            <StaggerItem key={item.name}>
              <div className="flex items-center gap-3 rounded-lg border border-gray-800 bg-gray-900/40 p-4 hover:border-gray-600 transition-colors">
                <Icon icon={item.icon} className="w-5 h-5 text-amber-400/80 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-white">{item.name}</p>
                  <p className="text-xs text-gray-500">{item.type}</p>
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>

        {/* Production Experience */}
        <ScrollReveal animation="fadeUp" delay={0.1}>
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Icon icon="lucide:clapperboard" className="w-5 h-5 text-gray-400" />
            Production Experience
          </h3>
        </ScrollReveal>

        <StaggerContainer stagger={0.12} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {productionExperience.map((exp) => (
            <StaggerItem key={exp.title}>
              <div className="relative overflow-hidden rounded-xl border border-gray-800 bg-gray-900/40 p-5 hover:border-gray-600 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-800 border border-gray-700 shrink-0">
                    <Icon icon={exp.icon} className="w-5 h-5 text-blue-400/80" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">{exp.title}</h4>
                    <p className="text-xs text-blue-400/70 font-medium">{exp.detail}</p>
                    <p className="text-xs text-gray-500 mt-1">{exp.context}</p>
                  </div>
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>

      {/* ── Music ── */}
      <div>
        <ScrollReveal>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-gray-700" />
            <span className="text-xs uppercase tracking-[0.3em] text-gray-500 font-medium">
              Music
            </span>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent to-gray-700" />
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <p className="text-center text-gray-400 text-sm mb-12 max-w-lg mx-auto">
            Pianist, trombonist, and composer. Find my original music on streaming platforms.
          </p>
        </ScrollReveal>

        {/* Instruments */}
        <StaggerContainer stagger={0.15} className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
          {musicBackground.map((m) => (
            <StaggerItem key={m.instrument}>
              <div className="relative overflow-hidden rounded-xl border border-gray-800 bg-gray-900/40 p-6 hover:border-gray-600 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-800 border border-gray-700">
                      <Icon icon={m.icon} className="w-5 h-5 text-purple-400/80" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-white">{m.instrument}</h4>
                      <p className="text-xs text-purple-400/70 font-medium">{m.highlight}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-bold text-white/90">{m.years}</span>
                    <p className="text-[10px] uppercase tracking-wider text-gray-500">years</p>
                  </div>
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>

        {/* Awards */}
        <ScrollReveal animation="fadeUp">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Icon icon="lucide:trophy" className="w-5 h-5 text-gray-400" />
            Awards
          </h3>
        </ScrollReveal>

        <StaggerContainer stagger={0.1} className="space-y-2 mb-10">
          {awards.map((award) => (
            <StaggerItem key={award.title}>
              <div className="flex items-center gap-3 rounded-lg border border-gray-800 bg-gray-900/40 p-4 hover:border-gray-600 transition-colors">
                <Icon icon={award.icon} className="w-5 h-5 text-amber-400/80 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-white">{award.title}</p>
                  <p className="text-xs text-gray-500">{award.org}</p>
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>

        {/* Streaming Links */}
        <ScrollReveal animation="scaleUp" delay={0.1}>
          <div className="flex flex-col items-center gap-6 rounded-xl border border-gray-800 bg-gray-900/40 p-10">
            <p className="text-base text-gray-300 font-medium">Listen to my original music</p>
            <div className="flex gap-4">
              <a
                href="https://open.spotify.com/artist/3CfXIgxCs9Sv7eVgZzqSEj"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-full bg-[#1DB954]/10 border border-[#1DB954]/30 px-6 py-3 text-base font-medium text-[#1DB954] hover:bg-[#1DB954]/20 transition-colors"
              >
                <Icon icon="simple-icons:spotify" className="w-5 h-5" />
                Spotify
              </a>
              <a
                href="https://music.apple.com/us/artist/bryan-hu/1751789628"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-full bg-[#FC3C44]/10 border border-[#FC3C44]/30 px-6 py-3 text-base font-medium text-[#FC3C44] hover:bg-[#FC3C44]/20 transition-colors"
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
