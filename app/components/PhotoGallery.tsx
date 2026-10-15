"use client";

import { useCallback, useEffect } from "react";
import { useState } from "react";
import type { Photo } from "../lib/photos";

type PhotoGalleryProps = {
  photos: Photo[];
};

// Cycled purely for visual variety between placeholder tiles — not a category signal.
const PLACEHOLDER_GROUNDS = ["bg-stone", "bg-blush", "bg-sage", "bg-ground"];

function PlaceholderTile({ index }: { index: number }) {
  return (
    <div
      className={`flex h-full w-full items-center justify-center ${PLACEHOLDER_GROUNDS[index % PLACEHOLDER_GROUNDS.length]}`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.25}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-8 w-8 text-ink-faded/50"
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
      <div className="panel bg-stone text-center">
        <p className="display-it m-0 text-h4 text-ink">No photos yet.</p>
      </div>
    );
  }

  const activePhoto = openIndex !== null ? photos[openIndex] : null;

  return (
    <>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
        {photos.map((photo, index) => (
          <button
            key={photo.id}
            type="button"
            onClick={() => setOpenIndex(index)}
            aria-label={`View ${photo.alt} larger`}
            className="block cursor-zoom-in rounded-[22px] bg-mat p-2.5 transition-colors duration-300 hover:bg-mat-wine"
          >
            {photo.src ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photo.src} alt={photo.alt} className="aspect-square w-full rounded-[12px] object-cover" />
            ) : (
              <div className="aspect-square w-full overflow-hidden rounded-[12px]">
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
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/90 px-4 py-10"
        >
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              setOpenIndex(null);
            }}
            aria-label="Close"
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-pill bg-ground/10 text-ground transition-colors duration-200 hover:bg-ground/20"
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
                className="absolute left-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-pill bg-ground/10 text-ground transition-colors duration-200 hover:bg-ground/20 sm:left-4"
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
                className="absolute right-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-pill bg-ground/10 text-ground transition-colors duration-200 hover:bg-ground/20 sm:right-4"
              >
                <ChevronIcon direction="right" />
              </button>
            </>
          )}

          <figure
            className="m-0 w-full max-w-2xl rounded-panel bg-mat p-[clamp(.9rem,2.5vw,1.6rem)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="aspect-[4/3] max-h-[70vh] w-full overflow-hidden rounded-photo">
              {activePhoto.src ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={activePhoto.src} alt={activePhoto.alt} className="h-full w-full object-cover" />
              ) : (
                <PlaceholderTile index={openIndex ?? 0} />
              )}
            </div>
            <figcaption className="mx-1.5 mt-3 text-small italic text-mat-text">{activePhoto.alt}</figcaption>
          </figure>
        </div>
      )}
    </>
  );
}
