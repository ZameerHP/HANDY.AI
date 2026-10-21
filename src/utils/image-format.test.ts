import test from 'node:test';
import assert from 'node:assert/strict';
import { detectFormatByMagicBytes, encodeBmp, encodeIcoFromPng } from './image-format.ts';

test('Detect JPEG by magic bytes FF D8 FF', () => {
  const bytes = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10]);
  assert.equal(detectFormatByMagicBytes(bytes), 'jpeg');
});

test('Detect PNG by magic bytes 89 50 4E 47 0D 0A 1A 0A', () => {
  const bytes = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  assert.equal(detectFormatByMagicBytes(bytes), 'png');
});

test('Detect GIF89a by magic bytes', () => {
  const bytes = new Uint8Array([0x47, 0x49, 0x46, 0x38, 0x39, 0x61]);
  assert.equal(detectFormatByMagicBytes(bytes), 'gif');
});

test('Detect BMP by magic bytes 42 4D', () => {
  const bytes = new Uint8Array([0x42, 0x4d, 0x00, 0x00]);
  assert.equal(detectFormatByMagicBytes(bytes), 'bmp');
});

test('Detect WebP by RIFF and WEBP', () => {
  const bytes = new Uint8Array([
    0x52, 0x49, 0x46, 0x46,
    0x00, 0x00, 0x00, 0x00,
    0x57, 0x45, 0x42, 0x50,
  ]);
  assert.equal(detectFormatByMagicBytes(bytes), 'webp');
});

test('Reject unknown or corrupted headers', () => {
  const bytes = new Uint8Array([0x00, 0x01, 0x02, 0x03]);
  assert.equal(detectFormatByMagicBytes(bytes), 'unknown');
});

test('BMP binary encoder creates valid BM header and 54-byte DIB header', () => {
  // 2x2 mock ImageData
  const mockImageData = {
    width: 2,
    height: 2,
    data: new Uint8ClampedArray([
      255, 0, 0, 255,   0, 255, 0, 255,
      0, 0, 255, 255,   255, 255, 255, 255,
    ]),
  } as unknown as ImageData;

  const bmp = encodeBmp(mockImageData);
  // 'BM' magic bytes
  assert.equal(bmp[0], 0x42);
  assert.equal(bmp[1], 0x4d);
  // Offset to pixels is 54 (byte 10 = 54)
  assert.equal(bmp[10], 54);
});

test('ICO binary encoder creates valid ICO header and ICONDIRENTRY', () => {
  const mockPng = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const ico = encodeIcoFromPng(mockPng, 32, 32);

  // ICO magic header: 00 00 01 00
  assert.equal(ico[0], 0);
  assert.equal(ico[1], 0);
  assert.equal(ico[2], 1);
  assert.equal(ico[3], 0);

  // Entry width/height
  assert.equal(ico[6], 32);
  assert.equal(ico[7], 32);

  // Total size = 6 + 16 + 8 = 30 bytes
  assert.equal(ico.length, 30);
});
