# Prototype Instructions

## Project direction

- Build an ethics audit workspace around transaction review, pattern review, and data upload. Anomaly context, evidence comparison, and tampering signals belong in one transaction detail view.
- Latest selected reference: a dramatic dark command center with a large circular 3D platform, architectural department blocks, a precise analytics wall, and metallic gold lighting on a black/graphite base. The latest palette request is gold and black; it supersedes the earlier SK red/orange palette and light dashboard direction.
- Keep the central 3D stage background plain black/graphite with no people or TEAM 007 / GOLDFINGER image. The latest request removes the character backdrop and supersedes the earlier image direction.
- Render the central space as real interactive WebGL geometry. Do not flatten the model or operational interface into a generated background image. Keep charts, Korean labels, tables, and controls crisp and functional.
- Use champagne/brass highlights and warm neutral typography. Latest feedback explicitly makes buildings with anomaly signals red; this supersedes the earlier all-gold risk palette. Zero-signal buildings stay gray and the selected building's base ring stays gold. Use red sparingly for signal counts and priority labels elsewhere.
- The latest 3D map is a matrix: X = scenario, Y/depth = departments ranked by matching signal counts (maximum eight), Z/height = matching transaction count. Zero cells stay low and neutral; positive bars are red and selection outlines gold. Use the same examples and date/category filters for matrix cells and review lists. The current dataset has six departments; do not invent two more to fill eight.
- Audit modules belong in a separate top-level `감사 도구` tab. Do not place audit-tool cards, docks, or module tabs underneath the 3D dashboard.
- Department selection updates dashboard data and its inspector. Preserve the selected department when switching to audit tools and back.
- Main-screen layout: natural-language condition input and a role-specific next action above the three columns, audit scope on the left, the interactive 3D matrix in the center, four selectable audit categories on the right, and the review list underneath. Keep evidence explanations in the unified transaction inspector.
- Audit categories are regulation signals, evidence comparison, suspected tampering, and new patterns. Selecting a category filters the 3D counts/heights and the review list; selecting a department narrows the category counts and list. Provide a clear return to all departments and all types.
- Distinguish full synthetic source totals (2,280 transactions / 29 anomalies) from the smaller displayed transaction examples. Derive category counts, map heights, and review rows from the same examples; a transaction can appear under multiple categories but is counted only once in each list.
- Prioritize desktop web only. Keep the 3D data view integrated with normal UI surfaces, typography, dividers, and coherent spacing; do not spend work on mobile layouts unless requested later.
- Label all sample results as examples. File selection only reads metadata; do not imply parsing, uploading, or real analysis until backend integration exists.
- Header role selector switches between auditor and administrator for the prototype. Both can review transactions; auditors request pattern registration, administrators register or reject patterns with a reason. This is a UI demonstration, not authentication or server-side authorization.
- Transaction detail combines the selected transaction's reason, evidence comparison, and tampering signals. Require a verdict (violation/normal/hold) and a review opinion before saving. Keep detection priority separate from the human verdict; reflect saved verdicts in review lists.
- Store example review and pattern decisions in this browser's localStorage and disclose that scope. Pattern registration changes the prototype decision state; it does not execute detection rules.
- Natural-language requests preview supported period, department, and scenario conditions before explicitly applying them. Unsupported conditions must not silently broaden into all results. Only the provided March 2026 examples are available; no real AI analysis is connected.

Run the local server yourself and open the preview in the browser available to this environment. Do not give the user server-start instructions when you can run it.

Before making substantial visual changes, use the Product Design plugin's `get-context` skill when the visual source is unclear or no longer matches the current goal. When the user gives durable prototype-specific design feedback, preferences, or decisions, record them in `AGENTS.md`.

When implementing from a selected generated mock, treat that image as the source of truth for layout, component anatomy, density, spacing, color, typography, visible content, and hierarchy.

Build app UI in `src/`. Keep `.openai/hosting.json`, `worker/index.js`, `scripts/prepare-sites-build.mjs`, and `tests/sites-worker.test.mjs` intact so the same local prototype can be handed to Sites. Before a Sites handoff, run `npm run build` and `npm run test:sites`; the build must leave `dist/client/index.html`, `dist/server/index.js`, and `dist/.openai/hosting.json`.
