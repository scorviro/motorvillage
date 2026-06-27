"use client";

import React, { useRef, useState, useEffect, forwardRef, useImperativeHandle } from "react";
import "../styles/gallery-section.css";

// ─────────────────────────────────────────────────────────────────────────────
// Gallery data — premium high-quality image paths from /public
// ─────────────────────────────────────────────────────────────────────────────
const galleryData = [
  { id: 1, img: "/workshopstore.png", title: "Main Storage Area", desc: "Organized • Clean • Professional" },
  { id: 2, img: "/workshopstoreA.png", title: "Advanced ECU Tuning Station", desc: "Performance • Precision • Speed" },
  { id: 3, img: "/servicedesctopback.png", title: "Performance Upgrade Zone", desc: "Dynamic • Custom • Calibrated" },
  { id: 4, img: "/workshopstore.png", title: "Master Mechanical Bay", desc: "Expertise • Quality • Care" },
  { id: 5, img: "/workshopstoreA.png", title: "Precision Diagnostic Terminal", desc: "Telemetry • Fault-Finding • Analysis" },
];

export interface GallerySectionProps {
}

export interface GallerySectionHandle {
  update: (progress: number) => void;
}

const GallerySection = forwardRef<GallerySectionHandle, GallerySectionProps>((props, ref) => {
  // ── Refs ──────────────────────────────────────────────────────────────────
  const containerRef = useRef<HTMLDivElement>(null);

  // ── State ─────────────────────────────────────────────────────────────────
  const [activeIdx, setActiveIdx] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  // ── Drag refs (no re-render needed) ───────────────────────────────────────
  const dragStartRef = useRef<number | null>(null);
  const isDraggingRef = useRef(false);

  // ── Mobile detection ──────────────────────────────────────────────────────
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // ── Auto-rotation ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (isHovered) return;
    const interval = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % galleryData.length);
    }, 1500);
    return () => clearInterval(interval);
  }, [isHovered]);

  // ── Keyboard navigation for lightbox ──────────────────────────────────────
  useEffect(() => {
    if (!lightboxImg) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxImg(null);
      if (e.key === "ArrowLeft") {
        const cur = galleryData.findIndex(item => item.img === lightboxImg);
        setLightboxImg(galleryData[(cur - 1 + galleryData.length) % galleryData.length].img);
      }
      if (e.key === "ArrowRight") {
        const cur = galleryData.findIndex(item => item.img === lightboxImg);
        setLightboxImg(galleryData[(cur + 1) % galleryData.length].img);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxImg]);

  // ── Expose update method imperatively to avoid React re-renders ──
  useImperativeHandle(ref, () => ({
    update: (progress: number) => {
      let slideOffset = 100; // vh
      let opacity = 0;

      // Gallery section scroll progress range: 0.79619 to 0.91
      if (isMobile) {
        if (progress > 0.61905) {
          if (progress <= 0.64286) {
            slideOffset = 100;
            opacity = 0;
          } else {
            const scrollT = Math.min(1, (progress - 0.64286) / (0.91 - 0.64286));
            slideOffset = 200 - scrollT * 300;
            opacity = slideOffset < 0 ? 1 : Math.max(0, 1 - slideOffset / 100);
          }
        } else {
          slideOffset = 100;
          opacity = 0;
        }
      } else {
        if (progress > 0.79619) {
          if (progress <= 0.82) {
            const t = (progress - 0.79619) / 0.02381;
            const easeT = t * t * (3 - 2 * t); // Smoothstep easing
            slideOffset = 100 - 100 * easeT;
            opacity = easeT;
          } else if (progress <= 0.886) {
            slideOffset = 0;
            opacity = 1;
          } else if (progress <= 0.91) {
            const t = (progress - 0.886) / 0.024;
            const easeT = t * t * (3 - 2 * t); // Smoothstep easing
            slideOffset = -100 * easeT;
            opacity = 1 - easeT;
          } else {
            slideOffset = -100;
            opacity = 0;
          }
        } else {
          slideOffset = 100;
          opacity = 0;
        }
      }

      if (containerRef.current) {
        containerRef.current.style.transform = `translateY(${slideOffset}vh)`;
        containerRef.current.style.opacity = `${opacity}`;
        containerRef.current.style.pointerEvents = opacity > 0.05 ? "auto" : "none";
        containerRef.current.style.visibility = opacity > 0.01 ? "visible" : "hidden";
      }

      // Automatically handle navbar light-theme class toggle
      const headerEl = document.querySelector(".desktop-navbar-fixed");
      if (headerEl) {
        const isGalleryActive = progress > 0.844 && progress <= 0.886;
        headerEl.classList.toggle("light-theme", isGalleryActive);
      }
    }
  }));

  // ── Drag handlers (mouse + touch) ─────────────────────────────────────────
  const handleDragStart = (clientX: number) => {
    dragStartRef.current = clientX;
    isDraggingRef.current = true;
  };

  const handleDragMove = (clientX: number) => {
    if (!isDraggingRef.current || dragStartRef.current === null) return;
    const delta = clientX - dragStartRef.current;
    if (Math.abs(delta) > 50) {
      if (delta > 0) {
        setActiveIdx((prev) => (prev - 1 + galleryData.length) % galleryData.length);
      } else {
        setActiveIdx((prev) => (prev + 1) % galleryData.length);
      }
      dragStartRef.current = null;
      isDraggingRef.current = false;
    }
  };

  const handleDragEnd = () => {
    isDraggingRef.current = false;
    dragStartRef.current = null;
  };

  // ── 3D transform calculator for each card ─────────────────────────────────
  const getCardStyle = (idx: number) => {
    let diff = idx - activeIdx;
    if (diff < -Math.floor(galleryData.length / 2)) diff += galleryData.length;
    if (diff > Math.floor(galleryData.length / 2)) diff -= galleryData.length;

    let transform = "";
    let opacity = 0;
    let zIndex = 1;
    let pointerEvents: "auto" | "none" = "none";

    if (diff === 0) {
      transform = "scale(1) translate3d(0, 0, 0) rotateY(0deg)";
      opacity = 1;
      zIndex = 10;
      pointerEvents = "auto";
    } else if (diff === -1) {
      transform = "scale(0.85) translate3d(-105%, 0, -100px) rotateY(25deg)";
      opacity = 1;
      zIndex = 5;
      pointerEvents = "auto";
    } else if (diff === 1) {
      transform = "scale(0.85) translate3d(105%, 0, -100px) rotateY(-25deg)";
      opacity = 1;
      zIndex = 5;
      pointerEvents = "auto";
    } else if (diff === -2) {
      transform = "scale(0.7) translate3d(-195%, 0, -200px) rotateY(35deg)";
      opacity = 0;
      zIndex = 2;
    } else if (diff === 2) {
      transform = "scale(0.7) translate3d(195%, 0, -200px) rotateY(-35deg)";
      opacity = 0;
      zIndex = 2;
    } else {
      transform = "scale(0.5) translate3d(0, 0, -300px)";
      opacity = 0;
      zIndex = 0;
    }

    return { transform, opacity, zIndex, pointerEvents };
  };

  return (
    <>
      {/* ── Gallery Section ── */}
      <div
        ref={containerRef}
        id="gallery"
        className="gallery-section-container"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100vh",
          zIndex: 5,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          opacity: 0,
          pointerEvents: "none",
          visibility: "hidden",
          willChange: "transform, opacity",
        }}
      >
        {/* Title */}
        <div className="gallery-title-wrapper">
          <h2 className="gallery-title">
            Gallery<span className="script">Our Work</span>
          </h2>
          <p className="gallery-subtext">
            Take a look at our organized workspace, tools, equipment, and the care we put into every detail.
          </p>
        </div>

        {/* 3D Slider Viewport */}
        <div
          className="gallery-slider-viewport"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => { setIsHovered(false); handleDragEnd(); }}
          onMouseDown={(e) => handleDragStart(e.clientX)}
          onMouseMove={(e) => handleDragMove(e.clientX)}
          onMouseUp={handleDragEnd}
          onTouchStart={(e) => handleDragStart(e.touches[0].clientX)}
          onTouchMove={(e) => handleDragMove(e.touches[0].clientX)}
          onTouchEnd={handleDragEnd}
          style={{ cursor: "grab" }}
        >
          {/* Prev Arrow */}
          <button
            className="gallery-nav-btn prev"
            onClick={() => setActiveIdx((prev) => (prev - 1 + galleryData.length) % galleryData.length)}
            aria-label="Previous slide"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>

          {/* Card Track */}
          <div className="gallery-slider-track">
            {galleryData.map((item, idx) => {
              const cardStyle = getCardStyle(idx);
              const isActive = idx === activeIdx;

              return (
                <div
                  key={item.id}
                  className={`gallery-3d-card ${isActive ? "active" : ""}`}
                  style={cardStyle}
                  onClick={() => {
                    if (isActive) {
                      setLightboxImg(item.img);
                    } else {
                      setActiveIdx(idx);
                    }
                  }}
                >
                  <img src={item.img} alt={item.title} />

                  {/* Caption overlay — visible only on active card */}
                  <div className="gallery-card-overlay">
                    <div className="gallery-card-info">
                      <p className="gallery-card-title">{item.title}</p>
                      <p className="gallery-card-desc">{item.desc}</p>
                    </div>
                    <button
                      className="gallery-card-zoom-btn"
                      onClick={(e) => { e.stopPropagation(); setLightboxImg(item.img); }}
                      aria-label="Open fullscreen"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8" />
                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                        <line x1="11" y1="8" x2="11" y2="14" />
                        <line x1="8" y1="11" x2="14" y2="11" />
                      </svg>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Next Arrow */}
          <button
            className="gallery-nav-btn next"
            onClick={() => setActiveIdx((prev) => (prev + 1) % galleryData.length)}
            aria-label="Next slide"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>

        {/* Thumbnail Strip */}
        <div className="gallery-thumb-container">
          <button
            className="gallery-thumb-arrow"
            onClick={() => setActiveIdx((prev) => (prev - 1 + galleryData.length) % galleryData.length)}
            aria-label="Previous thumbnail"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>

          {galleryData.map((item, idx) => (
            <div
              key={`thumb-${item.id}`}
              className={`gallery-thumb-wrapper ${idx === activeIdx ? "active" : ""}`}
              onClick={() => setActiveIdx(idx)}
            >
              <img src={item.img} alt={`Thumbnail ${item.title}`} />
            </div>
          ))}

          <button
            className="gallery-thumb-arrow"
            onClick={() => setActiveIdx((prev) => (prev + 1) % galleryData.length)}
            aria-label="Next thumbnail"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
      </div>

      {/* ── Lightbox Modal (rendered outside section container, full viewport) ── */}
      {lightboxImg && (
        <div
          className="gallery-lightbox-overlay"
          onClick={() => setLightboxImg(null)}
        >
          {/* Close Button */}
          <button
            className="gallery-lightbox-close"
            onClick={() => setLightboxImg(null)}
            aria-label="Close lightbox"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>

          {/* Prev in lightbox */}
          <button
            className="gallery-lightbox-nav prev"
            onClick={(e) => {
              e.stopPropagation();
              const cur = galleryData.findIndex(item => item.img === lightboxImg);
              setLightboxImg(galleryData[(cur - 1 + galleryData.length) % galleryData.length].img);
            }}
            aria-label="Previous image"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>

          {/* Image */}
          <div
            className="gallery-lightbox-content"
            onClick={(e) => e.stopPropagation()}
          >
            <img src={lightboxImg} alt="Gallery fullscreen" />
          </div>

          {/* Next in lightbox */}
          <button
            className="gallery-lightbox-nav next"
            onClick={(e) => {
              e.stopPropagation();
              const cur = galleryData.findIndex(item => item.img === lightboxImg);
              setLightboxImg(galleryData[(cur + 1) % galleryData.length].img);
            }}
            aria-label="Next image"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
      )}
    </>
  );
});

GallerySection.displayName = "GallerySection";

export default GallerySection;
