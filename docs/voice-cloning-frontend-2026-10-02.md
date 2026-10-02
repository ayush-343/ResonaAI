# Voice-cloning frontend preview

The existing Voices page now contains Built-in voices and Voice cloning tabs. The cloning tab extends the established dashboard design and does not introduce a separate screen or route.

Implemented: voice name, sample language (English/Hindi/Hinglish), optional description, recording selection, speaker-permission checkbox, original-recording playback, setup review, edit and remove actions. Review requires a name, a playable recording with a readable duration, and permission confirmation. Empty, unsupported, oversized and unplayable recording states have explicit recovery messages. The frontend accepts WAV/MP3/M4A/OGG/WebM up to 20 MB; these are preview constraints, not future model requirements.

Recordings use browser object URLs, stay in memory, and are never uploaded by this component. URLs are released when the sample changes or the component unmounts. Leaving the cloning tab or refreshing clears the setup. No microphone permission is requested.

The UI labels itself Frontend preview and explicitly states that cloning is not connected. No voice model is created, no simulated synthesis occurs, and the setup does not enter the built-in speech catalog. Connecting an appropriate local cloning engine is future work.

The production build and final design/diff checks passed.

Impeccable workflow: used existing PRODUCT.md/DESIGN.md as the Start brief, extended the existing Voices surface during Improve, verified the task states and desktop/narrow layouts during Check, and recorded the product constraints here and in PRODUCT.md for Maintain. The broader visual-direction mockup remains awaiting review.

Verification: type checking, existing 10 tests, lint and design detection passed (one pre-existing warning in unused wavy-background). In the signed-in browser, a synthetic one-second WAV was accepted; its duration was displayed and Review voice setup became enabled after name/permission entry. Review showed the correct name/language and an unavailable cloning action. Switching to built-in voices and back cleared the setup. Desktop and 390px layouts were inspected; narrow content width matched the viewport without horizontal overflow. Cloning styles were moved into a dedicated feature stylesheet after the dev server served stale global CSS; the rendered styles were then confirmed. Original recording playback is provided by the native audio element; linguistic cloning quality is not applicable to this preview.
