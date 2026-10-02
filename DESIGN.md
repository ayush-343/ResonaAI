---
name: ResonaAI
description: A focused workspace for writing, listening and saving speech.
colors:
  background: "#ffffff"
  foreground: "#242424"
  primary: "#242424"
  primary-foreground: "#ffffff"
  muted: "#f5f5f3"
  muted-foreground: "#626262"
  border: "#e6e6e2"
  selection: "#195b56"
  selection-surface: "#e8f2f0"
  sidebar: "#f8f8f6"
  success: "#216447"
  warning: "#805310"
  control-border: "#a3a3a3"
  error-background: "#fff3f0"
  error-foreground: "#75261f"
typography:
  font-family: "system-ui, Helvetica, sans-serif"
  body-size: "16px"
  body-line-height: "1.6"
  heading-weight: 600
---

# ResonaAI design system

## Overview
Apply the user-reviewed Home, Studio, Voices and Settings mockup direction: white work surfaces, warm neutral supporting panels, charcoal primary actions and restrained teal selection. The editor is the dominant work surface; controls and results support it. Brand expression comes from composition, bilingual content and precise copy. Keep the existing logo.

## Colors
Use semantic CSS tokens for surfaces, text, borders and state. Color communicates selection, errors and progress. Keep inactive content neutral. Body and secondary text must reach 4.5:1 contrast against their surface.

## Typography
Use a local system sans for the operating interface, with Devanagari system fallbacks. Avoid a network font requirement for startup. Fixed rem sizes, clear labels and tabular numerals for progress/timing. Scripts have comfortable line height; utility copy remains readable.

## Layout
Keep one primary action per work area. On wide screens the script and controls sit side by side. Narrow screens stack controls without hiding them. History uses rows with text, voice, date and action rather than decorative card grids. No animated background or ornamental waveform; a waveform must represent real audio.

## Components
Reuse the existing Button and field vocabulary. Associate every input with a visible label. Loading, disabled, empty, error, cancellation and recovery states are part of the component. Download and save are separate actions. Use native audio controls for playback and seeking.

## Motion
Short state transitions only. Honor reduced motion. No ambient dashboard animation or staggered card entrances.

## Maintenance
Run `npm run design:check` for authored product surfaces, `npm run check` for implementation checks, and the browser task checklist in `docs/design-workflow.md`. Update these rules alongside intentional changes. Future new screens begin with image mockups, as requested by the user.

Control borders: #a3a3a3. Error background: #fff3f0; error text: #75261f. Error meaning is conveyed by text and alert semantics.

## Navigation and settings
Every sidebar destination has its own page. Home, Speech Studio, Voices and History sit in the main navigation; Settings stays in the sidebar footer. Settings uses Profile, Workspace and Device & Storage route links with matching active states; avatar and organization menus navigate to those same Profile and Workspace destinations. Clerk panels use the shared shadcn theme. Voice configuration stays in Studio. Pages scroll normally and mobile navigation closes after choosing a route.

Voices contains Built-in voices and Voice cloning task tabs. The cloning setup inherits existing typography, fields, neutral surfaces and native playback. Its frontend-preview status is visible, and a draft setup must never appear as a usable cloned voice.

## Public landing and shared motion
Approved landing mockup: docs/mockups/resona-landing-v1.png. Public root is /; protected Home is /home. Use self-hosted Geist Latin for both surfaces; existing font fallback covers Devanagari. Landing inherits white, stone, charcoal, teal and the original logo. The generated ribbon is an original decorative asset, not an audio visualization.
Supporting tones: #dcece6 selection; #3b3b3b action hover; #00000014 action shadow; #4b4b47 secondary headline copy; #dce9e4 voice initial background; #26392e12 ribbon shadow; #eeeee9 language-pill track.
Landing has one 750ms ribbon entrance, with visible content from the start; buttons and selected pills respond in 150–180ms. Dashboard tabs, history expansion and output surfaces use brief 200–250ms transitions. No ambient loops, autoplay, new animation dependency or route-shell choreography. Reduced-motion disables all authored motion.
The public demo selects real catalog voices and hands text into Studio without downloading a model automatically. Cloning links to /voices?tab=cloning. Native FAQ disclosures work with keyboard controls. The Studio preview uses illustrative sample data and real supported controls.
