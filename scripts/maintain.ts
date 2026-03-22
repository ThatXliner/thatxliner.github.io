#!/usr/bin/env bun
import * as p from "@clack/prompts";
import { $ } from "bun";

const allTaskKeys = [
  "update-deps",
  "clean-dist",
  "clean-modules",
  "lint-check",
  "build",
  "prune-branches",
  "clear-cache",
];

const runAll = process.argv.includes("--all");

p.intro("🔧 Maintenance & Update Chores");

let selectedTasks: string[];

if (runAll) {
  p.log.info("Running all tasks (--all)");
  selectedTasks = allTaskKeys;
} else {
  const tasks = await p.multiselect({
    message: "Select tasks to run:",
    options: [
      {
        value: "update-deps",
        label: "Update dependencies",
        hint: "bun update",
      },
      {
        value: "clean-dist",
        label: "Clean build output",
        hint: "rm -rf dist/",
      },
      {
        value: "clean-modules",
        label: "Clean node_modules",
        hint: "rm -rf node_modules/ && bun install",
      },
      {
        value: "lint-check",
        label: "Type check",
        hint: "astro check",
      },
      {
        value: "build",
        label: "Verify build",
        hint: "astro build",
      },
      {
        value: "prune-branches",
        label: "Prune stale git branches",
        hint: "git fetch --prune && delete merged branches",
      },
      {
        value: "clear-cache",
        label: "Clear Astro cache",
        hint: "rm -rf node_modules/.astro/",
      },
    ],
    required: true,
  });

  if (p.isCancel(tasks)) {
    p.cancel("Cancelled.");
    process.exit(0);
  }

  selectedTasks = tasks as string[];
}

const runners: Record<string, () => Promise<void>> = {
  "update-deps": async () => {
    await $`bun update`.quiet();
    // Show what changed
    const diff = await $`git diff --stat bun.lock`.text();
    if (diff.trim()) {
      p.log.info(diff.trim());
    } else {
      p.log.info("Already up to date.");
    }
  },

  "clean-dist": async () => {
    await $`rm -rf dist/`.quiet();
  },

  "clean-modules": async () => {
    await $`rm -rf node_modules/`.quiet();
    await $`bun install`.quiet();
  },

  "lint-check": async () => {
    const result = await $`bunx astro check`.nothrow().quiet();
    if (result.exitCode !== 0) {
      p.log.warn(result.stderr.toString());
    }
  },

  build: async () => {
    await $`bun run build`.quiet();
  },

  "prune-branches": async () => {
    await $`git fetch --prune`.quiet();
    const merged =
      await $`git branch --merged main | grep -v '^\*' | grep -v 'main'`
        .nothrow()
        .quiet();
    const branches = merged
      .text()
      .split("\n")
      .map((b) => b.trim())
      .filter(Boolean);
    if (branches.length === 0) {
      p.log.info("No stale branches to prune.");
      return;
    }
    for (const branch of branches) {
      await $`git branch -d ${branch}`.quiet();
      p.log.info(`Deleted branch: ${branch}`);
    }
  },

  "clear-cache": async () => {
    await $`rm -rf node_modules/.astro/`.quiet();
  },
};

for (const task of selectedTasks) {
  const s = p.spinner();
  const label =
    {
      "update-deps": "Updating dependencies",
      "clean-dist": "Cleaning build output",
      "clean-modules": "Reinstalling node_modules",
      "lint-check": "Running type check",
      build: "Verifying build",
      "prune-branches": "Pruning git branches",
      "clear-cache": "Clearing Astro cache",
    }[task] ?? task;

  s.start(label);
  try {
    await runners[task]();
    s.stop(`${label} ✓`);
  } catch (e: any) {
    s.stop(`${label} ✗`);
    p.log.error(e.message ?? String(e));
  }
}

p.outro("Done!");
