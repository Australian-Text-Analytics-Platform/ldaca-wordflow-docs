# ldaca-wordflow-docs

Versioned GitHub Pages publication mirror for LDaCA Wordflow's user-facing
documentation. The complete editable source lives in the main application
repository under `frontend/public/`, with its registry in
`frontend/src/tutorials/bundledRegistry.ts`.

## Content workflow

Do not edit published Markdown or `registry.json` here first. In the main app
repository:

1. Edit and validate the bundled frontend documentation.
2. Run `pnpm -C frontend docs:check`.
3. Run `pnpm -C frontend docs:sync-publish`.

The sync command mirrors `tutorials/`, `information/`, and `references/`,
removes obsolete mirror-only content, generates `registry.json` from the
bundled registry and app version, and runs `node scripts/build-registry.mjs`.
Repository-maintainer files such as this README, `AGENTS.md`, workflows, and
validation scripts remain local to this repository.

## Runtime delivery

The app is fully functional with bundled documentation. If
`VITE_DOCS_ORIGIN` is configured, app version `0.7.1` first requests
`VITE_DOCS_ORIGIN/v0.7/registry.json` and Markdown below that tag directory.
Remote content can provide urgent corrections; missing or unavailable remote
content falls back to the app bundle.

## Mutable minor tags

Published minor versions are actual Git tags (`v0.5`, `v0.6`, `v0.7`), not
version branches. A minor tag deliberately moves when an urgent documentation
correction must reach installed apps on that line.

After committing a validated mirror update in this repository:

```sh
git tag -f v0.7
git push origin refs/tags/v0.7 --force
```

Replace `v0.7` with the app line being updated. Force-moving a public tag is an
explicit release operation: verify the target commit, push, then confirm
`v0.7/registry.json` and an edited Markdown page on GitHub Pages. The main
branch may also publish a preview at `main/`.

`registry.json` may carry `meta.eolDate` in ISO-8601 form. The app displays its
documentation end-of-life banner after that date.
