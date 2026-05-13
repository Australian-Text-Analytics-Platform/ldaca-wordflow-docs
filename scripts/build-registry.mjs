#!/usr/bin/env node
// Validate registry.json against the on-disk markdown.
//
// `registry.json` is the source of truth — it's hand-maintained alongside
// the markdown content. This script doesn't generate the registry; it
// only checks that every entry refers to an existing file with a present
// `<a id="anchor">` (or a heading with the same slug).
//
// Run via `npm run build` in this repo. Used by the Pages publish
// workflow as a pre-publish gate.

import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

const KINDS = ['tutorial', 'info', 'reference'];

const slugifyHeading = (text) =>
  text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');

const extractAnchors = (markdown) => {
  const anchors = new Set();
  // Any inline HTML element carrying `id="..."` — the docs convention
  // attaches anchors to headings like `<h2 id="help-...">` and the
  // bare `<a id="...">` form.
  for (const m of markdown.matchAll(/<[a-zA-Z][^>]*\sid=["']([^"']+)["']/g)) {
    anchors.add(m[1]);
  }
  // Heading-derived anchors (GFM auto-id), best-effort.
  for (const m of markdown.matchAll(/^#+\s+(.+)$/gm)) {
    anchors.add(slugifyHeading(m[1]));
  }
  return anchors;
};

const main = async () => {
  const registryPath = join(ROOT, 'registry.json');
  const registry = JSON.parse(await readFile(registryPath, 'utf8'));

  const errors = [];

  for (const kind of KINDS) {
    const section = registry[kind];
    if (!section) {
      errors.push(`registry.${kind} is missing`);
      continue;
    }
    for (const [key, entry] of Object.entries(section)) {
      const filePath = join(ROOT, entry.file);
      if (!existsSync(filePath)) {
        errors.push(`${kind}.${key}: file not found → ${entry.file}`);
        continue;
      }
      if (!entry.anchor) continue;
      const md = await readFile(filePath, 'utf8');
      const anchors = extractAnchors(md);
      if (!anchors.has(entry.anchor)) {
        errors.push(
          `${kind}.${key}: anchor "${entry.anchor}" not found in ${entry.file}`,
        );
      }
    }
  }

  if (errors.length) {
    console.error('registry.json validation failed:\n');
    for (const err of errors) console.error(`  • ${err}`);
    process.exit(1);
  }

  const total =
    Object.keys(registry.tutorial).length +
    Object.keys(registry.info).length +
    Object.keys(registry.reference).length;
  console.log(`registry.json OK — ${total} entries validated.`);
};

await main();
