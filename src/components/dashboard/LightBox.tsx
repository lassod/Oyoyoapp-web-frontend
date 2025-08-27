// Lightbox.tsx (or place above your component in the same file)
"use client";
import { useEffect, useRef, useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

type LightboxProps = {
  images: string[];
  index: number;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
};

export function Lightbox({
  images,
  index,
  onClose,
  onNext,
  onPrev,
}: LightboxProps) {
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const backdropRef = useRef<HTMLDivElement>(null);

  // Keyboard: ESC, ←, →
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onNext();
      if (e.key === "ArrowLeft") onPrev();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose, onNext, onPrev]);

  // Close when clicking backdrop (but not when clicking image)
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === backdropRef.current) onClose();
  };

  // Basic touch-swipe
  const onTouchStart = (e: React.TouchEvent) =>
    setTouchStartX(e.touches[0].clientX);
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (dx < -50) onNext();
    if (dx > 50) onPrev();
    setTouchStartX(null);
  };

  if (!images?.length) return null;

  return (
    <div
      ref={backdropRef}
      onClick={handleBackdropClick}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      className="fixed inset-0 z-[1000] bg-black/90 flex items-center justify-center"
      aria-modal="true"
      role="dialog"
    >
      {/* Close */}
      <button
        onClick={onClose}
        aria-label="Close"
        className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20"
      >
        <X className="w-6 h-6 text-white" />
      </button>

      {/* Prev */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onPrev();
        }}
        aria-label="Previous image"
        className="absolute left-4 p-3 rounded-full bg-white/10 hover:bg-white/20"
      >
        <ChevronLeft className="w-7 h-7 text-white" />
      </button>

      {/* Next */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onNext();
        }}
        aria-label="Next image"
        className="absolute right-4 p-3 rounded-full bg-white/10 hover:bg-white/20"
      >
        <ChevronRight className="w-7 h-7 text-white" />
      </button>

      {/* Counter */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 text-sm text-white/80">
        {index + 1} / {images.length}
      </div>

      {/* Image */}
      <div className="max-w-[95vw] max-h-[90vh]">
        {/* Using <img> avoids Next/Image domain constraints inside modal */}
        <img
          src={images[index]}
          alt={`Image ${index + 1}`}
          className="max-w-[95vw] max-h-[90vh] object-contain select-none"
          draggable={false}
        />
      </div>
    </div>
  );
}
