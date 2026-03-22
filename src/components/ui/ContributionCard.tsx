import { Icon } from "@iconify/react";
import { cn } from "@/lib/utils";

export interface Contribution {
  name: string;
  role: string;
  description: string;
  url: string;
  icon: string;
}

export default function ContributionCard({
  contribution,
}: {
  contribution: Contribution;
}) {
  return (
    <a href={contribution.url} target="_blank" rel="noopener noreferrer">
      <div
        className={cn(
          "group relative overflow-hidden rounded-xl border p-6 transition-all duration-300 h-full",
          "border-gray-700 bg-gray-900/60 hover:bg-gray-800/80",
          "hover:border-gray-500 hover:shadow-lg hover:shadow-white/5",
          "backdrop-blur-sm",
        )}
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-800 border border-gray-700 group-hover:border-gray-600 transition-colors">
            <Icon
              icon={contribution.icon}
              className="w-5 h-5 text-gray-300"
            />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white group-hover:text-blue-400 transition-colors">
              {contribution.name}
            </h3>
            <p className="text-xs text-purple-400 font-medium">
              {contribution.role}
            </p>
          </div>
        </div>
        <p className="text-sm text-gray-300 leading-relaxed">
          {contribution.description}
        </p>
      </div>
    </a>
  );
}
