import { resume } from "../src/data/resume";
import { execSync } from "child_process";
import { mkdirSync, writeFileSync, existsSync } from "fs";
import { join } from "path";

const outDir = join(import.meta.dirname, "..", "public");
const tmpDir = join(import.meta.dirname, "..", ".cache", "latex");
const texDest = join(import.meta.dirname, "..", "resume.tex");

function escapeLatex(str: string): string {
  return str
    .replace(/\\/g, "\\textbackslash{}")
    .replace(/[&%$#_{}]/g, (m) => `\\${m}`)
    .replace(/~/g, "\\textasciitilde{}")
    .replace(/\^/g, "\\textasciicircum{}")
    .replace(/—/g, "---");
}

function generateLatex(): string {
  const r = resume;

  const skillsSection = [
    `\\textbf{Languages:} ${r.skills.languages.map(escapeLatex).join(", ")}`,
    `\\textbf{Frameworks:} ${r.skills.frameworks.map(escapeLatex).join(", ")}`,
    `\\textbf{Tools:} ${r.skills.tools.map(escapeLatex).join(", ")}`,
  ].join(" \\\\\n");

  const awardsItems = [
    ...r.awards.map((a) => `\\item ${escapeLatex(a.label)}`),
    ...r.frcAwards.map(
      (a) =>
        `\\item FRC Team 3256: ${escapeLatex(a.label)} (${a.year})`
    ),
  ].join("\n");

  const projectItems = r.projects
    .map((p) => {
      const stars = p.stars ? ` --- ${p.stars} stars` : "";
      return `\\item \\textbf{${escapeLatex(p.name)}} --- ${escapeLatex(p.tagline)}${stars}${p.award ? ` --- \\textit{${escapeLatex(p.award)}}` : ""}`;
    })
    .join("\n");

  const contributionItems = r.contributions
    .map(
      (c) =>
        `\\item \\textbf{${escapeLatex(c.name)}} --- \\textit{${escapeLatex(c.role)}} \\\\\n${escapeLatex(c.description)}`
    )
    .join("\n");

  const musicItems = r.music
    .map((m) => {
      const awards = m.awards.map((a) => escapeLatex(a)).join("; ");
      return `\\item \\textbf{${escapeLatex(m.instrument)}} (${m.years} years) --- ${escapeLatex(m.highlight)}${awards ? ` --- ${awards}` : ""}`;
    })
    .join("\n");

  const productionItems = r.production
    .map(
      (p) =>
        `\\item \\textbf{${escapeLatex(p.title)}} --- ${escapeLatex(p.detail)} --- ${escapeLatex(p.context)}`
    )
    .join("\n");

  return `\\documentclass[11pt, letterpaper]{article}

\\usepackage[margin=0.6in]{geometry}
\\usepackage{enumitem}
\\usepackage[hidelinks]{hyperref}
\\usepackage{titlesec}
\\usepackage{parskip}

\\pagestyle{empty}

\\titleformat{\\section}{\\large\\bfseries\\uppercase}{}{0em}{}[\\titlerule]
\\titlespacing{\\section}{0pt}{10pt}{6pt}

\\begin{document}

%% ── Header ──
\\begin{center}
  {\\LARGE\\bfseries ${escapeLatex(r.name)}} \\\\[4pt]
  \\href{mailto:${r.email}}{${escapeLatex(r.email)}} \\enspace$|$\\enspace
  \\href{https://${r.website}}{${escapeLatex(r.website)}} \\enspace$|$\\enspace
  \\href{https://github.com/${r.github}}{github.com/${escapeLatex(r.github)}} \\enspace$|$\\enspace
  \\href{https://linkedin.com/in/${r.linkedin}}{linkedin.com/in/${escapeLatex(r.linkedin)}}
\\end{center}

%% ── Skills ──
\\section{Skills}
${skillsSection}

%% ── Awards ──
\\section{Awards}
\\begin{itemize}[leftmargin=1.5em, nosep]
${awardsItems}
\\end{itemize}

%% ── Projects ──
\\section{Projects}
\\begin{itemize}[leftmargin=1.5em, nosep]
${projectItems}
\\end{itemize}

%% ── Community \\& Contributions ──
\\section{Community \\& Contributions}
\\begin{itemize}[leftmargin=1.5em, nosep]
${contributionItems}
\\end{itemize}

%% ── Music ──
\\section{Music}
\\begin{itemize}[leftmargin=1.5em, nosep]
${musicItems}
\\end{itemize}

%% ── Photography \\& Production ──
\\section{Photography \\& Production}
\\begin{itemize}[leftmargin=1.5em, nosep]
${productionItems}
\\end{itemize}

\\end{document}
`;
}

// Generate
mkdirSync(tmpDir, { recursive: true });
mkdirSync(outDir, { recursive: true });

const texPath = join(tmpDir, "resume.tex");
const pdfSrc = join(tmpDir, "resume.pdf");
const pdfDest = join(outDir, "resume.pdf");

const latex = generateLatex();
writeFileSync(texPath, latex);
writeFileSync(texDest, latex);
console.log("Generated LaTeX →", texDest);

try {
  execSync(
    `pdflatex -interaction=nonstopmode -output-directory="${tmpDir}" "${texPath}"`,
    { stdio: "pipe" }
  );
  // Run twice for references
  execSync(
    `pdflatex -interaction=nonstopmode -output-directory="${tmpDir}" "${texPath}"`,
    { stdio: "pipe" }
  );
} catch (e: any) {
  console.error("pdflatex failed:", e.stderr?.toString() || e.message);
  process.exit(1);
}

// Copy PDF to public/
execSync(`cp "${pdfSrc}" "${pdfDest}"`);
console.log("PDF generated →", pdfDest);
