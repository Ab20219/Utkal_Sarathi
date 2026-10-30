import test from 'node:test';
import assert from 'node:assert/strict';
import {
  isRiffWavContainer,
  wrapPcm16InWavHeader,
} from './unifiedVoicePipeline';

test('isRiffWavContainer detects genuine WAV header and rejects non-WAV data', () => {
  // Synthesize a valid RIFF WAVE header in base64
  const headerBuf = Buffer.alloc(44);
  headerBuf.write('RIFF', 0, 'ascii');
  headerBuf.writeUInt32LE(36, 4);
  headerBuf.write('WAVE', 8, 'ascii');
  headerBuf.write('fmt ', 12, 'ascii');
  headerBuf.writeUInt32LE(16, 16);
  headerBuf.writeUInt16LE(1, 20); // PCM
  headerBuf.writeUInt16LE(1, 22); // Mono
  headerBuf.writeUInt32LE(24000, 24); // 24kHz
  headerBuf.writeUInt32LE(48000, 28); // byte rate
  headerBuf.writeUInt16LE(2, 32); // block align
  headerBuf.writeUInt16LE(16, 34); // 16-bit
  headerBuf.write('data', 36, 'ascii');
  headerBuf.writeUInt32LE(0, 40);

  const validWavBase64 = headerBuf.toString('base64');
  assert.equal(isRiffWavContainer(validWavBase64), true, 'Must detect valid RIFF WAVE container');

  // Raw PCM data (arbitrary bytes without RIFF header)
  const rawPcm = Buffer.from([0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08]).toString('base64');
  assert.equal(isRiffWavContainer(rawPcm), false, 'Must reject raw PCM without RIFF header');

  // Empty string
  assert.equal(isRiffWavContainer(''), false, 'Must reject empty string');
});

test('wrapPcm16InWavHeader constructs valid WAV container for raw PCM', () => {
  // 100 samples of 16-bit PCM = 200 bytes
  const rawPcm = Buffer.alloc(200);
  for (let i = 0; i < 200; i++) rawPcm[i] = i % 256;
  const rawBase64 = rawPcm.toString('base64');

  const dataUri = wrapPcm16InWavHeader(rawBase64, 24000);
  assert.ok(dataUri.startsWith('data:audio/wav;base64,'), 'Must return audio/wav data URI');

  const base64Part = dataUri.replace('data:audio/wav;base64,', '');
  const decoded = Buffer.from(base64Part, 'base64');

  // Total length must be 44-byte header + 200 bytes payload = 244 bytes
  assert.equal(decoded.length, 244, 'Total WAV length must be 44 header + 200 payload');
  assert.equal(decoded.subarray(0, 4).toString('ascii'), 'RIFF');
  assert.equal(decoded.subarray(8, 12).toString('ascii'), 'WAVE');
  assert.equal(decoded.readUInt32LE(24), 24000, 'Sample rate must be 24000');
  assert.equal(decoded.readUInt16LE(22), 1, 'Channel count must be 1 (mono)');
  assert.equal(decoded.readUInt16LE(34), 16, 'Bit depth must be 16-bit');
  assert.equal(decoded.readUInt32LE(40), 200, 'data subchunk size must be 200 bytes');
});

test('wrapPcm16InWavHeader is idempotent and never double-wraps existing WAV audio', () => {
  const headerBuf = Buffer.alloc(44);
  headerBuf.write('RIFF', 0, 'ascii');
  headerBuf.writeUInt32LE(44, 4);
  headerBuf.write('WAVE', 8, 'ascii');
  const existingWavBase64 = headerBuf.toString('base64');

  const resultUri = wrapPcm16InWavHeader(existingWavBase64, 24000);
  assert.equal(resultUri, `data:audio/wav;base64,${existingWavBase64}`, 'Must not double-wrap WAV container');
});
