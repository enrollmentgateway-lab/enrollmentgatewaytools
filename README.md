# Enrollment Gateway Tools

This repository is the single source of truth for the Enrollment Intelligence Hub and its associated tools.

## Structure

- `index.html` — hub published at the GitHub Pages root.
- `queryomatic/` — Queryomatic frontend, Worker configuration, options reference, and setup notes. Its GitHub Pages entry point is `/queryomatic/`.
- `slate-templates/` — version-controlled copies of the current Slate/Liquid dashboard templates:
  - `funnel-overview.liquid.html`
  - `pipeline-overview.liquid.html`
  - `event-tracker.liquid.html`
  - `teaching-site-overview.liquid.html`
- `iframe-bridge-test/` — working proof of concept for Slate query data sent to a GitHub-hosted iframe with automatic height resizing.
- `student-lookup/` — GitHub-hosted student search/profile interface.
- `slate-templates/student-lookup-wrapper.liquid.html` — the Slate query wrapper for the Student Lookup portal.

## Deployment model

GitHub Pages hosts the front-end pages. Slate retains the queries and renders their results into a small wrapper, which sends the data to the relevant page using `window.postMessage`. This keeps UI code deployable from this repository while each Slate portal controls its own query.

## Queryomatic

The former standalone Queryomatic repository was imported under `queryomatic/`. The Cloudflare Worker remains a separate deployment; use `queryomatic/README.md` for its Worker secrets and setup instructions. Update its worker `ALLOWED_ORIGIN` to permit the consolidated Pages origin and the `/enrollmentgatewaytools` site.
