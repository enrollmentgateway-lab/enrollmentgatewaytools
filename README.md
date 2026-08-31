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
- `regional-campus/` — GitHub-hosted campus funnel, record drilldown, lookup, and individual record dashboard.
- `slate-templates/wrappers/regional-campus-wrapper.liquid.html` — the Slate query wrapper for the Regional Campus portal.
- `pipeline-overview/`, `teaching-site-overview/`, `event-tracker/`, and `funnel-overview/` — GitHub-hosted dashboard interfaces.
- `assets/dashboard.css` and `assets/dashboard-common.js` — shared dashboard presentation, iframe bridge, and academic-period definitions.
- `slate-templates/wrappers/*-wrapper.liquid.html` — thin Slate templates that serialize query results and host the corresponding dashboard iframe.
- `supabase/functions/telegram-codex/` and `.github/workflows/telegram-codex.yml` — optional, allowlisted Telegram-to-Codex automation that proposes changes through pull requests. See `docs/telegram-codex.md` for setup.

## Deployment model

GitHub Pages hosts the front-end pages. Slate retains the queries and renders their results into a small wrapper, which sends the data to the relevant page using `window.postMessage`. This keeps UI code deployable from this repository while each Slate portal controls its own query.

The original full Liquid dashboards remain in `slate-templates/full-page-backups/` as rollback copies. Use the files in `slate-templates/wrappers/` for the iframe-based portals. Normal HTML, CSS, labels, charts, and client-side behavior can be changed in this repository without repasting a Slate template. Repaste a wrapper only when its query/export names, exported fields, URL parameters, iframe URL, or message contract changes.

## Wrapper rollout

Publish and verify one wrapper at a time in this order:

1. `slate-templates/wrappers/pipeline-overview-wrapper.liquid.html`
2. `slate-templates/wrappers/teaching-site-overview-wrapper.liquid.html`
3. `slate-templates/wrappers/event-tracker-wrapper.liquid.html`
4. `slate-templates/wrappers/funnel-overview-wrapper.liquid.html`

Before publishing the Pipeline and Teaching Sites wrappers, configure their primary Slate query exports as follows:

- `pipeline_persons` must apply `status`, `term`, and `year`.
- `teaching_sites_persons` must return all teaching-site records and apply only `term` and `year`. Do not filter this export by `status`; the overview displays total records per site.

The Teaching Sites wrapper also powers the site-specific funnel inside the same tool. It calls the configured JSON service query three times with these `status` values whenever a site detail page loads or its period dropdown changes:

- `inquiry` → Inquiries
- `applicant` → Applicants
- `student` → Students

Configure the service query to apply `status`, `site`, `term`, and `year` and return JSON in the form `{ "row": [...] }`. The `site` parameter must be an exact text match against the same teaching-site title returned as `teaching_sites_persons.title`. The wrapper writes spaces as `%20`; standard query parsing also decodes `+` as a space, so either encoding represents the same site name. No separate `teaching_site_*` Liquid exports are required.

The Pipeline wrapper's `total_apps`, `total_inquiries`, `total_prospects`, and `total_students` exports are fixed comparison populations used as percentage denominators. Do not apply the `term` or `year` URL parameters to those total exports. The Teaching Sites wrapper no longer uses comparison-total exports.

The Regional Campus wrapper does not require a Liquid query export. It reads `campus` key/value rows from Queryomatic's Slate prompt/options service (falling back to the current static campus-prompt values in the wrapper), excludes `Doctor of Ministry`, then queries two configured JSON services for every remaining campus. The general service supplies Applicant and Student rows using `campus`, `term`, and `year`; it must export `first`, `last`, `email`, `phone`, `sisid`, `status`, `app_status`, and `program`. The inquiry-only service accepts `campus` and exports `first`, `last`, `email`, `phone`, and `sisid`; the wrapper assigns `Inquiry` as the status for those rows. Inquiry counts are therefore all-time and do not change with the academic-period selector. The wrapper uses `sisid` to link individual profiles to Slate's record lookup. It tags each returned row with the requested campus, combines the responses, and sends them to the hosted interface. Campus cards are shown only when their current combined record count is at least 20. Choosing a campus limits the next page load to that campus's two service calls.

The Pipeline status dropdown supports `applicant`, `inquiry`, `prospect`, and `student`. Configure its Slate status filter so `?status=student` returns the intended student population.

The Pipeline dropdowns send combinations such as `?status=applicant&term=Fall&year=2026-2027`. The Teaching Sites period dropdown sends `term` and `year` without a status. Choosing **Total (All Time)** removes `term` and `year`.

Do not rename the query exports or their fields without making the matching change in the relevant wrapper. The iframe pages intentionally accept data only from `https://enroll.gs.edu`, and the wrappers intentionally accept messages only from the configured GitHub Pages origin.

## Queryomatic

The former standalone Queryomatic repository was imported under `queryomatic/`. The Cloudflare Worker remains a separate deployment; use `queryomatic/README.md` for its Worker secrets and setup instructions. Update its worker `ALLOWED_ORIGIN` to permit the consolidated Pages origin and the `/enrollmentgatewaytools` site.
