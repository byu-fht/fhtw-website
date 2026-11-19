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
//   node scripts/conf.mjs delete FILE…  remove files from R2 and the manifest
//   node scripts/conf.mjs download      fetch manifest files missing locally
//   node scripts/conf.mjs backup [DIR]  download missing files, then copy all
//                                       of them to the Box backup folder
//
// Uploading and downloading use wrangler, so run `npx wrangler login` first.
// The backup folder defaults to Box Drive's "FHTW Website Archive Backup";
// override with DIR or the FHTW_BACKUP_DIR environment variable.

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
import { homedir } from "node:os";

export const BUCKET = "fhtw-conf";
const ROOT = new URL("..", import.meta.url).pathname;
const LOCAL = join(ROOT, "public", "conf");
const MANIFEST = join(ROOT, "conf-manifest.txt");
const BACKUP_DIR =
  process.env.FHTW_BACKUP_DIR ??
  join(homedir(), "Library/CloudStorage/Box-Box/FHTW Website Archive Backup");

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

// Run a wrangler command, retrying transient Cloudflare API errors.
function wrangler(args, attempts = 4) {
  for (let i = 1; ; i++) {
    try {
      execFileSync("npx", ["wrangler", ...args], {
        stdio: ["ignore", "ignore", "pipe"],
      });
      return;
    } catch (err) {
      if (i >= attempts) {
        process.stderr.write(err.stderr ?? "");
        throw new Error(`wrangler ${args.slice(0, 4).join(" ")} failed`);
      }
      const wait = 2 ** i;
      console.error(`  retrying in ${wait}s (attempt ${i} failed)`);
      execFileSync("sleep", [String(wait)]);
    }
  }
}

function upload(key) {
  const type = TYPES[extname(key).toLowerCase()] ?? "application/octet-stream";
  wrangler([
    "r2",
    "object",
    "put",
    `${BUCKET}/${key}`,
    "--file",
    join(LOCAL, key),
    "--content-type",
    type,
    "--remote",
  ]);
}

function download(key) {
  const dest = join(LOCAL, key);
  mkdirSync(dirname(dest), { recursive: true });
  wrangler([
    "r2",
    "object",
    "get",
    `${BUCKET}/${key}`,
    "--file",
    dest,
    "--remote",
  ]);
}

function downloadMissing(manifest, local) {
  const keys = [...manifest].filter((k) => !local.includes(k));
  keys.forEach((key, i) => {
    process.stdout.write(`[${i + 1}/${keys.length}] ${key}\n`);
    download(key);
  });
  console.log(`downloaded ${keys.length} file(s)`);
}

// Copy every archive file to the backup folder. Never deletes from the
// backup, so it also keeps files later removed from the site.
function backup(dir) {
  if (!existsSync(dirname(dir))) {
    throw new Error(`${dirname(dir)} not found (is Box Drive running?)`);
  }
  mkdirSync(join(dir, "conf"), { recursive: true });
  execFileSync(
    "rsync",
    ["-a", "--exclude", ".DS_Store", LOCAL + "/", join(dir, "conf") + "/"],
    { stdio: "inherit" },
  );
  writeFileSync(join(dir, "conf-manifest.txt"), readFileSync(MANIFEST));
  const commit = execFileSync("git", ["rev-parse", "--short", "HEAD"], {
    cwd: ROOT,
  })
    .toString()
    .trim();
  writeFileSync(
    join(dir, "README.txt"),
    `Backup of the Family History Technology Workshop archive files
(papers, slides, audio, video) served at https://fhtw.byu.edu/conf/.

The live copies are in the Cloudflare R2 bucket "${BUCKET}"; this folder is
an offline backup. conf/ mirrors the bucket; files are never deleted here.
To refresh it, from the website repo (github.com/byu-fht/fhtw-website):

    npm run conf -- backup

Do this every year after adding that year's archive, and whenever
files are added or replaced. See the repo README.

Last backup: ${new Date().toISOString().slice(0, 10)} (repo commit ${commit})
`,
  );
  console.log(`backed up to ${dir}`);
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
  } else if (cmd === "delete") {
    for (const key of args) {
      if (!manifest.has(key)) {
        console.error(`not in manifest: ${key}`);
        process.exitCode = 1;
        continue;
      }
      wrangler(["r2", "object", "delete", `${BUCKET}/${key}`, "--remote"]);
      manifest.delete(key);
      writeManifest(manifest);
      console.log(`deleted ${key}`);
    }
  } else if (cmd === "download") {
    downloadMissing(manifest, local);
  } else if (cmd === "backup") {
    downloadMissing(manifest, local);
    backup(args[0] ?? BACKUP_DIR);
  } else {
    console.log(
      "usage: node scripts/conf.mjs status | upload [FILE…] | delete FILE… | download | backup [DIR]",
    );
    process.exitCode = 1;
  }
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main(process.argv.slice(2));
}
