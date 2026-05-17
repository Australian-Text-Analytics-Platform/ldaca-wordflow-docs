<!-- markdownlint-disable MD033 -->

<h1 id="help-snapshots-section">Demo Snapshots tutorial</h1>

> **New in v0.5.** Save the current view of any analysis to a small `.ldaca-snapshot` bundle, then open it later — or share it with a collaborator — without re-running the analysis or re-uploading the data.

Snapshots are the LDaCA Wordflow way of freezing an in-progress analysis for sharing, teaching, or future reference. Every one of the five analysis tools — Concordance, Quotation, Trends, Token Frequency, Topic Modelling — supports the same Save / Open buttons in its header, and produces a self-contained bundle that another Wordflow user (or the same user on a different machine) can load without access to the original source data.

![Snapshot Save and Open buttons](tutorials/assets/snapshots/header_buttons.png)

<h2 id="help-snapshots-what-is-a-snapshot">What is a snapshot?</h2>

A snapshot bundle is a small `.ldaca-snapshot` file — a zip archive — containing:

- **The result rows** the analysis produced (concordance hits, topic models, token counts, sequential aggregates, quotation extracts).
- **The parameters** that produced them (search term, frequency, group columns, stop-word list, random seed, etc.).
- **A manifest** describing the tool, the source data blocks, capabilities, and version compatibility info.
- **An optional description** in markdown, if you write one when you save.

Bundles travel through ordinary channels — email attachments, Slack uploads, shared drives, the Sample Data dialog's [Demo Snapshots tab](./data-loader.md#help-data-loader-import-demo-snapshots). When someone loads your snapshot, the analysis card flips into a read-only **snapshot view** with a banner identifying where the snapshot came from and an Exit button to return to live mode.

> **Snapshots are not the same as workspace saves.** A workspace save preserves your data blocks and the graph; opening it later lets you re-run any analysis from scratch. A snapshot captures one specific *result* — the chart, the table, the topics — and is much smaller. Use workspace saves to preserve work in progress; use snapshots to share a finished view.

<h2 id="help-snapshots-save">Save a snapshot</h2>

![Save snapshot dialog](tutorials/assets/snapshots/save_dialog_standard.png)

After running an analysis, click the **Save snapshot** button (camera icon) in the tool header.

1. **Filename.** Pre-populated with your selected data block names and today's date. Edit if you want. The tool prefix (e.g. `concordance-`, `token_frequencies-`) and the `.ldaca-snapshot` extension are added automatically — you don't need to type them.
2. **Description (optional).** A free-text field for context: what dataset, why this view matters, any caveats. Renders as markdown in the viewer's Description panel.
3. **Save.** Writes the bundle to your local snapshots folder (the same folder that backs the Open snapshot dialog).

The Save button is grey when:

- The analysis hasn't finished running yet.
- Any selected data block exceeds the per-block row cap (2 000 rows for most tools; 200 000 captured rows for Trends — see [Trends snapshots: capture configuration](#help-snapshots-trends) for why this differs).
- You're currently viewing a loaded snapshot (snapshots can't be re-saved; exit the snapshot view first).

Hover the disabled button to see the exact reason.

<h2 id="help-snapshots-open">Open a snapshot</h2>

![Open snapshot dialog](tutorials/assets/snapshots/load_dialog.png)

Click **Open snapshot** (folder-plus icon) in the tool header. The dialog lists every snapshot in your local folder for **this tool** — concordance snapshots show in Concordance only, token-frequency snapshots in Token Frequency only, and so on.

Each row shows the snapshot's filename, captured-at date, source data blocks, and a short summary derived from the manifest (number of topics, row count, chart type, etc.). Click the row to load. Click the trash icon to delete a snapshot from your local folder (the bundle file is removed; nothing on PyPI / GitHub is touched).

Loaded snapshots open with a coloured banner across the top of the analysis card:

![Snapshot view banner](tutorials/assets/snapshots/snapshot_banner.png)

The banner shows the snapshot filename, when it was captured, and an **Exit** button that returns the card to live mode.

<h2 id="help-snapshots-read-only">What's read-only in snapshot view?</h2>

The captured analysis is read-only in snapshot mode. Buttons that would mutate the captured state (Run, Clear Results, Process All, Add to Workspace, Tokenise, parameter inputs that need a backend re-run) are disabled with a tooltip explaining the lock — hover any greyed control to see *"Disabled in snapshot view — exit demo mode to use this control."*

**Frontend-only controls stay live**, because they project the captured rows in different ways without touching the underlying data. Across all five tools you'll find:

- Chart type / axis toggles
- Display caps (cloud size, list size)
- Sort buttons
- Min-group-size filters
- Legend visibility toggles
- Download chart / export visible rows

Tool-specific frontend-only controls:

- **Trends:** frequency dropdown (coarser-or-equal to the captured bin), group-by columns (subset of captured), case-sensitive toggle — see [Trends: client-side re-aggregation](#help-snapshots-trends-reagg) below.
- **Token Frequency:** stop-words filter, sort, cloud/list display limits.
- **Topic Modelling:** Words per topic slider (up to `max(50, fit_value × 2)`), stopword filter, view stopwords list.

<h2 id="help-snapshots-trends">Trends snapshots: capture configuration</h2>

![Trends snapshot configuration dialog](tutorials/assets/snapshots/trends_capture_dialog.png)

Trends snapshots are **data-rich captures** — they save more granular detail than what's currently on screen, so the viewer can re-aggregate locally. When you click Save in Trends, you get a custom dialog instead of the standard one:

- **Finest time bin** — the smallest unit the snapshot captures (down to per-second for datetime data; the bin width for numeric data). Coarser bins mean smaller bundles; the viewer can never re-aggregate finer than what you save here.
- **Group-by columns** (up to 3) — categorical / text columns the viewer can group on. Each ticked column shows its real cardinality (number of distinct values) next to its name, so you can see at a glance whether ticking it will explode the row count.
- **Numeric bin origin/step** — for numeric x-axes, the captured bin alignment. Defaults to origin=0, step=1; override to match your chart.
- **Estimated rows** — a live count of how many rows the bundle will contain, derived from the time span × bin count × group cardinalities. Updates as you tick / untick columns.

The estimated count is colour-coded:

- **Black** — under 100 000 rows. Comfortable.
- **Amber** — between 100 000 and 200 000. Large but still snappy.
- **Red** — over 200 000. The hard cap. You can't save until the estimate drops below the cap.

When the estimate creeps past half the cap, a **Verify actual row count** button appears. Click it to run a fast backend dry-run that returns the exact number — useful when the estimator over-counts for skewed data distributions.

<h2 id="help-snapshots-trends-reagg">Trends: client-side re-aggregation</h2>

![Trends snapshot frequency dropdown showing only coarser options](tutorials/assets/snapshots/trends_reagg_dropdown.png)

Trends is the only tool where the parameter panel stays interactive in snapshot view. Because the snapshot captured rows at the finest bin (and at all group dimensions), the viewer can:

- **Coarsen the time axis** — pick any frequency coarser-or-equal to the captured bin. A daily-captured snapshot can be viewed at daily, weekly, monthly, quarterly, or yearly granularity; a per-second-captured snapshot can also be viewed at minute / hourly / daily / …; but you can never go *finer* than what was captured. Finer options are greyed out.
- **Drop group dimensions** — uncheck any of the captured group-by columns. The viewer collapses the merged groups into a single series. You can't add new groups, only remove or keep the captured ones.
- **Toggle case-sensitivity** — merges legend values that differ only by case (e.g. "Alice" and "alice" become one series). Captured snapshots are always case-sensitive at save time so this toggle is reversible.

All of this happens locally without a backend round-trip — re-aggregation is instant, even on 200 000-row bundles. The chart, legend, summary stats, and min-group-size filter all update together.

<h2 id="help-snapshots-import">Import demo snapshots from the sample data catalogue</h2>

The LDaCA sample data catalogue includes a small collection of pre-made demo snapshots showcasing each tool. Open the [Sample Data dialog](./data-loader.md#help-data-loader-import-sample-button) and pick the **Demo Snapshots** tab to browse and download them.

See [Data Loader → Import demo snapshots](./data-loader.md#help-data-loader-import-demo-snapshots) for the full walkthrough.

<h2 id="help-snapshots-troubleshooting">Troubleshooting</h2>

| Symptom | Likely cause |
| --- | --- |
| Save button is grey | Hover it for the reason. Common: analysis hasn't finished; selected block is too large; you're already in snapshot view. |
| Open dialog is empty | No snapshots in the local folder for this tool. Either you haven't saved any, or your snapshots live in a different folder — check the Working Directory setting. |
| "Capture produced N rows; cap is 200 000" error on Trends save | The actual row count exceeded the estimate. Try a coarser bin or fewer group columns. |
| Snapshot won't load — "Incompatible version" | The snapshot was captured with a newer Wordflow than the one you're running. Upgrade Wordflow to match. |
| Snapshot loads but the chart looks wrong | Try clicking **Exit**, then re-opening. Stale state from the previous live analysis can occasionally leak into snapshot view; the round-trip flushes it. |

<h2 id="help-snapshots-defaults">Quick-reference defaults</h2>

| Field | Default | Notes |
| --- | --- | --- |
| Filename | `<tool-prefix>-<data-block-names>-<YYYY-MM-DD>` | You can override before saving. |
| Per-block row cap | 2 000 rows | Most tools. Snapshots aim to be small + shareable. |
| Trends captured row cap | 200 000 rows | Trends viewers re-aggregate locally so the bundle needs the underlying detail. |
| Trends finest bin | Matches the live tool's current frequency | Override in the capture dialog. |
| Trends group-by | Pre-populated from the live form | Override in the capture dialog (max 3 columns). |
| Case-sensitivity at capture | Always `true` | The viewer's case-fold toggle merges client-side without losing original casings. |
| Captured snapshots folder | App's user data dir | Specific path varies by platform; the dialog opens the folder for you. |
