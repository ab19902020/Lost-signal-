import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const [source, styles] = await Promise.all([
  readFile(new URL('../src/opening.js', import.meta.url), 'utf8'),
  readFile(new URL('../src/opening.css', import.meta.url), 'utf8'),
]);

const start = source.slice(
  source.indexOf('function startCutscene('),
  source.indexOf('function showFailure('),
);
assert.ok(start.includes('audio.play()'), 'the opening never requests its broadcast audio');
assert.ok(start.indexOf('audio.play()') < start.indexOf('enterLandscapeFullscreen()'),
  'fullscreen consumes the Android touch before audio playback starts');
assert.ok(start.includes('continueCutsceneWithoutAudio()'),
  'a rejected media play has no silent cutscene fallback');

const silent = source.slice(
  source.indexOf('function continueCutsceneWithoutAudio('),
  source.indexOf('function retryCutsceneAudio('),
);
assert.ok(silent.includes('audioFailed = true'), 'silent fallback does not advance from the frame clock');
assert.ok(silent.includes('cutsceneEpoch = performance.now() - elapsed * 1000'),
  'silent fallback restarts or freezes the cutscene timeline');
assert.ok(source.includes('id="openingRetryAudio"') &&
  source.includes('id="openingContinueSilent"') &&
  source.includes('id="openingAudioSkip"'),
'the mobile audio notice does not expose audio, silent and skip choices');
assert.ok(source.includes("addEventListener('pointerup'"),
  'the audio notice still relies on a synthetic mobile click');

const gateStart = styles.indexOf('.opening-audio-gate {');
const gateEnd = styles.indexOf('\n}', gateStart);
const gate = styles.slice(gateStart, gateEnd);
assert.ok(gate.includes('pointer-events: none'), 'the audio notice still blocks the whole cutscene');
assert.ok(!gate.includes('inset: 0'), 'the audio notice is still a full-screen modal');
assert.match(styles, /\.opening-audio-gate button\s*\{[^}]*pointer-events:\s*auto/s,
  'the audio retry buttons cannot receive touch through the notice');

console.log('Opening mobile QA passed: audio starts before fullscreen and rejection cannot trap touch.');
