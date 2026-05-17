# ldaca-wordflow-docs

User-facing documentation for the **LDaCA Wordflow** web app (renamed from "LDaCA Text Analytics" / `ldaca-web-app` at v0.4.2).
Hosts the markdown content + the `registry.json` consumed by the app's
runtime doc-link registry at
`@/tutorials/{tutorialRegistry,infoRegistry,referenceRegistry}.ts`.

## Layout

```
.
├── tutorials/       <h2 id="help-*"> anchors; in-app HelpIcon target
├── information/     <h2 id="info-*"> anchors; in-app InfoIcon target
├── references/      <h2 id="ref-*"> anchors; in-app ReferenceIcon target
├── warnings/        in-app WarningIcon target
├── registry.json    source of truth — maps targetKey → {file, anchor, label}
├── scripts/
│   ├── build-registry.mjs    validate registry.json against on-disk markdown
│   └── mirror-to-wiki.mjs    flatten + publish to master repo's wiki
└── .github/workflows/
    ├── publish.yml           branch-per-version → GitHub Pages
    └── mirror-to-wiki.yml    on push to main, mirror into master repo's wiki
```

## How the app loads docs

The web app reads `VITE_DOCS_BASE_URL` at build time (e.g.
`https://australian-text-analytics-platform.github.io/ldaca-wordflow-docs/v0.3`).
At app start it fetches `${VITE_DOCS_BASE_URL}/registry.json`, merges the
payload over the in-bundle fallback, and caches it in `localStorage`
with a schema-version stamp. Markdown is fetched lazily per modal open
from `${VITE_DOCS_BASE_URL}/<file>`. See
`docs/refactoring/online-tutorial-migration.md` in the app repo.

## Branch-per-version

- `main` — active editing, also serves the wiki via `mirror-to-wiki`.
- `v0.3`, `v0.4`, … — frozen branches matching app minor versions.

When the app's `package.json` minor version bumps (e.g. 0.3 → 0.4), cut
a new `v0.4` branch in this repo from `main` and bump
`VITE_DOCS_BASE_URL` in the app's `.env` to match.

Within a branch, docs are **accretive**: new anchors can be added but
existing anchors should not be removed (old apps in the wild still
reference them).

## Editing

1. Edit markdown under `tutorials/`, `information/`, `references/`, or
   `warnings/`.
2. If you add a new `<h… id="help-something">` anchor that the app should
   target, add a matching entry to `registry.json` keyed by the app's
   targetKey string. The targetKey **must** match the literal passed to
   `<HelpIcon targetKey="…">` in the app's source.
3. Run `node scripts/build-registry.mjs` locally to validate.
4. Push. The Pages workflow republishes; the wiki mirror runs on `main`
   pushes only.

## EOL

A registry can carry `meta.eolDate` (ISO-8601). The app shows a
deprecation banner once that date passes, prompting users to upgrade.

## Wiki one-time setup

The `mirror-to-wiki` workflow requires:
- A fine-grained PAT scoped to the master repo's wiki (`contents:write`).
- Stored as `WIKI_PAT` in this repo's Actions secrets.
- Master repo settings → "Restrict editing to collaborators only" on
  the wiki, so casual edits don't get clobbered by the next mirror.
