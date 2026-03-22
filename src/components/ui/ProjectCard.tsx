import { Icon } from "@iconify/react";
import { cn } from "@/lib/utils";

export interface Project {
  name: string;
  tagline: string;
  description: string;
  url: string;
  language: string;
  languageColor: string;
  stars?: number;
  tags: string[];
  icon: string;
  award?: string;
}

function renderDescription(text: string) {
  // Split on **text** or **text|url** markers
  const parts = text.split(/\*\*(.*?)\*\*/g);
  return parts.map((part, i) => {
    if (i % 2 === 0) return <span key={i}>{part}</span>;
    const pipeIdx = part.indexOf("|");
    if (pipeIdx !== -1) {
      const label = part.slice(0, pipeIdx);
      const href = part.slice(pipeIdx + 1);
      return (
        <a
          key={i}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 font-medium hover:underline"
          onClick={(e) => e.stopPropagation()}
        >
          {label}
        </a>
      );
    }
    return (
      <span key={i} className="text-blue-400 font-medium">
        {part}
      </span>
    );
  });
}

export default function ProjectCard({ project }: { project: Project }) {
  const handleCardClick = (e: React.MouseEvent) => {
    // Don't navigate if clicking an inner link
    if ((e.target as HTMLElement).closest("a")) return;
    window.open(project.url, "_blank", "noopener,noreferrer");
  };

  return (
    <div
      onClick={handleCardClick}
      className={cn(
        "group relative overflow-hidden rounded-xl border p-6 transition-all duration-300 cursor-pointer",
        "border-gray-700 bg-gray-900/60 hover:bg-gray-800/80",
        "hover:border-gray-500 hover:shadow-lg hover:shadow-white/5",
        "backdrop-blur-sm",
      )}
    >
      {project.award && (
        <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-amber-500/20 px-2.5 py-1 text-xs font-medium text-amber-300 border border-amber-500/30">
          <Icon icon="lucide:trophy" className="w-3 h-3" />
          {project.award}
        </div>
      )}

      <div className="flex items-center gap-3 mb-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-800 border border-gray-700 group-hover:border-gray-600 transition-colors">
          <Icon icon={project.icon} className="w-5 h-5 text-gray-300" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white group-hover:text-blue-400 transition-colors">
            {project.name}
          </h3>
          <p className="text-xs text-gray-400">{project.tagline}</p>
        </div>
      </div>

      <p className="text-sm text-gray-300 leading-relaxed mb-4">
        {renderDescription(project.description)}
      </p>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-xs text-gray-400">
          <div className="flex items-center gap-1">
            <div
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: project.languageColor }}
            />
            <span>{project.language}</span>
          </div>
          {project.stars !== undefined && project.stars > 0 && (
            <div className="flex items-center gap-1">
              <Icon icon="octicon:star-24" className="w-3.5 h-3.5" />
              <span>{project.stars}</span>
            </div>
          )}
        </div>
        <div className="flex flex-wrap gap-1.5 justify-end">
          {project.tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 text-[10px] rounded-full bg-gray-800 text-gray-400 border border-gray-700"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
