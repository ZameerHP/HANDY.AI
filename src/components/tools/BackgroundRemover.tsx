import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  DEFAULT_MATTE_OPTIONS,
  refineAlphaMatte,
  applyMatteToImage,
  createRawImageData,
} from '../../utils/bg-remover';

let pipelineFn: any = null;

const BG_PRESETS = [
  { id: 'transparent', label: 'Transparent', value: 'transparent' },
  { id: 'white', label: 'Pure White', value: '#FFFFFF' },
  { id: 'dark', label: 'Obsidian', value: '#05090D' },
  { id: 'navy', label: 'Deep Blue', value: '#172345' },
  { id: 'custom', label: 'Custom', value: 'custom' },
] as const;

export const BackgroundRemover: React.FC = () => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [rawMatte, setRawMatte] = useState<Uint8Array | null>(null);
  const [processedUrl, setProcessedUrl] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null);

  // Model loading and execution states
  const [isDownloadingModel, setIsDownloadingModel] = useState<boolean>(false);
  const [downloadProgress, setDownloadProgress] = useState<number>(0);
  const [isSegmenting, setIsSegmenting] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Background replacement
  const [selectedBg, setSelectedBg] = useState<string>('transparent');
  const [customColor, setCustomColor] = useState<string>('#5EC4BA');
  const [exportFormat, setExportFormat] = useState<'png' | 'jpeg'>('png');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const originalImgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    return () => {
      if (originalUrl) URL.revokeObjectURL(originalUrl);
      if (processedUrl) URL.revokeObjectURL(processedUrl);
    };
  }, [originalUrl, processedUrl]);

  const drawForegroundAndSave = (
    ctx: CanvasRenderingContext2D,
    cutOut: any,
    w: number,
    h: number
  ) => {
    const fgCanvas = document.createElement('canvas');
    fgCanvas.width = w;
    fgCanvas.height = h;
    const fgCtx = fgCanvas.getContext('2d')!;
    const fgData = new ImageData(cutOut.data, w, h);
    fgCtx.putImageData(fgData, 0, 0);

    ctx.drawImage(fgCanvas, 0, 0);

    ctx.canvas.toBlob(
      (blob) => {
        if (blob) {
          if (processedUrl) URL.revokeObjectURL(processedUrl);
          const url = URL.createObjectURL(blob);
          setProcessedUrl(url);
        }
      },
      exportFormat === 'jpeg' ? 'image/jpeg' : 'image/png'
    );
  };

  const renderComposite = useCallback(
    (matte: Uint8Array, bg: string, color: string) => {
      if (!originalImgRef.current) return;
      const img = originalImgRef.current;
      const width = img.naturalWidth;
      const height = img.naturalHeight;

      // Automatically apply optimal matte refinement: soft 2px feathering, defringing, island removal
      const refinedMatte = refineAlphaMatte(matte, width, height, DEFAULT_MATTE_OPTIONS);

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.drawImage(img, 0, 0);
      const srcData = ctx.getImageData(0, 0, width, height);
      const rawSrc = createRawImageData(width, height, srcData.data);

      const cutOut = applyMatteToImage(rawSrc, refinedMatte, DEFAULT_MATTE_OPTIONS.decontaminate);

      ctx.clearRect(0, 0, width, height);

      if (bg !== 'transparent') {
        ctx.fillStyle = bg === 'custom' ? color : bg;
        ctx.fillRect(0, 0, width, height);
      }

      drawForegroundAndSave(ctx, cutOut, width, height);
    },
    [exportFormat, processedUrl]
  );

  const runModelSegmentation = async (fileUrl: string, imgEl: HTMLImageElement) => {
    setErrorMessage(null);
    setIsSegmenting(true);
    setStatusMessage('Initializing neural segmentation engine...');

    try {
      if (!pipelineFn) {
        setIsDownloadingModel(true);
        setStatusMessage('Loading RMBG-1.4 model weights (~28 MB, cached locally)...');
        const transformers = await import('@xenova/transformers');
        transformers.env.allowLocalModels = false;
        transformers.env.useBrowserCache = true;

        pipelineFn = await transformers.pipeline(
          'image-segmentation',
          'briaai/RMBG-1.4',
          {
            progress_callback: (data: any) => {
              if (data.status === 'progress' && data.total) {
                const pct = Math.round((data.loaded / data.total) * 100);
                setDownloadProgress(pct);
                setStatusMessage(`Caching model weights: ${pct}%`);
              }
            },
          }
        );
        setIsDownloadingModel(false);
      }

      setStatusMessage('Extracting high-resolution foreground alpha matte...');
      const width = imgEl.naturalWidth;
      const height = imgEl.naturalHeight;

      const output = await pipelineFn(fileUrl);

      let maskData: Uint8Array;
      if (output && output.mask) {
        const maskImg = output.mask;
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Canvas 2D unavailable');

        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = maskImg.width;
        tempCanvas.height = maskImg.height;
        const tempCtx = tempCanvas.getContext('2d')!;
        const tempImgData = tempCtx.createImageData(maskImg.width, maskImg.height);

        for (let i = 0; i < maskImg.data.length; i++) {
          const val = maskImg.data[i];
          tempImgData.data[i * 4] = val;
          tempImgData.data[i * 4 + 1] = val;
          tempImgData.data[i * 4 + 2] = val;
          tempImgData.data[i * 4 + 3] = 255;
        }
        tempCtx.putImageData(tempImgData, 0, 0);

        ctx.drawImage(tempCanvas, 0, 0, width, height);
        const fullImgData = ctx.getImageData(0, 0, width, height);

        maskData = new Uint8Array(width * height);
        for (let i = 0; i < maskData.length; i++) {
          maskData[i] = fullImgData.data[i * 4];
        }
      } else {
        throw new Error('Neural network did not return a valid segmentation mask.');
      }

      setRawMatte(maskData);
      renderComposite(maskData, selectedBg, customColor);
      setStatusMessage('');
    } catch (err: any) {
      console.error(err);
      setErrorMessage(
        `Segmentation notice: ${err.message || 'Model execution error'}. Please ensure WebGL/WASM is active.`
      );
    } finally {
      setIsSegmenting(false);
      setIsDownloadingModel(false);
    }
  };

  const handleImageSelect = (file: File) => {
    if (file.size > 40 * 1024 * 1024) {
      setErrorMessage('Image exceeds safe 40 MB threshold.');
      return;
    }
    setErrorMessage(null);
    setImageFile(file);
    if (originalUrl) URL.revokeObjectURL(originalUrl);
    if (processedUrl) URL.revokeObjectURL(processedUrl);
    setRawMatte(null);
    setProcessedUrl(null);

    const url = URL.createObjectURL(file);
    setOriginalUrl(url);

    const img = new Image();
    img.onload = () => {
      originalImgRef.current = img;
      setDimensions({ width: img.naturalWidth, height: img.naturalHeight });
      // Automatically run segmentation on select
      runModelSegmentation(url, img);
    };
    img.src = url;
  };

  // Re-composite when background changes
  useEffect(() => {
    if (rawMatte) {
      renderComposite(rawMatte, selectedBg, customColor);
    }
  }, [rawMatte, selectedBg, customColor, renderComposite]);

  const handleDownload = () => {
    if (!processedUrl) return;
    const a = document.createElement('a');
    a.href = processedUrl;
    const baseName = imageFile?.name.replace(/\.[^/.]+$/, '') || 'cutout';
    a.download = `${baseName}_nobg.${exportFormat === 'jpeg' ? 'jpg' : 'png'}`;
    a.click();
  };

  return (
    <div className="w-full">
      {/* Title & Introduction */}
      <div className="mb-10">
        <h1 className="text-[36px] sm:text-[44px] font-normal text-[#EAF2F4] tracking-tight leading-tight">
          Accurate AI Background Remover
        </h1>
        <p className="mt-3 text-[17px] text-[#8FA3AB] max-w-3xl leading-relaxed">
          Automatic subject isolation using state-of-the-art neural vision (RMBG-1.4). Every pixel executes locally in client memory with zero server uploads.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Preview Canvas (8 cols) */}
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
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                  />
                </svg>
              </div>
              <div className="text-[#EAF2F4] text-lg font-normal">
                Choose an image to remove background
              </div>
              <p className="mt-2 text-sm text-[#8FA3AB]">
                Portraits, objects, vehicles, and products (JPG, PNG, WebP)
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Checkerboard Preview Surface */}
              <div className="relative w-full aspect-[4/3] bg-checker rounded-[10px] overflow-hidden border border-[rgba(255,255,255,0.08)] flex items-center justify-center">
                {processedUrl ? (
                  <img
                    src={processedUrl}
                    alt="Cutout Preview"
                    className="w-full h-full object-contain pointer-events-none"
                  />
                ) : (
                  <img
                    src={originalUrl}
                    alt="Original"
                    className="w-full h-full object-contain opacity-70 pointer-events-none"
                  />
                )}

                {/* Progress / Spinner Overlay */}
                {isSegmenting && (
                  <div className="absolute inset-0 bg-[#05090D]/85 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center z-20 space-y-4">
                    <div className="w-9 h-9 rounded-full border-2 border-[#5EC4BA] border-t-transparent animate-spin" />
                    <p className="text-[#EAF2F4] text-sm font-medium">{statusMessage}</p>
                    {isDownloadingModel && downloadProgress > 0 && (
                      <div className="w-56 bg-white/10 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-[#5EC4BA] h-full transition-all duration-300"
                          style={{ width: `${downloadProgress}%` }}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Resolution / Switch Image Bar */}
              <div className="flex flex-wrap items-center justify-between text-xs text-[#8FA3AB] px-1 pt-1">
                {dimensions && (
                  <span>
                    Resolution: <strong className="text-[#EAF2F4] font-mono">{dimensions.width} × {dimensions.height} px</strong>
                  </span>
                )}
                <div className="flex items-center gap-4">
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
              </div>
            </div>
          )}

          {errorMessage && (
            <p className="text-xs text-[#ad5f5a] px-1">{errorMessage}</p>
          )}
        </div>

        {/* Right: Background Presets & Export Action (4 cols) */}
        <div className="lg:col-span-4 p-7 sm:p-8 rounded-[10px] bg-[#0A1218] border border-[rgba(255,255,255,0.08)] space-y-6">
          <div>
            <div className="text-[12px] font-medium tracking-[0.08em] uppercase text-[#5EC4BA] mb-1">
              BACKGROUND SETTING
            </div>
            <h2 className="text-[20px] font-normal text-[#EAF2F4]">
              Backdrop Style
            </h2>
            <p className="text-xs text-[#8FA3AB] mt-1 leading-relaxed">
              Auto-defringing and smooth alpha blending are applied automatically.
            </p>
          </div>

          {/* Clean Backdrop Preset Buttons */}
          <div className="space-y-2.5">
            {BG_PRESETS.map((preset) => {
              const isSelected = selectedBg === preset.value;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => {
                    setSelectedBg(preset.value);
                    if (preset.id === 'custom') setExportFormat('png');
                    else if (preset.id === 'transparent') setExportFormat('png');
                  }}
                  className={`w-full flex items-center justify-between p-3.5 rounded-[10px] border text-left transition-all duration-200 ${
                    isSelected
                      ? 'bg-[#0F1A22] border-[#5EC4BA] text-[#EAF2F4]'
                      : 'bg-[#0A1218] border-[rgba(255,255,255,0.06)] hover:border-white/20 text-[#8FA3AB]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="w-5 h-5 rounded-full border border-white/20 shrink-0"
                      style={{
                        backgroundColor:
                          preset.value === 'transparent'
                            ? 'transparent'
                            : preset.value === 'custom'
                            ? customColor
                            : preset.value,
                        backgroundImage:
                          preset.value === 'transparent'
                            ? 'linear-gradient(45deg, #333 25%, transparent 25%), linear-gradient(-45deg, #333 25%, transparent 25%)'
                            : 'none',
                        backgroundSize: '6px 6px',
                      }}
                    />
                    <span className="text-sm font-medium">{preset.label}</span>
                  </div>

                  {isSelected && (
                    <span className="w-2 h-2 rounded-full bg-[#5EC4BA]" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Custom Color Input if Custom Selected */}
          {selectedBg === 'custom' && (
            <div className="flex items-center gap-3 p-3 rounded-[8px] bg-[#0F1A22] border border-[rgba(255,255,255,0.08)]">
              <input
                type="color"
                value={customColor}
                onChange={(e) => setCustomColor(e.target.value)}
                className="w-8 h-8 rounded-[6px] bg-transparent cursor-pointer border-0"
              />
              <span className="font-mono text-xs text-[#EAF2F4] uppercase">
                {customColor}
              </span>
            </div>
          )}

          {/* Export Action */}
          <div className="pt-6 border-t border-[rgba(255,255,255,0.08)] space-y-4">
            <div className="space-y-1.5">
              <label className="text-[11px] uppercase tracking-wider text-[#8FA3AB] font-medium">
                Output Format
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setExportFormat('png')}
                  className={`h-9 text-xs font-medium rounded-[8px] transition-colors ${
                    exportFormat === 'png'
                      ? 'bg-[#5EC4BA] text-[#05090D]'
                      : 'bg-[#0F1A22] text-[#8FA3AB] border border-[rgba(255,255,255,0.08)] hover:text-white'
                  }`}
                >
                  PNG (Transparency)
                </button>
                <button
                  type="button"
                  onClick={() => setExportFormat('jpeg')}
                  className={`h-9 text-xs font-medium rounded-[8px] transition-colors ${
                    exportFormat === 'jpeg'
                      ? 'bg-[#5EC4BA] text-[#05090D]'
                      : 'bg-[#0F1A22] text-[#8FA3AB] border border-[rgba(255,255,255,0.08)] hover:text-white'
                  }`}
                >
                  JPG (Flat)
                </button>
              </div>
            </div>

            <button
              disabled={!processedUrl || isSegmenting}
              onClick={handleDownload}
              className="w-full h-11 bg-white text-[#05090D] hover:bg-[#EAF2F4] disabled:opacity-30 disabled:pointer-events-none font-medium text-sm rounded-[10px] transition-all duration-200 flex items-center justify-center gap-2"
            >
              <span>Download Cutout</span>
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
