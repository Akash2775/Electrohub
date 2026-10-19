# Rating UI update

- Reference-style overall score with orange, fractionally filled stars.
- Live 5-to-1 star distribution and counts from published product reviews.
- Click a distribution row to filter reviews; click again or Clear filter to reset.
- Accessible 1–5 star radio selection replaces the dropdown (keyboard arrows supported).
- Responsive layout and dark mode styles.
- Empty ratings display 0.00 and empty stars, without sample scores.
- Quality / Customer Service / Value scores are not shown because these fields are not collected by the existing API.

No database migration or backend changes required. Existing delivered-purchase review validation remains active.

Run frontend: cd frontend, npm install, npm run dev.
Build verified with npm run build. Existing five frontend tests passed.
