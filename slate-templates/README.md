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

The Regional Campus portal loads the `campus` values from Queryomatic's Slate prompt/options service, with the current campus-prompt values as a static wrapper fallback, and excludes `Doctor of Ministry`. It calls two JSON services. The general service uses `campus`, `term`, and `year` and supplies Applicant and Student rows with `first`, `last`, `email`, `phone`, `sisid`, `status`, `app_status`, and `program`. The inquiry-only service uses `campus` and supplies `first`, `last`, `email`, `phone`, and `sisid`; the wrapper assigns the `Inquiry` status. Inquiry counts are all-time rather than period-specific. The wrapper uses `sisid` to build the individual profile's Slate record-lookup link. No Liquid query export is required. The interface labels `app_status` as **Application Status** and hides campus cards whose combined record count is below 20.

The Student Lookup wrapper does not require a portal query. It fetches the configured Slate JSON service after a first-name, last-name, or SIS-ID search. That service must export `status`, `name`, `email`, `phone`, `pipeline`, `teachingsite`, `birthdate`, `app_created_date`, `decision_code`, `vear`, `term`, `program`, `url`, `app_degree`, `app_round`, `app_status`, `app_term`, `app_year`, `app_f1`, and `app_url`. The `url` export must point to the person record in Slate. The wrapper extracts the application ID from `app_url` and links the application button to the applicant-facing `/apply/?id=...` route.
