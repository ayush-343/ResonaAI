# Browser speech assets

The build copies the unmodified espeak-ng npm package's JavaScript and WASM into public/vendor/espeak. This package is GPL-3.0; its license is also served there. Corresponding source and build instructions: https://github.com/wide-video/espeak-ng and https://github.com/espeak-ng/espeak-ng. Preserve the license and provide corresponding source for the exact distributed build when publishing; upstream links alone should not be treated as satisfying every distribution obligation. Resolve the distribution approach before a public release.

ONNX Runtime Web assets are copied from the installed onnxruntime-web package (MIT). Kokoro model files are downloaded directly from the pinned onnx-community/Kokoro-82M-v1.0-ONNX revision, based on hexgrad/Kokoro-82M (Apache-2.0). Retain model licenses when redistributing weights. Model hosting is used for downloads, not text inference.

## Geist font
The self-hosted Latin font in `public/fonts/resona-geist-latin.woff2` comes from the installed Next.js bundled Geist distribution. Copyright 2024 The Geist Project Authors. Licensed under SIL Open Font License 1.1; the complete license is included at `public/fonts/OFL.txt`.

## Landing artwork
`public/images/voice-ribbon.png` is original artwork generated with the built-in image generation tool for ResonaAI. No ElevenLabs assets are included.
