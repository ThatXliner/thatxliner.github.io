import { execFileSync } from "node:child_process";
import { copyFileSync, mkdirSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const source = join(root, "resume.tex");
const outputDir = join(root, "output", "pdf");
const publicDir = join(root, "public");
const buildDir = join(root, "tmp", "pdfs", "resume-build");
const compiled = join(buildDir, "resume.pdf");
const final = join(outputDir, "Bryan_Hu_Resume.pdf");
const publicResume = join(publicDir, "resume.pdf");

mkdirSync(outputDir, { recursive: true });
mkdirSync(publicDir, { recursive: true });
mkdirSync(buildDir, { recursive: true });

// resume.tex is the single source of truth. Tectonic provides a reproducible
// LaTeX build without requiring a full local TeX installation.
try {
  execFileSync("tectonic", ["--outdir", buildDir, source], {
    cwd: root,
    stdio: "inherit",
  });

  copyFileSync(compiled, final);
  copyFileSync(compiled, publicResume);
} finally {
  rmSync(buildDir, { recursive: true, force: true });
}

console.log(`Resume generated -> ${final}`);
console.log(`Website copy generated -> ${publicResume}`);
