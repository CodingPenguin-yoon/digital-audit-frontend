# Prototype Instructions

## Project direction

- Build an ethics audit workspace with five functional menu cards: upload, anomaly detection, pattern discovery, evidence comparison, and tampering analysis.
- The user selected the 3D interaction direction inspired by https://press.stripe.com/: staggered fan entrance, pointer tilt, and a selected card moving forward before revealing its feature.
- Use a dark editorial workspace with material-rich cards, then light, readable feature panels. On mobile, show a horizontally scrollable card deck.
- Label all sample results as examples. File selection only reads metadata; do not imply parsing, uploading, or real analysis until backend integration exists.

Run the local server yourself and open the preview in the browser available to this environment. Do not give the user server-start instructions when you can run it.

Before making substantial visual changes, use the Product Design plugin's `get-context` skill when the visual source is unclear or no longer matches the current goal. When the user gives durable prototype-specific design feedback, preferences, or decisions, record them in `AGENTS.md`.

When implementing from a selected generated mock, treat that image as the source of truth for layout, component anatomy, density, spacing, color, typography, visible content, and hierarchy.

Build app UI in `src/`. Keep `.openai/hosting.json`, `worker/index.js`, `scripts/prepare-sites-build.mjs`, and `tests/sites-worker.test.mjs` intact so the same local prototype can be handed to Sites. Before a Sites handoff, run `npm run build` and `npm run test:sites`; the build must leave `dist/client/index.html`, `dist/server/index.js`, and `dist/.openai/hosting.json`.
