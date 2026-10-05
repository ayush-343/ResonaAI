# ResonaAI

<!-- impeccable:product-schema 1 -->

## Platform
web

## Users
Creators producing voiceovers, people listening to documents, and general-purpose text-to-speech users. The initial device target is laptops.

## Product Purpose
Turn English, Hindi and Hinglish scripts into downloadable speech using the user's computer. Accounts and optional saved generation history are cloud-backed. Creator Projects organize longer scripts and document listening on the device.

## Capabilities and Constraints
Built-in voices ship first. Voice cloning has a frontend setup preview with local sample playback; a cloning engine follows later. The preview does not upload recordings or create usable voices. Inference and pronunciation processing run locally. Model files need an initial download. Hardware compatibility and Hindi/Hinglish quality must be measured rather than promised. Cloud history uploads text and audio to the account's organization.

Creator Projects support device-local chapters and multi-speaker blocks, reviewed local TXT/DOCX/selectable-text PDF imports, sequential playback, bookmarks and WAV exports. Imports accept at most 20 MB and 100,000 extracted characters; project scripts and pronunciation overrides share a 100,000-character budget. Serial inference requests stay within the existing 5,000-character worker limit. Local projects are scoped to user and organization, with no cloud project synchronization. Optional cloud saving uploads a compatible selected chapter through existing history limits: one voice, language, speed and compute backend, at most 5,000 characters, 20 minutes and 25 MB.

## Brand Commitments
Keep the ResonaAI name and refine the existing clean dashboard. Use Impeccable's Start, Improve, Check and Maintain workflow. The user prefers reviewing image mockups before future new screens; this iteration extends the existing dashboard and editor.

## Product Principles
- Keep script editing and generation easy to find.
- Describe download, generation and saving as distinct states.
- Preserve generated audio when cloud saving fails.
- Show supported controls and actual capability; do not invent performance or quality claims.

## Open Decisions
Minimum supported laptop specification, commercial offering, and the point at which experimental Hindi/Hinglish quality is sufficient for release.
