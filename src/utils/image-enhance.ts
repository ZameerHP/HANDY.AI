/**
 * High-performance image enhancement algorithms for "Conventional Enhancement":
 * - Unsharp mask sharpening (Gaussian convolution + high-pass edge emphasis)
 * - Contrast & Brightness adjustment (with smooth S-curve)
 * - Color Balance & Temperature/Saturation
 * - Edge-preserving noise reduction (Bilateral filter approximation)
 * - Master intensity multiplier
 */

export interface EnhancementSettings {
  masterIntensity: number; // 0 to 200 (100 is default 1x)
  sharpening: number;      // 0 to 100
  contrast: number;        // -50 to 50
  brightness: number;      // -50 to 50
  denoise: number;         // 0 to 100
  colorBalance: number;    // -50 to 50 (warmth / coolness)
  vibrance: number;        // -50 to 50
}

export const DEFAULT_ENHANCEMENT_SETTINGS: EnhancementSettings = {
  masterIntensity: 100,
  sharpening: 35,
  contrast: 15,
  brightness: 5,
  denoise: 20,
  colorBalance: 0,
  vibrance: 10,
};

export interface RawImageData {
  width: number;
  height: number;
  data: Uint8ClampedArray;
}

export function createRawImageData(width: number, height: number, data?: Uint8ClampedArray): RawImageData {
  if (typeof globalThis.ImageData !== 'undefined') {
    return data ? new globalThis.ImageData(data as any, width, height) : new globalThis.ImageData(width, height);
  }
  return {
    width,
    height,
    data: data || new Uint8ClampedArray(width * height * 4),
  };
}

/**
 * Apply full image enhancement pipeline to an ImageData object.
 * Returns a new enhanced ImageData.
 */
export function processImageEnhancement(
  source: RawImageData,
  settings: EnhancementSettings = DEFAULT_ENHANCEMENT_SETTINGS
): RawImageData {
  const width = source.width;
  const height = source.height;
  const src = source.data;

  // Clone source data
  const output = createRawImageData(width, height, new Uint8ClampedArray(src));
  const dst = output.data;

  const master = Math.max(0, settings.masterIntensity / 100);

  const effSharpen = (settings.sharpening / 100) * master;
  const effContrast = (settings.contrast / 100) * master;
  const effBrightness = (settings.brightness / 100) * 128 * master;
  const effDenoise = (settings.denoise / 100) * master;
  const effWarmth = (settings.colorBalance / 100) * 40 * master;
  const effVibrance = (settings.vibrance / 100) * master;

  // Step 1: Denoise if enabled (Edge-preserving 3x3 bilateral filter)
  if (effDenoise > 0.05) {
    applyEdgePreservingDenoise(dst, width, height, effDenoise);
  }

  // Step 2: Unsharp Mask Sharpening if enabled
  if (effSharpen > 0.05) {
    applyUnsharpMask(dst, width, height, effSharpen);
  }

  // Step 3: Brightness, Contrast, Color Balance, Vibrance
  const contrastFactor = Math.tan(((effContrast * 45 + 45) * Math.PI) / 180);

  for (let i = 0; i < dst.length; i += 4) {
    let r = dst[i];
    let g = dst[i + 1];
    let b = dst[i + 2];

    // Brightness
    r += effBrightness;
    g += effBrightness;
    b += effBrightness;

    // Contrast around midtone 128
    r = (r - 128) * contrastFactor + 128;
    g = (g - 128) * contrastFactor + 128;
    b = (b - 128) * contrastFactor + 128;

    // Color balance / warmth (warm adds red/yellow, cool adds blue)
    if (effWarmth !== 0) {
      r += effWarmth;
      b -= effWarmth;
    }

    // Vibrance (selective saturation that protects skin tones)
    if (effVibrance !== 0) {
      const max = Math.max(r, g, b);
      const avg = (r + g + b) / 3;
      const amt = ((max - avg) / 255) * -effVibrance;
      r += (max - r) * amt;
      g += (max - g) * amt;
      b += (max - b) * amt;
    }

    dst[i] = r;
    dst[i + 1] = g;
    dst[i + 2] = b;
    // dst[i + 3] alpha unchanged
  }

  return output;
}

/**
 * Fast edge-preserving 3x3 bilateral smoothing
 */
function applyEdgePreservingDenoise(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  intensity: number
): void {
  const copy = new Uint8ClampedArray(data);
  const sigmaSpace = 1.5;
  const sigmaRange = 30 * (1 - intensity * 0.5);

  const rangeWeight = (diff: number) => Math.exp(-(diff * diff) / (2 * sigmaRange * sigmaRange));

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const centerIdx = (y * width + x) * 4;
      const cR = copy[centerIdx];
      const cG = copy[centerIdx + 1];
      const cB = copy[centerIdx + 2];

      let sumR = 0, sumG = 0, sumB = 0, totalW = 0;

      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const nIdx = ((y + dy) * width + (x + dx)) * 4;
          const nR = copy[nIdx];
          const nG = copy[nIdx + 1];
          const nB = copy[nIdx + 2];

          const distSq = dx * dx + dy * dy;
          const wSpace = Math.exp(-distSq / (2 * sigmaSpace * sigmaSpace));

          const colorDiff = (Math.abs(nR - cR) + Math.abs(nG - cG) + Math.abs(nB - cB)) / 3;
          const wRange = rangeWeight(colorDiff);

          const w = wSpace * wRange;
          sumR += nR * w;
          sumG += nG * w;
          sumB += nB * w;
          totalW += w;
        }
      }

      if (totalW > 0) {
        data[centerIdx] = cR * (1 - intensity) + (sumR / totalW) * intensity;
        data[centerIdx + 1] = cG * (1 - intensity) + (sumG / totalW) * intensity;
        data[centerIdx + 2] = cB * (1 - intensity) + (sumB / totalW) * intensity;
      }
    }
  }
}

/**
 * Unsharp mask: High-pass sharpening via 3x3 Gaussian subtraction
 */
function applyUnsharpMask(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  amount: number
): void {
  const copy = new Uint8ClampedArray(data);
  const strength = amount * 1.5;

  // 3x3 Gaussian kernel:
  // 1 2 1
  // 2 4 2  / 16
  // 1 2 1
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const centerIdx = (y * width + x) * 4;

      let blurR = 0, blurG = 0, blurB = 0;

      for (let dy = -1; dy <= 1; dy++) {
        const weightY = dy === 0 ? 2 : 1;
        for (let dx = -1; dx <= 1; dx++) {
          const weightX = dx === 0 ? 2 : 1;
          const w = weightX * weightY;
          const nIdx = ((y + dy) * width + (x + dx)) * 4;

          blurR += copy[nIdx] * w;
          blurG += copy[nIdx + 1] * w;
          blurB += copy[nIdx + 2] * w;
        }
      }

      blurR /= 16;
      blurG /= 16;
      blurB /= 16;

      const origR = copy[centerIdx];
      const origG = copy[centerIdx + 1];
      const origB = copy[centerIdx + 2];

      data[centerIdx] = origR + (origR - blurR) * strength;
      data[centerIdx + 1] = origG + (origG - blurG) * strength;
      data[centerIdx + 2] = origB + (origB - blurB) * strength;
    }
  }
}
