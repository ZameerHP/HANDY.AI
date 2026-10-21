/**
 * Universal Image Format Converter utilities:
 * Magic byte detection, runtime format support detection, BMP encoder, ICO encoder.
 */

export interface ImageFormatInfo {
  format: 'jpeg' | 'png' | 'webp' | 'avif' | 'bmp' | 'ico' | 'gif' | 'unknown';
  mimeType: string;
  label: string;
  isLossy?: boolean;
  supportsAlpha?: boolean;
  canAnimate?: boolean;
}

export const FORMAT_DEFINITIONS: Record<string, ImageFormatInfo> = {
  jpeg: { format: 'jpeg', mimeType: 'image/jpeg', label: 'JPEG (.jpg)', isLossy: true, supportsAlpha: false },
  png: { format: 'png', mimeType: 'image/png', label: 'PNG (.png)', isLossy: false, supportsAlpha: true },
  webp: { format: 'webp', mimeType: 'image/webp', label: 'WebP (.webp)', isLossy: true, supportsAlpha: true, canAnimate: true },
  avif: { format: 'avif', mimeType: 'image/avif', label: 'AVIF (.avif)', isLossy: true, supportsAlpha: true },
  bmp: { format: 'bmp', mimeType: 'image/bmp', label: 'BMP (.bmp)', isLossy: false, supportsAlpha: false },
  ico: { format: 'ico', mimeType: 'image/x-icon', label: 'ICO (.ico)', isLossy: false, supportsAlpha: true },
  gif: { format: 'gif', mimeType: 'image/gif', label: 'GIF (.gif)', isLossy: false, supportsAlpha: true, canAnimate: true },
};

/**
 * Detect image format using magic bytes header inspection.
 */
export function detectFormatByMagicBytes(buffer: Uint8Array): ImageFormatInfo['format'] {
  if (!buffer || buffer.length < 4) return 'unknown';

  // JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return 'jpeg';
  }

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer.length >= 8 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return 'png';
  }

  // GIF: GIF87a or GIF89a (47 49 46 38 37/39 61)
  if (
    buffer.length >= 6 &&
    buffer[0] === 0x47 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x38 &&
    (buffer[4] === 0x37 || buffer[4] === 0x39) &&
    buffer[5] === 0x61
  ) {
    return 'gif';
  }

  // BMP: 42 4D ('BM')
  if (buffer[0] === 0x42 && buffer[1] === 0x4d) {
    return 'bmp';
  }

  // ICO: 00 00 01 00
  if (buffer[0] === 0x00 && buffer[1] === 0x00 && buffer[2] === 0x01 && buffer[3] === 0x00) {
    return 'ico';
  }

  // WebP: RIFF ... WEBP
  if (
    buffer.length >= 12 &&
    buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46 &&
    buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50
  ) {
    return 'webp';
  }

  // AVIF: ftypavif or ftypavis
  if (buffer.length >= 12) {
    // Look for 'ftyp' at offset 4
    if (buffer[4] === 0x66 && buffer[5] === 0x74 && buffer[6] === 0x79 && buffer[7] === 0x70) {
      const brand = String.fromCharCode(buffer[8], buffer[9], buffer[10], buffer[11]);
      if (brand === 'avif' || brand === 'avis' || brand === 'mif1') {
        return 'avif';
      }
    }
  }

  return 'unknown';
}

/**
 * Checks if a GIF or WebP buffer contains multiple frames.
 */
export function checkAnimationInFile(buffer: Uint8Array, format: string): boolean {
  if (format === 'gif') {
    // Look for multiple Graphic Control Extensions (0x21, 0xF9)
    let gceCount = 0;
    for (let i = 0; i < buffer.length - 2; i++) {
      if (buffer[i] === 0x21 && buffer[i + 1] === 0xf9) {
        gceCount++;
        if (gceCount > 1) return true;
      }
    }
    return false;
  }

  if (format === 'webp') {
    // Look for ANIM chunk in WebP
    for (let i = 12; i < buffer.length - 4; i++) {
      if (
        buffer[i] === 0x41 && // 'A'
        buffer[i + 1] === 0x4e && // 'N'
        buffer[i + 2] === 0x49 && // 'I'
        buffer[i + 3] === 0x4d // 'M'
      ) {
        return true;
      }
    }
    return false;
  }

  return false;
}

/**
 * Encode raw ImageData (RGBA) into standard 24-bit/32-bit BMP binary buffer.
 */
export function encodeBmp(imageData: ImageData, fillAlphaWithColor?: [number, number, number]): Uint8Array {
  const width = imageData.width;
  const height = imageData.height;
  const data = imageData.data;

  // 24-bit BMP row must be padded to a multiple of 4 bytes
  const rowSize = Math.floor((24 * width + 31) / 32) * 4;
  const imageSize = rowSize * height;
  const fileSize = 54 + imageSize; // 14 byte file header + 40 byte DIB header

  const buffer = new ArrayBuffer(fileSize);
  const view = new DataView(buffer);
  const bytes = new Uint8Array(buffer);

  // Bitmap File Header (14 bytes)
  view.setUint16(0, 0x424d, false); // 'BM'
  view.setUint32(2, fileSize, true);
  view.setUint16(6, 0, true);
  view.setUint16(8, 0, true);
  view.setUint32(10, 54, true); // Offset to pixel data

  // DIB Header (BITMAPINFOHEADER - 40 bytes)
  view.setUint32(14, 40, true);
  view.setInt32(18, width, true);
  view.setInt32(22, height, true); // Bottom-up
  view.setUint16(26, 1, true); // Color planes
  view.setUint16(28, 24, true); // 24 bits per pixel
  view.setUint32(30, 0, true); // BI_RGB (uncompressed)
  view.setUint32(34, imageSize, true);
  view.setInt32(38, 2835, true); // 72 DPI (2835 pixels/meter)
  view.setInt32(42, 2835, true);
  view.setUint32(46, 0, true);
  view.setUint32(50, 0, true);

  const fillR = fillAlphaWithColor ? fillAlphaWithColor[0] : 255;
  const fillG = fillAlphaWithColor ? fillAlphaWithColor[1] : 255;
  const fillB = fillAlphaWithColor ? fillAlphaWithColor[2] : 255;

  let offset = 54;
  // BMP stores rows bottom to top
  for (let y = height - 1; y >= 0; y--) {
    const rowOffset = offset;
    for (let x = 0; x < width; x++) {
      const srcIdx = (y * width + x) * 4;
      const a = data[srcIdx + 3] / 255;
      const r = Math.round(data[srcIdx] * a + fillR * (1 - a));
      const g = Math.round(data[srcIdx + 1] * a + fillG * (1 - a));
      const b = Math.round(data[srcIdx + 2] * a + fillB * (1 - a));

      // BMP 24-bit is BGR
      bytes[offset++] = b;
      bytes[offset++] = g;
      bytes[offset++] = r;
    }
    // Pad row to multiple of 4 bytes
    const rowBytesWritten = offset - rowOffset;
    const padding = (4 - (rowBytesWritten % 4)) % 4;
    for (let p = 0; p < padding; p++) {
      bytes[offset++] = 0;
    }
  }

  return bytes;
}

/**
 * Creates a valid Windows ICO file from PNG image bytes.
 * Windows Vista+ standard supports embedding PNG directly in ICO container.
 */
export function encodeIcoFromPng(pngBytes: Uint8Array, width: number, height: number): Uint8Array {
  // ICO header: 6 bytes
  // ICONDIRENTRY: 16 bytes
  // Payload: pngBytes.length
  const totalSize = 6 + 16 + pngBytes.length;
  const buffer = new ArrayBuffer(totalSize);
  const view = new DataView(buffer);
  const output = new Uint8Array(buffer);

  // ICONDIR header
  view.setUint16(0, 0, true); // Reserved (0)
  view.setUint16(2, 1, true); // Image type: 1 = ICO
  view.setUint16(4, 1, true); // Number of images: 1

  // ICONDIRENTRY
  // Width & height (0 means 256)
  output[6] = width >= 256 ? 0 : width;
  output[7] = height >= 256 ? 0 : height;
  output[8] = 0; // Number of colors in color palette (0 for truecolor)
  output[9] = 0; // Reserved
  view.setUint16(10, 1, true); // Color planes
  view.setUint16(12, 32, true); // Bits per pixel (32-bit RGBA)
  view.setUint32(14, pngBytes.length, true); // Size of image data
  view.setUint32(18, 22, true); // Offset of image data (6 + 16 = 22)

  // Copy PNG image data
  output.set(pngBytes, 22);

  return output;
}

/**
 * Runtime detection of supported canvas export formats.
 */
export function detectSupportedCanvasEncoders(): Record<string, boolean> {
  if (typeof document === 'undefined') {
    return {
      jpeg: true,
      png: true,
      webp: true,
      avif: false,
      bmp: true,
      ico: true,
    };
  }

  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;

  const testMime = (mime: string) => {
    try {
      const dataUrl = canvas.toDataURL(mime);
      return dataUrl.startsWith(`data:${mime}`);
    } catch {
      return false;
    }
  };

  return {
    png: testMime('image/png'),
    jpeg: testMime('image/jpeg'),
    webp: testMime('image/webp'),
    avif: testMime('image/avif'),
    bmp: true, // Custom binary encoder works everywhere
    ico: true, // Custom binary ICO container works everywhere
  };
}
