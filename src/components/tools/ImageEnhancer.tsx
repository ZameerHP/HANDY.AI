import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  EnhancementSettings,
  processImageEnhancement,
  createRawImageData,
} from '../../utils/image-enhance';

interface PresetOption {
  id: 'auto' | 'clarity' | 'portrait';
  name: string;
  tagline: string;
  description: string;
  settings: EnhancementSettings;
}

const ENHANCE_PRESETS: PresetOption[] = [
  {
    id: 'auto',
    name: 'Smart Auto-Balance',
    tagline: 'Recommended for all general photos',
    description: 'Intelligent multi-stage calibration: unsharp mask edge enhancement, dynamic luminance leveling, and bilateral noise cleanup.',
    settings: {
      masterIntensity: 100,
      sharpening: 40,
      contrast: 15,
      brightness: 6,
      denoise: 25,
      colorBalance: 0,
      vibrance: 12,
    },
  },
  {
    id: 'clarity',
    name: 'High Clarity & Micro-Detail',
    tagline: 'Best for textures, landscapes, architecture',
    description: 'Higher frequency high-pass filtering to restore lost edge definition, fine fabric weave, and optical micro-contrast.',
    settings: {
      masterIntensity: 100,
      sharpening: 65,
      contrast: 22,
      brightness: 4,
      denoise: 15,
      colorBalance: 0,
      vibrance: 10,
    },
  },
  {
    id: 'portrait',
    name: 'Portrait & Noise Reduction',
    tagline: 'Best for people, pets, high-ISO low light',
    description: 'Edge-preserving smoothing that eliminates camera sensor grain while maintaining eyelash definition and natural tones.',
    settings: {
      masterIntensity: 100,
      sharpening: 25,
      contrast: 10,
      brightness: 8,
      denoise: 45,
      colorBalance: 3,
      vibrance: 8,
    },
  },
];

export const ImageEnhancer: React.FC = () => {
  const [selectedPreset, setSelectedPreset] = useState<'auto' | 'clarity' | 'portrait'>('auto');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [processedUrl, setProcessedUrl] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [sliderPosition, setSliderPosition] = useState<number>(50); // 0 to 100
  const [exportFormat, setExportFormat] = useState<'png' | 'jpeg' | 'webp'>('png');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef<boolean>(false);

  // Clean up Object URLs
  useEffect(() => {
    return () => {
      if (originalUrl) URL.revokeObjectURL(originalUrl);
      if (processedUrl) URL.revokeObjectURL(processedUrl);
    };
  }, [originalUrl, processedUrl]);

  const runEnhance = useCallback(
    async (img: HTMLImageElement, settings: EnhancementSettings) => {
      setIsProcessing(true);
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) throw new Error('Canvas 2D rendering unavailable');

        let w = img.naturalWidth;
        let h = img.naturalHeight;
        const maxDim = 3840;
        if (w > maxDim || h > maxDim) {
          const ratio = Math.min(maxDim / w, maxDim / h);
          w = Math.round(w * ratio);
          h = Math.round(h * ratio);
        }

        canvas.width = w;
        canvas.height = h;
        ctx.drawImage(img, 0, 0, w, h);

        const imgData = ctx.getImageData(0, 0, w, h);
        const raw = createRawImageData(w, h, imgData.data);

        // Run pure enhancement pipeline
        const enhanced = processImageEnhancement(raw, settings);

        const outImgData = new ImageData(enhanced.data as any, w, h);
        ctx.putImageData(outImgData, 0, 0);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              if (processedUrl) URL.revokeObjectURL(processedUrl);
              const pUrl = URL.createObjectURL(blob);
              setProcessedUrl(pUrl);
            }
            setIsProcessing(false);
          },
          exportFormat === 'jpeg' ? 'image/jpeg' : exportFormat === 'webp' ? 'image/webp' : 'image/png',
          0.94
        );
      } catch (err: any) {
        setErrorMessage(err.message || 'Enhancement failed.');
        setIsProcessing(false);
      }
    },
    [processedUrl, exportFormat]
  );

  const handleImageSelect = (file: File) => {
    if (file.size > 50 * 1024 * 1024) {
      setErrorMessage('Image exceeds safe 50 MB memory threshold.');
      return;
    }

    setErrorMessage(null);
    setImageFile(file);
    if (originalUrl) URL.revokeObjectURL(originalUrl);
    if (processedUrl) URL.revokeObjectURL(processedUrl);
    setProcessedUrl(null);

    const url = URL.createObjectURL(file);
    setOriginalUrl(url);

    const img = new Image();
    img.onload = () => {
      setDimensions({ width: img.naturalWidth, height: img.naturalHeight });
      const preset = ENHANCE_PRESETS.find((p) => p.id === selectedPreset)!;
      runEnhance(img, preset.settings);
    };
    img.src = url;
  };

  // Re-run when preset changes
  useEffect(() => {
    if (!originalUrl) return;
    const img = new Image();
    img.onload = () => {
      const preset = ENHANCE_PRESETS.find((p) => p.id === selectedPreset)!;
      runEnhance(img, preset.settings);
    };
    img.src = originalUrl;
  }, [selectedPreset, originalUrl, runEnhance]);

  // Pointer drag for comparison slider
  const handlePointerDown = (e: React.PointerEvent) => {
    isDraggingRef.current = true;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    setSliderPosition((x / rect.width) * 100);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    isDraggingRef.current = false;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // Ignore
    }
  };

  const handleDownload = () => {
    if (!processedUrl || !dimensions) return;
    const a = document.createElement('a');
    a.href = processedUrl;
    const ext = exportFormat === 'jpeg' ? 'jpg' : exportFormat;
    const baseName = imageFile?.name.replace(/\.[^/.]+$/, '') || 'enhanced';
    a.download = `${baseName}_enhanced_${selectedPreset}.${ext}`;
    a.click();
  };

  return (
    <div className="w-full">
      {/* Title & Introduction */}
      <div className="mb-10">
        <h1 className="text-[36px] sm:text-[44px] font-normal text-[#EAF2F4] tracking-tight leading-tight">
          Image Quality Enhancer
        </h1>
        <p className="mt-3 text-[17px] text-[#8FA3AB] max-w-3xl leading-relaxed">
          One-click automatic photo enhancement. Sharpen soft contours, eliminate sensor noise, and calibrate dynamic range with 100% in-browser mathematical convolution.
        </p>
      </div>

      {/* Main Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Interactive Preview Frame (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {!originalUrl ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (e.dataTransfer.files?.[0]) handleImageSelect(e.dataTransfer.files[0]);
              }}
              className="w-full aspect-[4/3] min-h-[420px] border-2 border-dashed border-[rgba(255,255,255,0.12)] hover:border-[#5EC4BA]/50 rounded-[10px] flex flex-col items-center justify-center p-8 text-center cursor-pointer bg-[#0A1218]/80 hover:bg-[#0F1A22] transition-all group"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) handleImageSelect(e.target.files[0]);
                }}
              />
              <div className="w-14 h-14 rounded-[14px] bg-[#0F1A22] border border-[rgba(255,255,255,0.08)] group-hover:border-[#5EC4BA]/40 flex items-center justify-center mb-4 transition-colors">
                <svg
                  className="w-6 h-6 text-[#5EC4BA]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="1.75"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
              </div>
              <div className="text-[#EAF2F4] text-lg font-normal">
                Choose an image to auto-enhance
              </div>
              <p className="mt-2 text-sm text-[#8FA3AB]">
                Drag and drop JPG, PNG, or WebP (up to 50 MB)
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Draggable Split Comparison Container */}
              <div
                ref={containerRef}
                onPointerMove={handlePointerMove}
                className="relative w-full aspect-[4/3] bg-[#05090D] rounded-[10px] overflow-hidden select-none touch-none border border-[rgba(255,255,255,0.08)]"
              >
                {/* Background: Original Image */}
                <img
                  src={originalUrl}
                  alt="Original photo"
                  className="absolute inset-0 w-full h-full object-contain pointer-events-none"
                />

                {/* Foreground: Enhanced Image (clipped by slider) */}
                {processedUrl && (
                  <div
                    className="absolute inset-0 h-full overflow-hidden pointer-events-none"
                    style={{ width: `${sliderPosition}%` }}
                  >
                    <img
                      src={processedUrl}
                      alt="Enhanced photo"
                      className="absolute top-0 left-0 max-w-none h-full object-contain"
                      style={{
                        width: containerRef.current?.clientWidth || '100%',
                      }}
                    />
                  </div>
                )}

                {/* Vertical Divider Handle */}
                <div
                  onPointerDown={handlePointerDown}
                  onPointerUp={handlePointerUp}
                  className="absolute top-0 bottom-0 w-0.5 bg-[#5EC4BA] cursor-ew-resize flex items-center justify-center shadow-lg"
                  style={{ left: `calc(${sliderPosition}% - 1px)` }}
                >
                  <div className="w-7 h-7 rounded-full bg-[#5EC4BA] text-[#05090D] flex items-center justify-center shadow-md">
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      aria-hidden="true"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 9l-3 3 3 3m8-6l3 3-3 3" />
                    </svg>
                  </div>
                </div>

                {/* Badges */}
                <div className="absolute top-4 left-4 bg-[#05090D]/80 backdrop-blur-md px-3 py-1 rounded-[6px] text-xs font-mono text-[#5EC4BA] border border-[#5EC4BA]/20 pointer-events-none">
                  Enhanced
                </div>
                <div className="absolute top-4 right-4 bg-[#05090D]/80 backdrop-blur-md px-3 py-1 rounded-[6px] text-xs font-mono text-[#8FA3AB] border border-white/10 pointer-events-none">
                  Original
                </div>

                {/* Processing Overlay */}
                {isProcessing && (
                  <div className="absolute bottom-4 right-4 bg-[#0A1218]/90 backdrop-blur-md px-3.5 py-2 rounded-[8px] text-xs text-[#EAF2F4] flex items-center gap-2 border border-white/10">
                    <span className="w-2 h-2 rounded-full bg-[#5EC4BA] animate-ping" />
                    Processing enhancement...
                  </div>
                )}
              </div>

              {/* Image metadata bar */}
              {dimensions && (
                <div className="flex flex-wrap items-center justify-between text-xs text-[#8FA3AB] px-1 pt-1">
                  <span>
                    Resolution: <strong className="text-[#EAF2F4] font-mono">{dimensions.width} × {dimensions.height} px</strong> ({((dimensions.width * dimensions.height) / 1e6).toFixed(1)} MP)
                  </span>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="hover:text-[#5EC4BA] transition-colors underline"
                  >
                    Select different photo
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files?.[0]) handleImageSelect(e.target.files[0]);
                    }}
                  />
                </div>
              )}
            </div>
          )}

          {errorMessage && (
            <p className="text-xs text-[#ad5f5a] px-1">{errorMessage}</p>
          )}
        </div>

        {/* Right: Presets & Instant Download (4 cols) */}
        <div className="lg:col-span-4 p-7 sm:p-8 rounded-[10px] bg-[#0A1218] border border-[rgba(255,255,255,0.08)] space-y-6">
          <div>
            <div className="text-[12px] font-medium tracking-[0.08em] uppercase text-[#5EC4BA] mb-1">
              AUTOMATIC PROFILE
            </div>
            <h2 className="text-[20px] font-normal text-[#EAF2F4]">
              Enhancement Preset
            </h2>
            <p className="text-xs text-[#8FA3AB] mt-1 leading-relaxed">
              Auto-calibrated filters applied with zero manual slider tweaking.
            </p>
          </div>

          {/* 3 Clear One-Click Presets */}
          <div className="space-y-3">
            {ENHANCE_PRESETS.map((preset) => {
              const isSelected = selectedPreset === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => setSelectedPreset(preset.id)}
                  className={`w-full text-left p-4 rounded-[10px] border transition-all duration-200 ${
                    isSelected
                      ? 'bg-[#0F1A22] border-[#5EC4BA] shadow-[0_0_20px_-5px_rgba(94,196,186,0.15)]'
                      : 'bg-[#0A1218] border-[rgba(255,255,255,0.06)] hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-[15px] font-medium ${isSelected ? 'text-[#5EC4BA]' : 'text-[#EAF2F4]'}`}>
                      {preset.name}
                    </span>
                    {isSelected && (
                      <span className="w-2 h-2 rounded-full bg-[#5EC4BA]" />
                    )}
                  </div>
                  <div className="text-[11px] font-mono text-[#8FA3AB] mb-1">
                    {preset.tagline}
                  </div>
                  <p className="text-xs text-[#8FA3AB]/80 leading-relaxed">
                    {preset.description}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Export Settings */}
          <div className="pt-6 border-t border-[rgba(255,255,255,0.08)] space-y-4">
            <div className="space-y-1.5">
              <label className="text-[11px] uppercase tracking-wider text-[#8FA3AB] font-medium">
                Export Format
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['png', 'jpeg', 'webp'] as const).map((fmt) => (
                  <button
                    key={fmt}
                    type="button"
                    onClick={() => setExportFormat(fmt)}
                    className={`h-9 text-xs font-medium rounded-[8px] transition-colors uppercase ${
                      exportFormat === fmt
                        ? 'bg-[#5EC4BA] text-[#05090D]'
                        : 'bg-[#0F1A22] text-[#8FA3AB] border border-[rgba(255,255,255,0.08)] hover:text-white'
                    }`}
                  >
                    {fmt === 'jpeg' ? 'JPG' : fmt}
                  </button>
                ))}
              </div>
            </div>

            <button
              disabled={!processedUrl || isProcessing}
              onClick={handleDownload}
              className="w-full h-11 bg-white text-[#05090D] hover:bg-[#EAF2F4] disabled:opacity-30 disabled:pointer-events-none font-medium text-sm rounded-[10px] transition-all duration-200 flex items-center justify-center gap-2"
            >
              <span>Download Enhanced Photo</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.5v-2.25M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
