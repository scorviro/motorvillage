"use client";

import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";

const parseColorToRgb = (colorStr: string): { r: number; g: number; b: number } => {
  if (!colorStr) return { r: 255, g: 255, b: 255 };
  const cleanColor = colorStr.trim();
  if (cleanColor.startsWith("#")) {
    let hex = cleanColor.substring(1);
    if (hex.length === 3) {
      hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    const num = parseInt(hex, 16);
    if (isNaN(num)) return { r: 255, g: 255, b: 255 };
    return {
      r: (num >> 16) & 255,
      g: (num >> 8) & 255,
      b: num & 255,
    };
  }
  if (cleanColor.startsWith("rgb")) {
    const match = cleanColor.match(/\d+/g);
    if (match && match.length >= 3) {
      return {
        r: parseInt(match[0], 10),
        g: parseInt(match[1], 10),
        b: parseInt(match[2], 10),
      };
    }
  }
  return { r: 255, g: 255, b: 255 };
};

interface PathData {
  d: string;
  fill: string;
  transform: string;
}

interface PremiumLoaderProps {
  paths: PathData[];
  onTransitionStart: () => void;
  onComplete: () => void;
  isUnlocked: boolean;
  onUnlock: () => void;
  preloadProgress: number;
}

interface Particle {
  x: number;
  y: number;
  z: number;
  tx: number;
  ty: number;
  tz: number;
  ox: number;
  oy: number;
  oz: number;
  vx: number;
  vy: number;
  vz: number;
  color: string;
  r: number;
  g: number;
  b: number;
  size: number;
  alpha: number;
  life: number;
  maxLife: number;
  active: boolean;
  type: "explosion" | "assemble" | "spark" | "dust";
}

export default function PremiumLoader({
  paths,
  onTransitionStart,
  onComplete,
  isUnlocked,
  onUnlock,
  preloadProgress,
}: PremiumLoaderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const [sceneText, setSceneText] = useState("Every Machine Has A Story");
  const [hasStarted, setHasStarted] = useState(true);
  // Particle Engine Variables
  const particlesRef = useRef<Particle[]>([]);
  const animationFrameRef = useRef<number | null>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  const progressRef = useRef(preloadProgress);
  const hasPausedForLoadingRef = useRef(false);

  useEffect(() => {
    progressRef.current = preloadProgress;
    if (preloadProgress === 100 && hasPausedForLoadingRef.current && timelineRef.current) {
      hasPausedForLoadingRef.current = false;
      gsap.set(containerRef.current, { background: "transparent" });
      timelineRef.current.play();
    }
  }, [preloadProgress]);

  const logoPointsRef = useRef<{ x: number; y: number; color: string; r: number; g: number; b: number }[]>([]);

  // Scan light animation variable
  const scanXRef = useRef<number>(-200);
  const brushOpacityRef = useRef<number>(0);
  const bgOrangeProgressRef = useRef<number>(0);
  const bgBlackProgressRef = useRef<number>(0);

  // Cached Linear Gradients
  const gradCharcoalRef = useRef<CanvasGradient | null>(null);
  const gradOrangeRef = useRef<CanvasGradient | null>(null);

  // Cache for SVG path lengths
  const pathLengthsRef = useRef<Map<SVGPathElement, number>>(new Map());

  const onUnlockRef = useRef(onUnlock);
  useEffect(() => {
    onUnlockRef.current();
  }, []);

  useEffect(() => {
    // Resize handler
    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      if (canvasRef.current) {
        canvasRef.current.width = w;
        canvasRef.current.height = h;

        const ctx = canvasRef.current.getContext("2d");
        if (ctx) {
          // Cache Stripe 1, 3, 5 (Charcoal Black panels)
          const gradC = ctx.createLinearGradient(0, 0, 0, h);
          gradC.addColorStop(0, "#0E0E0E");
          gradC.addColorStop(0.3, "#050505");
          gradC.addColorStop(1, "#000000");
          gradCharcoalRef.current = gradC;

          // Cache Stripe 2 & 4 (Vibrant Orange panels)
          const gradO = ctx.createLinearGradient(0, 0, 0, h);
          gradO.addColorStop(0, "#FF6A1A");
          gradO.addColorStop(0.3, "#D24000");
          gradO.addColorStop(0.7, "#420700");
          gradO.addColorStop(1, "#000000");
          gradOrangeRef.current = gradO;
        }
      }
    };
    window.addEventListener("resize", handleResize);
    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Pre-measure all path lengths once to avoid layout thrashing during animation
  useEffect(() => {
    if (hasStarted) {
      const timer = setTimeout(() => {
        const pathEls = svgRef.current?.querySelectorAll(".logo-vector-path");
        if (pathEls) {
          pathEls.forEach((el) => {
            const path = el as SVGPathElement;
            pathLengthsRef.current.set(path, path.getTotalLength());
          });
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [hasStarted]);



  // Initialize particles once SVG is mounted (hidden)
  const sampleSVGPoints = () => {
    if (!svgRef.current || logoPointsRef.current.length > 0) return;

    const pathEls = svgRef.current.querySelectorAll("path");
    const points: { x: number; y: number; color: string; r: number; g: number; b: number }[] = [];

    pathEls.forEach((pathEl) => {
      const length = pathEl.getTotalLength();
      if (length < 2) return;

      const idxAttr = pathEl.getAttribute("data-index");
      const idx = idxAttr !== null ? parseInt(idxAttr, 10) : -1;
      const fill = (idx !== -1 ? paths[idx]?.fill : null) || "#FFFFFF";
      const rgb = parseColorToRgb(fill);

      // Parse transform translate
      let tx = 0, ty = 0;
      const transform = pathEl.getAttribute("transform");
      if (transform) {
        const match = transform.match(/translate\(([^,)]+)(?:[\s,]+([^)]+))?\)/);
        if (match) {
          tx = parseFloat(match[1]);
          ty = match[2] ? parseFloat(match[2]) : 0;
        }
      }

      // Sample points along path
      const spacing = 22; // px spacing (optimized for smoother performance)
      const numSamples = Math.max(8, Math.floor(length / spacing));
      for (let i = 0; i <= numSamples; i++) {
        const progress = i / numSamples;
        const pt = pathEl.getPointAtLength(progress * length);
        points.push({
          x: pt.x + tx,
          y: pt.y + ty + 724,
          color: fill,
          r: rgb.r,
          g: rgb.g,
          b: rgb.b,
        });
      }
    });

    logoPointsRef.current = points;
  };

  useEffect(() => {
    if (hasStarted) {
      // Trigger SVG point sampling
      sampleSVGPoints();

      // Start Particle loop
      startParticleSystem();

      // Start GSAP cinematic timeline
      startCinematicTimeline();
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (timelineRef.current) {
        timelineRef.current.kill();
      }
    };
  }, [hasStarted]);

  const startParticleSystem = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const particles: Particle[] = [];

    // Dust particles removed per user request

    particlesRef.current = particles;

    const renderLoop = () => {
      if (!canvas || !ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const w = canvas.width;
      const h = canvas.height;

      // 1. Draw Background Slats Base (Alternating Charcoal & Orange panels from image.png)
      const s1 = 0.185 * w;
      const s2 = 0.395 * w;
      const s3 = 0.605 * w;
      const s4 = 0.815 * w;

      // Draw Stripe 1, 3, 5 (Charcoal Black panels)
      const gradCharcoal = gradCharcoalRef.current || (() => {
        const grad = ctx.createLinearGradient(0, 0, 0, h);
        grad.addColorStop(0, "#0E0E0E"); // deep black-gray
        grad.addColorStop(0.3, "#050505"); // deeper black
        grad.addColorStop(1, "#000000"); // pure black
        return grad;
      })();

      // Draw Stripe 2 & 4 (Vibrant Orange panels)
      const gradOrange = gradOrangeRef.current || (() => {
        const grad = ctx.createLinearGradient(0, 0, 0, h);
        grad.addColorStop(0, "#FF6A1A"); // vibrant, rich orange highlight
        grad.addColorStop(0.3, "#D24000"); // deep luxury orange
        grad.addColorStop(0.7, "#420700"); // dark, rich burgundy/amber
        grad.addColorStop(1, "#000000"); // pure black at the bottom
        return grad;
      })();

      const panels = [
        { xStart: 0, xEnd: s1, isOrange: false, spotX: 0.09 * w },
        { xStart: s1, xEnd: s2, isOrange: true, spotX: 0.29 * w },
        { xStart: s2, xEnd: s3, isOrange: false, spotX: 0.50 * w },
        { xStart: s3, xEnd: s4, isOrange: true, spotX: 0.71 * w },
        { xStart: s4, xEnd: w, isOrange: false, spotX: 0.91 * w },
      ];

      panels.forEach((p) => {
        const progress = p.isOrange ? bgOrangeProgressRef.current : bgBlackProgressRef.current;
        if (progress <= 0.001) return;

        ctx.save();
        // Top-to-bottom reveal clip path
        ctx.beginPath();
        ctx.rect(p.xStart, 0, p.xEnd - p.xStart, h * progress);
        ctx.clip();

        // Draw panel background
        ctx.fillStyle = p.isOrange ? gradOrange : gradCharcoal;
        ctx.fillRect(p.xStart, 0, p.xEnd - p.xStart, h);

        // Draw Spotlight cone from the top inside this panel
        ctx.save();
        ctx.globalCompositeOperation = "screen";

        if (p.isOrange) {
          const spotGrad = ctx.createRadialGradient(p.spotX, 0, 0, p.spotX, 0, h * 0.45);
          spotGrad.addColorStop(0, "rgba(255, 130, 30, 0.18)");
          spotGrad.addColorStop(0.15, "rgba(230, 70, 10, 0.09)");
          spotGrad.addColorStop(0.45, "rgba(180, 40, 0, 0.04)");
          spotGrad.addColorStop(0.75, "rgba(90, 15, 0, 0.01)");
          spotGrad.addColorStop(1.0, "rgba(0, 0, 0, 0)");
          ctx.fillStyle = spotGrad;
          ctx.beginPath();
          ctx.arc(p.spotX, 0, h * 0.45, 0, Math.PI);
          ctx.fill();
        } else {
          const spotGrad = ctx.createRadialGradient(p.spotX, 0, 0, p.spotX, 0, h * 0.38);
          spotGrad.addColorStop(0, "rgba(255, 235, 215, 0.08)");
          spotGrad.addColorStop(0.2, "rgba(220, 200, 185, 0.04)");
          spotGrad.addColorStop(0.5, "rgba(120, 110, 100, 0.01)");
          spotGrad.addColorStop(1.0, "rgba(0, 0, 0, 0)");
          ctx.fillStyle = spotGrad;
          ctx.beginPath();
          ctx.arc(p.spotX, 0, h * 0.38, 0, Math.PI);
          ctx.fill();
        }
        ctx.restore();

        // Draw 3D Ribbed texture lines (slats) overlay inside this panel
        const spacing = 14;
        const firstSlatX = Math.floor(p.xStart / spacing) * spacing;
        for (let x = firstSlatX; x < p.xEnd; x += spacing) {
          if (x < p.xStart) continue;

          // Deep shadow edge on the left side of each rib
          ctx.strokeStyle = "rgba(0, 0, 0, 0.42)";
          ctx.lineWidth = 2.0;
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, h);
          ctx.stroke();

          // 3D edge highlight on the right side of each rib
          if (p.isOrange) {
            ctx.strokeStyle = "rgba(255, 180, 100, 0.09)";
          } else {
            ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
          }
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.moveTo(x + 1, 0);
          ctx.lineTo(x + 1, h);
          ctx.stroke();
        }

        ctx.restore();
      });

      // 2. Draw Soft Backlight Glow behind the brush stroke (Scene 3+)
      const brushOpacity = brushOpacityRef.current;
      if (brushOpacity > 0.005) {
        ctx.save();
        ctx.globalAlpha = brushOpacity;

        const logoW = Math.min(w * 0.85, 1100);
        const strokeW = logoW * 1.1;
        const strokeH = logoW * 0.25;

        // Base soft backlight glow behind the white brush stroke
        const glowGrad = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, strokeW * 0.55);
        glowGrad.addColorStop(0, "rgba(255, 255, 255, 0.03)");
        glowGrad.addColorStop(1, "rgba(255, 255, 255, 0)");
        ctx.fillStyle = glowGrad;
        ctx.fillRect(w / 2 - strokeW, h / 2 - strokeH * 2, strokeW * 2, strokeH * 4);

        ctx.restore();
      }

      // 4. Update and Draw Particles
      const particles = particlesRef.current;
      const cameraZ = 200; // Simulated perspective focal length

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        if (!p.active) continue;

        if (p.type === "dust") {
          // Soft ambient floating
          p.x += p.vx;
          p.y += p.vy;

          if (p.x < 0) p.x = w;
          if (p.x > w) p.x = 0;
          if (p.y < 0) p.y = h;
          if (p.y > h) p.y = 0;

          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.type === "spark") {
          // Spark physics
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.08; // Gravity
          p.alpha *= 0.96; // Fade out
          p.life++;

          if (p.life > p.maxLife || p.alpha < 0.01) {
            p.active = false;
          }

          ctx.fillStyle = `rgba(255, 106, 26, ${p.alpha})`;
          ctx.fillRect(p.x, p.y, p.size, p.size);
        } else if (p.type === "explosion") {
          // True 3D Particle Warp/Explosion
          p.x += p.vx;
          p.y += p.vy;
          p.z += p.vz; // Move Z forward/backward
          p.alpha *= 0.985; // Slow fade out

          // 3D perspective projection
          // Normalize coordinates around center of canvas
          const cx = w / 2;
          const cy = h / 2;
          const scale = cameraZ / (cameraZ + p.z);
          const projX = cx + (p.x - cx) * scale;
          const projY = cy + (p.y - cy) * scale;
          const projSize = Math.max(0.1, p.size * scale);

          if (p.z < -cameraZ || p.alpha < 0.01 || projX < 0 || projX > w || projY < 0 || projY > h) {
            p.active = false;
          }

          ctx.fillStyle = `rgba(${p.r},${p.g},${p.b},${p.alpha})`;
          ctx.beginPath();
          ctx.arc(projX, projY, projSize, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.type === "assemble") {
          // Particles flying into home page elements
          const dx = p.tx - p.x;
          const dy = p.ty - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 4) {
            p.x = p.tx;
            p.y = p.ty;
            p.alpha *= 0.94; // fade once settled
            if (p.alpha < 0.01) p.active = false;
          } else {
            p.x += dx * 0.12;
            p.y += dy * 0.12;
          }

          ctx.fillStyle = `rgba(${p.r},${p.g},${p.b},${p.alpha})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Keep particle array clean and fast by removing inactive particles
      particlesRef.current = particles.filter((p) => p.active);

      animationFrameRef.current = requestAnimationFrame(renderLoop);
    };

    renderLoop();
  };

  const spawnSparks = (x: number, y: number, count = 5) => {
    const particles = particlesRef.current;
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 3 + 1;
      particles.push({
        x,
        y,
        z: 0,
        tx: 0,
        ty: 0,
        tz: 0,
        ox: 0,
        oy: 0,
        oz: 0,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1, // slight upward bias
        vz: 0,
        color: "rgba(255, 106, 26, 1)",
        r: 255,
        g: 106,
        b: 26,
        size: Math.random() * 2 + 1,
        alpha: 1.0,
        life: 0,
        maxLife: Math.random() * 30 + 20,
        active: true,
        type: "spark",
      });
    }
  };

  const startCinematicTimeline = () => {
    const tl = gsap.timeline();
    timelineRef.current = tl;

    // SCENE 01: THE AWAKENING (0s - 3s)
    // Reveal Orange panels from top to bottom
    tl.to(bgOrangeProgressRef, {
      current: 1.0,
      duration: 1.6,
      ease: "power2.out",
    }, 0.2);

    // Reveal Charcoal Black panels from top to bottom
    tl.to(bgBlackProgressRef, {
      current: 1.0,
      duration: 1.6,
      ease: "power2.out",
    }, 1.2);

    // Fade in scene text "Every Machine Has A Story"
    tl.fromTo(
      ".scene-text",
      { opacity: 0, filter: "blur(12px)", scale: 0.95 },
      { opacity: 0.9, filter: "blur(0px)", scale: 1, duration: 1.8, ease: "power2.out" },
      0.5
    );

    // Camera slowly pushes forward
    tl.to(
      ".loader-scene",
      { scale: 1.05, duration: 12, ease: "linear" },
      0
    );

    // SCENE 02: PRECISION ENGINEERING (3s - 6s)
    // Triggers at 3s. SVG paths draw themselves.
    tl.add(() => {
      setSceneText("Precision In Every Detail");

      // Animate SVG path outline drawing
      const pathEls = svgRef.current?.querySelectorAll(".logo-vector-path");
      if (pathEls) {
        pathEls.forEach((el) => {
          const path = el as SVGPathElement;
          const length = pathLengthsRef.current.get(path) || path.getTotalLength();
          path.style.stroke = "#FFFFFF"; // Glowing white blueprint outline (changed per user request)
          path.style.strokeWidth = "2.5px";
          path.style.strokeDasharray = `${length}`;
          path.style.strokeDashoffset = `${length}`;
          path.style.fill = "none";
          path.style.opacity = "1";

          gsap.to(path, {
            strokeDashoffset: 0,
            duration: 2.5,
            ease: "power2.inOut",
            stagger: 0.005,
          });
        });
      }
    }, 3.0);

    // SCENE 03: CRAFTSMANSHIP (6s - 9s)
    // Fills materialize in their exact original colors
    tl.add(() => {
      setSceneText("Crafted By Experts");

      // Fade in the white brush stroke background behind the logo
      gsap.to(brushOpacityRef, {
        current: 1.0,
        duration: 1.8,
        ease: "power2.out",
      });

      // Fade in the white emblem circle background
      gsap.set(".emblem-circle-bg", { visibility: "visible" });
      gsap.to(".emblem-circle-bg", {
        opacity: 1.0,
        duration: 1.8,
        ease: "power2.out",
      });

      const pathEls = svgRef.current?.querySelectorAll(".logo-vector-path");
      if (pathEls) {
        pathEls.forEach((el) => {
          const path = el as SVGPathElement;
          const idxAttr = path.getAttribute("data-index");
          if (idxAttr === null) return;
          const idx = parseInt(idxAttr, 10);
          const transform = path.getAttribute("transform") || "";

          const origFill = paths[idx]?.fill || "#FFFFFF";

          // Transition outline to its original color
          gsap.to(path, {
            stroke: origFill,
            strokeWidth: "0.2px",
            duration: 1.5,
          });

          // Directly fill with its original color
          gsap.to(path, {
            fill: origFill,
            duration: 2.0,
            delay: Math.random() * 0.8,
            onStart: () => {
              // Spawn sparks at the centroid of path translations
              let tx = window.innerWidth / 2;
              let ty = window.innerHeight / 2;
              const match = transform.match(/translate\(([^,)]+)(?:[\s,]+([^)]+))?\)/);
              if (match) {
                const scaleFactor = getSVGScaleFactor();
                const cx = window.innerWidth / 2;
                const cy = window.innerHeight / 2;

                const rawX = parseFloat(match[1]);
                const rawY = match[2] ? parseFloat(match[2]) : 0;

                // Coordinate space mapping (adding 724 offset to match the shifted logo paths)
                tx = cx + (rawX - 2172 / 2) * scaleFactor;
                ty = cy + (rawY + 724 - 2172 / 2) * scaleFactor;
              }
              spawnSparks(tx, ty, 3);
            },
          });
        });
      }
    }, 6.0);

    // SCENE 04: FULL BRAND REVEAL (9s - 11s)
    // Shiny Chrome sweep transitions the logo into its full glory
    tl.add(() => {
      setSceneText("Performance • Precision • Perfection");

      // Chrome metallic sweep effect across the entire logo
      gsap.fromTo(
        ".logo-sweep-mask",
        { x: "-100%" },
        { x: "100%", duration: 2.0, ease: "power2.inOut" }
      );
    }, 9.0);

    // SCENE 05: CINEMATIC EXIT (13s+)
    // 2 second pause after Scene 4 (9.0s + 2.0s duration + 2.0s pause = 13.0s)
    // If frames are not fully loaded (100%), pause and wait until loading hits 100%
    tl.add(() => {
      if (progressRef.current < 100) {
        tl.pause();
        hasPausedForLoadingRef.current = true;
      } else {
        gsap.set(containerRef.current, { background: "transparent" });
      }
    }, 13.0);

    // First, orange panels reverse up
    tl.to(bgOrangeProgressRef, {
      current: 0.0,
      duration: 1.5,
      ease: "power2.inOut",
    }, 13.0);

    // Then, black panels reverse up
    tl.to(bgBlackProgressRef, {
      current: 0.0,
      duration: 1.5,
      ease: "power2.inOut",
    }, 13.6);

    // Logo container fades out in place
    tl.to(".logo-container", {
      opacity: 0,
      duration: 1.5,
      ease: "power2.out",
    }, 13.0);

    // Tagline text fades out in place simultaneously
    tl.to(".scene-text", {
      opacity: 0,
      duration: 1.5,
      ease: "power2.out",
      onComplete: () => {
        gsap.set(".emblem-circle-bg", { visibility: "hidden" });
        onComplete();
      }
    }, 13.0);
  };

  const getSVGScaleFactor = () => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const maxW = w * 0.85;
    const maxH = h * 0.8;
    return Math.min(maxW / 2172, maxH / 2172);
  };

  return (
    <div
      ref={containerRef}
      className="loader-container"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: 9999,
        background: "#000000",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
        pointerEvents: "none",
      }}
    >
      {/* 1. Canvas for high-performance particle engine & linear light scan */}
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          display: "block",
          zIndex: 1,
        }}
      />

      {/* 2. Luxury SVG Logo Overlay */}
      <div
        className="loader-scene"
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 2,
        }}
      >
        {/* Wrapper to handle responsive resizing */}
        <div
          className="logo-container"
          style={{
            position: "relative",
            width: "min(85vw, 62vh)", // dynamically scale to fit both width and height perfectly
            aspectRatio: "1/1",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {/* Inline SVG rendering logo paths inside a round emblem */}
          <svg
            ref={svgRef}
            viewBox="0 0 2172 2172"
            width="100%"
            height="100%"
            style={{
              display: "block",
            }}
          >
            {/* Add a linear gradient for the chrome reflection sweep */}
            <defs>
              <linearGradient id="chrome-sweep" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="rgba(255,255,255,0)" />
                <stop offset="30%" stopColor="rgba(255,255,255,0)" />
                <stop offset="50%" stopColor="rgba(255,255,255,0.7)" />
                <stop offset="70%" stopColor="rgba(255,255,255,0)" />
                <stop offset="100%" stopColor="rgba(255,255,255,0)" />
              </linearGradient>
              <mask id="logo-mask">
                {/* Clone paths inside mask for shiny reflection effect */}
                <g transform="translate(0, 724)">
                  {paths.map((p, idx) => {
                    if (p.transform.includes("translate(0,0)")) return null;
                    return (
                      <path
                        key={`mask-${idx}`}
                        d={p.d}
                        fill="#FFFFFF"
                        transform={p.transform}
                      />
                    );
                  })}
                </g>
              </mask>
            </defs>

            {/* 1. Luxury Solid White Emblem Circle Background */}
            <circle
              className="emblem-circle-bg"
              cx="1086"
              cy="1086"
              r="1050"
              fill="#FFFFFF"
              stroke="#F26522"
              strokeWidth="14"
              style={{
                opacity: 0,
                filter: "drop-shadow(0 15px 45px rgba(0,0,0,0.65))",
                visibility: "hidden",
              }}
            />
            {/* Inner Dark Hairline Accent Ring */}
            <circle
              className="emblem-circle-bg"
              cx="1086"
              cy="1086"
              r="1010"
              fill="none"
              stroke="#232425"
              strokeWidth="6"
              style={{
                opacity: 0,
                visibility: "hidden",
              }}
            />

            {/* 2. Render logo vector paths centered vertically */}
            <g transform="translate(0, 724)">
              {paths.map((p, idx) => {
                const isBg = p.transform.includes("translate(0,0)");
                if (isBg) return null; // strip white background rect
                return (
                  <path
                    key={`logo-path-${idx}`}
                    className="logo-vector-path"
                    data-index={idx}
                    d={p.d}
                    fill="none" // starts transparent, transitions to vector fill in Scene 3
                    transform={p.transform}
                    style={{
                      transition: "fill 0.5s ease",
                    }}
                  />
                );
              })}
            </g>

            {/* Glowing Chrome Sweep overlay inside mask */}
            <rect
              className="logo-sweep-mask"
              x="-100%"
              y="724"
              width="100%"
              height="724"
              fill="url(#chrome-sweep)"
              mask="url(#logo-mask)"
              style={{
                mixBlendMode: "overlay",
                pointerEvents: "none",
              }}
            />
          </svg>
        </div>

        {/* Cinematic Materializing Text */}
        <div
          className="scene-text"
          style={{
            position: "absolute",
            bottom: "12%",
            left: 0,
            width: "100%",
            textAlign: "center",
            padding: "0 20px",
            boxSizing: "border-box",
            fontFamily: "var(--font-geist-sans), sans-serif",
            color: "#E5E5E5",
            fontSize: "0.95rem",
            letterSpacing: "6px",
            textTransform: "uppercase",
            opacity: 0,
            textShadow: "0 0 15px rgba(242, 101, 34, 0.35)",
          }}
        >
          {sceneText}
        </div>

        {/* Preload Progress Indicator */}
        {preloadProgress < 100 && (
          <div
            style={{
              position: "absolute",
              bottom: "7%",
              left: 0,
              width: "100%",
              textAlign: "center",
              fontFamily: "var(--font-mono), monospace",
              color: "rgba(255, 255, 255, 0.3)",
              fontSize: "0.75rem",
              letterSpacing: "3px",
              textTransform: "uppercase",
            }}
          >
            Initializing System... {preloadProgress}%
          </div>
        )}
      </div>
    </div>
  );
}
