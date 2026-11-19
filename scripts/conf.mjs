#!/usr/bin/env node
// Manage the archive files that live in Cloudflare R2 rather than in git.
//
// Files are kept locally (git-ignored) in public/conf/ so `npm run dev`
// serves them, and uploaded to the R2 bucket that backs /conf/ in production.
// conf-manifest.txt (committed) lists every file in the bucket; the build's
// link check uses it to verify /conf/ links without needing the files.
//
//   node scripts/conf.mjs status        local files not yet uploaded, and vice versa
//   node scripts/conf.mjs upload        upload local files missing from the manifest
//   node scripts/conf.mjs upload FILE…  (re)upload specific files, e.g. 2024/x.pdf
//   node scripts/conf.mjs download      fetch manifest files missing locally
//
// Uploading and downloading use wrangler, so run `npx wrangler login` first.

import { execFileSync } from "node:child_process";
import {
  mkdirSync,
  readFileSync,
  writeFileSync,
  readdirSync,
  statSync,
  existsSync,
} from "node:fs";
import { join, relative, extname, dirname } from "node:path";
import { pathToFileURL } from "node:url";

export const BUCKET = "fhtw-conf";
const ROOT = new URL("..", import.meta.url).pathname;
const LOCAL = join(ROOT, "public", "conf");
const MANIFEST = join(ROOT, "conf-manifest.txt");

const TYPES = {
  ".pdf": "application/pdf",
  ".mp3": "audio/mpeg",
  ".mp4": "video/mp4",
  ".mpg": "video/mpeg",
  ".html": "text/html; charset=utf-8",
  ".htm": "text/html; charset=utf-8",
  ".css": "text/css",
  ".js": "text/javascript",
  ".gif": "image/gif",
  ".jpg": "image/jpeg",
  ".png": "image/png",
  ".txt": "text/plain; charset=utf-8",
  ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ".pptx":
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
};

export function readManifest() {
  if (!existsSync(MANIFEST)) return new Set();
  return new Set(
    readFileSync(MANIFEST, "utf8")
      .split("\n")
      .filter((l) => l && !l.startsWith("#")),
  );
}

function writeManifest(keys) {
  const header =
    "# Files in the fhtw-conf R2 bucket, served at /conf/<path>.\n" +
    "# Maintained by scripts/conf.mjs; used by scripts/check-links.mjs.\n";
  writeFileSync(MANIFEST, header + [...keys].sort().join("\n") + "\n");
}

function localFiles(dir = LOCAL) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).flatMap((name) => {
    if (name === ".DS_Store") return [];
    const path = join(dir, name);
    return statSync(path).isDirectory()
      ? localFiles(path)
      : [relative(LOCAL, path)];
  });
}

function upload(key) {
  const type = TYPES[extname(key).toLowerCase()] ?? "application/octet-stream";
  execFileSync(
    "npx",
    [
      "wrangler",
      "r2",
      "object",
      "put",
      `${BUCKET}/${key}`,
      "--file",
      join(LOCAL, key),
      "--content-type",
      type,
      "--remote",
    ],
    { stdio: ["ignore", "ignore", "inherit"] },
  );
}

function download(key) {
  const dest = join(LOCAL, key);
  mkdirSync(dirname(dest), { recursive: true });
  execFileSync(
    "npx",
    [
      "wrangler",
      "r2",
      "object",
      "get",
      `${BUCKET}/${key}`,
      "--file",
      dest,
      "--remote",
    ],
    { stdio: ["ignore", "ignore", "inherit"] },
  );
}

function main([cmd, ...args]) {
  const manifest = readManifest();
  const local = localFiles();

  if (cmd === "status") {
    const notUploaded = local.filter((k) => !manifest.has(k));
    const notLocal = [...manifest].filter((k) => !local.includes(k));
    console.log(`${local.length} local files, ${manifest.size} in manifest`);
    for (const k of notUploaded) console.log(`  not uploaded: ${k}`);
    for (const k of notLocal) console.log(`  not local:    ${k}`);
  } else if (cmd === "upload") {
    const keys = args.length ? args : local.filter((k) => !manifest.has(k));
    let n = 0;
    for (const key of keys) {
      if (!existsSync(join(LOCAL, key))) {
        console.error(`missing locally: ${key}`);
        process.exitCode = 1;
        continue;
      }
      process.stdout.write(`[${++n}/${keys.length}] ${key}\n`);
      upload(key);
      manifest.add(key);
      // Save as we go so an interrupted upload can resume where it stopped.
      writeManifest(manifest);
    }
    console.log(`uploaded ${n} file(s)`);
  } else if (cmd === "download") {
    const keys = [...manifest].filter((k) => !local.includes(k));
    keys.forEach((key, i) => {
      process.stdout.write(`[${i + 1}/${keys.length}] ${key}\n`);
      download(key);
    });
    console.log(`downloaded ${keys.length} file(s)`);
  } else {
    console.log(
      "usage: node scripts/conf.mjs status | upload [FILE…] | download",
    );
    process.exitCode = 1;
  }
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main(process.argv.slice(2));
}
