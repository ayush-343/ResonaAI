# Design workflow

Reference: https://impeccable.style/designing/

## Start
Read PRODUCT.md and DESIGN.md before UI work. The user approved refinement of the current dashboard and serves creators, readers and general TTS users. This iteration extends existing surfaces. Future new screens start with image mockups before code.

## Improve
Make the actual speech task visible: script, language, voice, model setup, generation, playback, download and save. Replace decorative placeholders with useful content. Preserve the established neutral dashboard and familiar navigation.

## Check
Run design detection and inspect the running desktop and narrow layouts together. Try keyboard navigation, missing/long text, model loading/failure, cancellation, storage failure and recovery. Fix verified findings in one batch, then confirm once. Record measured evidence and limitations; do not assign accessibility scores without verification.

## Maintain
Keep product truth, visual tokens and shared controls current. Run the design detector in CI alongside type checking, lint and meaningful behavioral tests. Model quality belongs in a separate bilingual listening/benchmark record, not a visual audit.

## First iteration evidence
Desktop (1440 px) and narrow (390 px) editor layouts were inspected together, then confirmed once after correcting the lab heading, error treatment and history rows. No horizontal overflow at 390 px. The final detector completed successfully. Functional inference checks produced real English, Hindi and mixed-script Hinglish audio; this does not establish linguistic quality or full accessibility compliance. See implementation-status-2026-10-02.md for measured timings and release limitations.

## Reviewed layout delivery

The user approved the image mockup direction on 2026-10-02. The accepted system is implemented across Home, Studio, Voices, History and Settings, including actual local voice previews and Device & Storage data. Detector scope now includes shared workspace CSS, Home components and history. See layout-implementation-2026-10-02.md for browser evidence and outstanding product work.

## Landing follow-up: Start → Improve → Check → Maintain
Start: approved landing mockup after ElevenLabs reference review. Improve: public demo, Studio preview, FAQ, cloning setup link, and shared dashboard pills/motion. Check: production build, 12 tests, signed-in handoff, cloning deep link, keyboard disclosures, desktop and 390px browser checks; anonymous HTTP landing 200 and protected Home 307. Maintain: DESIGN.md, font license, artwork prompt, routing tests and screenshot proof updated. Reduced-motion CSS is present; OS preference switching not exercised.
