import fs from "node:fs";
import path from "node:path";

export interface Document {
  year: string;
  title: string;
  url: string;
  description?: string;
  thumbnail: string;
}

export interface ForbundLink {
  title: string;
  url: string;
  logo: string;
}

export interface Avtal {
  slug: string;
  name: string;
  description: string[];
  documents: Document[];
  forbund: ForbundLink[];
  sources: string[];
}

// Agreement content lives under `avtal/`, one markdown file per canonical
// agreement, e.g. `avtal/teknikavtalet.md`.
const contentRoot = path.join(process.cwd(), "avtal");

export function getAvtalSlugs(): string[] {
  return fs
    .readdirSync(contentRoot, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".md"))
    .map((entry) => entry.name.slice(0, -3));
}

const yearHeading = /^(\d{4})$/;

const documentLink =
  /^-\s*\[([^\]]+)\]\((https:\/\/kollektivavtal\.github\.io\/(\d{4})\/[^)]+)\)\s*$/;

const forbundLink =
  /^-\s*\[([^\]]+)\]\((https:\/\/fackforbund\.github\.io\/[^)]+)\)\s*$/;

export function parseAvtal(slug: string): Avtal {
  const markdown = fs.readFileSync(path.join(contentRoot, `${slug}.md`), "utf8");

  let name = slug;
  const description: string[] = [];
  const documents: Document[] = [];
  const forbund: ForbundLink[] = [];
  let section: "preamble" | "versioner" | "forbund" | "kallor" | "other" = "preamble";
  const sources: string[] = [];
  let currentYear: string | null = null;

  for (const rawLine of markdown.split("\n")) {
    const line = rawLine.trim();

    if (line.startsWith("# ")) {
      name = line.slice(2).trim();
      continue;
    }

    if (line.startsWith("## ")) {
      const heading = line.slice(3).trim();
      const yearMatch = heading.match(yearHeading);
      if (yearMatch) {
        section = "versioner";
        currentYear = yearMatch[1];
      } else {
        const lower = heading.toLowerCase();
        section = lower === "forbund" ? "forbund" : lower === "källor" ? "kallor" : "other";
        currentYear = null;
      }
      continue;
    }

    if (!line) {
      continue;
    }

    if (section === "preamble") {
      description.push(line);
      continue;
    }

    if (section === "versioner") {
      const match = line.match(documentLink);
      if (match && currentYear) {
        const [, title, url] = match;
        const thumbnail = url.replace(/\.pdf$/, "-320.webp");
        documents.push({ year: currentYear, title, url, thumbnail });
        continue;
      }
      const last = documents[documents.length - 1];
      if (last && currentYear && last.year === currentYear && !last.description) {
        last.description = line;
      }
      continue;
    }

    if (section === "kallor") {
      const match = line.match(/^-\s*(https?:\/\/\S+)\s*$/);
      if (match) {
        sources.push(match[1]);
      }
      continue;
    }

    if (section === "forbund") {
      const match = line.match(forbundLink);
      if (match) {
        const [, title, url] = match;
        const logoSlug = url.replace(/^https?:\/\/fackforbund\.github\.io\//, "").replace(/\/$/, "");
        forbund.push({
          title,
          url,
          logo: `https://fackforbund.github.io/${logoSlug}/${logoSlug}@512x512.webp`,
        });
      }
    }
  }

  documents.sort((a, b) => b.year.localeCompare(a.year));

  return { slug, name, description, documents, forbund, sources };
}
