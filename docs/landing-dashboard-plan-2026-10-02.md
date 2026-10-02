# Landing page and dashboard motion — 2026-10-02

Status: approved with “Proceed” and implemented. See landing-implementation-2026-10-02.md for validation.

## Start
References: https://elevenlabs.io/ and https://impeccable.style/designing/
Inherit ResonaAI identity: white/stone surfaces, charcoal actions, restrained teal selection, original logo.
Public landing mode: Persuade. Dashboard mode: Operate.
Public root proposed at /; move protected Home to /home. Update sidebar, organization selection/switching, auth fallback destinations and route tests together. Preserve /text-to-speech and other deep links.

## Improve
Landing sequence:
1. Compact navigation with section links, sign-in and Open Studio.
2. Editorial split hero: “Give your words a voice.” Explain local generation and experimental Hindi/Hinglish.
3. Large rounded demo with language pills, editable example, real built-in voice choices, and Try in Studio handoff. No automatic model download or sound.
4. Authored Studio preview, using synthetic sample text and no private account screenshots.
5. Three steps: choose voice; download model and generate locally; optionally save to cloud workspace.
6. Cloning setup teaser labeled preview, with explicit unavailable engine.
7. FAQ addressing downloads, device requirements, experimental language quality and cloud saves.
8. Minimal footer and working Studio action.

Motion thesis: language/voice selection is the focal interaction. A single original abstract voice ribbon supports the demo; no copied ElevenLabs assets. Use brief opacity/transform continuity when selection changes, a one-time restrained entrance, and clear button feedback. Content remains visible without animation. Reduced-motion removes decorative motion. Any ambient work stops offscreen and during inference. No autoplay audio.

Dashboard follow-up:
- Carry over demo pill behavior, compact voice selection and rounded surfaces.
- Short feedback for tab changes, expandable history and generation completion.
- Preserve editor focus, script drafts, local engine progress, account navigation and audio controls.
- Do not animate the app shell on every navigation or pretend a decorative waveform represents generated audio.

## Check
After mockup review and implementation: typecheck, meaningful routing/draft tests, lint/design checks, production build. Batch desktop and narrow-browser inspection of landing, sign-in handoff, workspace redirects and dashboard controls. Fix discovered defects in one batch and confirm once. Verify reduced-motion and keyboard operation.

## Maintain
Record final tokens and motion behavior in DESIGN.md; keep mockup/prompt and browser proof in docs. Frontend cloning stays explicitly unavailable until its engine is implemented. No fabricated testimonials, customer logos, subscriptions or device performance claims.

