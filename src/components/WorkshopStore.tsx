"use client";

import React, { useRef, useState, useEffect, forwardRef, useImperativeHandle } from "react";
import "../styles/workshop-store.css";

// ─────────────────────────────────────────────────────────────
// WorkshopStore — self-contained scroll-animated section
// ─────────────────────────────────────────────────────────────

export interface WorkshopStoreHandle {
  update: (progress: number) => void;
}

const WorkshopStore = forwardRef<WorkshopStoreHandle, {}>((props, ref) => {
  // ── Refs for direct DOM style mutations (no React re-render on scroll) ──
  const containerRef = useRef<HTMLDivElement>(null);
  const storeDetailsRef = useRef<HTMLDivElement>(null);
  const storeGridRef = useRef<HTMLDivElement>(null);
  const revealedImgRef = useRef<HTMLImageElement>(null);
  const revealerBarRef = useRef<HTMLDivElement>(null);

  // ── State ──
  const [activeCard, setActiveCard] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  // ── Detect mobile ──
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Expose the update function to parent components to trigger 60fps animations
  useImperativeHandle(ref, () => ({
    update: (progress: number) => {
      let slideOffset = 100; // vh — starts offscreen bottom
      let opacity = 0;
      let revealPct = 0;

      // Adjusted scroll ranges for Motovillage timeline (interchanged, now at 0.61905 -> 0.72):
      //   0.61905 → 0.64286 : slide in (enter)
      //   0.64286 → 0.72 : visible + image reveal
      //   0.72 → 0.74381 : slide out (exit)
      if (isMobile) {
        if (progress > 0.61905) {
          if (progress <= 0.64286) {
            const t = (progress - 0.61905) / 0.02381;
            const easeT = t * t * (3 - 2 * t); // Smoothstep easing
            slideOffset = 100 - 100 * easeT;
            opacity = easeT;
            revealPct = 0;
          } else {
            const scrollT = Math.min(1, (progress - 0.64286) / (0.91 - 0.64286));
            slideOffset = -scrollT * 300;
            opacity = slideOffset < 0 ? 1 : Math.max(0, 1 - slideOffset / 100);
            revealPct = Math.max(0, Math.min(100, scrollT * 600)); // Reveal faster on scroll
          }
        }
      } else {
        if (progress > 0.61905) {
          if (progress <= 0.64286) {
            const t = (progress - 0.61905) / 0.02381;
            const easeT = t * t * (3 - 2 * t); // Smoothstep easing
            slideOffset = 100 - 100 * easeT;
            opacity = easeT;
          } else if (progress <= 0.72) {
            slideOffset = 0;
            opacity = 1;
            revealPct = Math.max(0, Math.min(100, ((progress - 0.64286) / 0.07714) * 100));
          } else if (progress <= 0.74381) {
            const t = (progress - 0.72) / 0.02381;
            const easeT = t * t * (3 - 2 * t); // Smoothstep easing
            slideOffset = -100 * easeT;
            opacity = 1 - easeT;
            revealPct = 100;
          } else {
            slideOffset = -100;
            opacity = 0;
            revealPct = 100;
          }
        }
      }

      const storeDetailsSlide = (slideOffset / 100) * 30;

      if (containerRef.current) {
        containerRef.current.style.transform = `translateY(${slideOffset}vh)`;
        containerRef.current.style.opacity = `${opacity}`;
        containerRef.current.style.pointerEvents = opacity > 0.05 ? "auto" : "none";
        containerRef.current.style.visibility = opacity > 0.01 ? "visible" : "hidden";
      }

      if (storeDetailsRef.current) {
        storeDetailsRef.current.style.opacity = `${opacity}`;
        storeDetailsRef.current.style.transform = isMobile
          ? `translateY(${slideOffset * 0.3}px)`
          : `translateX(${-storeDetailsSlide}px)`;
      }

      if (storeGridRef.current) {
        storeGridRef.current.style.opacity = `${opacity}`;
        storeGridRef.current.style.transform = isMobile
          ? `translateY(${slideOffset * 0.3}px)`
          : `translateX(${storeDetailsSlide}px)`;
      }

      if (revealedImgRef.current) {
        revealedImgRef.current.style.clipPath = `polygon(0 0, ${revealPct}% 0, ${revealPct}% 100%, 0 100%)`;
      }

      if (revealerBarRef.current) {
        revealerBarRef.current.style.left = `${revealPct}%`;
      }
    }
  }), [isMobile]);

  return (
    <div
      ref={containerRef}
      id="workshop-store"
      className="workshop-store-container"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        background: "#08080a",
        transform: "translateY(100vh)",
        opacity: 0,
        pointerEvents: "none",
        zIndex: 5,
        visibility: "hidden",
        willChange: "transform, opacity",
      }}
    >
      {/* ── LEFT: Store Info & Tool Cards ── */}
      <div
        ref={storeDetailsRef}
        className="store-details-glass workshop-store-left"
        style={{
          padding: "24px 30px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          textAlign: "left",
          opacity: 0,
          transform: "translateX(-30px)",
          boxSizing: "border-box",
          borderRadius: "24px",
          border: "1px solid rgba(255, 255, 255, 0.05)",
          background: "rgba(8, 8, 10, 0.75)",
          backdropFilter: "blur(20px)",
          willChange: "transform, opacity",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
          <span
            style={{
              fontSize: "0.75rem",
              color: "var(--color-orange)",
              fontFamily: "var(--font-mono)",
              letterSpacing: "3px",
              fontWeight: 800,
            }}
          >
            EQUIPMENT & PARTS
          </span>
          <h2
            style={{
              fontSize: "2.4rem",
              fontWeight: 900,
              textTransform: "uppercase",
              color: "var(--color-white)",
              margin: "5px 0 15px 0",
              lineHeight: 1.1,
              letterSpacing: "-0.5px",
            }}
          >
            Workshop <span style={{ color: "var(--color-orange)" }}>Store</span>
          </h2>
          <p style={{ fontSize: "0.95rem", color: "rgba(255, 255, 255, 0.6)", lineHeight: "1.6", margin: 0 }}>
            Our state-of-the-art diagnostic and mechanical parts store. Motor Village houses
            premium performance components, specialized gearboxes, high-grade suspension
            elements, and precision tuning tools used by our certified master technicians.
          </p>
        </div>

        {/* Tool Cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", margin: "15px 0", flex: 1, justifyContent: "center" }}>
          {/* Card 1 — ECU Diagnostics */}
          <ToolCard
            id="ecu"
            active={activeCard === "ecu"}
            onToggle={() => setActiveCard(activeCard === "ecu" ? null : "ecu")}
            icon={
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
            }
            title="ECU Diagnostics & Tuning"
            subtitle="Live engine remapping & telemetry sensors."
            detail="Real-time engine mapping, sensor calibration, dyno telemetry diagnostics, and customized fuel/air curve adjustments for track and street setups."
          />

          {/* Card 2 — Performance Upgrades */}
          <ToolCard
            id="upgrades"
            active={activeCard === "upgrades"}
            onToggle={() => setActiveCard(activeCard === "upgrades" ? null : "upgrades")}
            icon={
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            }
            title="Performance Upgrades"
            subtitle="Stage-grade suspension, exhausts, and gear setups."
            detail="Installation of stage-grade coilover suspension, lightweight carbon fiber body panels, custom high-flow exhaust systems, and high-performance racing gear ratios."
          />

          {/* Card 3 — Precision Tools */}
          <ToolCard
            id="tools"
            active={activeCard === "tools"}
            onToggle={() => setActiveCard(activeCard === "tools" ? null : "tools")}
            icon={
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            }
            title="Precision Tools Store"
            subtitle="Calibrated wrench boards and hydraulic pump testers."
            detail="Calibrated digital torque wrenches, high-pressure hydraulic pump testers, specialized valve spring compressors, and advanced fluid flush systems."
          />
        </div>
      </div>

      {/* ── RIGHT: Before-After Image Revealer ── */}
      <div
        ref={storeGridRef}
        className="workshop-store-right"
        style={{
          position: "relative",
          borderRadius: "24px",
          overflow: "hidden",
          boxShadow: "0 20px 50px rgba(0, 0, 0, 0.5)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          opacity: 0,
          transform: "translateX(30px)",
          willChange: "transform, opacity",
        }}
      >
        {/* Base image */}
        <img
          src="/workshopstore.png"
          alt="Workshop Store"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            position: "absolute",
            top: 0,
            left: 0,
            zIndex: 1,
          }}
        />

        {/* Overlay image — revealed by clip-path */}
        <img
          ref={revealedImgRef}
          src="/workshopstoreA.png"
          alt="Workshop Store Details"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            position: "absolute",
            top: 0,
            left: 0,
            zIndex: 2,
            clipPath: "polygon(0 0, 0% 0, 0% 100%, 0 100%)",
            willChange: "clip-path",
          }}
        />

        {/* Orange revealer bar */}
        <div
          ref={revealerBarRef}
          style={{
            position: "absolute",
            top: 0,
            left: "0%",
            width: "2px",
            height: "100%",
            background: "var(--color-orange)",
            boxShadow: "0 0 15px var(--color-orange), 0 0 30px var(--color-orange)",
            zIndex: 3,
            pointerEvents: "none",
            willChange: "left",
          }}
        />
      </div>
    </div>
  );
});

WorkshopStore.displayName = "WorkshopStore";
export default WorkshopStore;

// ─────────────────────────────────────────────────────────────────────────────
// ToolCard — reusable accordion card sub-component
// ─────────────────────────────────────────────────────────────────────────────
interface ToolCardProps {
  id: string;
  active: boolean;
  onToggle: () => void;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  detail: string;
}

function ToolCard({ active, onToggle, icon, title, subtitle, detail }: ToolCardProps) {
  return (
    <div
      className={`store-tool-card ${active ? "active" : ""}`}
      onClick={onToggle}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        padding: "12px 16px",
        borderRadius: "12px",
        background: active ? "rgba(255,90,0,0.05)" : "rgba(255,255,255,0.02)",
        border: active ? "1px solid var(--color-orange)" : "1px solid rgba(255,255,255,0.04)",
        cursor: "pointer",
        transition: "all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)",
        boxShadow: active ? "0 0 20px rgba(255,90,0,0.1)" : "none",
      }}
    >
      <div style={{ display: "flex", gap: "15px", alignItems: "center" }}>
        <div
          style={{
            color: "var(--color-orange)",
            background: "rgba(255,90,0,0.1)",
            borderRadius: "8px",
            padding: "8px",
            display: "flex",
            transition: "transform 0.3s ease",
          }}
        >
          {icon}
        </div>
        <div style={{ flex: 1 }}>
          <h4 style={{ margin: "0 0 2px 0", color: "#fff", fontSize: "1.02rem", fontWeight: 700 }}>
            {title}
          </h4>
          <p style={{ margin: 0, color: "rgba(255,255,255,0.4)", fontSize: "0.82rem" }}>
            {subtitle}
          </p>
        </div>
        <div
          style={{
            transform: active ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.3s ease",
            color: "var(--color-orange)",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </div>

      <div
        style={{
          maxHeight: active ? "120px" : "0px",
          opacity: active ? 1 : 0,
          overflow: "hidden",
          transition: "all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)",
          fontSize: "0.85rem",
          color: "rgba(255,255,255,0.7)",
          lineHeight: "1.5",
          paddingLeft: "45px",
        }}
      >
        <div style={{ paddingTop: "8px", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
          {detail}
        </div>
      </div>
    </div>
  );
}
