import { formatDistanceToNow } from "date-fns";
import { Icon } from "@iconify/react";
import { cn } from "@/lib/utils";

export default function Repo({
  name,
  body,
  language,
  languageColor,
  starCount,
  forkCount,
  isPublic,
  updatedAt,
}: {
  name: string;
  body: string;
  language?: string;
  languageColor?: string;
  starCount: number;
  forkCount: number;
  isPublic: boolean;
  updatedAt: string | Date;
}) {
  const relativeTime = formatDistanceToNow(new Date(updatedAt), {
    addSuffix: true,
  });
  return (
    <a href={`https://github.com/ThatXliner/${name}`}>
      <div
        className={cn(
          "relative w-64 sm:w-80 cursor-pointer overflow-hidden rounded-lg border p-4 transition-colors",
          // light styles
          " border-gray-300 bg-white hover:bg-gray-50",
          // dark styles
          " dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-750",
        )}
      >
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <Icon
              icon="octicon:repo"
              className="w-4 h-4 text-gray-600 dark:text-gray-400"
            />
            <h3 className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline">
              {name}
            </h3>
          </div>
          <span className="text-xs px-2 py-1 rounded-full border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400">
            {isPublic ? "Public" : "Private"}
          </span>
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
          {body}
        </p>

        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-4">
            {language && (
              <div className="flex items-center gap-1">
                <div
                  className={`w-3 h-3 rounded-full`}
                  style={{ backgroundColor: languageColor || "#3178c6" }}
                ></div>
                <span>{language}</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Icon icon="octicon:star-24" className="w-4 h-4" />
              <span>{starCount}</span>
            </div>
            <div className="flex items-center gap-1">
              <Icon icon="octicon:repo-forked-16" className="w-4 h-4" />
              <span>{forkCount}</span>
            </div>
          </div>
          {/*<span>Updated {relativeTime}</span>*/}
        </div>
      </div>
    </a>
  );
}
