# Prototype Instructions

## Project direction

- Build an ethics audit workspace with five functional modules: upload, anomaly detection, pattern discovery, evidence comparison, and tampering analysis.
- Latest selected reference: a dramatic dark command center with a large circular 3D platform, architectural department blocks, a precise analytics wall, and SK red/orange signal lighting. This explicitly supersedes the previous light dashboard direction.
- Render the central space as real interactive WebGL geometry. Do not flatten the model or operational interface into a generated background image. Keep charts, Korean labels, tables, and controls crisp and functional.
- Departments with zero anomalies stay low and neutral; anomaly blocks extend upward in proportion to their counts. Use lighting and subtle data particles to emphasize risk without decorative trees or miniature scenery.
- Audit modules belong in a separate top-level `감사 도구` tab. Do not place audit-tool cards, docks, or module tabs underneath the 3D dashboard.
- Department selection updates dashboard data and its inspector. Preserve the selected department when switching to audit tools and back.
- Prioritize desktop web only. Keep the 3D data view integrated with normal UI surfaces, typography, dividers, and coherent spacing; do not spend work on mobile layouts unless requested later.
- Label all sample results as examples. File selection only reads metadata; do not imply parsing, uploading, or real analysis until backend integration exists.

Run the local server yourself and open the preview in the browser available to this environment. Do not give the user server-start instructions when you can run it.

Before making substantial visual changes, use the Product Design plugin's `get-context` skill when the visual source is unclear or no longer matches the current goal. When the user gives durable prototype-specific design feedback, preferences, or decisions, record them in `AGENTS.md`.

When implementing from a selected generated mock, treat that image as the source of truth for layout, component anatomy, density, spacing, color, typography, visible content, and hierarchy.

Build app UI in `src/`. Keep `.openai/hosting.json`, `worker/index.js`, `scripts/prepare-sites-build.mjs`, and `tests/sites-worker.test.mjs` intact so the same local prototype can be handed to Sites. Before a Sites handoff, run `npm run build` and `npm run test:sites`; the build must leave `dist/client/index.html`, `dist/server/index.js`, and `dist/.openai/hosting.json`.
