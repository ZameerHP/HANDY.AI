import React, { useState, useEffect, useRef } from 'react';
import JSZip from 'jszip';
import {
  detectFormatByMagicBytes,
  encodeBmp,
  encodeIcoFromPng,
  detectSupportedCanvasEncoders,
} from '../../utils/image-format';

interface QueuedFile {
  id: string;
  file: File;
  originalFormat: string;
  originalSize: number;
  dimensions?: { width: number; height: number };
  status: 'pending' | 'processing' | 'done' | 'error';
  errorMessage?: string;
  convertedBlob?: Blob;
  convertedSize?: number;
  convertedUrl?: string;
  targetFormat: string;
}

const QUALITY_PRESETS = [
  { label: 'High (92%)', value: 92 },
  { label: 'Maximum (100%)', value: 100 },
  { label: 'Compact (80%)', value: 80 },
];

export const ImageConverter: React.FC = () => {
  const [queue, setQueue] = useState<QueuedFile[]>([]);
  const [outputFormat, setOutputFormat] = useState<string>('webp');
  const [quality, setQuality] = useState<number>(92);
  const [fillColor, setFillColor] = useState<string>('#FFFFFF');
  const [icoSize, setIcoSize] = useState<number>(32);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [supportedEncoders, setSupportedEncoders] = useState<Record<string, boolean>>({
    png: true,
    jpeg: true,
    webp: true,
    bmp: true,
    ico: true,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const enc = detectSupportedCanvasEncoders();
    setSupportedEncoders(enc);
  }, []);

  // Clean up object URLs on unmount
  useEffect(() => {
    return () => {
      queue.forEach((item) => {
        if (item.convertedUrl) URL.revokeObjectURL(item.convertedUrl);
      });
    };
  }, [queue]);

  const handleFiles = async (files: FileList | File[]) => {
    const newItems: QueuedFile[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      if (file.size === 0) {
        newItems.push({
          id: `${Date.now()}-${i}`,
          file,
          originalFormat: 'unknown',
          originalSize: 0,
          status: 'error',
          errorMessage: 'Empty file (0 bytes).',
          targetFormat: outputFormat,
        });
        continue;
      }

      if (file.size > 50 * 1024 * 1024) {
        newItems.push({
          id: `${Date.now()}-${i}`,
          file,
          originalFormat: 'unknown',
          originalSize: file.size,
          status: 'error',
          errorMessage: 'File exceeds 50 MB limit.',
          targetFormat: outputFormat,
        });
        continue;
      }

      try {
        const slice = await file.slice(0, 1024).arrayBuffer();
        const detected = detectFormatByMagicBytes(new Uint8Array(slice));

        newItems.push({
          id: `${Date.now()}-${i}-${Math.random()}`,
          file,
          originalFormat: detected === 'unknown' ? file.type.split('/')[1] || 'image' : detected,
          originalSize: file.size,
          status: 'pending',
          targetFormat: outputFormat,
        });
      } catch (err: any) {
        newItems.push({
          id: `${Date.now()}-${i}`,
          file,
          originalFormat: 'unknown',
          originalSize: file.size,
          status: 'error',
          errorMessage: err.message || 'File read error.',
          targetFormat: outputFormat,
        });
      }
    }

    setQueue((prev) => [...prev, ...newItems]);
  };

  const convertSingleFile = async (
    file: File,
    format: string,
    qual: number,
    hexFill: string,
    icoDim: number
  ): Promise<{ blob: Blob; dimensions: { width: number; height: number } }> => {
    const imgUrl = URL.createObjectURL(file);
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = () => reject(new Error('Decoding image failed.'));
      i.src = imgUrl;
    });

    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas 2D context unavailable.');

      let targetWidth = img.naturalWidth;
      let targetHeight = img.naturalHeight;

      if (format === 'ico') {
        targetWidth = icoDim;
        targetHeight = icoDim;
      }

      canvas.width = targetWidth;
      canvas.height = targetHeight;

      if (format === 'jpeg' || format === 'bmp') {
        ctx.fillStyle = hexFill;
        ctx.fillRect(0, 0, targetWidth, targetHeight);
      }

      ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

      if (format === 'bmp') {
        const imgData = ctx.getImageData(0, 0, targetWidth, targetHeight);
        const rgb: [number, number, number] = [
          parseInt(hexFill.slice(1, 3), 16) || 255,
          parseInt(hexFill.slice(3, 5), 16) || 255,
          parseInt(hexFill.slice(5, 7), 16) || 255,
        ];
        const bmpBytes = encodeBmp(imgData, rgb);
        const blob = new Blob([bmpBytes as unknown as BlobPart], { type: 'image/bmp' });
        return { blob, dimensions: { width: targetWidth, height: targetHeight } };
      }

      if (format === 'ico') {
        const pngBlob = await new Promise<Blob>((res, rej) => {
          canvas.toBlob((b) => (b ? res(b) : rej(new Error('Canvas PNG export failed'))), 'image/png');
        });
        const pngBuf = new Uint8Array(await pngBlob.arrayBuffer());
        const icoBytes = encodeIcoFromPng(pngBuf, targetWidth, targetHeight);
        const blob = new Blob([icoBytes as unknown as BlobPart], { type: 'image/x-icon' });
        return { blob, dimensions: { width: targetWidth, height: targetHeight } };
      }

      let mimeType = 'image/png';
      if (format === 'jpeg') mimeType = 'image/jpeg';
      else if (format === 'webp') mimeType = 'image/webp';
      else if (format === 'avif') mimeType = 'image/avif';

      const qualityParam = format === 'jpeg' || format === 'webp' || format === 'avif' ? qual / 100 : undefined;

      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (b) => {
            if (b) resolve(b);
            else reject(new Error(`Failed to encode to ${format}`));
          },
          mimeType,
          qualityParam
        );
      });

      return { blob, dimensions: { width: targetWidth, height: targetHeight } };
    } finally {
      URL.revokeObjectURL(imgUrl);
    }
  };

  const processQueue = async () => {
    if (isProcessing) return;
    setIsProcessing(true);

    const updated = [...queue];

    for (let i = 0; i < updated.length; i++) {
      const item = updated[i];
      if (item.status === 'done') continue;

      updated[i] = { ...item, status: 'processing', targetFormat: outputFormat };
      setQueue([...updated]);

      try {
        const { blob, dimensions } = await convertSingleFile(
          item.file,
          outputFormat,
          quality,
          fillColor,
          icoSize
        );

        const url = URL.createObjectURL(blob);
        updated[i] = {
          ...item,
          status: 'done',
          targetFormat: outputFormat,
          dimensions,
          convertedBlob: blob,
          convertedSize: blob.size,
          convertedUrl: url,
        };
      } catch (err: any) {
        updated[i] = {
          ...item,
          status: 'error',
          errorMessage: err.message || 'Conversion failed.',
        };
      }
      setQueue([...updated]);
    }

    setIsProcessing(false);
  };

  const downloadSingle = (item: QueuedFile) => {
    if (!item.convertedUrl || !item.convertedBlob) return;
    const a = document.createElement('a');
    const baseName = item.file.name.replace(/\.[^/.]+$/, '');
    a.download = `${baseName}.${item.targetFormat === 'jpeg' ? 'jpg' : item.targetFormat}`;
    a.href = item.convertedUrl;
    a.click();
  };

  const downloadAllZip = async () => {
    const completed = queue.filter((item) => item.status === 'done' && item.convertedBlob);
    if (completed.length === 0) return;

    const zip = new JSZip();
    completed.forEach((item) => {
      const baseName = item.file.name.replace(/\.[^/.]+$/, '');
      const ext = item.targetFormat === 'jpeg' ? 'jpg' : item.targetFormat;
      zip.file(`${baseName}.${ext}`, item.convertedBlob!);
    });

    const content = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(content);
    const a = document.createElement('a');
    a.download = `handy_converted_${Date.now()}.zip`;
    a.href = url;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  const clearQueue = () => {
    queue.forEach((item) => {
      if (item.convertedUrl) URL.revokeObjectURL(item.convertedUrl);
    });
    setQueue([]);
  };

  const hasDoneItems = queue.some((q) => q.status === 'done');
  const hasPendingItems = queue.some((q) => q.status === 'pending');

  return (
    <div className="w-full">
      {/* Title & Introduction */}
      <div className="mb-10">
        <h1 className="text-[36px] sm:text-[44px] font-normal text-[#EAF2F4] tracking-tight leading-tight">
          Universal Image Format Converter
        </h1>
        <p className="mt-3 text-[17px] text-[#8FA3AB] max-w-3xl leading-relaxed">
          Batch transcode JPG, PNG, WebP, AVIF, BMP, and ICO images locally in browser memory. Verified native codecs with zero server uploads.
        </p>
      </div>

      <div className="space-y-8">
        {/* Drop Zone */}
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            if (e.dataTransfer.files) handleFiles(e.dataTransfer.files);
          }}
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-[rgba(255,255,255,0.12)] hover:border-[#5EC4BA]/50 rounded-[10px] p-12 text-center cursor-pointer transition-all bg-[#0A1218]/80 hover:bg-[#0F1A22] group"
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,.avif,.webp,.bmp,.ico"
            className="hidden"
            onChange={(e) => {
              if (e.target.files) handleFiles(e.target.files);
            }}
          />
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-[14px] bg-[#0F1A22] border border-[rgba(255,255,255,0.08)] group-hover:border-[#5EC4BA]/40 flex items-center justify-center mx-auto transition-colors">
              <svg className="w-6 h-6 text-[#5EC4BA]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </div>
            <div className="text-[#EAF2F4] text-lg font-normal">
              Choose files or drag & drop here
            </div>
            <p className="text-sm text-[#8FA3AB]">
              Supports JPG, PNG, WebP, AVIF, BMP, ICO (up to 50 MB each, batch ready)
            </p>
          </div>
        </div>

        {/* Global Controls */}
        <div className="p-7 sm:p-8 rounded-[10px] bg-[#0A1218] border border-[rgba(255,255,255,0.08)] space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 items-end">
            {/* Target Format */}
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wider text-[#8FA3AB] font-medium">
                Target Format
              </label>
              <select
                value={outputFormat}
                onChange={(e) => setOutputFormat(e.target.value)}
                className="w-full h-11 px-3 bg-[#0F1A22] border border-[rgba(255,255,255,0.12)] text-[#EAF2F4] text-sm rounded-[10px] focus:outline-none focus:ring-1 focus:ring-[#5EC4BA]"
              >
                <option value="webp">WebP (Modern, High Compression)</option>
                <option value="png">PNG (Lossless, Alpha)</option>
                <option value="jpeg">JPEG (Universal)</option>
                {supportedEncoders.avif && <option value="avif">AVIF (Ultra high efficiency)</option>}
                <option value="bmp">BMP (Windows Bitmap)</option>
                <option value="ico">ICO (Favicon / Icon)</option>
              </select>
            </div>

            {/* Quality Presets for Lossy Formats */}
            {(outputFormat === 'jpeg' || outputFormat === 'webp' || outputFormat === 'avif') && (
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-wider text-[#8FA3AB] font-medium">
                  Compression Preset
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {QUALITY_PRESETS.map((p) => (
                    <button
                      key={p.value}
                      type="button"
                      onClick={() => setQuality(p.value)}
                      className={`h-11 px-2 text-xs font-medium rounded-[8px] transition-colors ${
                        quality === p.value
                          ? 'bg-[#5EC4BA] text-[#05090D]'
                          : 'bg-[#0F1A22] text-[#8FA3AB] border border-[rgba(255,255,255,0.08)] hover:text-white'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Background Fill Color for JPG / BMP */}
            {(outputFormat === 'jpeg' || outputFormat === 'bmp') && (
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-wider text-[#8FA3AB] font-medium">
                  Matte Fill for Alpha
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={fillColor}
                    onChange={(e) => setFillColor(e.target.value)}
                    className="w-11 h-11 bg-transparent cursor-pointer rounded-[8px] border border-white/20"
                  />
                  <span className="text-xs font-mono text-[#EAF2F4] uppercase">
                    {fillColor}
                  </span>
                </div>
              </div>
            )}

            {/* ICO Dimensions */}
            {outputFormat === 'ico' && (
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-wider text-[#8FA3AB] font-medium">
                  Icon Dimensions
                </label>
                <select
                  value={icoSize}
                  onChange={(e) => setIcoSize(Number(e.target.value))}
                  className="w-full h-11 px-3 bg-[#0F1A22] border border-[rgba(255,255,255,0.12)] text-[#EAF2F4] text-sm rounded-[10px] focus:outline-none focus:ring-1 focus:ring-[#5EC4BA]"
                >
                  <option value={16}>16 × 16 px (Browser tab)</option>
                  <option value={32}>32 × 32 px (Standard favicon)</option>
                  <option value={48}>48 × 48 px (Desktop icon)</option>
                  <option value={64}>64 × 64 px (HiDPI)</option>
                  <option value={128}>128 × 128 px (High-res)</option>
                  <option value={256}>256 × 256 px (Ultra)</option>
                </select>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center gap-3 sm:col-span-2 md:col-span-1 justify-end">
              {queue.length > 0 && (
                <button
                  type="button"
                  onClick={clearQueue}
                  className="h-11 px-4 text-xs font-medium text-[#8FA3AB] hover:text-white transition-colors"
                >
                  Clear list
                </button>
              )}

              <button
                type="button"
                disabled={queue.length === 0 || isProcessing}
                onClick={processQueue}
                className="h-11 px-6 font-medium bg-[#5EC4BA] text-[#05090D] hover:bg-[#5EC4BA]/90 disabled:opacity-30 disabled:pointer-events-none rounded-[10px] text-sm transition-all duration-200 flex items-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-[#05090D] border-t-transparent rounded-full animate-spin" />
                    <span>Converting...</span>
                  </>
                ) : (
                  <span>Convert {queue.length > 0 ? `(${queue.length})` : ''}</span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Queue Items */}
        {queue.length > 0 && (
          <div className="p-7 sm:p-8 rounded-[10px] bg-[#0A1218] border border-[rgba(255,255,255,0.08)] space-y-4">
            <div className="flex items-center justify-between pb-4 border-b border-[rgba(255,255,255,0.08)]">
              <div className="text-sm font-medium text-[#EAF2F4]">
                Batch Queue ({queue.length} file{queue.length !== 1 ? 's' : ''})
              </div>

              {hasDoneItems && (
                <button
                  type="button"
                  onClick={downloadAllZip}
                  className="inline-flex items-center gap-2 h-9 px-4 rounded-[8px] bg-white text-[#05090D] hover:bg-[#EAF2F4] text-xs font-medium transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.5v-2.25M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                  </svg>
                  <span>Download All (.ZIP)</span>
                </button>
              )}
            </div>

            <div className="divide-y divide-[rgba(255,255,255,0.06)]">
              {queue.map((item) => {
                const savings =
                  item.convertedSize && item.originalSize
                    ? Math.round(((item.originalSize - item.convertedSize) / item.originalSize) * 100)
                    : null;

                return (
                  <div key={item.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-10 h-10 rounded-[8px] bg-[#0F1A22] border border-white/10 flex items-center justify-center font-mono text-xs text-[#5EC4BA] uppercase shrink-0">
                        {item.originalFormat.slice(0, 3)}
                      </div>

                      <div className="min-w-0 space-y-0.5">
                        <div className="text-sm font-medium text-[#EAF2F4] truncate max-w-sm">
                          {item.file.name}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-[#8FA3AB]">
                          <span>{formatBytes(item.originalSize)}</span>
                          {item.convertedSize && (
                            <>
                              <span>→</span>
                              <span className="text-[#5EC4BA] font-mono">{formatBytes(item.convertedSize)}</span>
                              {savings !== null && (
                                <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono ${
                                  savings > 0 ? 'bg-[#5EC4BA]/15 text-[#5EC4BA]' : 'bg-white/10 text-[#8FA3AB]'
                                }`}>
                                  {savings > 0 ? `-${savings}%` : `+${Math.abs(savings)}%`}
                                </span>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-auto">
                      {item.status === 'processing' && (
                        <div className="flex items-center gap-2 text-xs text-[#5EC4BA]">
                          <span className="w-2 h-2 rounded-full bg-[#5EC4BA] animate-pulse" />
                          <span>Encoding...</span>
                        </div>
                      )}

                      {item.status === 'done' && (
                        <button
                          type="button"
                          onClick={() => downloadSingle(item)}
                          className="h-8 px-3 rounded-[6px] bg-[#0F1A22] border border-[rgba(255,255,255,0.12)] hover:border-[#5EC4BA]/50 text-xs font-medium text-[#EAF2F4] hover:text-[#5EC4BA] transition-colors"
                        >
                          Download
                        </button>
                      )}

                      {item.status === 'error' && (
                        <span className="text-xs text-[#ad5f5a]">
                          {item.errorMessage || 'Error'}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
