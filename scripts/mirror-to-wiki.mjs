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

// Build a map from file path → best display label using registry.json.
// Prefers entries whose key ends with .tab, .overview, or .section
// (the section-level entries); falls back to the first entry for the file.
const buildFileLabels = () => {
  try {
    const registry = JSON.parse(readFileSync(join(ROOT, 'registry.json'), 'utf8'));
    const labels = new Map();
    const PREFER = ['.tab', '.overview', '.section'];
    for (const kind of ['tutorial', 'info', 'reference']) {
      for (const [key, entry] of Object.entries(registry[kind] ?? {})) {
        const isPreferred = PREFER.some((s) => key.endsWith(s));
        if (!labels.has(entry.file) || isPreferred) labels.set(entry.file, entry.label);
      }
    }
    return labels;
  } catch {
    return new Map();
  }
};

// All kind dirs that could appear in cross-file links (including information/,
// even though we don't mirror it, so existing cross-links don't break).
const ALL_KIND_DIRS = ['tutorials', 'information', 'references', 'warnings'];

const rewriteContent = (markdown, sourceRelPath) => {
  let out = markdown;

  // Image paths → absolute raw-content URLs.
  const assetRe = new RegExp(`\\]\\((${ALL_KIND_DIRS.join('|')})/([^)]+)\\)`, 'g');
  out = out.replace(assetRe, (_m, kindDir, rest) =>
    `](${DOCS_RAW_BASE}/${kindDir}/${rest})`
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
  const lines = ['**[[Home]]**', ''];
  for (const kind of WIKI_KIND_DIRS) {
    const items = grouped[kind];
    if (!items?.length) continue;
    lines.push('---', `**${KIND_LABELS[kind]}**`, '');
    for (const e of sortEntries(items)) lines.push(`- [[${e.slug}|${e.label}]]`);
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
    for (const e of sortEntries(items)) lines.push(`- [[${e.slug}|${e.label}]]`);
    lines.push('');
  }
  return lines.join('\n');
};

const run = (cmd, opts = {}) => {
  console.log(`+ ${cmd}`);
  return execSync(cmd, { stdio: ['ignore', 'inherit', 'inherit'], ...opts });
};

const main = () => {
  const fileLabels = buildFileLabels();

  const entries = [];
  for (const kindDir of WIKI_KIND_DIRS) {
    for (const fullPath of walkMarkdown(join(ROOT, kindDir))) {
      const file = fullPath.slice(ROOT.length + 1);
      const slug = slugForFile(file);
      const label = fileLabels.get(file)
        ?? titleCase(file.split('/')[1].replace(/\.md$/, ''));
      entries.push({ fullPath, file, kindDir, slug, label });
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
      const src = readFileSync(e.fullPath, 'utf8');
      writeFileSync(join(workDir, `${e.slug}.md`), rewriteContent(src, e.file));
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
