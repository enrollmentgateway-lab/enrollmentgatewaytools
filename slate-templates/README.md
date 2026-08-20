# Slate template folders

## `wrappers/` — paste these into Slate

These are the current production templates. Each file sends Slate query results to its matching GitHub-hosted page:

- `pipeline-overview-wrapper.liquid.html`
- `teaching-site-overview-wrapper.liquid.html`
- `event-tracker-wrapper.liquid.html`
- `funnel-overview-wrapper.liquid.html`
- `student-lookup-wrapper.liquid.html`

## `full-page-backups/` — do not paste unless rolling back

These are the previous self-contained dashboard templates. They include the old HTML, CSS, JavaScript, and Liquid in one file and are retained only as backups.

The live hosted HTML is kept in each tool's top-level folder—for example, `pipeline-overview/index.html`. Those locations must not be moved without also updating the iframe URLs in the wrappers.
