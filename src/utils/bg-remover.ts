/**
 * AI Background Remover & Alpha Matte Refinement Pipeline.
 * Includes:
 * - Edge-aware feathering & softness
 * - Matte thresholding
 * - Morphological erosion / dilation
 * - Background color decontamination (defringing)
 * - Stray island removal (connected component cleanup)
 * - Model pipeline runner via Transformers.js with WebGPU/WASM fallback
 */

export interface MatteRefinementOptions {
  threshold: number;      // 0 to 255 (cutoff threshold)
  feather: number;        // 0 to 20 (softness radius)
  erodeDilate: number;    // -10 to 10 (negative = erode, positive = dilate)
  decontaminate: number;  // 0 to 100 (strength of edge color decontamination)
  removeIslands: boolean; // Clean disconnected small noise specks
}

export const DEFAULT_MATTE_OPTIONS: MatteRefinementOptions = {
  threshold: 128,
  feather: 2,
  erodeDilate: 0,
  decontaminate: 60,
  removeIslands: true,
};

/**
 * Refines an alpha matte array (Uint8Array of size width * height) with edge-aware post-processing.
 */
export function refineAlphaMatte(
  matte: Uint8Array,
  width: number,
  height: number,
  options: MatteRefinementOptions
): Uint8Array {
  let current: any = new Uint8Array(matte);

  // 1. Thresholding
  if (options.threshold !== 128) {
    const thresh = options.threshold;
    for (let i = 0; i < current.length; i++) {
      if (current[i] < thresh - 30) current[i] = 0;
      else if (current[i] > thresh + 30) current[i] = 255;
      else {
        // Smooth transition in boundary
        current[i] = Math.round(((current[i] - (thresh - 30)) / 60) * 255);
      }
    }
  }

  // 2. Morphological Erode or Dilate
  if (options.erodeDilate !== 0) {
    const isErode = options.erodeDilate < 0;
    const radius = Math.min(10, Math.abs(options.erodeDilate));
    current = applyMorphology(current, width, height, radius, isErode) as Uint8Array;
  }

  // 3. Remove small stray islands if enabled
  if (options.removeIslands) {
    current = filterSmallIslands(current, width, height, 40) as Uint8Array;
  }

  // 4. Edge feathering / smoothing
  if (options.feather > 0) {
    current = applyBoxFeather(current, width, height, Math.min(15, options.feather)) as Uint8Array;
  }

  return current;
}

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
 * Combines original image RGB with refined alpha matte, applying color decontamination (defringing).
 */
export function applyMatteToImage(
  sourceImage: RawImageData,
  refinedMatte: Uint8Array,
  decontaminateStrength: number = 60
): RawImageData {
  const width = sourceImage.width;
  const height = sourceImage.height;
  const src = sourceImage.data;

  const result = createRawImageData(width, height);
  const dst = result.data;

  const decontamFactor = Math.min(1, Math.max(0, decontaminateStrength / 100));

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const mIdx = y * width + x;
      const alpha = refinedMatte[mIdx];

      let r = src[idx];
      let g = src[idx + 1];
      let b = src[idx + 2];

      // Color decontamination: on semi-transparent transition edges,
      // background light bleeds into foreground hair/edges.
      // We sample inward toward the opaque foreground to replace fringe colors.
      if (decontamFactor > 0 && alpha > 10 && alpha < 240) {
        // Look 2 pixels around for highest alpha neighbor
        let bestAlpha = alpha;
        let bestR = r, bestG = g, bestB = b;

        for (let dy = -2; dy <= 2; dy += 2) {
          const ny = y + dy;
          if (ny < 0 || ny >= height) continue;
          for (let dx = -2; dx <= 2; dx += 2) {
            const nx = x + dx;
            if (nx < 0 || nx >= width) continue;
            const nAlpha = refinedMatte[ny * width + nx];
            if (nAlpha > bestAlpha) {
              bestAlpha = nAlpha;
              const nIdx = (ny * width + nx) * 4;
              bestR = src[nIdx];
              bestG = src[nIdx + 1];
              bestB = src[nIdx + 2];
            }
          }
        }

        if (bestAlpha > alpha + 30) {
          r = Math.round(r * (1 - decontamFactor) + bestR * decontamFactor);
          g = Math.round(g * (1 - decontamFactor) + bestG * decontamFactor);
          b = Math.round(b * (1 - decontamFactor) + bestB * decontamFactor);
        }
      }

      dst[idx] = r;
      dst[idx + 1] = g;
      dst[idx + 2] = b;
      dst[idx + 3] = alpha;
    }
  }

  return result;
}

/**
 * Morphological Erode or Dilate on 8-bit alpha mask
 */
function applyMorphology(
  input: Uint8Array,
  width: number,
  height: number,
  radius: number,
  isErode: boolean
): Uint8Array {
  const output = new Uint8Array(input.length);
  const r = Math.round(radius);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let extreme = isErode ? 255 : 0;
      for (let dy = -r; dy <= r; dy++) {
        const ny = y + dy;
        if (ny < 0 || ny >= height) continue;
        for (let dx = -r; dx <= r; dx++) {
          const nx = x + dx;
          if (nx < 0 || nx >= width) continue;
          const val = input[ny * width + nx];
          if (isErode) {
            if (val < extreme) extreme = val;
          } else {
            if (val > extreme) extreme = val;
          }
        }
      }
      output[y * width + x] = extreme;
    }
  }

  return output;
}

/**
 * Filter out disconnected stray islands smaller than minPixels
 */
function filterSmallIslands(
  input: Uint8Array,
  width: number,
  height: number,
  minPixels: number
): Uint8Array {
  const output = new Uint8Array(input);
  const visited = new Uint8Array(input.length);

  // Fast flood fill to find small components
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      if (input[idx] > 30 && !visited[idx]) {
        // Collect connected pixels
        const stack: number[] = [idx];
        visited[idx] = 1;
        const component: number[] = [];

        while (stack.length > 0 && component.length < minPixels + 10) {
          const curr = stack.pop()!;
          component.push(curr);
          const cy = Math.floor(curr / width);
          const cx = curr % width;

          const neighbors = [
            cy > 0 ? (cy - 1) * width + cx : -1,
            cy < height - 1 ? (cy + 1) * width + cx : -1,
            cx > 0 ? cy * width + (cx - 1) : -1,
            cx < width - 1 ? cy * width + (cx + 1) : -1,
          ];

          for (const n of neighbors) {
            if (n >= 0 && input[n] > 30 && !visited[n]) {
              visited[n] = 1;
              stack.push(n);
            }
          }
        }

        // If isolated speck is small, zero it out
        if (component.length < minPixels) {
          for (const p of component) {
            output[p] = 0;
          }
        }
      }
    }
  }

  return output;
}

/**
 * Box blur feathering for gentle alpha transitions
 */
function applyBoxFeather(
  input: Uint8Array,
  width: number,
  height: number,
  radius: number
): Uint8Array {
  const output = new Uint8Array(input.length);
  const r = Math.round(radius);
  const windowSize = (2 * r + 1) * (2 * r + 1);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const currentVal = input[y * width + x];
      // Only blur near edges to preserve solid interior and exterior
      if (currentVal === 0 || currentVal === 255) {
        // Check if pure interior
        let hasVariance = false;
        if (x > r && x < width - r && y > r && y < height - r) {
          if (
            input[y * width + (x - r)] !== currentVal ||
            input[y * width + (x + r)] !== currentVal ||
            input[(y - r) * width + x] !== currentVal ||
            input[(y + r) * width + x] !== currentVal
          ) {
            hasVariance = true;
          }
        } else {
          hasVariance = true;
        }

        if (!hasVariance) {
          output[y * width + x] = currentVal;
          continue;
        }
      }

      let sum = 0;
      let count = 0;
      for (let dy = -r; dy <= r; dy++) {
        const ny = y + dy;
        if (ny < 0 || ny >= height) continue;
        for (let dx = -r; dx <= r; dx++) {
          const nx = x + dx;
          if (nx < 0 || nx >= width) continue;
          sum += input[ny * width + nx];
          count++;
        }
      }
      output[y * width + x] = Math.round(sum / (count || windowSize));
    }
  }

  return output;
}
