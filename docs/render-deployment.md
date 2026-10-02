# Deploy ResonaAI on Render

Use a Node **Web Service**, not a Static Site. The repository root contains package.json; leave Root Directory blank. A free-plan Blueprint is also provided in render.yaml. It does not create a database or paid resources.

## Service settings

| Field | Value |
| --- | --- |
| Repository | https://github.com/ayush-343/ResonaAI |
| Branch | main |
| Language | Node |
| Region | Singapore (or the region of your existing database) |
| Root Directory | Leave blank |
| Build Command | `npm ci --include=dev && npm run build` |
| Start Command | `npm run start -- --hostname 0.0.0.0` |
| Compute | Free |
| Health Check Path | `/` |

Node 22 is specified in .nvmrc. Render supplies PORT (normally 10000), which next start reads; remove a manually added PORT unless you intentionally need a different port. Do not set PORT to a secret or nonnumeric value. Do not prune devDependencies before building: Prisma generation and TypeScript tooling are needed during installation/build.

## Environment variables

Add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY, CLERK_SECRET_KEY and DATABASE_URL in the Render dashboard. Use a matched pair of Clerk keys for your chosen instance and a real PostgreSQL connection string. Do not paste secrets into GitHub or chat. The publishable Clerk key is embedded at build time, so changing it requires rebuilding.

For cloud saving, also add R2_ACCOUNT_ID, R2_BUCKET_NAME, R2_ACCESS_KEY_ID and R2_SECRET_ACCESS_KEY. Leave these unset for a local-generation prototype if cloud saving is not ready. No model-hosting API key or server GPU is needed.

For production authentication, configure the deployed domain and production instance using Clerk's domain/deployment settings. Verify sign-in and organization selection on the actual HTTPS URL. Development Clerk keys are appropriate only for a temporary development preview, not a production release.

Apply database migrations separately, after checking the target database and any existing migration baseline: `npx prisma migrate deploy`. Free Render services do not support pre-deploy commands or shell access; run migrations from a trusted local environment with that database's DATABASE_URL. No migration runs automatically in this Blueprint, avoiding accidental changes to your existing database. Cloud history may fail until the database schema is current.

## Deploy and verify

Create the service with Free selected. Watch build logs for Prisma client generation, browser asset preparation and successful next build. Confirm startup binds 0.0.0.0 at PORT. Then verify the public landing page, sign-in, workspace selection, Studio and Voices. Use CPU for an initial local speech test, then evaluate WebGPU on a compatible laptop. Validate model/pronunciation downloads and WAV playback on the HTTPS deployment.

Free web services spin down after inactivity and have cold starts. Browser inference still runs on the user's laptop. Do not use service disk for audio/history: it is not persistent; configured cloud audio uses R2. See https://render.com/docs/free for current limits. Before distributing the application, complete the eSpeak source-distribution requirements documented in THIRD_PARTY_NOTICES.md.

Official references: https://render.com/docs/deploy-nextjs-app and https://render.com/docs/web-services.
