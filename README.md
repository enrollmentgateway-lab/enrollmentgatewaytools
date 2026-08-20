# Enrollment Gateway Tools

This repository is the single source of truth for the Enrollment Intelligence Hub and its associated tools.

## Structure

- `index.html` — hub published at the GitHub Pages root.
- `queryomatic/` — Queryomatic frontend, Worker configuration, options reference, and setup notes. Its GitHub Pages entry point is `/queryomatic/`.
- `slate-templates/wrappers/` — the small wrapper files you paste into Slate.
- `slate-templates/full-page-backups/` — the old self-contained Liquid dashboards, retained only for rollback/reference.
- `iframe-bridge-test/` — working proof of concept for Slate query data sent to a GitHub-hosted iframe with automatic height resizing.
- `student-lookup/` — GitHub-hosted student search/profile interface.
- `slate-templates/wrappers/student-lookup-wrapper.liquid.html` — the Slate query wrapper for the Student Lookup portal.
- `pipeline-overview/`, `teaching-site-overview/`, `event-tracker/`, and `funnel-overview/` — GitHub-hosted dashboard interfaces.
- `assets/dashboard.css` and `assets/dashboard-common.js` — shared dashboard presentation, iframe bridge, and academic-period definitions.
- `slate-templates/wrappers/*-wrapper.liquid.html` — thin Slate templates that serialize query results and host the corresponding dashboard iframe.

## Deployment model

GitHub Pages hosts the front-end pages. Slate retains the queries and renders their results into a small wrapper, which sends the data to the relevant page using `window.postMessage`. This keeps UI code deployable from this repository while each Slate portal controls its own query.

The original full Liquid dashboards remain in `slate-templates/full-page-backups/` as rollback copies. Use the files in `slate-templates/wrappers/` for the iframe-based portals. Normal HTML, CSS, labels, charts, and client-side behavior can be changed in this repository without repasting a Slate template. Repaste a wrapper only when its query/export names, exported fields, URL parameters, iframe URL, or message contract changes.

## Wrapper rollout

Publish and verify one wrapper at a time in this order:

1. `slate-templates/wrappers/pipeline-overview-wrapper.liquid.html`
2. `slate-templates/wrappers/teaching-site-overview-wrapper.liquid.html`
3. `slate-templates/wrappers/event-tracker-wrapper.liquid.html`
4. `slate-templates/wrappers/funnel-overview-wrapper.liquid.html`

Before publishing the Pipeline and Teaching Sites wrappers, configure their primary Slate query exports to accept `status`, `term`, and `year` URL parameters:

- `pipeline_persons` must apply `status`, `term`, and `year`.
- `teaching_sites_persons` must apply `status`, `term`, and `year`.

The `total_apps`, `total_inquiries` / `total_inq`, `total_prospects`, and `total_students` exports are fixed comparison populations used as percentage denominators. Do not apply the `term` or `year` URL parameters to those total exports.

Both status dropdowns support `applicant`, `inquiry`, `prospect`, and `student`. Configure the Slate status filter so `?status=student` returns the intended student population.

The hosted dropdown sends combinations such as `?status=applicant&term=Fall&year=2026-2027`. Choosing **Total (All Time)** removes `term` and `year`. Status and period changes preserve one another.

Do not rename the query exports or their fields without making the matching change in the relevant wrapper. The iframe pages intentionally accept data only from `https://enroll.gs.edu`, and the wrappers intentionally accept messages only from the configured GitHub Pages origin.

## Queryomatic

The former standalone Queryomatic repository was imported under `queryomatic/`. The Cloudflare Worker remains a separate deployment; use `queryomatic/README.md` for its Worker secrets and setup instructions. Update its worker `ALLOWED_ORIGIN` to permit the consolidated Pages origin and the `/enrollmentgatewaytools` site.
