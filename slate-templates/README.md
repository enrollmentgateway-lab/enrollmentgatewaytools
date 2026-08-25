# Slate template folders

## `wrappers/` — paste these into Slate

These are the current production templates. Each file sends Slate query results to its matching GitHub-hosted page:

- `pipeline-overview-wrapper.liquid.html`
- `teaching-site-overview-wrapper.liquid.html`
- `event-tracker-wrapper.liquid.html`
- `funnel-overview-wrapper.liquid.html`
- `student-lookup-wrapper.liquid.html`
- `regional-campus-wrapper.liquid.html`

## `full-page-backups/` — do not paste unless rolling back

These are the previous self-contained dashboard templates. They include the old HTML, CSS, JavaScript, and Liquid in one file and are retained only as backups.

The live hosted HTML is kept in each tool's top-level folder—for example, `pipeline-overview/index.html`. Those locations must not be moved without also updating the iframe URLs in the wrappers.

The Teaching Sites overview and its site-specific funnel share `teaching-site-overview-wrapper.liquid.html`; there is no separate funnel wrapper. The wrapper calls one JSON service query for the `inquiry`, `applicant`, and `student` status values whenever a site detail page loads or its period dropdown changes. See the repository README for its required response shape and URL filters.

The Regional Campus portal loads its teaching-site list from Queryomatic's Slate prompt/options service, with a static wrapper fallback, and calls its JSON records service once per campus with `campus`, `term`, and `year`. No Liquid query export is required. The service must return `first`, `last`, `email`, `phone`, `status`, `app_status`, and `program`; the wrapper supplies the campus and selected period used for each request. The interface labels `app_status` as **Application Status** and filters status drilldowns client-side.
