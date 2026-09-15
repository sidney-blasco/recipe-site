"use client";

import { useCallback, useEffect } from "react";
import { useState } from "react";
import type { Photo } from "../lib/photos";

type PhotoGalleryProps = {
  photos: Photo[];
};

// Cycled purely for visual variety between placeholder tiles — not a category signal.
const PLACEHOLDER_GRADIENTS = [
  "from-lavender to-mauve/40",
  "from-blush to-lilac/50",
  "from-periwinkle/40 to-lavender",
  "from-mauve/30 to-blush",
];

function PlaceholderTile({ index }: { index: number }) {
  return (
    <div
      className={`flex h-full w-full items-center justify-center bg-gradient-to-br ${PLACEHOLDER_GRADIENTS[index % PLACEHOLDER_GRADIENTS.length]}`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-8 w-8 text-plum/40"
        aria-hidden="true"
      >
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <circle cx="9" cy="11" r="2" />
        <path d="m21 16-4.5-4.5a2 2 0 0 0-2.8 0L7 18" />
      </svg>
    </div>
  );
}

function CloseIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function ChevronIcon({ direction }: { direction: "left" | "right" }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-6 w-6"
      aria-hidden="true"
    >
      <polyline points={direction === "left" ? "15 18 9 12 15 6" : "9 18 15 12 9 6"} />
    </svg>
  );
}

export default function PhotoGallery({ photos }: PhotoGalleryProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const showNext = useCallback(() => {
    setOpenIndex((current) => (current === null ? null : (current + 1) % photos.length));
  }, [photos.length]);

  const showPrev = useCallback(() => {
    setOpenIndex((current) =>
      current === null ? null : (current - 1 + photos.length) % photos.length
    );
  }, [photos.length]);

  useEffect(() => {
    if (openIndex === null) return;

    document.body.style.overflow = "hidden";
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpenIndex(null);
      if (event.key === "ArrowRight") showNext();
      if (event.key === "ArrowLeft") showPrev();
    }
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [openIndex, showNext, showPrev]);

  if (photos.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-plum/20 px-6 py-16 text-center">
        <p className="text-lg text-plum">No photos yet.</p>
      </div>
    );
  }

  const activePhoto = openIndex !== null ? photos[openIndex] : null;

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
        {photos.map((photo, index) => (
          <button
            key={photo.id}
            type="button"
            onClick={() => setOpenIndex(index)}
            aria-label={`View ${photo.alt} larger`}
            className="group aspect-square overflow-hidden rounded-2xl bg-lavender focus:outline-none focus-visible:ring-2 focus-visible:ring-plum/50"
          >
            {photo.src ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={photo.src}
                alt={photo.alt}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <div className="h-full w-full transition-transform duration-300 group-hover:scale-105">
                <PlaceholderTile index={index} />
              </div>
            )}
          </button>
        ))}
      </div>

      {activePhoto && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={activePhoto.alt}
          onClick={() => setOpenIndex(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/85 px-4 py-10"
        >
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              setOpenIndex(null);
            }}
            aria-label="Close"
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-cream transition-colors hover:bg-white/20"
          >
            <CloseIcon />
          </button>

          {photos.length > 1 && (
            <>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  showPrev();
                }}
                aria-label="Previous photo"
                className="absolute left-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-cream transition-colors hover:bg-white/20 sm:left-4"
              >
                <ChevronIcon direction="left" />
              </button>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  showNext();
                }}
                aria-label="Next photo"
                className="absolute right-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-cream transition-colors hover:bg-white/20 sm:right-4"
              >
                <ChevronIcon direction="right" />
              </button>
            </>
          )}

          <div
            className="max-h-[80vh] w-full max-w-2xl overflow-hidden rounded-2xl bg-lavender"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="aspect-[4/3] w-full">
              {activePhoto.src ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={activePhoto.src} alt={activePhoto.alt} className="h-full w-full object-cover" />
              ) : (
                <PlaceholderTile index={openIndex ?? 0} />
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
