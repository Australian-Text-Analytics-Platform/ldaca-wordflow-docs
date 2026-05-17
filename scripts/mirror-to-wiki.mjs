#!/usr/bin/env node
// Mirror this docs repo's markdown into the master repo's GitHub Wiki
// for human browsing.
//
// Information pages are intentionally excluded — tutorials + references +
// warnings cover the wiki audience; info pages are redundant there.
//
// The wiki is one-way: the docs repo is the source of truth. The wiki
// is flat (no subdirectories), so file paths get encoded into page
// slugs (`tutorials/foo.md` → `Tutorials-Foo`), and image refs are
// rewritten to absolute raw-content URLs back at this repo.
//
// Inputs (env vars):
//   WIKI_REMOTE   - https URL to the wiki git repo, with auth token
//   DOCS_RAW_BASE - raw-content base URL of this repo's main branch
//   WIKI_BRANCH   - (optional) wiki branch to push to. Default 'master'

import { execSync } from 'node:child_process';
import {
  mkdtempSync, readFileSync, readdirSync, statSync,
  writeFileSync, rmSync, existsSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

// information/ is excluded — tutorials are the primary wiki content.
const WIKI_KIND_DIRS = ['tutorials', 'references', 'warnings'];

const KIND_LABELS = {
  tutorials: 'Tutorials',
  references: 'References',
  warnings: 'Warnings',
};

const requireEnv = (name) => {
  const v = process.env[name];
  if (!v) { console.error(`Missing required env var: ${name}`); process.exit(1); }
  return v;
};

const WIKI_REMOTE = requireEnv('WIKI_REMOTE');
const DOCS_RAW_BASE = requireEnv('DOCS_RAW_BASE').replace(/\/+$/, '');
const WIKI_BRANCH = process.env.WIKI_BRANCH ?? 'master';

const titleCase = (s) =>
  s.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join('-');

const slugForFile = (relPath) => {
  const [dir, file] = relPath.split('/');
  return `${titleCase(dir)}-${titleCase(file.replace(/\.md$/, ''))}`;
};

const walkMarkdown = (dir, acc = []) => {
  if (!existsSync(dir)) return acc;
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) continue;
    if (!name.endsWith('.md')) continue;
    acc.push(full);
  }
  return acc;
};

// Extract the first H1 heading from markdown content — used as the page
// display label in the sidebar and home page.
const labelFromH1 = (content) => {
  const m = content.match(/^#\s+(.+)$/m);
  return m ? m[1].trim() : null;
};

// All kind dirs that could appear in cross-file links (including information/,
// even though we don't mirror it, so existing cross-links don't break).
const ALL_KIND_DIRS = ['tutorials', 'information', 'references', 'warnings'];

// Asset dirs at the docs-repo root (NOT under a tutorials/ subdir).
// Top-level `assets/` carries brand-level assets — the logo files +
// favicon used by the tutorial index hero. We rewrite their paths
// the same way as kind-dir paths so the wiki resolves them via
// raw.githubusercontent.com instead of looking for the dir alongside
// the (flat) wiki pages.
const ASSET_DIRS = ['assets'];
const REWRITE_DIRS = [...ALL_KIND_DIRS, ...ASSET_DIRS];

const rewriteContent = (markdown, sourceRelPath) => {
  let out = markdown;

  // Markdown image / link paths → absolute raw-content URLs.
  const assetRe = new RegExp(`\\]\\((${REWRITE_DIRS.join('|')})/([^)]+)\\)`, 'g');
  out = out.replace(assetRe, (_m, kindDir, rest) =>
    `](${DOCS_RAW_BASE}/${kindDir}/${rest})`
  );

  // HTML <img src="kindDir/..."> tags — the mirror script previously
  // skipped these, so a centred-hero <img> stayed literal in the wiki
  // and 404'd against `/wiki/<sourceDir>/<…>`. Rewrite to the same
  // absolute raw URL; preserve any other attributes (width, alt, etc.).
  const htmlImgRe = new RegExp(
    `(<img\\b[^>]*?\\ssrc=)(["'])(${REWRITE_DIRS.join('|')})/([^"']+)(["'])`,
    'gi'
  );
  out = out.replace(htmlImgRe, (_m, pre, quote, kindDir, rest, quote2) =>
    `${pre}${quote}${DOCS_RAW_BASE}/${kindDir}/${rest}${quote2}`
  );

  // Sibling links: (./preprocessing.md) or (preprocessing.md#anchor)
  const sourceDir = sourceRelPath.split('/')[0];
  const siblingRe = /\]\((\.\/)?([\w.-]+)\.md(#[\w-]+)?\)/g;
  out = out.replace(siblingRe, (_m, _dot, base, hash) =>
    `](${titleCase(sourceDir)}-${titleCase(base)}${hash ?? ''})`
  );

  // Cross-kind links: (/tutorials/foo.md#anchor)
  const crossKindRe = new RegExp(
    `\\]\\(/?(${ALL_KIND_DIRS.join('|')})/([\\w.-]+)\\.md(#[\\w-]+)?\\)`, 'g'
  );
  out = out.replace(crossKindRe, (_m, kindDir, base, hash) =>
    `](${titleCase(kindDir)}-${titleCase(base)}${hash ?? ''})`
  );

  return out;
};

const sortEntries = (entries) =>
  [...entries].sort((a, b) => {
    // index pages first within their kind, then alphabetical by label.
    const aIsIndex = a.file.includes('index') ? 0 : 1;
    const bIsIndex = b.file.includes('index') ? 0 : 1;
    return aIsIndex - bIsIndex || a.label.localeCompare(b.label);
  });

const groupBy = (arr, key) =>
  arr.reduce((acc, e) => { (acc[key(e)] ??= []).push(e); return acc; }, {});

const renderSidebar = (entries) => {
  const grouped = groupBy(entries, (e) => e.kindDir);
  const lines = ['[Home](Home)', ''];
  for (const kind of WIKI_KIND_DIRS) {
    const items = grouped[kind];
    if (!items?.length) continue;
    lines.push(`**${KIND_LABELS[kind]}**`, '');
    for (const e of sortEntries(items)) lines.push(`- [${e.label}](${e.slug})`);
    lines.push('');
  }
  return lines.join('\n');
};

const renderHome = (entries) => {
  const grouped = groupBy(entries, (e) => e.kindDir);
  const lines = [
    '# LDaCA Text Analytics — Documentation',
    '',
    '_Mirrored from [ldaca-analytics-docs](https://github.com/Australian-Text-Analytics-Platform/ldaca-analytics-docs). Edit there, not here._',
    '',
  ];
  for (const kind of WIKI_KIND_DIRS) {
    const items = grouped[kind];
    if (!items?.length) continue;
    lines.push(`## ${KIND_LABELS[kind]}`, '');
    for (const e of sortEntries(items)) lines.push(`- [${e.label}](${e.slug})`);
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
  for (const kindDir of WIKI_KIND_DIRS) {
    for (const fullPath of walkMarkdown(join(ROOT, kindDir))) {
      const file = fullPath.slice(ROOT.length + 1);
      const slug = slugForFile(file);
      const src = readFileSync(fullPath, 'utf8');
      const label = labelFromH1(src)
        ?? titleCase(file.split('/')[1].replace(/\.md$/, ''));
      entries.push({ file, kindDir, slug, label, src });
    }
  }
  if (entries.length === 0) {
    console.error('No markdown found to mirror.');
    process.exit(1);
  }

  const workDir = mkdtempSync(join(tmpdir(), 'wiki-mirror-'));
  try {
    run(`git clone --depth=1 --branch=${WIKI_BRANCH} ${WIKI_REMOTE} ${workDir}`);

    for (const name of readdirSync(workDir)) {
      if (name.endsWith('.md')) rmSync(join(workDir, name));
    }

    for (const e of entries) {
      writeFileSync(join(workDir, `${e.slug}.md`), rewriteContent(e.src, e.file));
    }

    writeFileSync(join(workDir, 'Home.md'), renderHome(entries));
    writeFileSync(join(workDir, '_Sidebar.md'), renderSidebar(entries));

    run(`git -C ${workDir} add -A`);
    try {
      run(`git -C ${workDir} diff --cached --quiet`);
      console.log('Wiki already in sync — no changes to push.');
      return;
    } catch {
      // staged changes exist, proceed
    }
    run(
      `git -C ${workDir} -c user.name='docs-mirror' -c user.email='docs-mirror@users.noreply.github.com' ` +
      `commit -m 'Mirror docs from ldaca-analytics-docs@${process.env.GITHUB_SHA?.slice(0, 7) ?? 'local'}'`
    );
    run(`git -C ${workDir} push origin ${WIKI_BRANCH}`);
  } finally {
    rmSync(workDir, { recursive: true, force: true });
  }
};

main();
