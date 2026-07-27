## Goal
Get your Vedaalay School OS website rendering in the Lovable preview by merging the uploaded zip into this project.

## What the zip contains
- A full School OS UI at `src/school-os/App.tsx` (~7k lines) plus `DataImportSection.tsx` and `dataImportUtils.ts`
- A shadcn `src/components/ui/` set
- A modified `src/routes/index.tsx` that renders `SchoolOS` and sets Vedaalay page metadata
- A modified `src/routes/__root.tsx` with Vedaalay title/description and og:image
- A `package.json` that adds the `xlsx` dependency
- Same TanStack Start + Vite + Tailwind stack as the current project — safe to merge

No `.git` directory in the zip, so nothing dangerous to copy.

## Steps
1. Copy the app source from `/tmp/veda` into the project, excluding lockfiles, `.lovable/`, `AGENTS.md`, `README.md`, `bunfig.toml`, `eslint.config.js`, `tsconfig.json`, `vite.config.ts`, and `src/routeTree.gen.ts` (keep the current project's tooling and generated route tree). Specifically bring in:
   - `src/school-os/` (all three files)
   - `src/components/ui/` (overwrite — same shadcn set)
   - `src/routes/index.tsx` (replaces the placeholder, wires in `SchoolOS`, sets Vedaalay meta)
   - `src/routes/__root.tsx` (Vedaalay title/description/og:image)
   - `public/` assets if any are new
2. Add the `xlsx` dependency with `bun add xlsx` (needed by `DataImportSection` / import utils).
3. Let the dev server rebuild and verify the home route renders the School OS UI (no placeholder, no import errors) via a quick preview check.

## Notes
- `src/school-os/App.tsx` starts with `// @ts-nocheck`, so TS won't block the build even though the file is large.
- Not touching `vite.config.ts`, `tsconfig.json`, or `src/routeTree.gen.ts` — the router will regenerate the route tree on its own since no new route files are added (index/root already exist).
- No backend work needed; this is pure frontend.
