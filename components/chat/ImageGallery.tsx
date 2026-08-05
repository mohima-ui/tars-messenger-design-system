"use client";

import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";

/* Image gallery — a grid of thumbnails with a lightbox for full-size viewing.

   Three columns at this width: two makes each tile large enough to compete with
   the message, four shrinks them past recognisable. Tiles are square so a mixed
   set of aspect ratios still reads as a grid, and a name sits under each one —
   for people, the face alone doesn't identify anyone. */

const LINE = "#E0DAD3";
const INK = "#333333";
const MUTED = "#6E6E6E";

export type GalleryImage = {
  src: string;
  /** Shown under the tile and as the lightbox title. */
  caption: string;
  /** Optional second line — speciality, role, location. */
  detail?: string;
};

export type GalleryData = {
  title?: string;
  images: GalleryImage[];
};

export function ImageGallery({ data }: { data: GalleryData }) {
  const [open, setOpen] = useState<number | null>(null);
  const count = data.images.length;

  const close = useCallback(() => setOpen(null), []);
  const step = useCallback(
    (dir: number) => setOpen((i) => (i === null ? i : (i + dir + count) % count)),
    [count],
  );

  /* Keyboard is the point of a lightbox: Esc out, arrows through. */
  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close, step]);

  const current = open === null ? null : data.images[open];

  /* The message bubble keeps a transform from its entrance animation, which
     makes it the containing block for `fixed` — so a lightbox rendered in
     place is trapped inside the panel and clipped by its overflow. Portal it
     to the body to get a true full-viewport overlay.

     Resolved on open rather than on mount: nothing is portalled until the
     visitor taps a tile, so there is no state to set during the first render. */
  const host = open !== null && typeof document !== "undefined" ? document.body : null;

  return (
    <div className="w-full min-w-0">
      {data.title && (
        <p className="mb-2 text-[12px] font-semibold" style={{ color: INK }}>
          {data.title}
        </p>
      )}

      <div className="grid grid-cols-3 gap-2">
        {data.images.map((img, i) => (
          <button
            key={img.src + i}
            type="button"
            onClick={() => setOpen(i)}
            aria-label={`View ${img.caption}`}
/* Named group: the message bubble is also a `.group` (for its hover
               toolbar), and a bare `group-hover` would match that ancestor —
               lighting every tile whenever the pointer is anywhere in the
               message. */
            className="group/tile text-left"
          >
            <span
              className="relative block aspect-square overflow-hidden rounded-[10px] border bg-white"
              style={{ borderColor: LINE }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.src}
                alt={img.caption}
                loading="lazy"
                /* object-top keeps faces in frame when a portrait is cropped
                   square; on hover it fades back to let the prompt read */
                className="size-full object-cover object-top transition-all duration-300 group-hover/tile:scale-[1.04] group-hover/tile:opacity-25"
              />
              {/* the image fades toward the white tile, so the prompt is ink
                  rather than white-on-photo */}
              <span className="absolute inset-0 flex items-center justify-center px-2 text-center opacity-0 transition-opacity duration-200 group-hover/tile:opacity-100 group-focus-visible/tile:opacity-100">
                <span className="text-[10.5px] font-medium leading-tight" style={{ color: INK }}>
                  Tap to see full size
                </span>
              </span>
            </span>

            <span
              className="mt-1.5 block truncate text-[11.5px] font-medium leading-tight"
              style={{ color: INK }}
            >
              {img.caption}
            </span>
            {img.detail && (
              <span className="block truncate text-[10.5px] leading-tight" style={{ color: MUTED }}>
                {img.detail}
              </span>
            )}
          </button>
        ))}
      </div>

      {current && host && createPortal(
        <div
          role="dialog"
          aria-modal="true"
          aria-label={current.caption}
          className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-black/70 p-6 backdrop-blur-sm"
          style={{ animation: "fade-in 180ms ease-out both" }}
          onClick={close}
        >
          {/* clicks inside the frame shouldn't dismiss it */}
          <div
            className="relative flex max-h-full max-w-[min(920px,90vw)] flex-col items-center gap-3"
            onClick={(e) => e.stopPropagation()}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={current.src}
              alt={current.caption}
              className="max-h-[72vh] w-auto rounded-[12px] object-contain shadow-2xl"
            />
            <p className="text-[14px] font-medium text-white">{current.caption}</p>
            {current.detail && <p className="text-[12px] text-white/70">{current.detail}</p>}
            <p className="text-[11px] text-white/50">
              {(open ?? 0) + 1} of {count}
            </p>
          </div>

          <button
            type="button"
            onClick={close}
            aria-label="Close"
            className="absolute right-5 top-5 flex size-9 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
          >
            <X className="size-5" strokeWidth={2} />
          </button>

          {count > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  step(-1);
                }}
                aria-label="Previous image"
                className="absolute left-4 flex size-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
              >
                <ChevronLeft className="size-6" strokeWidth={2} />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  step(1);
                }}
                aria-label="Next image"
                className="absolute right-4 flex size-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
              >
                <ChevronRight className="size-6" strokeWidth={2} />
              </button>
            </>
          )}
        </div>,
        host,
      )}

    </div>
  );
}
