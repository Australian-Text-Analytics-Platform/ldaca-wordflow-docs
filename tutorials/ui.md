<!-- markdownlint-disable MD033 MD041 -->

[← Back to tutorial index](./index.md)

<h1 id="help-ui-overview">User Interface Overview</h1>

The LDaCA app interface is organised into three columns containing eight main sections. This page describes each section and how they work together.

![LDaCA main app](tutorials/assets/ldaca_main.png)

<h2 id="help-ui-tool-choice">1. Tool Choice</h2>

The left sidebar lists the available tool modules. Click a tool name to switch the main area (section 6) to that tool's interface. The available tools include:

- [**Data Loader**](./data-loader.md) — create or load workspaces and upload data files.
- [**Preprocessing**](./preprocessing.md) — filter, sample, join, stack, find, and create columns.
- [**Token Frequency**](./token-frequency.md) — count and explore the most common terms.
- [**Concordance**](./concordance.md) — inspect search terms in their surrounding context.
- [**Trends and Sequence**](./sequential-analysis.md) — count documents over time or any ordered numeric axis.
- [**Topic Modelling**](./topic-modeling.md) — discover themes using BERTopic.
- [**Quotation Extraction**](./quotation.md) — capture quoted speech with speaker and verb annotations.

The edit icon next to the heading lets you customise which tools appear and also allows you to reset the [**hint system**](#help-ui-hint-system).

<h2 id="help-ui-data-selection">2. Data Selection</h2>

Below the tool list, the **Data Blocks** panel shows every data block in the active workspace. It is both a quick selector and a live indicator of what is selected in the [Workspace Graph View](#help-ui-workspace-graph-view) (section 4) — selecting a block here is equivalent to clicking the corresponding node in the graph, and the two panels always stay in sync. It is especially useful when the right column is hidden.

- The total count and the number of currently selected data blocks are shown at the top.
- Click a data block to toggle its selection. Click again to deselect it. For tools that require more than one data block (e.g. Join or Stack), simply click each block in turn to build up a multi-selection.
- A filled circular checkbox indicates a selected data block; an empty circle indicates an unselected one.
- The list is sorted so that selected blocks always appear at the top, ordered by most recently selected first. Unselected blocks follow in alphabetical order.
- Selected data blocks automatically populate the tool interface (section 6) and the Data Viewer (section 5).
- Most tools can only process a limited number of data blocks at a time; by default these are the most recently selected ones.

<h2 id="help-ui-task-centre">3. Task Centre</h2>

The **Tasks** panel sits below data selection and tracks time-consuming background operations such as topic modelling or large data transformations.

- While a task is running, a progress bar and status message appear. Click **Stop** to cancel it.
- **Successful tasks fade out automatically** after roughly 8 seconds and are removed from the list without any action needed.
- **Failed or stopped tasks remain** on screen until you dismiss them manually — click **Clear** on the individual task card to remove it.
- **Live updates** keeps the panel refreshed automatically so you can continue working while tasks run in the background.

<h2 id="help-ui-workspace-graph-view">4. Workspace Graph View</h2>

**Note:** The entire right column (Workspace Graph View and Data Viewer) can be collapsed to save screen space. Click the top-right arrow button to hide or show the right pane.

The **Workspace Graph View** occupies the top-right area and visualises how data blocks relate to each other. Every data block is a node and every derivation (filter, join, sample, etc.) draws an edge from parent to child.

- Click a node to select that data block across the entire interface. Click it again to deselect. Selections made here are reflected immediately in the Data Blocks panel (section 2) and vice versa.
- Use **Rename** to rename the active workspace.
- Use **Delete (n)** to batch-remove all currently multi-selected nodes in one call. (Replaces the previous *Save* button, which is now redundant — workspaces autosave on every change.)
- Pan and zoom the graph with your mouse to navigate large workspaces. A control panel sits at the top-right corner of the graph with the following buttons:
  - <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="13" height="13" style="display:inline;vertical-align:text-bottom"><path d="M32 18.133H18.133V32h-4.266V18.133H0v-4.266h13.867V0h4.266v13.867H32z"/></svg> **Zoom in** — increases the zoom level.
  - <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 5" width="13" height="2" style="display:inline;vertical-align:middle"><path d="M0 0h32v4.2H0z"/></svg> **Zoom out** — decreases the zoom level.
  - <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 30" width="13" height="12" style="display:inline;vertical-align:text-bottom"><path d="M3.692 4.63c0-.53.4-.938.939-.938h5.215V0H4.631A4.63 4.63 0 0 0 0 4.63v5.216h3.692V4.631zM27.354 0h-5.2v3.692h5.215c.53 0 .938.4.938.939v5.215H32V4.631A4.63 4.63 0 0 0 27.354 0zm.954 24.746c0 .53-.4.938-.939.938h-5.215V29.338h5.215A4.63 4.63 0 0 0 32 24.708v-5.215h-3.692v5.253zm-23.677.938a.939.939 0 0 1-.939-.938v-5.253H0v5.215A4.63 4.63 0 0 0 4.631 30h5.215v-3.692H4.631v.376z"/></svg> **Zoom to fit** — resets the view so all nodes are visible at once.
  - <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 25 32" width="10" height="13" style="display:inline;vertical-align:text-bottom"><path d="M21.333 10.667H19.81V7.619C19.81 3.429 16.38 0 12.19 0 8 0 4.571 3.429 4.571 7.619v3.048H3.048A3.048 3.048 0 0 0 0 13.714v15.238A3.048 3.048 0 0 0 3.048 32h18.285a3.048 3.048 0 0 0 3.048-3.048V13.714a3.048 3.048 0 0 0-3.048-3.047zM12.19 24.533a3.048 3.048 0 1 1 0-6.095 3.048 3.048 0 0 1 0 6.095zm4.724-13.866H7.467V7.619a4.723 4.723 0 0 1 9.447 0v3.048z"/></svg> **Lock** — toggles whether nodes can be dragged. When locked, node positions are fixed; panning and zooming still work.
  - **□ / ▣ Overview** — toggles a minimap in the bottom-right corner of the graph, giving a bird's-eye view of the full workspace layout. Click again to hide it.
  - **⊘ Clear selection** — deselects all currently selected data blocks at once. Greyed out when nothing is selected.
- Asterisked nodes indicate the currently selected data blocks.
- **Multiple roots** in the same workspace (e.g. two unrelated imports) are now left-aligned uniformly via a virtual super-source rather than stair-cased. This makes side-by-side projects easier to compare visually.

<h3 id="help-ui-workspace-node-colours">Node colours, focus, and the new-node outline</h3>

<!-- TODO(screenshot): Workspace graph showing two derivation chains with assigned X/Y shade pairs; include at least one Active node (currently in an analysis tab), one Focus node (selected but not active), and one Unselected node. Save as tutorials/assets/ui/node_colours_states.png -->
![Node colour states (Active / Focus / Unselected)](tutorials/assets/ui/node_colours_states.png)

Every node on the workspace graph carries an X/Y shade pair drawn from a 12-colour palette. The colour is **per workspace** and persisted in a small `ui_state.json` sidecar so it survives reloads, workspace switches, and shared workspace ZIPs.

Three visual states tell you at a glance how a node relates to the analysis you're running:

| State | What it means | How it looks |
|---|---|---|
| Active | Currently being analysed in the right-hand tool | Full saturation; node name in solid colour |
| Focus | Selected via click / multi-select but not the active analysis input | Mid-saturation fill |
| Unselected | Not currently part of any selection | Greyed body; if a colour has been assigned, the **name text** keeps a tint so the assignment is still visible |

<!-- TODO(screenshot): Per-tab colour picker panel above an analysis tab, with a temp pick highlighted (showing preview before Run promotes it). Save as tutorials/assets/ui/colour_picker_preview.png -->
![Per-tab colour picker with preview state](tutorials/assets/ui/colour_picker_preview.png)

- **Manual picks** via the per-tab colour picker preview *before* you click **Run** — committed only when the analysis actually starts on that node. This lets you experiment without polluting the persisted colour map.
- The colour assignment is **global within the workspace**: a node always renders in the same colour everywhere — graph, sidebar, analysis tabs, Juxtorpus, dispersion legend, statistics-table captions, etc.

<!-- TODO(screenshot): A graph view immediately after a Detach / Join / Stack action, with the freshly-created node carrying the 3-px black outer outline. Save as tutorials/assets/ui/new_node_outline.png -->
![Newly-created node with a 3-px black outline](tutorials/assets/ui/new_node_outline.png)

- **Newly-created nodes** (from *Detach*, *Clone*, *Join*, *Stack*, *Tokenise*) get a 3-px black outer outline until you first interact with them. That makes a fresh derivation easy to spot amid many similar grey blocks. The outline clears the first time you click or select the node.

<h3 id="help-ui-workspace-node-actions">Node actions (right-click menu)</h3>

<!-- TODO(screenshot): right-click context menu on a workspace graph node, with Tokenise and "Manage derived columns" entries visible. Save as tutorials/assets/ui/node_context_menu.png -->
![Right-click context menu on a graph node](tutorials/assets/ui/node_context_menu.png)

Right-click any node to open its action menu. In addition to the standard *Select*, *Rename*, *Delete* entries, two v0.4 actions appear on data-bearing nodes:

- **Tokenise** — opens the [Tokenise dialog](#help-ui-workspace-tokenise) below.
- **Manage derived columns** — opens a per-node dialog listing every derivation registered on that node (e.g. one row per `__derived__.tokens` column added by Tokenise), with the source column, tokeniser model, and a delete control for each. The dialog reactively reflects deletions without a reopen.

<h3 id="help-ui-workspace-tokenise">Tokenise action</h3>

<!-- TODO(screenshot): Tokenise dialog at default state — Source column dropdown, Language dropdown (showing Japanese selected), Dictionary dropdown (showing IPADIC + UniDic), Tokenizer model input populated with lindera-ja-ipadic, and the first-use download hint. Save as tutorials/assets/ui/tokenise_dialog.png -->
![Tokenise dialog with Japanese + dictionary picker](tutorials/assets/ui/tokenise_dialog.png)

The **Tokenise** action adds a hidden `__derived__.tokens` column on the node so Concordance (tokens-mode) and Token Frequency can share a single segmentation. The operation is **idempotent** on `(source column, model)` — re-running with the same model replaces the previous derived column rather than stacking copies.

The dialog has four fields:

1. **Source column** — which text column to tokenise. Only string-typed columns are listed.
2. **Language** — pre-populated from the node's stored language (set at import time, see [Data Loader → Language tag](./data-loader.md#help-data-loader-language)). Change it here if you need to override.
3. **Dictionary** *(Japanese only at present)* — pick **IPADIC** (~15 MB, recommended general purpose) or **UniDic** (~50 MB, higher morphological accuracy). The chosen dict's model ID populates the model field.
4. **Tokenizer model** — defaults to the recommended model for the chosen language. Accepts HuggingFace model IDs, the special `jieba` backend, or any of `lindera-ja-ipadic`, `lindera-ja-unidic`, `lindera-ko-dic`. **First-use note:** Lindera dicts are downloaded into the local cache (~15 MB for IPADIC, ~50 MB for UniDic, ~34 MB for ko-dic) the first time they're requested.

**What happens after tokenise**

- A new derivation appears in the node's *Manage derived columns* dialog and the Concordance / Token Frequency tabs auto-pick it when the source column is selected.
- Tokens are persisted in a per-user content-addressed cache so re-tokenising the same `(text, tokeniser, model)` finishes in a fraction of the first-run time, even after a backend restart. The cache is swept on workspace / node / derived-column delete and at backend startup, so it never leaks orphans.
- The `__derived__.tokens` column is **hidden from the Data Viewer, detach dialogs, Row Details, and exported files** — manage it via *Manage derived columns*. The derivation propagates correctly across `clone`, `filter`, `slice`, `concat`, `join`, and Polars-expression operations.

<h2 id="help-ui-data-viewer">5. Data Viewer</h2>

The **Data Viewer** fills the bottom-right area and displays the contents of selected data blocks in a tabular format.

- Tabs along the top let you switch between multiple selected data blocks.
- The **Data View** sub-tab shows the raw table; the **Rename** button lets you rename the data block.
- **Undo** and **Redo** buttons revert or reapply the most recent in-place operation (e.g. rename a column, change a data type, create or delete a column).
- Each column header shows the column name and its data type (e.g. `datetime`, `string`). Click the settings icon on a column to rename it or change its data type (if feasible) — for example, to convert a date column loaded as string to a `datetime` type. When converting, the app attempts to guess the date format automatically. This works for many common formats but can fail or produce incorrect results when the format is ambiguous (e.g. `01/02/03` could be read as DD/MM/YY, MM/DD/YY, or YY/MM/DD). If the conversion fails or the dates look wrong, use the **Format** field to specify the format explicitly using [Python strftime/strptime codes](https://docs.python.org/3/library/datetime.html#strftime-and-strptime-format-codes). Common examples:
  - `%Y-%m-%d` → `2025-05-06`
  - `%d/%m/%Y` → `06/05/2025`
  - `%m/%d/%Y` → `05/06/2025`
  - `%Y-%m-%dT%H:%M:%S` → `2025-05-06T14:30:00` (ISO 8601)
  - `%d %b %Y` → `06 May 2025`
  - `%B %d, %Y` → `May 06, 2025`
- Click any row to open the **Row Details** panel, which displays the full contents of that row in a readable layout. The <a href="tutorials/assets/ui/row_details.png" target="_blank">row details</a> panel has two sections:
  - **Document** — shows the full text of the data block's designated document column (the column marked as the primary text when the data was loaded, e.g. the column named `text`, `document`, or `doc`). The section heading displays the column name, e.g. *Document: text*. If no document column has been configured for the data block, this section is omitted.
  - **Metadata** — shows all remaining columns as a two-column key/value table, making it easy to inspect structured fields such as speaker, date, or source alongside the document text.
- The table is paginated — use the controls at the bottom to navigate through large data blocks.
- Scroll vertically with your mouse scroll wheel. Hold **Shift** to scroll horizontally.

<h2 id="help-ui-tool-interface">6. Tool Interface</h2>

The centre column is the main working area and shows the interface of whichever tool is selected in section 1. Each tool provides its own configuration options, previews, and action buttons.

- The tool name and a short description appear at the top.
- Sub-tabs (e.g. Filter, Sample, Join, Stack, Find, Create in Preprocessing) let you switch between related operations within the same tool.
- Most tools follow a common workflow: configure parameters → review a preview → click an action button (such as **Add to Workspace**) to produce a new data block.
- Help icons (**?**) are placed next to individual controls and link directly to the relevant section of the tutorial.

<h2 id="help-ui-working-directory">7. Working Directory</h2>

The **Working Directory** indicator at the bottom of the left sidebar shows the local file-system path where workspace data is stored.

- Click the edit icon to change the directory.
- All workspaces, uploaded files, and exported outputs are stored under this path.
- The default location is `~/Documents/ldaca`. This applies when running the app locally — via self-hosting, the Tauri desktop app, or UVX.
- This section is not available in multi-user mode, where storage is managed server-side.

<h2 id="help-ui-help-feedback">8. Help and Feedback</h2>

The **Tutorial** and **Feedback** buttons at the very bottom of the left sidebar provide quick access to assistance.

- **Tutorial** opens the built-in tutorial in a floating window (the one you are currently reading). Clicking any **?** help icon in the interface scrolls the tutorial to the relevant section.
- **Feedback** opens a form where you can report bugs, request features, or ask questions. Your feedback goes directly to the developer team. Please do not include any confidential information.
<span id="help-ui-hint-system"></span>
- The app includes a **hint system** that displays contextual coach-mark bubbles near relevant UI elements to guide you through key steps (e.g. uploading a file, creating a workspace, selecting a column). Hints appear automatically when their triggering condition is met and are accompanied by a glowing highlight ring around the relevant element. Each hint offers two dismissal options:
  - **Got it** / **Dismiss** — hides the hint for the current session only; it will reappear after a page reload if the condition is still met.
  - **Don't show again** — permanently dismisses the hint until you manually reset it.
- To bring back dismissed hints, click the **edit icon** (pencil) next to the **Views** heading in the left sidebar to open the view settings menu, then choose **Reset all hints** at the bottom of that menu. This restores all permanently and session-dismissed hints so they can appear again.

[← Back to tutorial index](./index.md)
