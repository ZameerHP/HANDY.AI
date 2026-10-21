import test from 'node:test';
import assert from 'node:assert/strict';
import { refineAlphaMatte, applyMatteToImage, DEFAULT_MATTE_OPTIONS } from './bg-remover.ts';

test('Alpha matte thresholding sets extreme values cleanly', () => {
  const width = 4;
  const height = 4;
  const matte = new Uint8Array([
    0, 20, 50, 80,
    100, 128, 150, 180,
    200, 220, 240, 255,
    10, 30, 210, 250,
  ]);

  const refined = refineAlphaMatte(matte, width, height, {
    ...DEFAULT_MATTE_OPTIONS,
    threshold: 128,
    feather: 0,
    erodeDilate: 0,
    removeIslands: false,
  });

  assert.equal(refined.length, matte.length);
  assert.equal(refined[0], 0);
  assert.equal(refined[11], 255);
});

test('Applying matte creates valid RGBA ImageData with alpha mapped from matte', () => {
  const width = 2;
  const height = 2;
  const sourceImage = {
    width,
    height,
    data: new Uint8ClampedArray([
      255, 0, 0, 255,   0, 255, 0, 255,
      0, 0, 255, 255,   255, 255, 255, 255,
    ]),
  } as unknown as ImageData;

  const matte = new Uint8Array([0, 128, 200, 255]);
  const result = applyMatteToImage(sourceImage, matte, 0);

  assert.equal(result.data[3], 0);    // Pixel 0 alpha
  assert.equal(result.data[7], 128);  // Pixel 1 alpha
  assert.equal(result.data[11], 200); // Pixel 2 alpha
  assert.equal(result.data[15], 255); // Pixel 3 alpha
});
