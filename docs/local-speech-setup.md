# Local speech development

Use Node 22 LTS, then `npm ci` and `npm run dev`. Postinstall generates Prisma and copies pronunciation/ONNX browser assets into public/vendor; those generated files are excluded from Git. Copy .env.example to .env and configure Clerk and PostgreSQL. Visit /lab for a public local benchmark without saving to cloud, or /text-to-speech inside an authenticated workspace.

Select CPU or GPU, load the model, try a sample, then generate. CPU uses Q8, GPU uses FP32. The first download needs network access; subsequent loads use browser caches when available. Text stays on the laptop until Save to workspace is clicked. The download host receives model asset requests.

Cloud saving requires a private R2 bucket and server credentials listed in .env.example. Apply the additive Prisma migration to a development database with `npx prisma migrate deploy` before testing saves. This implementation has not migrated the configured database. Never expose R2 credentials to the browser. Reads authorize the current organization before issuing short-lived object URLs.

Run `npm run typecheck`, `npm run test`, `npm run lint`, `npm run build`, and `npm run design:check`. Webpack is selected because Turbopack's CSS worker failed under this local process sandbox. Remaining release gates: bilingual listening evaluation, representative laptop WebGPU performance, cloud integration tests, dependency advisory triage, and eSpeak source-distribution obligations. Full voice catalog/history screens need image mockups first, per the user's preference.
