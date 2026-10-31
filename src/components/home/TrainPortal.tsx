"use client";

import { useEffect, useRef } from "react";
import type { TrainPortal as Portal } from "./train-portal-scene";

/**
 * Overlays a 3D Mumbai local that drives out of the photo it sits on as the
 * page scrolls. Place it inside a `relative` wrapper whose first child is the
 * photo's <figure>. Purely decorative: three.js loads only when the photo is
 * near the viewport, nothing renders without WebGL, and with reduced motion
 * the train is shown already out of the frame, without movement.
 */
export function TrainPortal() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    const photo = wrap?.parentElement?.querySelector<HTMLElement>("figure > div");
    if (!wrap || !canvas || !photo) return;

    let portal: Portal | null = null;
    let disposed = false;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const layout = () => {
      if (!portal) return;
      const box = wrap.getBoundingClientRect();
      const p = photo.getBoundingClientRect();
      portal.resize(box.width, box.height, { x: p.left - box.left, y: p.top - box.top, w: p.width, h: p.height });
    };
    // 0 when the photo's top reaches the bottom of the screen, 1 when it is a
    // third of the way down.
    const update = () => {
      if (!portal) return;
      if (reduced) return portal.setProgress(1);
      const p = photo.getBoundingClientRect();
      const vh = window.innerHeight;
      portal.setProgress((vh - p.top) / (vh * 0.68));
    };

    const start = async () => {
      const { createTrainPortal } = await import("./train-portal-scene");
      if (disposed) return;
      portal = createTrainPortal(canvas);
      if (!portal) return;
      layout();
      update();
      wrap.dataset.ready = "true";
    };

    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting) && !portal) {
          io.disconnect();
          void start();
        }
      },
      { rootMargin: "400px 0px" },
    );
    io.observe(photo);

    const ro = new ResizeObserver(() => {
      layout();
      update();
    });
    ro.observe(wrap);
    window.addEventListener("scroll", update, { passive: true });

    return () => {
      disposed = true;
      io.disconnect();
      ro.disconnect();
      window.removeEventListener("scroll", update);
      portal?.dispose();
    };
  }, []);

  return (
    <div
      ref={wrapRef}
      aria-hidden
      className="pointer-events-none absolute -inset-x-[8%] -inset-y-[110%] z-10 opacity-0 transition-opacity duration-500 data-[ready=true]:opacity-100"
    >
      <canvas ref={canvasRef} className="block size-full" />
    </div>
  );
}
