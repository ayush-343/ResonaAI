# Creator Projects implementation — 2026-10-05

Creator Projects adds `/projects` and `/projects/[id]` to the authenticated workspace. It extends the existing speech engine and history API; backend routes and the Prisma schema are unchanged.

## Behavior and boundaries

- Projects contain chapters, named speakers and editable blocks with voice, language, generation speed, pronunciation overrides and pauses. Chapters and blocks can be reordered; blocks split at the cursor after clearing pronunciation overrides.
- TXT, DOCX and selectable-text PDF extraction runs locally. Imports are reviewed before project creation. Explicit `# Chapter title` lines create chapters and blank lines create blocks. Limits are 20 MB per file and 100,000 extracted characters; project text plus pronunciation overrides also shares a 100,000-character budget. Password-protected and image-only PDFs need preparation in another tool.
- Generation is serial, with requests of at most 5,000 UTF-16 units. Splitting avoids separating surrogate pairs. Completed WAV chunks persist independently; matching chunks are reused. Fingerprints cover script, pronunciation, voice, language, speed, engine and model revision. Stale results are refused, and saving metadata prunes audio for changed/deleted blocks. Optimistic metadata revisions detect competing-tab saves.
- IndexedDB stores project metadata and audio under the signed-in user plus selected organization. This is device-local storage, not cloud synchronization. Deleting a project removes its audio; in-flight generation cannot recreate a deleted project.
- Native audio controls play generated chunks sequentially, with block pauses, chapter selection, playback rate, bookmarks and a saved listening position. A missing/changed section requires generation before playback or export.
- Chapter/full-project WAV export assembles stored PCM slices and silence without allocating a full-project Float32Array. This reduces one source of memory pressure; it does not establish a measured long-form memory ceiling.
- Cloud history saving uploads only the selected chapter and keeps the editable project local. All blocks must share voice, language, generation speed and compute backend. Existing history validation limits apply: 5,000 characters, 20 minutes and 25 MB. Multi-speaker exports remain downloadable.

## Design comparison

The Projects stylesheet uses incumbent semantic tokens for white work surfaces, warm neutral support, charcoal actions, teal selection, borders and error states. It reuses shared Buttons, labeled fields, native playback and normal page scrolling. The wide outline/editor layout stacks on mobile. This extends the existing system, so `DESIGN.md` and `.impeccable/design.json` were intentionally preserved. Existing design-palette advisories remain; this work does not resolve them.

The generated [concept board](mockups/creator-projects-v1.png) is illustrative. Its provenance and exact prompt are recorded in [the prompt note](mockups/creator-projects-v1-prompt.md). It includes generated Llama and stability controls that are not implemented, and is not evidence of user approval or a rendered application screenshot.

## Verification evidence

Final `npm run check` passed TypeScript, 27 tests, ESLint and design checks. The production build completed successfully, including both Projects routes. The existing hook-dependency warning in `wavy-background` and pre-existing palette advisories remain.

Actual browser checks exercised CPU generation with two voices and WebGPU generation in a second chapter, sequential playback advancing between blocks, a bookmark, saved-project reload, and desktop (1440 px) and mobile (390 px) layouts without horizontal overflow. Rendered review was accepted. A downloaded WAV was verified as mono, 24 kHz, 16-bit audio lasting 10.39 seconds. Real two-page PDF and bilingual DOCX extraction were tested locally.

Browser file selection was denied by security policy, so browser import interaction was not verified and must not be retried in this session. Local extractor tests do not establish browser file-picker coverage. A real cloud upload and broad long-form memory benchmarking were not verified.

## Maintenance

Use Node.js 22.13 or later for the installed PDF.js package. Installation prepares the self-hosted compatibility worker and Apache-2.0 license; Mammoth uses its browser build under BSD-2-Clause. `fake-indexeddb` is test-only. Preserve dependency notices and the existing eSpeak source-distribution follow-up before public release. Follow-up validation should cover configured cloud history, representative long documents and ordinary user-driven browser import outside the denied automation path.

## Discovery and Beta follow-up

Home now presents **Creator Studio Beta** with an **Open Projects** action. The public landing page adds a Projects hero CTA and updates its preview, feature copy and FAQ to explain document import and device-local storage. The project library and editor display Beta badges. This follow-up passed `npm run check` with 27 tests and the production build. Desktop and mobile screenshots were reviewed without horizontal overflow. Existing design artifacts remain unchanged.
