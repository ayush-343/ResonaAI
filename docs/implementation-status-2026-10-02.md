# Implementation status — 2 October 2026

This is the first working slice of the development plan, not a production release.

## Delivered
- Worker-owned pinned Kokoro ONNX model with WebGPU FP32 and local CPU Q8 modes, cached downloads, English/Hindi pronunciation, mixed-script Hinglish, chunking and cancellation through worker termination.
- Built-in voices, speed control, explicit model load, progress, actionable errors, native playback and WAV download.
- IndexedDB audio recovery scoped to the selected workspace; recent results embedded in the existing editor. Explicit cloud save/retry; server-side organization authorization, bounded WAV validation, deterministic/idempotent result IDs, private R2 playback and deletion routes.
- Additive database migration prepared, not applied. Prisma adapter aligned; placeholder tRPC identity removed; development test page scoped and unavailable in production.
- Dashboard input handoff repaired; misleading inference price estimate, animated hero and decorative gradient thumbnails removed. Navigation points to functioning editor sections. Dedicated future screens remain subject to mockup review.
- PRODUCT.md, DESIGN.md, Start/Improve/Check/Maintain workflow, reusable design check and CI implementation checks. Future new screens use mockups first.

## Measured evidence
Local isolated Chrome session, developer machine, short built-in samples. These timings are single observations, not minimum-device guarantees. Playback starts after complete assembly; first chunk is a compute metric, not streaming playback latency.

| Mode | Language | Audio | Compute | First generated chunk |
|---|---|---:|---:|---:|
| CPU Q8 | English | 6.345 s | 11.56 s | 6.90 s |
| CPU Q8 | Hindi | 9.465 s | 17.60 s | 4.78 s |
| CPU Q8 | Mixed-script Hinglish | 9.365 s | 17.46 s | 5.18 s |
| WebGPU FP32 | Mixed-script Hinglish | 9.340 s | 9.92 s | 4.61 s |

Browser produced native playable audio and WAV export for all three CPU samples; records survived reload. WebGPU session creation and actual mixed-script inference succeeded. The proposed first-chunk <3 s and real-time-factor <=1 targets have not been met by these observations. Hindi quality still needs native-speaker listening. Romanized Hindi requires a Devanagari pronunciation override; automatic transliteration is not implemented.

`npm run check` and `npm run build` pass. Lint has one existing wavy-background hook warning. Paired 1440 px / 390 px editor inspection passed; no narrow horizontal overflow. Detector found no anti-patterns after corrections. Unauthenticated GET /api/generations returned 401. Authenticated multi-workspace isolation and cloud storage integration have not been exercised.

## Next gates
1. Review generated samples with English/Hindi speakers; assess Hinglish transitions, punctuation and long scripts. Benchmark Windows integrated GPU and Apple Silicon laptops. Improve pronunciation initialization/streaming before committing to latency claims; compare a different local model if quality fails.
2. Configure private R2 and migrate a development database. Test upload retries/races, save failure recovery, cross-workspace read/delete denial, and cross-device replay. Add quotas and durable orphan cleanup before scale.
3. Review mockups for dedicated voice catalog, history and document-listening screens. Add document ingestion and voiceover workflow features after core quality is established.
4. Complete model cache management, GPU-loss/browser storage eviction recovery, large-script/cancel automation, keyboard/screen-reader checks and deployed HTTPS smoke tests.
5. Dependency release gate: compatible audit patches reduced 19 advisories to 6 (5 high, 1 low). Remaining groups involve Prisma/deepmerge-ts, Transformers.js/sharp and esbuild. Do not use npm audit fix --force blindly; validate targeted runtime upgrades separately. Check eSpeak GPL corresponding-source obligations before distributing the application publicly.

Fine-tuning and voice cloning remain later milestones. Vulkan remains a potential native desktop backend; the browser delivery uses WebGPU.

## Navigation follow-up
Dedicated Voices and History pages and unified Settings routes are now implemented following a generated mockup. See navigation-settings-repair-2026-10-02.md for routing, authenticated browser evidence and the corrected dashboard draft handoff. This supersedes the earlier note that dedicated voice/history screens were awaiting mockups. Document-listening workflows remain future work.
