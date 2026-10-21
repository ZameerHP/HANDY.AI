import test from 'node:test';
import assert from 'node:assert/strict';
import { processImageEnhancement, DEFAULT_ENHANCEMENT_SETTINGS } from './image-enhance.ts';

test('Enhancement preserves pixel dimensions and channels', () => {
  const width = 4;
  const height = 4;
  const data = new Uint8ClampedArray(width * height * 4);
  // Fill with dummy pattern
  for (let i = 0; i < data.length; i += 4) {
    data[i] = 120;     // R
    data[i + 1] = 130; // G
    data[i + 2] = 140; // B
    data[i + 3] = 255; // A
  }

  const source = { width, height, data } as unknown as ImageData;
  const result = processImageEnhancement(source, DEFAULT_ENHANCEMENT_SETTINGS);

  assert.equal(result.width, width);
  assert.equal(result.height, height);
  assert.equal(result.data.length, data.length);
  // Alpha should remain 255
  assert.equal(result.data[3], 255);
});

test('Zero intensity yields identical output', () => {
  const width = 3;
  const height = 3;
  const data = new Uint8ClampedArray(width * height * 4);
  for (let i = 0; i < data.length; i += 4) {
    data[i] = 100;
    data[i + 1] = 100;
    data[i + 2] = 100;
    data[i + 3] = 255;
  }
  const source = { width, height, data } as unknown as ImageData;
  const result = processImageEnhancement(source, {
    ...DEFAULT_ENHANCEMENT_SETTINGS,
    masterIntensity: 0,
  });

  assert.equal(result.data[0], 100);
  assert.equal(result.data[1], 100);
  assert.equal(result.data[2], 100);
});
