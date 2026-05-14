import { useState, useRef, useCallback, useEffect } from 'react';
import { X, ZoomIn, ZoomOut, RotateCcw, Check } from 'lucide-react';
import { Slider } from '@/components/ui/slider';

// ─── Types ────────────────────────────────────────────────────────────────────

type AspectRatio = '1:1' | '4:3' | '16:9' | '3:2' | 'free';

type ImageCropperProps = {
  imageSrc: string;
  onCropComplete: (croppedBlob: Blob) => void;
  onCancel: () => void;
  /** Default aspect ratio for the crop frame. Defaults to '1:1'. */
  defaultAspectRatio?: AspectRatio;
};

// ─── Canvas crop helper ───────────────────────────────────────────────────────

async function getCroppedImg(
  imageSrc: string,
  sx: number,
  sy: number,
  sw: number,
  sh: number,
  outputSize: number
): Promise<Blob | null> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.setAttribute('crossOrigin', 'anonymous');
    image.onload = () => {
      const canvas = document.createElement('canvas');
      // Always output a square at outputSize resolution; caller can resize later
      canvas.width = outputSize;
      canvas.height = outputSize;
      const ctx = canvas.getContext('2d');
      if (!ctx) return resolve(null);

      // For PNGs with transparency, keep the background transparent
      ctx.clearRect(0, 0, outputSize, outputSize);
      ctx.drawImage(image, sx, sy, sw, sh, 0, 0, outputSize, outputSize);
      canvas.toBlob((blob) => resolve(blob), 'image/png');
    };
    image.onerror = reject;
    image.src = imageSrc;
  });
}

// ─── Aspect ratio map ─────────────────────────────────────────────────────────

const ASPECT_RATIOS: Record<AspectRatio, { label: string; w: number; h: number }> = {
  '1:1':  { label: '1:1',  w: 1, h: 1 },
  '4:3':  { label: '4:3',  w: 4, h: 3 },
  '16:9': { label: '16:9', w: 16, h: 9 },
  '3:2':  { label: '3:2',  w: 3, h: 2 },
  free:   { label: 'Free', w: 0, h: 0 },
};

// ─── Constants ────────────────────────────────────────────────────────────────

const CANVAS_SIZE = 420;      // canvas element pixel size
const CROP_AREA_PAD = 40;     // padding around the crop frame inside the canvas
const OUTPUT_SIZE = 512;      // exported image resolution
const MIN_ZOOM = 0.1;
const MAX_ZOOM = 5;
const ZOOM_STEP = 0.05;

// ─── Component ────────────────────────────────────────────────────────────────

export const ImageCropper = ({
  imageSrc,
  onCropComplete,
  onCancel,
  defaultAspectRatio = '1:1',
}: ImageCropperProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Natural image dimensions
  const [imgSize, setImgSize] = useState({ w: 0, h: 0 });

  // zoom: 1 means the image fits the crop frame exactly ("fit to frame")
  const [zoom, setZoom] = useState(1);

  // Pan offset in canvas pixels, relative to the centered-fit position
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  // Chosen aspect ratio
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>(defaultAspectRatio);

  // Free-crop frame state (only used when aspectRatio === 'free')
  const [freeFrame, setFreeFrame] = useState({ x: 0, y: 0, w: 0, h: 0 });

  const [processing, setProcessing] = useState(false);

  // Drag state
  const dragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const offsetRef = useRef(offset);
  offsetRef.current = offset;

  // Free-crop resize/drag state
  const freeAction = useRef<null | 'move' | 'nw' | 'ne' | 'sw' | 'se'>(null);
  const freeDragStart = useRef({ mx: 0, my: 0, fx: 0, fy: 0, fw: 0, fh: 0 });

  // ── Derive the crop frame rect on the canvas ─────────────────────────────

  const getCropRect = useCallback(() => {
    if (aspectRatio === 'free') {
      return freeFrame;
    }
    const { w: rw, h: rh } = ASPECT_RATIOS[aspectRatio];
    const maxW = CANVAS_SIZE - CROP_AREA_PAD * 2;
    const maxH = CANVAS_SIZE - CROP_AREA_PAD * 2;
    let fw = maxW;
    let fh = (fw * rh) / rw;
    if (fh > maxH) {
      fh = maxH;
      fw = (fh * rw) / rh;
    }
    const fx = (CANVAS_SIZE - fw) / 2;
    const fy = (CANVAS_SIZE - fh) / 2;
    return { x: fx, y: fy, w: fw, h: fh };
  }, [aspectRatio, freeFrame]);

  // ── Draw ──────────────────────────────────────────────────────────────────

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || imgSize.w === 0) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.src = imageSrc;
    img.onload = () => {
      ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

      // ── Image placement ──────────────────────────────────────────────────
      // zoom=1 → image fills the crop frame exactly (contain-style fit)
      const frame = getCropRect();
      if (frame.w === 0 || frame.h === 0) return;

      const fitScale = Math.min(frame.w / imgSize.w, frame.h / imgSize.h);
      const scale = fitScale * zoom;

      const drawW = imgSize.w * scale;
      const drawH = imgSize.h * scale;

      // Center of the crop frame on canvas
      const frameCx = frame.x + frame.w / 2;
      const frameCy = frame.y + frame.h / 2;

      const dx = frameCx - drawW / 2 + offsetRef.current.x;
      const dy = frameCy - drawH / 2 + offsetRef.current.y;

      // Checkerboard background (indicates transparency)
      const tileSize = 10;
      for (let ty = 0; ty < CANVAS_SIZE; ty += tileSize) {
        for (let tx = 0; tx < CANVAS_SIZE; tx += tileSize) {
          ctx.fillStyle = ((tx + ty) / tileSize) % 2 === 0 ? '#e5e5e5' : '#cccccc';
          ctx.fillRect(tx, ty, tileSize, tileSize);
        }
      }

      ctx.drawImage(img, dx, dy, drawW, drawH);

      // ── Overlay dim ──────────────────────────────────────────────────────
      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      const { x: cx, y: cy, w: cw, h: ch } = frame;
      ctx.fillRect(0, 0, CANVAS_SIZE, cy);                   // top
      ctx.fillRect(0, cy + ch, CANVAS_SIZE, CANVAS_SIZE);    // bottom
      ctx.fillRect(0, cy, cx, ch);                           // left
      ctx.fillRect(cx + cw, cy, CANVAS_SIZE - cx - cw, ch); // right

      // ── Crop border ──────────────────────────────────────────────────────
      ctx.strokeStyle = '#ec4899';
      ctx.lineWidth = 2;
      ctx.strokeRect(cx, cy, cw, ch);

      // ── Rule-of-thirds grid ──────────────────────────────────────────────
      ctx.strokeStyle = 'rgba(236,72,153,0.35)';
      ctx.lineWidth = 0.5;
      for (let i = 1; i < 3; i++) {
        ctx.beginPath(); ctx.moveTo(cx + (cw / 3) * i, cy); ctx.lineTo(cx + (cw / 3) * i, cy + ch); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(cx, cy + (ch / 3) * i); ctx.lineTo(cx + cw, cy + (ch / 3) * i); ctx.stroke();
      }

      // ── Corner handles (free mode) ───────────────────────────────────────
      if (aspectRatio === 'free') {
        const hSize = 8;
        ctx.fillStyle = '#ec4899';
        [
          [cx, cy], [cx + cw - hSize, cy],
          [cx, cy + ch - hSize], [cx + cw - hSize, cy + ch - hSize],
        ].forEach(([hx, hy]) => ctx.fillRect(hx, hy, hSize, hSize));
      }
    };
  }, [imageSrc, zoom, imgSize, getCropRect, aspectRatio]);

  // ── Load image natural size ───────────────────────────────────────────────

  useEffect(() => {
    const img = new Image();
    img.src = imageSrc;
    img.onload = () => {
      setImgSize({ w: img.naturalWidth, h: img.naturalHeight });
    };
  }, [imageSrc]);

  // ── Initialise free frame and reset zoom/offset when ratio or image changes ─

  useEffect(() => {
    if (imgSize.w === 0) return;
    setZoom(1);
    setOffset({ x: 0, y: 0 });

    if (aspectRatio === 'free') {
      // Default free frame: same as 1:1 square
      const maxW = CANVAS_SIZE - CROP_AREA_PAD * 2;
      const size = Math.min(maxW, CANVAS_SIZE - CROP_AREA_PAD * 2);
      setFreeFrame({
        x: (CANVAS_SIZE - size) / 2,
        y: (CANVAS_SIZE - size) / 2,
        w: size,
        h: size,
      });
    }
  }, [aspectRatio, imgSize]);

  // ── Redraw whenever relevant state changes ────────────────────────────────

  useEffect(() => { draw(); }, [draw, offset, freeFrame]);

  // ── Mouse / touch pan ────────────────────────────────────────────────────

  const getHitZone = (mx: number, my: number) => {
    if (aspectRatio !== 'free') return null;
    const { x, y, w, h } = freeFrame;
    const hs = 12; // hit size for handles
    if (mx >= x && mx <= x + hs && my >= y && my <= y + hs) return 'nw';
    if (mx >= x + w - hs && mx <= x + w && my >= y && my <= y + hs) return 'ne';
    if (mx >= x && mx <= x + hs && my >= y + h - hs && my <= y + h) return 'sw';
    if (mx >= x + w - hs && mx <= x + w && my >= y + h - hs && my <= y + h) return 'se';
    if (mx >= x && mx <= x + w && my >= y && my <= y + h) return 'move';
    return null;
  };

  const canvasCoords = (clientX: number, clientY: number) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return { mx: 0, my: 0 };
    const scaleX = CANVAS_SIZE / rect.width;
    const scaleY = CANVAS_SIZE / rect.height;
    return { mx: (clientX - rect.left) * scaleX, my: (clientY - rect.top) * scaleY };
  };

  const onMouseDown = (e: React.MouseEvent) => {
    const { mx, my } = canvasCoords(e.clientX, e.clientY);
    if (aspectRatio === 'free') {
      const zone = getHitZone(mx, my);
      if (zone) {
        freeAction.current = zone;
        freeDragStart.current = { mx, my, fx: freeFrame.x, fy: freeFrame.y, fw: freeFrame.w, fh: freeFrame.h };
        return;
      }
    }
    dragging.current = true;
    dragStart.current = { x: e.clientX - offset.x, y: e.clientY - offset.y };
  };

  const onMouseMove = (e: React.MouseEvent) => {
    const { mx, my } = canvasCoords(e.clientX, e.clientY);

    if (freeAction.current) {
      const { mx: sx, my: sy, fx, fy, fw, fh } = freeDragStart.current;
      const dx = mx - sx;
      const dy = my - sy;
      const MIN = 40;
      let { x, y, w, h } = freeFrame;

      switch (freeAction.current) {
        case 'move': x = fx + dx; y = fy + dy; break;
        case 'nw': x = fx + dx; y = fy + dy; w = fw - dx; h = fh - dy; break;
        case 'ne': y = fy + dy; w = fw + dx; h = fh - dy; break;
        case 'sw': x = fx + dx; w = fw - dx; h = fh + dy; break;
        case 'se': w = fw + dx; h = fh + dy; break;
      }

      // Clamp to canvas
      w = Math.max(MIN, w); h = Math.max(MIN, h);
      x = Math.max(0, Math.min(x, CANVAS_SIZE - w));
      y = Math.max(0, Math.min(y, CANVAS_SIZE - h));
      setFreeFrame({ x, y, w, h });
      return;
    }

    // Update cursor for free mode
    if (aspectRatio === 'free') {
      const zone = getHitZone(mx, my);
      const canvas = canvasRef.current;
      if (canvas) {
        if (zone === 'nw' || zone === 'se') canvas.style.cursor = 'nwse-resize';
        else if (zone === 'ne' || zone === 'sw') canvas.style.cursor = 'nesw-resize';
        else if (zone === 'move') canvas.style.cursor = 'move';
        else canvas.style.cursor = 'default';
      }
    }

    if (!dragging.current) return;
    setOffset({ x: e.clientX - dragStart.current.x, y: e.clientY - dragStart.current.y });
  };

  const onMouseUp = () => {
    dragging.current = false;
    freeAction.current = null;
  };

  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    dragging.current = true;
    dragStart.current = { x: t.clientX - offset.x, y: t.clientY - offset.y };
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (!dragging.current) return;
    const t = e.touches[0];
    setOffset({ x: t.clientX - dragStart.current.x, y: t.clientY - dragStart.current.y });
  };

  // ── Scroll-to-zoom on canvas ──────────────────────────────────────────────

  const onWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? ZOOM_STEP * 2 : -ZOOM_STEP * 2;
    setZoom((z) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z + delta)));
  };

  // ── Reset ─────────────────────────────────────────────────────────────────

  const handleReset = () => {
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  };

  // ── Save / crop ───────────────────────────────────────────────────────────

  const handleSave = async () => {
    if (!canvasRef.current || imgSize.w === 0) return;
    setProcessing(true);
    try {
      const frame = getCropRect();
      if (frame.w === 0 || frame.h === 0) return;

      const fitScale = Math.min(frame.w / imgSize.w, frame.h / imgSize.h);
      const scale = fitScale * zoom;

      const drawW = imgSize.w * scale;
      const drawH = imgSize.h * scale;
      const frameCx = frame.x + frame.w / 2;
      const frameCy = frame.y + frame.h / 2;
      const dx = frameCx - drawW / 2 + offset.x;
      const dy = frameCy - drawH / 2 + offset.y;

      // Convert crop frame to source image coordinates
      const srcX = (frame.x - dx) / scale;
      const srcY = (frame.y - dy) / scale;
      const srcW = frame.w / scale;
      const srcH = frame.h / scale;

      const blob = await getCroppedImg(
        imageSrc,
        Math.max(0, srcX),
        Math.max(0, srcY),
        Math.min(srcW, imgSize.w - Math.max(0, srcX)),
        Math.min(srcH, imgSize.h - Math.max(0, srcY)),
        OUTPUT_SIZE,
      );
      if (blob) onCropComplete(blob);
    } catch (err) {
      console.error(err);
      alert('Error cropping image. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
      <div className="bg-secondary border-2 border-foreground w-full max-w-lg overflow-hidden flex flex-col shadow-2xl">

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-background">
          <p className="text-xs font-bold uppercase tracking-widest text-editorial-pink">
            Crop Image
          </p>
          <button
            onClick={onCancel}
            aria-label="Close"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* ── Aspect ratio tabs ── */}
        <div className="flex items-center gap-1 px-4 pt-3 pb-1 bg-background">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mr-2">
            Ratio
          </p>
          {(Object.keys(ASPECT_RATIOS) as AspectRatio[]).map((key) => (
            <button
              key={key}
              onClick={() => setAspectRatio(key)}
              className={[
                'text-xs font-bold uppercase tracking-wider px-2.5 py-1 border transition-colors',
                aspectRatio === key
                  ? 'border-editorial-pink text-editorial-pink bg-editorial-pink/10'
                  : 'border-border text-muted-foreground hover:border-foreground hover:text-foreground',
              ].join(' ')}
            >
              {ASPECT_RATIOS[key].label}
            </button>
          ))}
        </div>

        {/* ── Canvas ── */}
        <div className="relative bg-neutral-900 flex items-center justify-center select-none overflow-hidden">
          <canvas
            ref={canvasRef}
            width={CANVAS_SIZE}
            height={CANVAS_SIZE}
            className="touch-none w-full"
            style={{ maxHeight: '420px', cursor: 'grab' }}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseUp}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={() => { dragging.current = false; freeAction.current = null; }}
            onWheel={onWheel}
          />
          <p className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] text-white/40 pointer-events-none">
            {aspectRatio === 'free' ? 'Drag handles to resize · Drag image to pan' : 'Drag to pan · Scroll to zoom'}
          </p>
        </div>

        {/* ── Zoom controls ── */}
        <div className="px-5 pt-4 pb-1 bg-background space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Zoom</p>
            <div className="flex items-center gap-3 text-muted-foreground">
              <button
                onClick={() => setZoom((z) => Math.max(MIN_ZOOM, z - ZOOM_STEP * 2))}
                className="hover:text-foreground transition-colors"
                aria-label="Zoom out"
              >
                <ZoomOut size={14} />
              </button>
              <span className="text-xs tabular-nums w-8 text-center">{zoom.toFixed(2)}×</span>
              <button
                onClick={() => setZoom((z) => Math.min(MAX_ZOOM, z + ZOOM_STEP * 2))}
                className="hover:text-foreground transition-colors"
                aria-label="Zoom in"
              >
                <ZoomIn size={14} />
              </button>
            </div>
          </div>
          <Slider
            value={[zoom]}
            min={MIN_ZOOM}
            max={MAX_ZOOM}
            step={ZOOM_STEP}
            onValueChange={(val) => setZoom(val[0])}
          />
        </div>

        {/* ── Footer actions ── */}
        <div className="flex items-center justify-between px-5 py-4 bg-background">
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Reset zoom and position"
          >
            <RotateCcw size={12} />
            Reset
          </button>

          <div className="flex gap-3">
            <button
              onClick={onCancel}
              disabled={processing}
              className="text-xs font-bold uppercase tracking-wider border-2 border-border px-4 py-2 hover:border-foreground transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={processing}
              className="flex items-center gap-1.5 bg-editorial-pink text-background px-5 py-2 text-xs font-black uppercase tracking-wider hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {processing ? (
                'Saving…'
              ) : (
                <>
                  <Check size={13} />
                  Save Crop
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
