# Browser speech assets

The build copies the unmodified espeak-ng npm package's JavaScript and WASM into public/vendor/espeak. This package is GPL-3.0; its license is also served there. Corresponding source and build instructions: https://github.com/wide-video/espeak-ng and https://github.com/espeak-ng/espeak-ng. Preserve the license and provide corresponding source for the exact distributed build when publishing; upstream links alone should not be treated as satisfying every distribution obligation. Resolve the distribution approach before a public release.

ONNX Runtime Web assets are copied from the installed onnxruntime-web package (MIT). Kokoro model files are downloaded directly from the pinned onnx-community/Kokoro-82M-v1.0-ONNX revision, based on hexgrad/Kokoro-82M (Apache-2.0). Retain model licenses when redistributing weights. Model hosting is used for downloads, not text inference.

## Geist font
The self-hosted Latin font in `public/fonts/resona-geist-latin.woff2` comes from the installed Next.js bundled Geist distribution. Copyright 2024 The Geist Project Authors. Licensed under SIL Open Font License 1.1; the complete license is included at `public/fonts/OFL.txt`.

## Landing artwork
`public/images/voice-ribbon.png` is original artwork generated with the built-in image generation tool for ResonaAI. No ElevenLabs assets are included.

## Document import

Mammoth (`mammoth`, browser build) extracts raw DOCX text locally. Copyright (c) 2013, Michael Williamson; licensed under BSD-2-Clause. Its complete license follows below.

PDF.js (`pdfjs-dist`) extracts selectable PDF text locally using its compatibility (`legacy`) build. It is licensed under Apache License 2.0. The build serves its unmodified worker and complete license at `public/vendor/pdfjs/pdf.worker.min.mjs` and `public/vendor/pdfjs/LICENSE`; preserve that license when distributing the worker. Node.js 22.13 or later is required by the installed package.

`fake-indexeddb` is a development-only dependency for local persistence tests; it is not shipped as a browser runtime asset.

### Mammoth license

```text
Copyright (c) 2013, Michael Williamson
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

1. Redistributions of source code must retain the above copyright notice, this
   list of conditions and the following disclaimer.
2. Redistributions in binary form must reproduce the above copyright notice,
   this list of conditions and the following disclaimer in the documentation
   and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
```
