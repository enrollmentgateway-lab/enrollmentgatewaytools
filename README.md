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
- `pipeline-overview/`, `teaching-site-overview/`, `event-tracker/`, and `funnel-overview/` — GitHub-hosted dashboard interfaces.
- `assets/dashboard.css` and `assets/dashboard-common.js` — shared dashboard presentation, iframe bridge, and academic-period definitions.
- `slate-templates/*-wrapper.liquid.html` — thin Slate templates that serialize query results and host the corresponding dashboard iframe.

## Deployment model

GitHub Pages hosts the front-end pages. Slate retains the queries and renders their results into a small wrapper, which sends the data to the relevant page using `window.postMessage`. This keeps UI code deployable from this repository while each Slate portal controls its own query.

The original full Liquid dashboards remain in `slate-templates/` as rollback copies. Use the files ending in `-wrapper.liquid.html` for the iframe-based portals. Normal HTML, CSS, labels, charts, and client-side behavior can be changed in this repository without repasting a Slate template. Repaste a wrapper only when its query/export names, exported fields, URL parameters, iframe URL, or message contract changes.

## Wrapper rollout

Publish and verify one wrapper at a time in this order:

1. `pipeline-overview-wrapper.liquid.html`
2. `teaching-site-overview-wrapper.liquid.html`
3. `event-tracker-wrapper.liquid.html`
4. `funnel-overview-wrapper.liquid.html`

Before publishing the Pipeline and Teaching Sites wrappers, configure their Slate query exports to accept optional `term` and `year` URL parameters:

- `pipeline_persons` must apply `status`, `term`, and `year`. `total_apps`, `total_inquiries`, and `total_prospects` must apply the same optional `term` and `year` filters so percentages use the correct denominator.
- `teaching_sites_persons` must apply `status`, `term`, and `year`. `total_apps`, `total_inq`, and `total_prospects` must apply the same optional `term` and `year` filters.

The hosted dropdown sends combinations such as `?status=applicant&term=Fall&year=2026-2027`. Choosing **Total (All Time)** removes `term` and `year`. Status and period changes preserve one another.

Do not rename the query exports or their fields without making the matching change in the relevant wrapper. The iframe pages intentionally accept data only from `https://enroll.gs.edu`, and the wrappers intentionally accept messages only from the configured GitHub Pages origin.

## Queryomatic

The former standalone Queryomatic repository was imported under `queryomatic/`. The Cloudflare Worker remains a separate deployment; use `queryomatic/README.md` for its Worker secrets and setup instructions. Update its worker `ALLOWED_ORIGIN` to permit the consolidated Pages origin and the `/enrollmentgatewaytools` site.
