#!/usr/bin/env node
// After `astro build`, check that every /conf/... link in the built site
// points at a file listed in conf-manifest.txt (i.e. a file in R2), and that
// every label button actually has a link. Exits non-zero on problems so a
// broken link fails the Netlify build instead of reaching the live site.

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { readManifest } from "./conf.mjs";

const DIST = new URL("../dist", import.meta.url).pathname;
const manifest = readManifest();

function htmlFiles(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) {
      return relative(DIST, path) === "conf" ? [] : htmlFiles(path);
    }
    return name.endsWith(".html") ? [path] : [];
  });
}

const decode = (s) =>
  decodeURIComponent(s.replace(/&amp;/g, "&").replace(/&#38;/g, "&"));

const problems = [];
let checked = 0;
for (const file of htmlFiles(DIST)) {
  const page = "/" + relative(DIST, file).replace(/index\.html$/, "");
  const html = readFileSync(file, "utf8");
  for (const [, url] of html.matchAll(/(?:href|src)="\/conf\/([^"#?]+)"/g)) {
    checked++;
    const key = decode(url);
    if (!manifest.has(key)) problems.push(`${page}: /conf/${key} is not in conf-manifest.txt`);
  }
  for (const [tag] of html.matchAll(/<a class="no-underline rounded-lg[^>]*>/g)) {
    if (!tag.includes("href=")) problems.push(`${page}: label button without a url`);
  }
}

if (problems.length) {
  console.error(`check-links: ${problems.length} problem(s) in ${checked} /conf links`);
  for (const p of problems) console.error("  " + p);
  process.exit(1);
}
console.log(`check-links: all ${checked} /conf links OK`);
