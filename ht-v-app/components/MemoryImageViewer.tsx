"use client";

import { useEffect, useState } from "react";

export default function MemoryImageViewer({ src, alt, title, imageClassName = "", variant = "", onImageDimensions }: {
  src: string;
  alt: string;
  title: string;
  imageClassName?: string;
  variant?: "senior" | "";
  onImageDimensions?: (width: number, height: number) => void;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [open]);

  return <>
    <button type="button" className={`memory-photo-trigger ${variant === "senior" ? "memory-photo-trigger-senior" : ""}`} onClick={() => setOpen(true)} aria-label={`View full photo: ${alt}`}>
      <img className={imageClassName} src={src} alt={alt} loading="lazy" onLoad={(event) => onImageDimensions?.(event.currentTarget.naturalWidth, event.currentTarget.naturalHeight)} />
      <span className="memory-photo-hover">View full photo <span aria-hidden="true">⤢</span></span>
    </button>
    {open && <div className="memory-photo-lightbox" role="dialog" aria-modal="true" aria-label={`Full photo: ${title}`} onClick={() => setOpen(false)}>
      <button type="button" className="memory-photo-close" onClick={() => setOpen(false)} aria-label="Close full photo">×</button>
      <div className="memory-photo-lightbox-content" onClick={(event) => event.stopPropagation()}>
        <img src={src} alt={alt} />
        <p>{title}</p>
      </div>
    </div>}
  </>;
}
