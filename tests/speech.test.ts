import { test } from 'node:test';
import assert from 'node:assert/strict';
import { normalizeScript, splitScript, languageSpans } from '../src/features/tts-engine/text';
import { encodeWav, joinAudio } from '../src/features/tts-engine/audio';
import { validateWav } from '../src/features/history/validation';
test('long multilingual scripts retain every non-whitespace character', () => {
  const input = 'नमस्ते। Hello world! ' + 'अ'.repeat(800) + ' अंत';
  const chunks = splitScript(input);
  assert.equal(chunks.join('').replace(/\s/g,''), input.replace(/\s/g,''));
  assert.ok(chunks.every(chunk => Array.from(chunk).length <= 240));
});
test('mixed script routes pronunciation without dropping characters', () => {
 const input = 'कल मेरी meeting तीन बजे है।';
 const spans = languageSpans(input, 'hinglish');
 assert.equal(spans.map(span=>span.text).join(''),input);
 assert.ok(spans.some(span=>span.language === 'hi'));
 assert.ok(spans.some(span=>span.language === 'en-us'));
 assert.equal(normalizeScript('\ufeff hello\r\nworld '),'hello\nworld');
});
test('audio joins with silence and produces validated PCM', () => {
 const samples = joinAudio([new Float32Array([1,-1]),new Float32Array([0.5])],24000);
 assert.equal(samples.length,2883);
 const wav = new Uint8Array(encodeWav(samples,24000));
 assert.equal(validateWav(wav).duration,samples.length/24000);
 assert.equal(new DataView(wav.buffer).getInt16(44,true),32767);
 wav[24]=0;
 assert.throws(()=>validateWav(wav));
});
