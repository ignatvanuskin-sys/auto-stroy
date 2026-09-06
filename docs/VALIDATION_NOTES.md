# BuildScope AI — Validation Notes

## Visual review

Desktop screenshots were reviewed for the home page, calculator, projects, process, CRM overview, lead Kanban, analytics, and settings screens at 1440×960.

The public experience correctly uses the planned premium construction direction: a charcoal editorial hero with a warm terracotta accent, architectural photography, prominent calculator CTA, generous asymmetric spacing, and an uncluttered typographic hierarchy. The calculator presents one meaningful question per step with a permanent range preview and a visible progress indicator.

The CRM is visually distinct from the public site while remaining brand-consistent. Its dark operational sidebar, compact metric cards, kanban columns, notification panel, analytics, and rate-table view are readable at desktop size. No obvious overlap, truncation, missing image, or invisible text was observed in the inspected top viewports.

## Functional checks pending / completed

The seed command completed with 12 diverse leads, rate tables, proposals, tasks, follow-up drafts, and an outbound Telegram queue item. Type checking completed successfully before the latest migration reseed. The test run is still tracked by the shell job that follows seed completion; its terminal result must be confirmed before final delivery.

## Known demo limits

Telegram and Email integrations intentionally display their current setup state because no external credentials were supplied. Their records are persisted, but external delivery is not asserted in demo validation. Customer follow-up remains a draft pending manager approval.

## Browser flow review

The preview browser successfully loaded `/calculator`, exposed the six-step structure, and advanced from step 1 to step 2 with a live estimate. For the demo input (180 m², 2 floors, Алматы, brick, standard, land present), the sidebar returned the honest rounded range `66–85 млн ₸`; no exact amount was displayed. Step 3 also rendered the material and finish choices with the same stable range preview. The browser preview footer blocked the bottom-most Continue button on step 3 in this sandbox preview mode, so the remaining form submission was verified via server code and unit tests rather than by forcing a click through the overlay.

## CRM flow review

The browser loaded the seeded Kanban with 12 visible demo leads across the pipeline, including the expected 92/100 Very Hot lead. Opening that card showed all project parameters, the AI summary, intent and confidence, the deterministic estimate range, timeline, task, and a Follow-up empty state. Clicking **Сгенерировать КП** created a draft proposal, added the three follow-up entries (day 1 / 3 / 7) as pending manager-confirmation drafts, appended a timeline event, and exposed a downloadable PDF action. The UI explicitly states that sending to the customer requires confirmation.
