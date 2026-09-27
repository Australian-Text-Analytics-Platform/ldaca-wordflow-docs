# AGENTS.md — ldaca-wordflow-docs

This repository is a publication mirror, not the authoring source.

- Edit user-facing Markdown, assets, and registry targets in the main app's
  `frontend/` package first.
- Run `pnpm -C frontend docs:check`, then
  `pnpm -C frontend docs:sync-publish` from the main repository.
- Do not hand-edit generated `registry.json` or mirror content to resolve drift.
- Keep maintainer files, validation scripts, and publishing workflows in this
  repository.
- Run `node scripts/build-registry.mjs` before committing; the sync command
  already performs this validation.
- Treat `v{major}.{minor}` tags as deliberately mutable release channels.
  Moving or force-pushing one requires explicit release authorization and a
  post-publish Pages check.
