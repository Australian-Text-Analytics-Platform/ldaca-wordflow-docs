#!/usr/bin/env node
// Mirror this docs repo's markdown into the master repo's GitHub Wiki
// for human browsing.
//
// The wiki is one-way: the docs repo is the source of truth. The wiki
// is flat (no subdirectories), so file paths get encoded into page
// slugs (`tutorials/foo.md` → `Tutorials-Foo.md`), and image refs are
// rewritten to absolute raw-content URLs back at this repo.
//
// Inputs (env vars):
//   WIKI_REMOTE     - https URL to the wiki git repo, with auth, e.g.
//                     https://x-access-token:${{secrets.WIKI_PAT}}@github.com/<org>/<master-repo>.wiki.git
//   DOCS_RAW_BASE   - raw-content base URL of this docs repo's main
//                     branch, e.g. https://raw.githubusercontent.com/<org>/ldaca-analytics-docs/main
//   WIKI_BRANCH     - (optional) wiki branch to push to. Default 'master'
//                     (GitHub wikis use 'master' historically).
//
// Run as: `node scripts/mirror-to-wiki.mjs` — exits non-zero on failure.

import { execSync } from 'node:child_process';
import { mkdtempSync, readFileSync, readdirSync, statSync, writeFileSync, rmSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

const KIND_DIRS = ['tutorials', 'information', 'references', 'warnings'];

const requireEnv = (name) => {
  const v = process.env[name];
  if (!v) {
    console.error(`Missing required env var: ${name}`);
    process.exit(1);
  }
  return v;
};

const WIKI_REMOTE = requireEnv('WIKI_REMOTE');
const DOCS_RAW_BASE = requireEnv('DOCS_RAW_BASE').replace(/\/+$/, '');
const WIKI_BRANCH = process.env.WIKI_BRANCH ?? 'master';

const titleCase = (s) =>
  s.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join('-');

const slugForFile = (relPath) => {
  // 'tutorials/data-loader.md' -> 'Tutorials-Data-Loader'
  const [dir, file] = relPath.split('/');
  const base = file.replace(/\.md$/, '');
  return `${titleCase(dir)}-${titleCase(base)}`;
};

const walkMarkdown = (dir, acc = []) => {
  if (!existsSync(dir)) return acc;
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) continue; // assets/, etc — not mirrored
    if (!name.endsWith('.md')) continue;
    acc.push(full);
  }
  return acc;
};

const rewriteContent = (markdown, sourceRelPath) => {
  let out = markdown;

  // Image paths: 'tutorials/assets/foo.png' -> absolute raw URL.
  // Match `](path)` where path starts with one of the kind dirs.
  const assetRe = new RegExp(`\\]\\((${KIND_DIRS.join('|')})/([^)]+)\\)`, 'g');
  out = out.replace(assetRe, (_m, kindDir, rest) => {
    return `](${DOCS_RAW_BASE}/${kindDir}/${rest})`;
  });

  // Sibling-doc links: '(./preprocessing.md)' or '(preprocessing.md)' or
  // '(preprocessing.md#anchor)' resolved against the source dir.
  const sourceDir = sourceRelPath.split('/')[0];
  const siblingRe = /\]\((\.\/)?([\w.-]+)\.md(#[\w-]+)?\)/g;
  out = out.replace(siblingRe, (_m, _dot, base, hash) => {
    const slug = `${titleCase(sourceDir)}-${titleCase(base)}`;
    return `](${slug}${hash ?? ''})`;
  });

  // Cross-kind absolute-ish links: '(/information/foo.md)' or
  // '(/tutorials/foo.md#anchor)'.
  const crossKindRe = new RegExp(
    `\\]\\(/?(${KIND_DIRS.join('|')})/([\\w.-]+)\\.md(#[\\w-]+)?\\)`,
    'g',
  );
  out = out.replace(crossKindRe, (_m, kindDir, base, hash) => {
    const slug = `${titleCase(kindDir)}-${titleCase(base)}`;
    return `](${slug}${hash ?? ''})`;
  });

  return out;
};

const renderHome = (entries) => {
  const grouped = {};
  for (const e of entries) {
    if (!grouped[e.kindDir]) grouped[e.kindDir] = [];
    grouped[e.kindDir].push(e);
  }
  const sectionOrder = ['tutorials', 'information', 'references', 'warnings'];
  const lines = [
    '# LDaCA Text Analytics — docs',
    '',
    '_Mirrored from the [ldaca-analytics-docs](https://github.com/Australian-Text-Analytics-Platform/ldaca-analytics-docs) repo._',
    '',
  ];
  for (const kind of sectionOrder) {
    const items = grouped[kind];
    if (!items || items.length === 0) continue;
    lines.push(`## ${titleCase(kind)}`);
    lines.push('');
    for (const e of items.sort((a, b) => a.slug.localeCompare(b.slug))) {
      lines.push(`- [[${e.slug}]]`);
    }
    lines.push('');
  }
  return lines.join('\n');
};

const run = (cmd, opts = {}) => {
  console.log(`+ ${cmd}`);
  return execSync(cmd, { stdio: ['ignore', 'inherit', 'inherit'], ...opts });
};

const main = () => {
  const entries = [];
  for (const kindDir of KIND_DIRS) {
    for (const fullPath of walkMarkdown(join(ROOT, kindDir))) {
      const file = fullPath.slice(ROOT.length + 1);
      const slug = slugForFile(file);
      entries.push({ fullPath, file, kindDir, slug });
    }
  }
  if (entries.length === 0) {
    console.error('No markdown found to mirror.');
    process.exit(1);
  }

  const workDir = mkdtempSync(join(tmpdir(), 'wiki-mirror-'));
  try {
    run(`git clone --depth=1 --branch=${WIKI_BRANCH} ${WIKI_REMOTE} ${workDir}`);

    // Wipe existing .md so renamed/removed pages stay in sync. Leave
    // any non-markdown the wiki carries (custom uploads) alone.
    for (const name of readdirSync(workDir)) {
      if (name.endsWith('.md')) rmSync(join(workDir, name));
    }

    for (const e of entries) {
      const src = readFileSync(e.fullPath, 'utf8');
      const rewritten = rewriteContent(src, e.file);
      writeFileSync(join(workDir, `${e.slug}.md`), rewritten);
    }

    writeFileSync(join(workDir, 'Home.md'), renderHome(entries));

    run(`git -C ${workDir} add -A`);
    try {
      run(`git -C ${workDir} diff --cached --quiet`);
      console.log('Wiki already in sync — no changes to push.');
      return;
    } catch {
      // staged changes exist, proceed.
    }
    run(`git -C ${workDir} -c user.name='docs-mirror' -c user.email='docs-mirror@users.noreply.github.com' commit -m 'Mirror docs from ldaca-analytics-docs@${process.env.GITHUB_SHA?.slice(0, 7) ?? 'local'}'`);
    run(`git -C ${workDir} push origin ${WIKI_BRANCH}`);
  } finally {
    rmSync(workDir, { recursive: true, force: true });
  }
};

main();
