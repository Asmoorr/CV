## 1. Production SEO configuration

- [x] 1.1 Confirm the canonical production HTTPS origin and document the deployment value; verify `/`, `/ru`, and `/en` are reachable on that host and record any proxy behavior.
- [x] 1.2 Add a server-only, normalized site configuration used by all absolute SEO URLs; verify unit tests reject missing/non-HTTPS production values, trailing-path inputs, localhost, and preview hosts while accepting the confirmed origin.
- [x] 1.3 Wire the public origin into the production build/deployment instructions without committing secrets; verify a clean documented production build receives the same origin as the deployed site.

## 2. Localized metadata and social previews

- [x] 2.1 Extend the typed RU/EN content model with concise, distinct SEO title/description and social-preview text; verify locale-shape tests pass and editorial checks confirm truthfulness, readability, and no keyword stuffing.
- [x] 2.2 Expand server-generated page metadata with `metadataBase`, self-canonical, reciprocal `ru`/`en` plus `x-default` alternates, robots directives, Open Graph locale/alternate locale, and Twitter large-card fields; verify metadata tests assert exact absolute values for both locales.
- [x] 2.3 Create the branded 1200×630 social-preview asset(s) with readable safe-area content and alt text; verify generated metadata references a crawlable absolute image URL with declared dimensions and the image passes a visual review at full and thumbnail size.
- [x] 2.4 Add or complete favicon, app icon, and relevant identity metadata using Next.js 16 file conventions; verify the production build emits the expected head links/assets without 404 responses.

## 3. Crawl and locale discovery

- [x] 3.1 Add a localized sitemap containing only `/ru` and `/en`, self-canonical URLs, and reciprocal language alternates; verify parsed `/sitemap.xml` contains no `/`, hash, localhost, preview-host, duplicate URL, or fabricated `lastModified` value.
- [x] 3.2 Update robots output to allow public crawling and reference the absolute production sitemap; verify `/robots.txt` parses correctly and uses the same configured origin.
- [x] 3.3 Preserve the root redirect to `/ru` and fixed locale route set; verify production requests return the intended redirect for `/`, successful indexable HTML for both locales, and 404 for unsupported locales.

## 4. Structured profile data

- [x] 4.1 Define a typed server-side JSON-LD builder for a stable `ProfilePage` → `Person` graph sourced from existing localized content and confirmed external profiles; verify unit tests cover both locales, canonical URLs, stable `@id`, visible-fact parity, and omission of unknown properties.
- [x] 4.2 Render JSON-LD in each localized page with safe serialization that escapes `<`; verify the production HTML contains one parseable payload per page and an injection-focused test cannot terminate the script element.
- [ ] 4.3 Validate deployed representative markup with Google Rich Results Test and Schema.org Validator, then record results and any expected non-eligibility notes; verify there are no syntax errors or critical structured-data errors.

## 5. Human-first content relevance

- [x] 5.1 Revise the RU hero/role/summary and supporting sections to state the confirmed backend, databases, API, and data-platform specialization plus concrete project outcomes naturally; verify every new claim maps to existing resume evidence and the page retains one descriptive H1.
- [x] 5.2 Apply an equivalent native-English edit rather than a literal keyword copy; verify RU/EN content IDs, facts, career dates, project links, section hierarchy, and existing content tests remain aligned.
- [x] 5.3 Review rendered pages for useful anchor text, crawlable links, semantic heading order, duplicated boilerplate, hidden SEO text, and decorative-only critical content; verify accessibility/component tests and desktop/tablet/mobile visual regression snapshots pass or are deliberately updated after review.

## 6. Automated SEO quality gate

- [x] 6.1 Add production smoke tests for `/`, `/ru`, `/en`, `/robots.txt`, `/sitemap.xml`, metadata in initial HTML, canonical/hreflang reciprocity, one H1, non-empty main content, JSON-LD parsing, and internal-link status; verify the new suite fails against a deliberately invalid fixture and passes against the production server.
- [x] 6.2 Run lint, typecheck, unit/component tests, production build, SEO smoke tests, and visual tests; verify all commands succeed with zero warnings treated as errors where configured.
- [x] 6.3 Capture a mobile and desktop Lighthouse baseline for `/ru` and `/en` and investigate material regressions caused by this change; verify the report records environment, date, LCP/INP proxy or TBT, CLS, accessibility, and SEO without presenting lab data as field data.

## 7. Release and measurement

- [ ] 7.1 Deploy the SEO release and inspect live response status, redirects, rendered head, robots, sitemap, image assets, canonical/hreflang, and JSON-LD on the confirmed domain; verify no production URL resolves to localhost, preview hosts, mixed HTTP, or an unintended canonical.
- [ ] 7.2 Confirm site ownership in Google Search Console and Bing Webmaster Tools, submit the sitemap, and inspect both canonical locale URLs; verify the dashboards accept the sitemap and record the initial crawl/indexing state without storing verification secrets in the repository.
- [ ] 7.3 Record a dated baseline for indexed pages, queries, impressions, clicks, CTR, average position, crawl issues, and available field Core Web Vitals by locale/page; verify the measurement note distinguishes unavailable or low-volume data from zero.
- [ ] 7.4 Schedule a review after a comparable reindexing/data window and evaluate changes by query, page, device, and locale; verify follow-up actions are evidence-based and do not claim guaranteed ranking impact from the release alone.
