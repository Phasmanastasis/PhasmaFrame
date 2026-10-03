# Alaga · Offline BP follow-up

Phone-first frontend prototype for the offline hypertension follow-up MVP. The UI supports
patient and BHW record review, BP entry, a manual transfer walkthrough, visit notes, and an
RHU/YAKAP-ready summary. Product scope and architecture are described in
[`docs/prd.md`](./docs/prd.md), [`docs/sdd.md`](./docs/sdd.md), and
[`docs/solution-brief.md`](./docs/solution-brief.md).

## Requirements

- Node.js 20.19+ or 22.12+
- pnpm 10+

## Getting started

1. Install dependencies with `pnpm install`.
2. Run `pnpm --filter @app/web dev` and open `http://localhost:4321`.

The frontend uses synthetic sample information. After its first online visit, the app shell
is cached for offline reopening; readings and notes persist in browser local storage for the
demo. Device discovery and phone-to-phone transfer are not connected;
the transfer screen demonstrates explicit review, confirmation, cancel, and retry states.
The UI does not provide diagnosis or treatment advice.

## Workspace layout

- `apps/web` — Astro site with React islands and Tailwind CSS. The phone UI follows
  Material 3 layout and color patterns; the larger layout supports BHW tablet use.
- `apps/api` — Hono server, Zod validation, and Prisma data access.
- `packages/shared` — API schemas and TypeScript contracts consumed by both apps.

## License

Licensed under the Mozilla Public License 2.0 (MPL-2.0). See [`LICENSE`](./LICENSE).
