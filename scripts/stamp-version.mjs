#!/usr/bin/env node
// Stamps a build version across the delivery apps (same scheme as the
// wholesale app: YYYY-MM-DD.N).
//
//   node scripts/stamp-version.mjs            # stamps today's date + a counter
//   node scripts/stamp-version.mjs 2026-09-13.2
//
// Run this before every push that changes an app, and add a matching entry to
// CHANGELOG.md. Two things depend on the stamp:
//
//   1. The header shows the version, so "which build is this phone running?"
//      is answerable at a glance.
//   2. The service-worker cache name carries it, so an old cached shell is
//      discarded on update.
//
// A version that is not bumped is worse than none, because it looks current.

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const APPS = ["driver", "wh", "admin"];

function nextVersion(existing) {
  const today = new Date().toISOString().slice(0, 10);
  const used = existing
    .map((v) => (v?.startsWith(today) ? Number(v.split(".").pop()) : 0))
    .filter(Number.isFinite);
  return `${today}.${Math.max(0, ...used) + 1}`;
}

const current = APPS.map((a) => {
  const html = readFileSync(join(ROOT, a, "index.html"), "utf8");
  return html.match(/const APP_VERSION = "([^"]+)"/)?.[1];
});
const version = process.argv[2] || nextVersion(current);

for (const app of APPS) {
  const file = join(ROOT, app, "index.html");
  let html = readFileSync(file, "utf8");

  if (/const APP_VERSION = "[^"]*"/.test(html)) {
    html = html.replace(/const APP_VERSION = "[^"]*"/, `const APP_VERSION = "${version}"`);
  } else {
    html = html.replace(/(const API = "[^"]*";)/, `$1\nconst APP_VERSION = "${version}";`);
  }
  writeFileSync(file, html);

  const swFile = join(ROOT, app, "sw.js");
  let sw = readFileSync(swFile, "utf8");
  sw = sw.replace(/const CACHE = "[^"]*"/, `const CACHE = "ffd-${app}-${version}"`);
  writeFileSync(swFile, sw);
}

console.log(`stamped ${version} across ${APPS.length} app(s) — now add a CHANGELOG.md entry`);
