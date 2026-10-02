# Landing and dashboard refinement

Implemented after the user approved the landing mockup with “Proceed.”

- Public landing at `/`, protected Home at `/home`. Shared logo preserved.
- Language pills, real catalog voice selection, editable sample and Studio handoff. No automatic download or audio playback.
- Product preview with supported controls, local-generation explanation, optional cloud-save copy, cloning setup link and keyboard-accessible FAQ.
- Self-hosted Geist font and original teal/ivory ribbon; official font license included.
- Short feedback on dashboard tabs, language pills, history expansion and output surfaces. One landing artwork entrance. Reduced-motion CSS disables authored animation and transitions. No ambient animation loops.
- Organization selection preserves an allowlisted workspace destination, including Studio query parameters. Login fallback and workspace switching lead to `/home`.

Validation: production build passes; 12 tests pass; typecheck, lint and design checks pass (existing unrelated wavy-background hook warning remains). Signed-in browser verified Hinglish script + Alpha voice handoff, cloning deep link, FAQ keyboard interaction, Home navigation and desktop/narrow layouts. Landing and Home both have width 390 without horizontal overflow in the narrow viewport. Reduced-motion behavior is implemented in CSS; OS preference switching was not exercised.

Proof: `docs/screenshots/landing-2026-10-02/`. No cloud save, history deletion or account changes during verification. Cloning remains a frontend setup preview. Actual GPU/CPU engine remains the previously implemented local inference engine.

Artwork prompt: “Create one original sculptural folded ribbon for the ResonaAI voice demo, like a continuous softly twisted paper/fabric loop with three fluid folds, muted sea-green #8caaa2 and warm ivory, finely textured matte material, soft studio lighting, front three-quarter view, isolated centered with ample margin, transparent background. Elegant physical sculpture, no sphere, no logo, no letters, no text, no UI, no additional objects.” Built-in image generation, saved as `public/images/voice-ribbon.png`.
