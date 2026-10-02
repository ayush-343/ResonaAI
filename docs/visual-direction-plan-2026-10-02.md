# ResonaAI visual direction and page plan

Status: proposal for mockup review, not an implemented or approved replacement for DESIGN.md.

## Direction

Refine the existing dashboard into a calm bilingual audio workspace. The script and listening experience should carry the visual identity: English and Devanagari shown comfortably together, clear voice choices, real audio results, and understandable device status. Serve quick TTS, voiceover creation, and document listening through a shared speech engine, with task-specific workspaces added in stages.

References reviewed: [ElevenLabs homepage](https://elevenlabs.io/), [text-to-speech page](https://elevenlabs.io/text-to-speech), and [Impeccable designing workflow](https://impeccable.style/designing/). Visual inspection covered public pages and embedded product previews, not the authenticated ElevenLabs application. Exact animation timings were not measured; timings below are ResonaAI recommendations.

## What the references contribute

ElevenLabs uses broad white space, restrained sans typography, black primary actions, pale neutral containers, rounded controls, and voice demos close to the task. Its speech page makes choosing a voice tangible with compact preview rows and a clear next action. Adapt that clarity and hierarchy to the existing app. Retain ResonaAI branding, routes, and local-inference model; build original components and compositions. Use no copied logos, voice assets, orb illustrations, proprietary fonts, or marketing claims.

Proposed visual vocabulary:

- White work surface, a subtly warm neutral sidebar/panel background, charcoal text, and dark primary buttons. Existing semantic success/error colors remain. A restrained deep teal selection accent is a mockup candidate, subject to contrast checks.
- System sans UI with deliberate Devanagari fallbacks; 14–16px controls/body, 24–32px page titles, larger type reserved for a future public introduction. Comfortable script line spacing; tabular timing and download figures.
- Fine separators, 8–12px control corners, 12–16px panels, shadows reserved for floating menus. Pills communicate filters or state; ordinary fields retain familiar shapes.
- Stable sidebar, consistent page headers, generous editing space. Lists for history and voices; cards only when they contain genuinely distinct tasks or previews.
- Simple voice initials/language identifiers, actual audio waveforms when available, and useful bilingual examples create character without decorative gradients or simulated activity.

## Page plan

| Page | Composition and behavior | Feature scope |
| --- | --- | --- |
| Home `/` | Compact greeting/title; dominant script-start area; recent work below; task shortcuts with short examples. Useful empty state instead of invented statistics. | Refine current quick generation and recent results. Add document shortcut only when Reader ships. |
| Speech Studio `/text-to-speech` | Large script editor in the center, compact voice/language/speed inspector on the right, result player immediately below. Advanced pronunciation controls progressively disclosed. Narrow layouts stack controls and keep the generate action reachable. | Preserve current local generation, cancellation, download and explicit cloud save. Add draft autosave, keyboard shortcut, and reusable pronunciation entries. Longer-term section regeneration. |
| Voices `/voices` | Search and language filters at top; compact voice rows with name, language, preview, favorite and Use voice. Selected voice is obvious. | Current eight built-in voices remain the honest catalog. Add previews from this same model, generated/cached locally, and favorites. Describe character only after listening evaluation. |
| History `/history` | Scan-friendly rows with script excerpt, voice, duration, date, and local/cloud state. Row selection opens a detail panel with player, full script and reuse/download actions. | Keep existing local and cloud records. Add rename, search, pagination and filters. Cloud failure retains playable local audio and a retry action. Avoid a second overlapping Library destination initially. |
| Settings `/settings/*` | One page shell and one consistent section navigation: Profile, Workspace, Device & Storage. Align embedded account forms with app width/type. | Profile owns identity/security; Workspace owns members and organization details; proposed Device & Storage owns model downloads, cache usage, engine preference and diagnostics. Editor voice options remain in Studio. |
| Reader `/reader` — new, next phase | Document contents/chapter navigation on the left, readable text in the center, compact playback controls below. Import leads to an editable text preview before generation. | Start with pasted text and TXT; then text-based PDF/DOCX extraction on device. Paragraph-level playback/resume and queued generation. OCR and exact word highlighting require separate capabilities. |
| Projects — later | Project list opens a script divided into ordered sections. Each section has voice, text, regenerate and audio status; a modest assembled-audio view sits below. | Multiple voices by section, inserted pauses and selective regeneration. Start with sequential speech assembly before a full multitrack editor. |
| First-use setup | Small, task-specific setup panel in Studio: device check → download choice/size → progress → ready. Show once, then collapse to a status control. | Explain initial download and CPU fallback clearly. Separate downloading, preparing, generating, and uploading; never present one misleading percentage for all four. |
| Sign-in/workspace selection | Same typography, neutral surfaces and restrained branded header as the app. | Preserve working Clerk flows and return users to the intended task. Keep personal-account controls distinct from workspace management. |
| Public introduction — optional later | Focused headline, real English/Hindi sample, a short explanation of local generation, and one start action. | Only verified quality/performance claims. Keep dashboard routing intact; choose public routing explicitly when this page is scheduled. |

Navigation at first delivery stays Home / Speech Studio / Voices / History, with Settings at the bottom. Reader and Projects appear only when usable. `/lab` stays a diagnostic surface rather than a primary customer destination. Existing `/text-to-speech` links and profile aliases remain valid.

## Important interaction states

- Model absent: show download size and the reason it is needed before starting.
- Download interrupted: provide accurate recovery using what the cache actually retained; do not promise resumability without support.
- GPU unavailable or lost: explain the fallback and preserve the script; allow retry on CPU.
- Generating: show real stage/chunk progress and cancellation. Current output becomes playable after assembly; early playback is a separate engine improvement.
- Ready: play/seek, download WAV, and Save to cloud are separate actions.
- Save failed: keep the result available locally with a specific recovery action.
- Storage clearing: explain which models/results will be removed before deletion. Do not conflate cached model files and saved user audio.
- Hinglish: distinguish mixed English/Devanagari support from Romanized Hindi. Keep pronunciation overrides visible; automatic transliteration needs validation and editable results.

## Motion

Use motion to explain selection and continuity. Recommended durations: button feedback 120–160ms; tabs/menus 150–200ms; detail panels 180–240ms. Avoid moving the whole page when switching routes. Preserve editor position and focus.

Playback may animate a cursor over a waveform derived from actual audio. Download progress reflects downloaded bytes when available; unknown work uses a labeled indeterminate state. No autoplay, ambient blobs, bouncing voice avatars or repeated card entrances. Honor reduced motion with immediate state changes. Benchmark UI responsiveness during GPU generation; decorative effects must not compete with inference.

## Feature priorities and dependencies

1. **Finish the reliable core:** coherent navigation/settings; model setup and recovery; bilingual quality validation; persistent local drafts; actual cloud-history configuration and migration. Local inference is already implemented, but cloud deployment and a representative laptop test matrix remain release dependencies.
2. **Make everyday use faster:** voice previews/favorites, history search and pagination, named outputs, reusable pronunciation dictionary, device/cache management. Test all local-versus-cloud state labels against actual data behavior.
3. **Serve document listeners:** local document extraction, text cleanup, chapter/paragraph queue, resume position, bounded memory use for long documents.
4. **Serve creators deeply:** section projects, multiple voices, selective regeneration, pause insertion and assembled WAV export. MP3 export and subtitles require explicit encoding/timing work.
5. **Research later:** voice cloning, fine-tuning, richer expressive control and a native/Vulkan option. Do not expose emotion, stability or cloning controls until the selected local engine genuinely supports them. Model experiments should follow quality and hardware benchmarks, not visual imitation.

The browser architecture remains WebGPU with a CPU fallback. A desktop backend can later share the product design without appearing as confusing GPU API choices in everyday UI.

## Impeccable: Start → Improve → Check → Maintain

**Start:** use PRODUCT.md and this proposal as the brief. Prepare image mockups of Home, Studio, Voices and unified Settings before changing the interface. Include a bilingual Studio example and a narrow-layout example. Present one coherent recommended direction with a restrained alternate accent treatment, rather than unrelated redesigns. Record the accepted direction in DESIGN.md after review.

**Improve:** implement shared shell, typography, buttons, fields, tabs, voice rows, status messages and player styling first; then apply them to existing pages. Deliver new Reader/Projects flows separately with their own mockups and real end-to-end behavior. Keep explanatory copy specific to the task.

**Check:** inspect desktop and narrow layouts together. Verify keyboard/focus behavior, contrast, reduced motion, long Hindi/English text, route/back navigation, and all loading/empty/error/recovery states. Run existing checks and meaningful behavior tests. Test generation with UI motion enabled on representative laptops; validate pronunciation with native Hindi speakers. A visual detector does not establish usability or speech quality.

**Maintain:** update DESIGN.md tokens and component guidance when accepted changes land; maintain docs/design-workflow.md with evidence; keep route ownership and feature status documented; run design checking alongside existing CI. Record missing capabilities rather than shipping placeholder buttons.

## Delivery sequence

1. Review mockups for the four anchor screens and the bilingual/narrow Studio states.
2. Apply the accepted shared visual system to existing routes, including unified Settings.
3. Finish model setup, history reliability and everyday usability features.
4. Mock up and implement Reader, then section-based Projects.

This document changes no application code and does not overwrite the currently accepted design system.
