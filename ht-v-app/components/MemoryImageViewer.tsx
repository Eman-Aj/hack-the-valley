"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export default function MemoryImageViewer({ src, alt, title, imageClassName = "", variant = "" }: {
  src: string;
  alt: string;
  title: string;
  imageClassName?: string;
  variant?: "senior" | "";
}) {
  const [open, setOpen] = useState(false);
  const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setPortalRoot(document.body);
  }, []);

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
      {variant === "senior" && <span className="memory-photo-ambient" aria-hidden="true"><img src={src} alt="" loading="lazy"/></span>}
      <img className={`${imageClassName} ${variant === "senior" ? "memory-photo-foreground" : ""}`} src={src} alt={alt} loading="lazy" />
      <span className="memory-photo-hover">View full photo <span aria-hidden="true">⤢</span></span>
    </button>
    {open && portalRoot && createPortal(<div className="memory-photo-lightbox" role="dialog" aria-modal="true" aria-label={`Full photo: ${title}`} onClick={() => setOpen(false)}>
      <button type="button" className="memory-photo-close" onClick={() => setOpen(false)} aria-label="Close full photo">×</button>
      <div className="memory-photo-lightbox-content" onClick={(event) => event.stopPropagation()}>
        <img src={src} alt={alt} />
        <p>{title}</p>
      </div>
    </div>, portalRoot)}
  </>;
}
