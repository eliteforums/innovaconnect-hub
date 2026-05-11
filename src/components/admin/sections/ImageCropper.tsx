import { useState, useRef, useCallback, useEffect } from 'react';
import { X, ZoomIn, ZoomOut } from 'lucide-react';
import { Slider } from '@/components/ui/slider';

// ─── Canvas-based crop helper (no external deps) ─────────────────────────────
async function getCroppedImg(
  imageSrc: string,
  crop: { x: number; y: number; width: number; height: number }
): Promise<Blob | null> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.setAttribute('crossOrigin', 'anonymous');
    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = crop.width;
      canvas.height = crop.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return resolve(null);
      ctx.drawImage(image, crop.x, crop.y, crop.width, crop.height, 0, 0, crop.width, crop.height);
      canvas.toBlob((blob) => resolve(blob), 'image/png');
    };
    image.onerror = reject;
    image.src = imageSrc;
  });
}

type ImageCropperProps = {
  imageSrc: string;
  onCropComplete: (croppedBlob: Blob) => void;
  onCancel: () => void;
};

export const ImageCropper = ({ imageSrc, onCropComplete, onCancel }: ImageCropperProps) => {
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [processing, setProcessing] = useState(false);
  const [imgSize, setImgSize] = useState({ w: 0, h: 0 });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const offsetRef = useRef(offset);
  offsetRef.current = offset;

  const CANVAS_SIZE = 400;
  const CROP_SIZE = 280; // visible crop square

  // Draw the canvas whenever zoom/offset/image changes
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || imgSize.w === 0) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.src = imageSrc;
    img.onload = () => {
      ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

      const scale = zoom;
      const drawW = imgSize.w * scale;
      const drawH = imgSize.h * scale;
      const dx = (CANVAS_SIZE - drawW) / 2 + offsetRef.current.x;
      const dy = (CANVAS_SIZE - drawH) / 2 + offsetRef.current.y;

      // Draw image
      ctx.drawImage(img, dx, dy, drawW, drawH);

      // Dim outside crop area
      ctx.fillStyle = 'rgba(0,0,0,0.55)';
      const cx = (CANVAS_SIZE - CROP_SIZE) / 2;
      const cy = (CANVAS_SIZE - CROP_SIZE) / 2;
      ctx.fillRect(0, 0, CANVAS_SIZE, cy);                        // top
      ctx.fillRect(0, cy + CROP_SIZE, CANVAS_SIZE, cy);           // bottom
      ctx.fillRect(0, cy, cx, CROP_SIZE);                         // left
      ctx.fillRect(cx + CROP_SIZE, cy, cx, CROP_SIZE);            // right

      // Crop border
      ctx.strokeStyle = '#ec4899';
      ctx.lineWidth = 2;
      ctx.strokeRect(cx, cy, CROP_SIZE, CROP_SIZE);

      // Rule-of-thirds grid
      ctx.strokeStyle = 'rgba(236,72,153,0.3)';
      ctx.lineWidth = 0.5;
      for (let i = 1; i < 3; i++) {
        ctx.beginPath();
        ctx.moveTo(cx + (CROP_SIZE / 3) * i, cy);
        ctx.lineTo(cx + (CROP_SIZE / 3) * i, cy + CROP_SIZE);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx, cy + (CROP_SIZE / 3) * i);
        ctx.lineTo(cx + CROP_SIZE, cy + (CROP_SIZE / 3) * i);
        ctx.stroke();
      }
    };
  }, [imageSrc, zoom, imgSize]);

  // Load image natural size once
  useEffect(() => {
    const img = new Image();
    img.src = imageSrc;
    img.onload = () => setImgSize({ w: img.naturalWidth, h: img.naturalHeight });
  }, [imageSrc]);

  useEffect(() => { draw(); }, [draw, offset]);

  // Mouse drag handlers
  const onMouseDown = (e: React.MouseEvent) => {
    dragging.current = true;
    dragStart.current = { x: e.clientX - offset.x, y: e.clientY - offset.y };
  };
  const onMouseMove = (e: React.MouseEvent) => {
    if (!dragging.current) return;
    setOffset({ x: e.clientX - dragStart.current.x, y: e.clientY - dragStart.current.y });
  };
  const onMouseUp = () => { dragging.current = false; };

  // Touch drag handlers
  const onTouchStart = (e: React.TouchEvent) => {
    dragging.current = true;
    dragStart.current = {
      x: e.touches[0].clientX - offset.x,
      y: e.touches[0].clientY - offset.y,
    };
  };
  const onTouchMove = (e: React.TouchEvent) => {
    if (!dragging.current) return;
    setOffset({ x: e.touches[0].clientX - dragStart.current.x, y: e.touches[0].clientY - dragStart.current.y });
  };

  const handleSave = async () => {
    if (!canvasRef.current || imgSize.w === 0) return;
    setProcessing(true);
    try {
      const scale = zoom;
      const drawW = imgSize.w * scale;
      const drawH = imgSize.h * scale;
      const dx = (CANVAS_SIZE - drawW) / 2 + offset.x;
      const dy = (CANVAS_SIZE - drawH) / 2 + offset.y;
      const cx = (CANVAS_SIZE - CROP_SIZE) / 2;
      const cy = (CANVAS_SIZE - CROP_SIZE) / 2;

      // Convert crop box back to image coordinates
      const srcX = (cx - dx) / scale;
      const srcY = (cy - dy) / scale;
      const srcW = CROP_SIZE / scale;
      const srcH = CROP_SIZE / scale;

      const blob = await getCroppedImg(imageSrc, {
        x: Math.max(0, srcX),
        y: Math.max(0, srcY),
        width: Math.min(srcW, imgSize.w - srcX),
        height: Math.min(srcH, imgSize.h - srcY),
      });
      if (blob) onCropComplete(blob);
    } catch (e) {
      console.error(e);
      alert('Error cropping image');
    }
    setProcessing(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
      <div className="bg-secondary border-2 border-foreground w-full max-w-lg overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-background">
          <p className="text-xs font-bold uppercase tracking-widest text-editorial-pink">
            Crop Logo
          </p>
          <button onClick={onCancel} className="text-muted-foreground hover:text-foreground transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Canvas */}
        <div className="relative bg-black flex items-center justify-center select-none">
          <canvas
            ref={canvasRef}
            width={CANVAS_SIZE}
            height={CANVAS_SIZE}
            className="cursor-grab active:cursor-grabbing touch-none"
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseUp}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={() => { dragging.current = false; }}
          />
        </div>

        {/* Controls */}
        <div className="p-5 space-y-6 bg-background">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Zoom</p>
              <div className="flex items-center gap-2 text-muted-foreground">
                <ZoomOut size={12} />
                <span className="text-xs">{zoom.toFixed(1)}x</span>
                <ZoomIn size={12} />
              </div>
            </div>
            <Slider
              value={[zoom]}
              min={0.5}
              max={3}
              step={0.05}
              onValueChange={(val) => setZoom(val[0])}
            />
          </div>
          <p className="text-xs text-muted-foreground text-center">Drag the image to reposition</p>

          <div className="flex gap-3 justify-end pt-2">
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
              className="bg-editorial-pink text-background px-6 py-2 text-xs font-black uppercase tracking-wider hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {processing ? 'Saving...' : 'Save Crop'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};