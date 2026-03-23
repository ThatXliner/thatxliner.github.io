import { Icon } from "@iconify/react";
import { ScrollReveal, StaggerContainer, StaggerItem } from "./ScrollReveal";
import AudioVisualizer from "./AudioVisualizer";

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
  {
    title: "Post Production",
    detail: "Final Cut Pro, Logic Pro, Darktable",
    context: "Editing, Music Production, Color Grading",
    icon: "lucide:film",
  },
];

const musicBackground = [
  {
    instrument: "Piano",
    years: 9,
    highlight: "Solo Pianist",
    awards: [
      "CM Level 10, State Honors",
      "USOMC Intermediate Baroque — 3rd Place, 2023",
    ],
    icon: "lucide:piano",
  },
  {
    instrument: "Trombone",
    years: 8,
    highlight: "HS Band & Jazz Band",
    awards: ["2nd Place — Folsom Jazz Festival, 2025"],
    icon: "lucide:music",
  },
];

const card =
  "rounded-2xl border border-white/10 bg-white/[0.04] hover:border-white/15 transition-colors";

export default function CreativeSection({ c200Src }: { c200Src?: string }) {
  return (
    <div className="w-full max-w-5xl mx-auto space-y-20">
      {/* ── Photography & Production — Bento Grid ── */}
      <div>
        <ScrollReveal>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 text-center">
            Photography & Production
          </h2>
          <p className="text-base text-gray-400 mb-12 max-w-xl mx-auto text-center">
            Freelance photographer and production crew member — behind both the
            camera and the switcher.
          </p>
        </ScrollReveal>

        <StaggerContainer
          stagger={0.1}
          className="grid grid-cols-2 md:grid-cols-4 auto-rows-[minmax(160px,auto)] gap-4 max-w-4xl mx-auto"
        >
          {/* C200 image — tall, spans 2 rows */}
          {c200Src && (
            <StaggerItem className="col-span-2 row-span-3">
              <div
                className={`${card} p-8 h-full flex items-center justify-center`}
              >
                <img
                  src={c200Src}
                  alt="Canon C200 cinema camera"
                  className="max-h-full object-contain select-none"
                  draggable={false}
                />
              </div>
            </StaggerItem>
          )}

          {/* Production experience cards */}
          {productionExperience.map((exp) => (
            <StaggerItem key={exp.title} className="col-span-2 md:col-span-2">
              <div className={`${card} p-6 h-full flex items-center gap-4`}>
                <Icon
                  icon={exp.icon}
                  className="w-6 h-6 mt-0.5 shrink-0 text-gray-500"
                />
                <div>
                  <h3 className="text-lg font-semibold">{exp.title}</h3>
                  <p className="text-sm text-gray-400 mt-1">{exp.detail}</p>
                  <p className="text-sm text-gray-500 mt-1">{exp.context}</p>
                </div>
              </div>
            </StaggerItem>
          ))}

          {/* Gear — wide card spanning full width */}
          <StaggerItem className="col-span-2 md:col-span-4">
            <div className={`${card} p-6 h-full flex flex-col justify-center`}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500">
                  My Gear
                </h3>
                <a
                  href="https://forms.gle/XUSbKXj6n1RW3kcC9"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-white text-black px-5 py-2 text-sm font-semibold hover:bg-gray-200 transition-colors"
                >
                  <Icon icon="lucide:camera" className="w-4 h-4" />
                  Hire Me
                </a>
              </div>
              <div className="flex flex-wrap gap-2">
                {gear.map((item) => (
                  <span
                    key={item.name}
                    className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-sm"
                  >
                    {item.name}
                    <span className="text-xs text-gray-500">{item.type}</span>
                  </span>
                ))}
              </div>
            </div>
          </StaggerItem>
        </StaggerContainer>
      </div>

      {/* ── Music — Bento Grid ── */}
      <div>
        <ScrollReveal>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 text-center">
            Music
          </h2>
          <p className="text-base text-gray-400 mb-12 max-w-xl mx-auto text-center">
            Pianist, trombonist, and composer.
          </p>
        </ScrollReveal>

        <StaggerContainer
          stagger={0.12}
          className="grid grid-cols-2 md:grid-cols-4 auto-rows-[180px] gap-4 max-w-4xl mx-auto"
        >
          {/* Instrument cards */}
          {musicBackground.map((m) => (
            <StaggerItem key={m.instrument} className="col-span-2">
              <div
                className={`${card} p-7 h-full flex flex-col justify-between`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Icon icon={m.icon} className="w-6 h-6 text-gray-500" />
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
                <div>
                  <p className="text-sm text-gray-400">{m.highlight}</p>
                  {m.awards.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-white/[0.06] space-y-1">
                      {m.awards.map((award) => (
                        <div key={award} className="flex items-center gap-2">
                          <Icon
                            icon="lucide:award"
                            className="w-4 h-4 shrink-0 text-gray-500"
                          />
                          <p className="text-sm">{award}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </StaggerItem>
          ))}

          {/* Audio visualizer + streaming links — wide card */}
          <StaggerItem className="col-span-2 md:col-span-4 row-span-2">
            <div
              className={`${card} p-8 h-full flex flex-col items-center justify-center gap-6`}
            >
              <AudioVisualizer className="w-full max-w-xs" />
              <p className="text-2xl font-bold">Listen to my music</p>
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
          </StaggerItem>
        </StaggerContainer>
      </div>
    </div>
  );
}
