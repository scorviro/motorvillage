"use client";

import React, { useEffect, useRef, useState } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import WorkshopStore, { WorkshopStoreHandle } from "./WorkshopStore";
import GallerySection, { GallerySectionHandle } from "./GallerySection";
import ContactSection, { ContactSectionHandle } from "./ContactSection";

interface PathData {
  d: string;
  fill: string;
  transform: string;
}

interface HomepageProps {
  logoPaths: PathData[];
  isVisible: boolean;
  preloadedImages: React.MutableRefObject<{ [key: number]: HTMLImageElement }>;
  isLoaderComplete?: boolean;
  loadProgressRef?: React.MutableRefObject<number>;
}

const DynamicText = () => {
  const words = ["Trusted", "Premium", "Advanced", "Reliable"];
  const spanRef = useRef<HTMLSpanElement>(null);
  let idx = 0;

  useEffect(() => {
    const interval = setInterval(() => {
      if (!spanRef.current) return;
      spanRef.current.style.opacity = "0";
      spanRef.current.style.transform = "translateY(5px)";
      setTimeout(() => {
        idx = (idx + 1) % words.length;
        if (spanRef.current) {
          spanRef.current.textContent = words[idx];
          spanRef.current.style.opacity = "1";
          spanRef.current.style.transform = "translateY(0)";
        }
      }, 300);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <span
      ref={spanRef}
      style={{
        color: "var(--color-orange)",
        display: "inline-block",
        opacity: 1,
        transform: "translateY(0)",
        transition: "all 0.3s ease",
      }}
    >
      {words[0]}
    </span>
  );
};

const ServiceIcon = ({ name, size = 32, color = "var(--color-orange)" }: { name: string; size?: number; color?: string }) => {
  switch (name) {
    case "new-car":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" />
          <circle cx="7" cy="17" r="2" />
          <circle cx="17" cy="17" r="2" />
          <path d="M9 17h6" />
          <path d="m21 10-2-3h-3" />
        </svg>
      );
    case "pre-owned":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" />
          <circle cx="7" cy="17" r="2" />
          <circle cx="17" cy="17" r="2" />
          <path d="M9 17h6" />
          <circle cx="13" cy="13" r="3" />
        </svg>
      );
    case "mechanical":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
        </svg>
      );
    case "accidental":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
          <path d="m18.5 5.5-3 3M15.5 5.5l3 3" />
        </svg>
      );
    case "insurance":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      );
    case "ac":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          <path d="M3 12h18" />
          <path d="m8 8 4 4-4 4M16 8l-4 4 4 4" />
        </svg>
      );
    case "ecm":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="4" y="4" width="16" height="16" rx="2" ry="2" />
          <rect x="9" y="9" width="6" height="6" />
          <path d="M9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 15h3M1 9h3M1 15h3" />
        </svg>
      );
    case "electrical":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
        </svg>
      );
    case "detailing":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 3v18M3 12h18M12 12l6-6M12 12l-6 6M12 12l6 6M12 12l-6-6" />
          <circle cx="12" cy="12" r="9" />
        </svg>
      );
    case "accessories":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <circle cx="12" cy="12" r="3" />
          <path d="M12 2v7M12 15v7M2 12h7M15 12h7" />
        </svg>
      );
    case "gps":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
      );
    case "rto":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
      );
    default:
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5">
          <circle cx="12" cy="12" r="10" />
        </svg>
      );
  }
};

const servicesData = [
  {
    id: "new-car",
    title: "New Car Sales",
    shortDesc: "Expert guidance and transparent pricing for your new car purchase.",
    detailedDesc: "Our new car sales team provides personalized vehicle consultation to help you find the perfect match. With transparent pricing and no hidden charges, flexible financing options, complete documentation assistance, and dedicated customer support throughout the buying journey — we make car ownership easy and enjoyable.",
    process: ["Vehicle Consultation — Expert helps choose the right vehicle", "Transparent Pricing — Clear costs, no hidden charges", "Finance Support — Flexible financing options available", "Documentation Assistance — Registration and paperwork support"],
    benefits: ["Hassle-Free Buying", "Wide Range Options", "Expert Guidance", "Flexible Payment", "Quality Assurance"],
    idealCustomers: "First-time buyers, upgrade seekers, families looking for trusted guidance.",
    icon: "new-car"
  },
  {
    id: "pre-owned",
    title: "Pre-Owned Car Sales",
    shortDesc: "Buy a reliable pre-owned vehicle with expert inspection and support.",
    detailedDesc: "Every pre-owned vehicle at Motovillage goes through a thorough inspection by our engineer-led team before being offered for sale. We ensure quality, performance, and value — so you drive away with complete confidence.",
    process: ["Multi-point Inspection by Engineers", "History & Document Verification", "Restoration & Detailing", "Transparent Ownership Transfer"],
    benefits: ["Inspected Vehicles", "Transparent History", "Quality Assurance", "Flexible Payment", "Expert Guidance"],
    idealCustomers: "Budget-conscious buyers, first-time car owners.",
    icon: "pre-owned"
  },
  {
    id: "mechanical",
    title: "Mechanical Work",
    shortDesc: "Complete mechanical repairs for engine, brakes, suspension, and more.",
    detailedDesc: "Our engineer-led technicians perform a thorough vehicle inspection to identify faults and performance issues accurately. From engine repair and brake service to suspension repair and parts replacement — every job is done with precision to restore your vehicle's smooth performance.",
    process: ["Vehicle Inspection — Complete systems checked", "Engine Repair — Precision repair of engine components", "Brake Service — Braking systems inspected and serviced", "Suspension Repair — Parts repaired or replaced carefully"],
    benefits: ["Improved Performance", "Better Safety", "Increased Reliability", "Longer Vehicle Life", "Fuel Efficiency"],
    idealCustomers: "All car owners with performance, safety, or reliability concerns.",
    icon: "mechanical"
  },
  {
    id: "accidental",
    title: "Accidental Repair",
    shortDesc: "Complete accident damage restoration — from dents to full body repair.",
    detailedDesc: "After an accident, your vehicle deserves a complete and professional restoration. Our team handles dent repair, panel replacement, matched paint restoration, parts repair & replacement, and surface refinishing — ensuring your car looks and performs exactly as it did before the accident.",
    process: ["Dent Repair — Body damage repaired, shape restored", "Panel Replacement — Damaged panels replaced", "Paint Restoration — Matched paintwork, seamless blending", "Surface Refinishing — Polishing for premium smooth finish"],
    benefits: ["Restored Appearance", "Professional Repair Quality", "Long-Lasting Paint", "Value Preservation", "Complete Restoration"],
    idealCustomers: "Accident victims, insurance claimants, vehicle owners with body damage.",
    icon: "accidental"
  },
  {
    id: "insurance",
    title: "Insurance Work",
    shortDesc: "Stress-free insurance claim assistance and cashless repair services.",
    detailedDesc: "Dealing with insurance after an accident can be overwhelming. Motovillage simplifies the entire process — from claim assistance and documentation support to coordinating with insurance surveyors and providing cashless claim facility. We handle the paperwork so you can focus on getting back on the road.",
    process: ["Claim Assistance — Support for insurance procedures", "Documentation Support — Efficient paperwork management", "Survey Coordination — Coordination with insurance surveyors", "Cashless Claim Facility — Convenient cashless repair support"],
    benefits: ["Hassle-Free Claim Process", "Faster Claim Approval", "Cashless Repairs", "Accurate Damage Evaluation", "Peace of Mind"],
    idealCustomers: "Accident victims, insurance claimants, vehicle owners with body damage.",
    icon: "insurance"
  },
  {
    id: "ac-repair",
    title: "Car AC Repair",
    shortDesc: "Complete car AC diagnosis, repair, and maintenance for cool comfort.",
    detailedDesc: "A faulty AC is more than discomfort — it can affect your driving focus. Our technicians perform a thorough AC system inspection, check refrigerant levels, repair faulty compressors, clean or replace cabin filters, and inspect vents for balanced airflow across the cabin.",
    process: ["AC System Inspection — Complete system checked", "Gas Level Check — Refrigerant levels inspected", "Compressor Repair — Compressor issues resolved", "Filter & Vent Check — Cleaning and airflow optimization"],
    benefits: ["Better Cooling", "Fresh Cabin Air", "Improved Airflow", "Leak Prevention", "System Efficiency"],
    idealCustomers: "Vehicle owners facing weak cooling, bad odors, or air vent issues.",
    icon: "ac"
  },
  {
    id: "ecm",
    title: "ECM Programming",
    shortDesc: "Advanced ECM diagnosis, software programming, and system calibration.",
    detailedDesc: "The Engine Control Module (ECM) is your car's brain. Our advanced diagnostic equipment scans error codes, identifies electronic faults, reprograms ECM software, checks wiring integrity, and calibrates system settings — restoring accurate engine performance and eliminating warning lights.",
    process: ["ECM Diagnosis — Electronic module checked", "Error Code Scanning — Advanced scanners detect faults", "Software Programming — ECM software updated/reprogrammed", "System Calibration — Settings calibrated for accuracy"],
    benefits: ["Improved Performance", "Accurate System Control", "Better Fuel Efficiency", "Reduced Errors", "Faster Detection"],
    idealCustomers: "Cars with dashboard warning lights or running errors.",
    icon: "ecm"
  },
  {
    id: "electrical",
    title: "Electrical Repairs",
    shortDesc: "Complete automotive electrical and electronic system repairs.",
    detailedDesc: "From faulty wiring to malfunctioning sensors and electronic modules, our team diagnoses and repairs all electrical and electronic issues in your vehicle. We use modern diagnostic tools to identify problems quickly and resolve them accurately.",
    process: ["Wiring Integrity Check", "Sensor & Actuator Diagnostics", "Short Circuit Remediation", "Module Calibration"],
    benefits: ["Accurate Diagnosis", "Reliable Repairs", "Safe Electrical Systems", "Improved Performance"],
    idealCustomers: "Cars with warning lights, battery drains, or power accessory faults.",
    icon: "electrical"
  },
  {
    id: "detailing",
    title: "Detailing & PPF",
    shortDesc: "20 specialized detailing treatments for exterior and interior perfection.",
    detailedDesc: "Our premium studio offers paint protection film, ceramic coatings, foam wash, interior deep cleaning, water spot removal, leather treatment, AC vent sanitization, and engine bay detailing. We feature 20 specialized detailing treatments.",
    process: ["Surface Preparation", "Decontamination & Buffing", "Coating/Film Application", "IR Curing & Quality Check"],
    benefits: ["Maximum Paint Safety", "Stone Chip Protection", "Self-Healing Surface", "UV Resistance", "Glossy Appearance"],
    idealCustomers: "Car enthusiasts, new car owners wanting maximum protection, luxury cars.",
    icon: "detailing"
  },
  {
    id: "accessories",
    title: "Premium Accessories",
    shortDesc: "Custom interior/exterior accessories, audio systems, and lighting.",
    detailedDesc: "Custom interior/exterior accessories, audio systems, lighting, and safety add-ons — professionally installed by our expert team to customize your vehicle to perfection.",
    process: ["Product Selection", "Pre-installation Wiring Check", "Professional Fitting", "Testing & Tuning"],
    benefits: ["Enhanced Comfort", "Better Appearance", "Improved Functionality", "Increased Safety", "Personalized Style"],
    idealCustomers: "Owners looking to upgrade their car's cabin features, audio, or lighting.",
    icon: "accessories"
  },
  {
    id: "gps-tracking",
    title: "GPS & Camera Systems",
    shortDesc: "GPS tracking installation with real-time monitoring and theft protection.",
    detailedDesc: "GPS tracking device installation with real-time monitoring, route monitoring, theft protection system, and mobile app integration for complete peace of mind.",
    process: ["System Planning", "Concealed Wiring & Install", "Mobile App Pair", "Functional Testing"],
    benefits: ["Enhanced Security", "Real-Time Monitoring", "Faster Recovery", "Route Management", "Mobile Access"],
    idealCustomers: "Fleet owners, safety-conscious drivers, premium car owners.",
    icon: "gps"
  },
  {
    id: "rto-work",
    title: "RTO Work",
    shortDesc: "Complete RTO documentation and registration support services.",
    detailedDesc: "Navigate the complexities of RTO procedures with ease. Our team handles all documentation, registration, transfers, and regulatory paperwork so you don't have to waste time in queues. We ensure accurate, timely submission for a completely hassle-free experience.",
    process: ["Document Checklist Check", "Paperwork Compilation", "RTO Portal Submission", "Process Follow-up"],
    benefits: ["Time-Saving", "Accurate Documentation", "Hassle-Free Process", "Expert Guidance", "Faster Approval"],
    idealCustomers: "Pre-owned car buyers/sellers, vehicle registration renewals.",
    icon: "rto"
  }
];

export default function Homepage({ logoPaths, isVisible, preloadedImages, isLoaderComplete = true, loadProgressRef }: HomepageProps) {
  const lenisRef = useRef<Lenis | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const currentFrameIndexRef = useRef<number>(1);
  const drawFrameRef = useRef<((idx: number) => void) | null>(null);

  // DOM Refs for direct style mutations to bypass React rendering bottleneck on scroll
  const heroRef = useRef<HTMLDivElement>(null);
  const aboutRef = useRef<HTMLDivElement>(null);
  const storyRef = useRef<HTMLDivElement>(null);
  const visionRef = useRef<HTMLDivElement>(null);
  const workshopRef1 = useRef<HTMLDivElement>(null);
  const workshopRef2 = useRef<HTMLDivElement>(null);
  const workshopRef3 = useRef<HTMLDivElement>(null);
  const workshopRef4 = useRef<HTMLDivElement>(null);
  const canvasWrapperRef = useRef<HTMLDivElement>(null);
  const desktopOverlayRef = useRef<HTMLDivElement>(null);
  const servicesRef = useRef<HTMLDivElement>(null);
  const servicesDetailsRef = useRef<HTMLDivElement>(null);
  const servicesGridRef = useRef<HTMLDivElement>(null);
  const workshopStoreRef = useRef<WorkshopStoreHandle>(null);
  const gallerySectionRef = useRef<GallerySectionHandle>(null);
  const contactSectionRef = useRef<ContactSectionHandle>(null);

  const navRef = useRef<HTMLElement>(null);
  const isScrolledRef = useRef(false);
  const isNavVisibleRef = useRef(true);
  const activeSectionRef = useRef("home");

  const lastDprRef = useRef(0);
  const lastCanvasWRef = useRef(0);
  const lastCanvasHRef = useRef(0);
  const isLoadingCompleteRef = useRef(false);

  const drawCacheRef = useRef<{
    drawWidth: number;
    drawHeight: number;
    offsetX: number;
    offsetY: number;
    lastW: number;
    lastH: number;
  } | null>(null);

  const [selectedService, setSelectedService] = useState<any>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [expandedCard, setExpandedCard] = useState<number | null>(null);

  const lastScrollY = useRef(0);
  const forceUpdateRef = useRef(false);

  // Mark that a style force-update is needed on next animation frame after any React render
  useEffect(() => {
    forceUpdateRef.current = true;
  });

  // Stop Lenis scrolling when mobile menu overlay is active
  useEffect(() => {
    if (!lenisRef.current) return;
    if (isMobileMenuOpen) {
      lenisRef.current.stop();
    } else {
      lenisRef.current.start();
    }
  }, [isMobileMenuOpen]);

  // Lock scrolling when workshop card modal is open
  useEffect(() => {
    if (!lenisRef.current) return;
    if (expandedCard !== null) {
      lenisRef.current.stop();
    } else {
      lenisRef.current.start();
    }
  }, [expandedCard]);

  // Trigger entry animation from the right side after loader is complete using GSAP directly
  useEffect(() => {
    if (isLoaderComplete && heroRef.current) {
      gsap.set(heroRef.current, { opacity: 0, visibility: "visible", pointerEvents: "none" });

      const tl = gsap.timeline();

      tl.to(heroRef.current, {
        opacity: 1,
        duration: 2.5,
        delay: 0.4,
        ease: "power2.out",
        onStart: () => {
          if (heroRef.current) heroRef.current.style.pointerEvents = "auto";
        }
      });
    }
  }, [isLoaderComplete]);

  useEffect(() => {
    if (!isVisible) return;
    isLoadingCompleteRef.current = isLoaderComplete;

    // 1. Initialize Canvas (Done dynamically in functions to prevent stale React closures)
    const initialCanvas = canvasRef.current;
    if (initialCanvas) {
      const initialCtx = initialCanvas.getContext("2d");
      if (initialCtx) {
        initialCtx.imageSmoothingEnabled = true;
        initialCtx.imageSmoothingQuality = "high";
      }
    }

    const resizeCanvas = (force = false) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Set image smoothing on the current context
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      const w = window.innerWidth;
      const h = window.innerHeight;
      const rawDpr = window.devicePixelRatio || 1;
      const dpr = Math.min(rawDpr, 2); // Cap at 2x — visually identical, 44% less GPU work on 3x phones

      // Skip if nothing changed (mobile address bar toggle, etc.)
      if (!force && w === lastCanvasWRef.current && h === lastCanvasHRef.current && dpr === lastDprRef.current) return;

      lastCanvasWRef.current = w;
      lastCanvasHRef.current = h;
      lastDprRef.current = dpr;

      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.scale(dpr, dpr);

      if (drawFrameRef.current) {
        drawFrameRef.current(currentFrameIndexRef.current);
      }
    };

    const getFrameForProgress = (prog: number): number => {
      // Scale progress to the pinned part [0, 0.61905]
      const normalizedProgress = Math.min(1, prog / 0.61905);
      return Math.max(1, Math.min(1466, Math.floor(normalizedProgress * 1465) + 1));
    };

    const drawFrame = (index: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Reset transform to identity and scale by dpr to prevent quadrant/scaling issues on rerenders
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      const dpr = lastDprRef.current || 1;
      ctx.scale(dpr, dpr);

      // Ensure smoothing is active on context
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      const getClosestLoadedImage = (idx: number) => {
        if (preloadedImages.current[idx] && preloadedImages.current[idx].naturalWidth > 0) return preloadedImages.current[idx];

        // Scale search radius with load progress: 
        // 10% loaded = radius 8, 50% loaded = radius 32, 100% loaded = radius 64
        const loadProgress = loadProgressRef?.current ?? 1;
        const MAX_RADIUS = Math.max(8, Math.round(64 * loadProgress));

        const minIdx = 1;
        const maxIdx = 1466;

        for (let r = 1; r <= MAX_RADIUS; r++) {
          const left = idx - r;
          const right = idx + r;
          if (left >= minIdx && preloadedImages.current[left] && preloadedImages.current[left].naturalWidth > 0) return preloadedImages.current[left];
          if (right <= maxIdx && preloadedImages.current[right] && preloadedImages.current[right].naturalWidth > 0) return preloadedImages.current[right];
        }
        return null;
      };

      const img = getClosestLoadedImage(index);
      if (img && img.naturalWidth > 0) {
        const canvasWidth = canvas.width / (lastDprRef.current || 1);
        const canvasHeight = canvas.height / (lastDprRef.current || 1);

        // Recompute only if canvas size changed
        const cache = drawCacheRef.current;
        if (!cache || cache.lastW !== canvasWidth || cache.lastH !== canvasHeight) {
          const imgRatio = img.width / img.height;
          const canvasRatio = canvasWidth / canvasHeight;
          let drawWidth = canvasWidth, drawHeight = canvasHeight, offsetX = 0, offsetY = 0;
          if (imgRatio > canvasRatio) {
            drawWidth = canvasHeight * imgRatio;
            offsetX = (canvasWidth - drawWidth) / 2;
          } else {
            drawHeight = canvasWidth / imgRatio;
            offsetY = (canvasHeight - drawHeight) / 2;
          }
          drawCacheRef.current = { drawWidth, drawHeight, offsetX, offsetY, lastW: canvasWidth, lastH: canvasHeight };
        }

        const { drawWidth, drawHeight, offsetX, offsetY } = drawCacheRef.current!;
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
      }
    };

    drawFrameRef.current = drawFrame;
    drawFrame(currentFrameIndexRef.current);

    // Scroll interpolation variables stored in local closure
    let targetFrame = currentFrameIndexRef.current;
    let currentFrame = currentFrameIndexRef.current;
    let targetProgress = 0;
    let currentProgress = 0;
    let lastDrawnFrame = 0;

    const handleScrollUpdate = (scrollY: number) => {
      const scrolled = scrollY > 50;
      if (scrolled !== isScrolledRef.current) {
        isScrolledRef.current = scrolled;
        navRef.current?.classList.toggle("scrolled", scrolled);
      }

      if (scrollY <= 100) {
        if (!isNavVisibleRef.current) {
          isNavVisibleRef.current = true;
          navRef.current?.classList.remove("nav-hidden");
        }
        lastScrollY.current = scrollY;
      } else {
        const diff = scrollY - lastScrollY.current;
        if (Math.abs(diff) > 5) {
          const shouldBeVisible = diff < 0;
          if (shouldBeVisible !== isNavVisibleRef.current) {
            isNavVisibleRef.current = shouldBeVisible;
            navRef.current?.classList.toggle("nav-hidden", !shouldBeVisible);
          }
          lastScrollY.current = scrollY;
        }
      }

      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (maxScroll <= 0) return;
      const progress = Math.max(0, Math.min(1, scrollY / maxScroll));
      targetProgress = progress;
      targetFrame = getFrameForProgress(progress);
    };

    const isMobile = window.innerWidth <= 768;

    // 2. Initialize Lenis (exactly like classic SmoothScroll.tsx)
    const lenis = new Lenis({
      lerp: isMobile ? 0.12 : 0.07, // Mobile: 0.12 (responsive touch), Laptop: 0.07 (smooth scrolling)
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 0.9,
      touchMultiplier: isMobile ? 1.8 : 1.2, // Mobile: 1.8 (more scroll per swipe), Laptop: 1.2
      autoRaf: false,
      syncTouch: false,
    });
    lenisRef.current = lenis;

    // Listen to Lenis scroll updates
    lenis.on("scroll", (e) => {
      handleScrollUpdate(e.scroll);
    });

    // 3. Setup GSAP Ticker connection (exactly like classic SmoothScroll.tsx)
    // Run the scroll interpolation loop directly inside the ticker to ensure perfectly synced refresh-rate updates
    const updateTicker = (time: number) => {
      lenis.raf(time * 1000);

      // Do not run canvas rendering until loader is complete — 
      // let all CPU go to image decoding during the loading phase
      if (!isLoadingCompleteRef.current) return;

      // Perform lerp animations for canvas frame and panels
      const frameDiff = targetFrame - currentFrame;
      const progDiff = targetProgress - currentProgress;
      const shouldUpdate = Math.abs(frameDiff) > 0.01 || Math.abs(progDiff) > 0.0001 || forceUpdateRef.current;
      if (shouldUpdate) {
        if (forceUpdateRef.current) {
          forceUpdateRef.current = false;
          lastDrawnFrame = -1; // Force canvas redraw to restore image after React render
        }
        const frameLerpFactor = isMobile ? 0.12 : 0.10; // Mobile: 0.12 for 24fps sparse frame smoothing, Laptop: 0.10
        currentFrame += frameDiff * frameLerpFactor;
        currentProgress += progDiff * frameLerpFactor;

        const frameIdx = Math.max(1, Math.min(1466, Math.round(currentFrame)));
        const progress = currentProgress;

        if (frameIdx !== lastDrawnFrame) {
          drawFrame(frameIdx);
          lastDrawnFrame = frameIdx;
          currentFrameIndexRef.current = frameIdx; // Keep ref updated for resize handler
        }

        // Removed temporary frame counter logic

        // Interpolate opacity and offsets between Home (Hero), About, Our Story, and Vision & Mission:
        let heroOp = 0;
        let aboutOp = 0;
        let storyOp = 0;
        let storyOffset = 0;
        let visOp = 0;
        let visOffset = 100;

        // Hero
        if (frameIdx <= 40) {
          heroOp = 1;
        } else if (frameIdx > 40 && frameIdx < 80) {
          heroOp = 1 - (frameIdx - 40) / 40;
        }

        // About
        if (frameIdx > 110 && frameIdx < 190) {
          aboutOp = (frameIdx - 110) / 80;
        } else if (frameIdx >= 190 && frameIdx <= 230) {
          aboutOp = 1;
        } else if (frameIdx > 230 && frameIdx < 270) {
          aboutOp = 1 - (frameIdx - 230) / 40;
        }

        // Our Story
        if (frameIdx > 300 && frameIdx <= 380) {
          storyOp = (frameIdx - 300) / 80;
        } else if (frameIdx > 380 && frameIdx <= 390) {
          storyOp = 1;
        } else if (frameIdx > 390 && frameIdx < 430) {
          const t = (frameIdx - 390) / 40;
          storyOp = 1 - t;
          storyOffset = -100 * t;
        } else if (frameIdx >= 430) {
          storyOp = 0;
          storyOffset = -100;
        }

        // Vision & Mission
        if (frameIdx > 430 && frameIdx <= 490) {
          const t = (frameIdx - 430) / 60;
          visOp = t;
          visOffset = 100 - (100 * t);
        } else if (frameIdx > 490 && frameIdx <= 556) {
          visOp = 1;
          visOffset = 0;
        } else if (frameIdx > 556 && frameIdx <= 576) {
          const t = (frameIdx - 556) / 20;
          visOp = 1 - t;
          visOffset = 0;
        } else if (frameIdx > 576) {
          visOp = 0;
          visOffset = 0;
        }

        const normalizedProgress = Math.min(1, progress / 0.61905);

        // Workshop section glass panel transition for 4 cards
        let workshopOp1 = 0, workshopOffset1 = 0;
        let workshopOp2 = 0, workshopOffset2 = 0;
        let workshopOp3 = 0, workshopOffset3 = 0;
        let workshopOp4 = 0, workshopOffset4 = 0;

        if (frameIdx >= 578 && frameIdx < 800) {
          if (frameIdx <= 628) {
            const t = (frameIdx - 578) / 50;
            const easeT = t * t * (3 - 2 * t);
            workshopOp1 = easeT;
            workshopOffset1 = 0;
          } else if (frameIdx <= 750) {
            workshopOp1 = 1;
            workshopOffset1 = 0;
          } else {
            const t = (frameIdx - 750) / 50;
            const easeT = t * t * (3 - 2 * t);
            workshopOp1 = 1 - easeT;
            workshopOffset1 = 0;
          }
        }

        if (frameIdx >= 750 && frameIdx < 1022) {
          if (frameIdx <= 800) {
            const t = (frameIdx - 750) / 50;
            const easeT = t * t * (3 - 2 * t);
            workshopOp2 = easeT;
            workshopOffset2 = 0;
          } else if (frameIdx <= 972) {
            workshopOp2 = 1;
            workshopOffset2 = 0;
          } else {
            const t = (frameIdx - 972) / 50;
            const easeT = t * t * (3 - 2 * t);
            workshopOp2 = 1 - easeT;
            workshopOffset2 = 0;
          }
        }

        if (frameIdx >= 972 && frameIdx < 1244) {
          if (frameIdx <= 1022) {
            const t = (frameIdx - 972) / 50;
            const easeT = t * t * (3 - 2 * t);
            workshopOp3 = easeT;
            workshopOffset3 = 0;
          } else if (frameIdx <= 1194) {
            workshopOp3 = 1;
            workshopOffset3 = 0;
          } else {
            const t = (frameIdx - 1194) / 50;
            const easeT = t * t * (3 - 2 * t);
            workshopOp3 = 1 - easeT;
            workshopOffset3 = 0;
          }
        }

        if (frameIdx >= 1194) {
          if (frameIdx <= 1244) {
            const t = (frameIdx - 1194) / 50;
            const easeT = t * t * (3 - 2 * t);
            workshopOp4 = easeT;
            workshopOffset4 = 0;
          } else {
            workshopOp4 = 1;
            workshopOffset4 = 0;
          }
        }

        // Exit transition when scrolling past the pinned workshop sequence (starts at 0.61905)
        if (progress > 0.61905) {
          const exitProgress = Math.min(1, (progress - 0.61905) / 0.02381);
          const exitOp = 1 - exitProgress;
          if (workshopOp1 > 0) {
            workshopOp1 = exitOp;
            workshopOffset1 = 0;
          }
          if (workshopOp2 > 0) {
            workshopOp2 = exitOp;
            workshopOffset2 = 0;
          }
          if (workshopOp3 > 0) {
            workshopOp3 = exitOp;
            workshopOffset3 = 0;
          }
          if (workshopOp4 > 0) {
            workshopOp4 = exitOp;
            workshopOffset4 = 0;
          }
        }

        // Canvas (3D Car) opacity fade out (556->576) and fade back in (576->596)
        let canvasOp = 1;
        if (frameIdx > 556 && frameIdx <= 576) {
          const t = (frameIdx - 556) / 20;
          canvasOp = 1 - 0.8 * t;
        } else if (frameIdx > 576 && frameIdx <= 596) {
          const t = (frameIdx - 576) / 20;
          canvasOp = 0.2 + 0.8 * t;
        } else if (frameIdx > 596) {
          canvasOp = 1;
        }

        // Services slide-up section (interchanged, now at 0.72 -> 0.82)
        let servSlideOffset = 100;
        let servOp = 0;
        const isMobileView = typeof window !== "undefined" && window.innerWidth <= 1024;

        if (isMobileView) {
          if (progress > 0.61905) {
            if (progress <= 0.64286) {
              servSlideOffset = 100;
              servOp = 0;
            } else {
              const scrollT = Math.min(1, (progress - 0.64286) / (0.91 - 0.64286));
              servSlideOffset = 100 - scrollT * 300;
              servOp = servSlideOffset < 0 ? 1 : Math.max(0, 1 - servSlideOffset / 100);
            }
          }
        } else {
          if (progress > 0.72 && progress <= 0.74381) {
            const t = (progress - 0.72) / 0.02381;
            const easeT = t * t * (3 - 2 * t); // Smoothstep easing
            servSlideOffset = 100 - (100 * easeT);
            servOp = easeT;
          } else if (progress > 0.74381 && progress <= 0.79619) {
            servSlideOffset = 0;
            servOp = 1;
          } else if (progress > 0.79619 && progress <= 0.82) {
            const t = (progress - 0.79619) / 0.02381;
            const easeT = t * t * (3 - 2 * t); // Smoothstep easing
            servSlideOffset = -100 * easeT;
            servOp = 1 - easeT;
          } else if (progress > 0.82) {
            servSlideOffset = -100;
            servOp = 0;
          }
        }

        // Canvas / Desktop Content Overlay translate
        let canvasSlideOffset = 0;
        if (progress > 0.61905 && progress <= 0.64286) {
          const t = (progress - 0.61905) / 0.02381;
          const easeT = t * t * (3 - 2 * t); // Smoothstep easing
          canvasSlideOffset = -100 * easeT;
        } else if (progress > 0.64286) {
          canvasSlideOffset = -100;
        }

        // Direct DOM mutations to completely bypass React rendering cycle during scroll
        if (heroRef.current) {
          heroRef.current.style.opacity = `${heroOp}`;
          heroRef.current.style.visibility = heroOp > 0.01 ? "visible" : "hidden";
          heroRef.current.style.pointerEvents = heroOp > 0.01 ? "auto" : "none";
        }
        if (aboutRef.current) {
          aboutRef.current.style.opacity = `${aboutOp}`;
          aboutRef.current.style.visibility = aboutOp > 0.01 ? "visible" : "hidden";
          aboutRef.current.style.pointerEvents = aboutOp > 0.01 ? "auto" : "none";
        }
        if (storyRef.current) {
          storyRef.current.style.opacity = `${storyOp}`;
          storyRef.current.style.transform = `translateY(-50%) translateX(${storyOffset}px)`;
          storyRef.current.style.visibility = storyOp > 0.01 ? "visible" : "hidden";
          storyRef.current.style.pointerEvents = storyOp > 0.01 ? "auto" : "none";
        }
        if (visionRef.current) {
          visionRef.current.style.opacity = `${visOp}`;
          visionRef.current.style.transform = `translateY(-50%) translateX(${visOffset}px)`;
          visionRef.current.style.visibility = visOp > 0.01 ? "visible" : "hidden";
          visionRef.current.style.pointerEvents = visOp > 0.01 ? "auto" : "none";
        }
        if (workshopRef1.current) {
          workshopRef1.current.style.opacity = `${workshopOp1}`;
          workshopRef1.current.style.transform = `translateY(-50%) translateX(${workshopOffset1}px)`;
          workshopRef1.current.style.visibility = workshopOp1 > 0.01 ? "visible" : "hidden";
          workshopRef1.current.style.pointerEvents = workshopOp1 > 0.01 ? "auto" : "none";
        }
        if (workshopRef2.current) {
          workshopRef2.current.style.opacity = `${workshopOp2}`;
          workshopRef2.current.style.transform = `translateY(-50%) translateX(${workshopOffset2}px)`;
          workshopRef2.current.style.visibility = workshopOp2 > 0.01 ? "visible" : "hidden";
          workshopRef2.current.style.pointerEvents = workshopOp2 > 0.01 ? "auto" : "none";
        }
        if (workshopRef3.current) {
          workshopRef3.current.style.opacity = `${workshopOp3}`;
          workshopRef3.current.style.transform = `translateY(-50%) translateX(${workshopOffset3}px)`;
          workshopRef3.current.style.visibility = workshopOp3 > 0.01 ? "visible" : "hidden";
          workshopRef3.current.style.pointerEvents = workshopOp3 > 0.01 ? "auto" : "none";
        }
        if (workshopRef4.current) {
          workshopRef4.current.style.opacity = `${workshopOp4}`;
          workshopRef4.current.style.transform = `translateY(-50%) translateX(${workshopOffset4}px)`;
          workshopRef4.current.style.visibility = workshopOp4 > 0.01 ? "visible" : "hidden";
          workshopRef4.current.style.pointerEvents = workshopOp4 > 0.01 ? "auto" : "none";
        }
        if (canvasWrapperRef.current) {
          canvasWrapperRef.current.style.opacity = `${canvasOp}`;
          canvasWrapperRef.current.style.transform = `translateY(${canvasSlideOffset}vh)`;
          canvasWrapperRef.current.style.visibility = (canvasOp > 0.01 && canvasSlideOffset > -99.9) ? "visible" : "hidden";
        }
        if (desktopOverlayRef.current) {
          desktopOverlayRef.current.style.transform = `translateY(${canvasSlideOffset}vh)`;
          desktopOverlayRef.current.style.visibility = canvasSlideOffset <= -99.9 ? "hidden" : "visible";
        }
        if (servicesRef.current) {
          servicesRef.current.style.transform = `translateY(${servSlideOffset}vh)`;
          servicesRef.current.style.opacity = `${servOp}`;
          servicesRef.current.style.pointerEvents = servOp > 0.05 ? "auto" : "none";
          servicesRef.current.style.visibility = servOp > 0.01 ? "visible" : "hidden";
        }
        const slideX = isMobileView ? 0 : (servSlideOffset / 100) * 30;
        if (servicesDetailsRef.current) {
          servicesDetailsRef.current.style.opacity = `${servOp}`;
          servicesDetailsRef.current.style.transform = isMobileView ? "translateY(0)" : `translateX(${-slideX}px)`;
        }
        if (servicesGridRef.current) {
          servicesGridRef.current.style.opacity = `${servOp}`;
          servicesGridRef.current.style.transform = isMobileView ? "translateY(0)" : `translateX(${slideX}px)`;
        }

        // Animate Workshop Store overlay
        workshopStoreRef.current?.update(progress);

        // Animate Gallery overlay
        gallerySectionRef.current?.update(progress);

        // Animate Contact overlay
        contactSectionRef.current?.update(progress);

        let active = "home";
        if (progress >= 0.91) active = "contact";
        else if (progress >= 0.82) active = "gallery";
        else if (progress >= 0.72) active = "services";
        else if (progress >= 0.61905) active = "workshop";
        else if (progress >= 0.248) active = "workshop";
        else if (frameIdx >= 110) active = "about";
        else active = "home";

        if (active !== activeSectionRef.current) {
          activeSectionRef.current = active;
          // Update nav link active classes directly
          document.querySelectorAll(".nav-link-item, .mobile-nav-link").forEach((el) => {
            const href = el.getAttribute("href")?.replace("#", "") ?? "";
            el.classList.toggle("active", href === active);
          });
        }
      }
    };

    gsap.ticker.add(updateTicker);
    gsap.ticker.lagSmoothing(500, 33);

    // Initial sizing and scroll setup
    let resizeTimer: ReturnType<typeof setTimeout>;
    const debouncedResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resizeCanvas, 150);
    };
    window.addEventListener("resize", debouncedResize, { passive: true });
    resizeCanvas(true); // Force canvas setup on mount/re-initialization

    // Instant sync on refresh to prevent frame jump / fast-forward flicker
    const initScrollY = window.scrollY;
    const maxScrollInit = document.documentElement.scrollHeight - window.innerHeight;
    const initProgress = maxScrollInit > 0 ? Math.max(0, Math.min(1, initScrollY / maxScrollInit)) : 0;
    const initFrame = getFrameForProgress(initProgress);

    targetFrame = initFrame;
    currentFrame = initFrame;
    targetProgress = initProgress;
    currentProgress = initProgress;
    lastDrawnFrame = initFrame;
    currentFrameIndexRef.current = initFrame;

    drawFrame(initFrame);
    if (isLoaderComplete) {
      // Redraw correct frame now that loader is done and canvas is fully visible
      const currentScrollY = window.scrollY;
      const maxS = document.documentElement.scrollHeight - window.innerHeight;
      const p = maxS > 0 ? Math.max(0, Math.min(1, currentScrollY / maxS)) : 0;
      const fIdx = getFrameForProgress(p);
      drawFrame(fIdx);
    }
    handleScrollUpdate(initScrollY);

    // Fade in the whole homepage wrapper
    gsap.to(".homepage-wrapper", { opacity: 1, duration: 0.8, ease: "power1.out" });

    return () => {
      lenis.destroy();
      clearTimeout(resizeTimer);
      window.removeEventListener("resize", debouncedResize);
      gsap.ticker.remove(updateTicker);
    };
  }, [isVisible, preloadedImages, isLoaderComplete]);

  // Map logo path fills dynamically for legibility on dark/transparent backgrounds
  const getNavLogoFill = (fill: string, transform: string) => {
    return fill;
  };

  const NavLogo = () => (
    <svg
      viewBox="0 0 2172 724"
      style={{
        height: "60px",
        width: "auto",
        display: "block",
      }}
    >
      {logoPaths.map((p, idx) => {
        if (p.transform.includes("translate(0,0)")) return null;
        const fill = getNavLogoFill(p.fill, p.transform);
        return (
          <path
            key={`nav-logo-path-${idx}`}
            d={p.d}
            fill={fill}
            transform={p.transform}
          />
        );
      })}
    </svg>
  );

  const handleNavLinkClick = (e: React.MouseEvent<HTMLElement>, target: string) => {
    e.preventDefault();
    setIsMobileMenuOpen(false);
    if (target !== "home" && target !== "about" && target !== "services" && target !== "workshop" && target !== "gallery" && target !== "contact") return;
    if (!lenisRef.current) return;

    const scrollMap: { [key: string]: number } = {
      home: 0,
      about: 0.08,
      workshop: 0.248,
      services: 0.72,
      gallery: 0.82,
      contact: 0.91,
    };

    const progress = scrollMap[target] ?? 0;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const targetScroll = maxScroll * progress;

    lenisRef.current.scrollTo(targetScroll, {
      duration: 1.6,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });
  };

  if (!isVisible) return null;

  return (
    <div
      className="homepage-wrapper"
      style={{
        width: "100%",
        minHeight: "100vh",
        height: "1310vh", // outer scrollable track (matches sticky container height)
        overflow: "unset",
        background: "#000000",
        position: "relative",
        opacity: 0,
      }}
    >
      <header ref={navRef} className="desktop-navbar-fixed">
        <div className="navbar-logo">
          <a href="#home" onClick={(e) => handleNavLinkClick(e, "home")} style={{ display: "block" }}>
            <NavLogo />
          </a>
        </div>
        <nav className="navbar-links-center">
          <a href="#home" className="nav-link-item active" onClick={(e) => handleNavLinkClick(e, "home")}>Home</a>
          <a href="#about" className="nav-link-item" onClick={(e) => handleNavLinkClick(e, "about")}>About</a>
          <a href="#workshop" className="nav-link-item" onClick={(e) => handleNavLinkClick(e, "workshop")}>Workshop</a>
          <a href="#services" className="nav-link-item" onClick={(e) => handleNavLinkClick(e, "services")}>Services</a>
          <a href="#gallery" className="nav-link-item" onClick={(e) => handleNavLinkClick(e, "gallery")}>Gallery</a>
          <a href="#contact" className="nav-link-item" onClick={(e) => handleNavLinkClick(e, "contact")}>Contact</a>
        </nav>
        <div className="navbar-cta-right">
          <button className="nav-btn-cta" onClick={(e) => handleNavLinkClick(e, "contact")}>Book Service</button>
        </div>
        <button
          className={`mobile-hamburger-btn ${isMobileMenuOpen ? "open" : ""}`}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </header>

      <div className={`mobile-nav-overlay ${isMobileMenuOpen ? "open" : ""}`}>
        <a href="#home" className="mobile-nav-link active" onClick={(e) => handleNavLinkClick(e, "home")}>Home</a>
        <a href="#about" className="mobile-nav-link" onClick={(e) => handleNavLinkClick(e, "about")}>About</a>
        <a href="#workshop" className="mobile-nav-link" onClick={(e) => handleNavLinkClick(e, "workshop")}>Workshop</a>
        <a href="#services" className="mobile-nav-link" onClick={(e) => handleNavLinkClick(e, "services")}>Services</a>
        <a href="#gallery" className="mobile-nav-link" onClick={(e) => handleNavLinkClick(e, "gallery")}>Gallery</a>
        <a href="#contact" className="mobile-nav-link" onClick={(e) => handleNavLinkClick(e, "contact")}>Contact</a>
        <button className="mobile-nav-btn-cta" onClick={(e) => handleNavLinkClick(e, "contact")}>Book Service</button>
      </div>

      {/* Sticky Pin Container for Pinned Animations */}
      <div style={{ position: "relative", height: "1310vh", width: "100%" }}>
        <div style={{ position: "sticky", top: 0, height: "100vh", width: "100%", overflow: "hidden" }}>
          <div
            ref={canvasWrapperRef}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              overflow: "hidden",
              zIndex: 1,
              background: "#000000",
              transform: "translateY(0vh) translateZ(0)",
              willChange: "transform",
            }}
          >
            <canvas
              ref={canvasRef}
              style={{
                width: "100%",
                height: "100%",
                display: "block",
                objectFit: "cover",
                willChange: "contents",
                transform: "translateZ(0)",
                backfaceVisibility: "hidden",
              }}
            />
          </div>

          <div
            ref={desktopOverlayRef}
            className="desktop-content-overlay"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              zIndex: 2,
              pointerEvents: "none",
              display: "flex",
              alignItems: "center",
              transform: "translateY(0vh) translateZ(0)",
              willChange: "transform",
              justifyContent: "flex-start",
              paddingLeft: "8%",
              paddingRight: "8%",
            }}
          >
            <div
              ref={heroRef}
              className="glass-panel services-details-glass homepage-section-hero"
              style={{
                position: "absolute",
                right: "1%",
                top: "50%",
                transform: "translateY(-50%)",
                maxWidth: "600px",
                width: "100%",
                padding: "40px",
                textAlign: "right",
                opacity: 0,
                visibility: "hidden",
                pointerEvents: "none",
                willChange: "transform, opacity",
              }}
            >
              <div style={{ color: "var(--color-orange)", fontFamily: "var(--font-mono)", fontSize: "0.91rem", fontWeight: 800, letterSpacing: "4px", textTransform: "uppercase", marginBottom: "15px" }}>
                MOTOVILLAGE CAR WORKSHOP
              </div>
              <h1 style={{ fontSize: "2.6rem", fontWeight: 900, textTransform: "uppercase", color: "var(--color-white)", lineHeight: 1.15, marginBottom: "20px" }}>
                Rajkot's Most <DynamicText /> Car Care Destination
              </h1>
              <p style={{ color: "#FFFFFF", fontSize: "0.95rem", lineHeight: 1.6, marginBottom: "30px" }}>
                Welcome to Motovillage Car Workshop Pvt Ltd — where engineering expertise meets genuine care for your vehicle. Since 2018, we have served over 22,000+ satisfied customers across Gujarat.
              </p>
              <div style={{ display: "flex", gap: "15px", justifyContent: "flex-end" }}>
                <button className="btn-primary" onClick={(e) => handleNavLinkClick(e, "contact")}>
                  Book a Service
                </button>
                <button className="btn-secondary" onClick={(e) => handleNavLinkClick(e, "services")}>
                  Explore Services
                </button>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "15px", marginTop: "35px", paddingTop: "25px", borderTop: "1px solid rgba(255, 255, 255, 0.15)", textAlign: "center" }}>
                <div>
                  <div style={{ fontSize: "1.4rem", fontWeight: 700, color: "var(--color-orange)" }}>22k+</div>
                  <div style={{ fontSize: "0.65rem", color: "#FFFFFF", textTransform: "uppercase", letterSpacing: "1px" }}>Happy Clients</div>
                </div>
                <div>
                  <div style={{ fontSize: "1.4rem", fontWeight: 700, color: "var(--color-white)" }}>7+ Yrs</div>
                  <div style={{ fontSize: "0.65rem", color: "#FFFFFF", textTransform: "uppercase", letterSpacing: "1px" }}>Field Exp</div>
                </div>
                <div>
                  <div style={{ fontSize: "1.4rem", fontWeight: 700, color: "var(--color-white)" }}>10+ Yrs</div>
                  <div style={{ fontSize: "0.65rem", color: "#FFFFFF", textTransform: "uppercase", letterSpacing: "1px" }}>Knowledge</div>
                </div>
                <div>
                  <div style={{ fontSize: "1.4rem", fontWeight: 700, color: "var(--color-white)" }}>30+</div>
                  <div style={{ fontSize: "0.65rem", color: "#FFFFFF", textTransform: "uppercase", letterSpacing: "1px" }}>Services</div>
                </div>
              </div>
            </div>

            <div
              ref={aboutRef}
              className="glass-panel services-details-glass homepage-section-about"
              style={{
                position: "absolute",
                right: "1%",
                top: "53%",
                transform: "translateY(-50%)",
                maxWidth: "600px",
                width: "100%",
                padding: "40px",
                textAlign: "right",
                opacity: 0,
                visibility: "hidden",
                pointerEvents: "none",
                willChange: "transform, opacity",
              }}
            >
              <div style={{ color: "var(--color-orange)", fontFamily: "var(--font-mono)", fontSize: "0.91rem", fontWeight: 800, letterSpacing: "4px", textTransform: "uppercase", marginBottom: "15px" }}>
                WHO WE ARE
              </div>
              <h1 style={{ fontSize: "2.6rem", fontWeight: 900, textTransform: "uppercase", color: "var(--color-white)", lineHeight: 1.15, marginBottom: "20px" }}>
                Led by <span style={{ color: "var(--color-orange)" }}>Automobile</span> Engineers
              </h1>
              <p style={{ color: "#FFFFFF", fontSize: "0.95rem", lineHeight: 1.6, marginBottom: "25px" }}>
                Motovillage was built on the belief that every car deserves expert care, honest service, and lasting quality. Led by three Managing Directors holding a B.E. in Automobile Engineering, we combine deep theoretical knowledge since 2013 with years of hands-on expertise.
              </p>
              <div style={{ color: "#FFFFFF", fontSize: "0.9rem", fontStyle: "italic", marginBottom: "30px", borderRight: "3px solid var(--color-orange)", paddingRight: "15px", lineHeight: 1.5 }}>
                "To be the most trusted one-stop car care destination, delivering quality, innovation, and reliable automotive solutions with excellence and customer satisfaction."
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "24px 20px", marginTop: "25px", paddingTop: "25px", borderTop: "1px solid rgba(255, 255, 255, 0.15)", textAlign: "right" }}>
                <div>
                  <div style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--color-orange)", marginBottom: "6px", display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "8px" }}>
                    <span>TRUST</span>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-orange)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="m9 12 2 2 4-4" /></svg>
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "#FFFFFF" }}>Relationships, not just repairs.</div>
                </div>
                <div>
                  <div style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--color-white)", marginBottom: "6px", display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "8px" }}>
                    <span>QUALITY</span>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-white)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="m9 12 2 2 4-4" /></svg>
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "#FFFFFF" }}>Precision in every service.</div>
                </div>
              </div>
            </div>

            <div
              ref={storyRef}
              className="glass-panel services-details-glass homepage-section-story"
              style={{
                position: "absolute",
                left: "8%",
                top: "53%",
                transform: "translateY(-50%) translateX(0px)",
                maxWidth: "600px",
                width: "100%",
                padding: "40px",
                textAlign: "left",
                opacity: 0,
                visibility: "hidden",
                pointerEvents: "none",
                willChange: "transform, opacity",
              }}
            >
              <div style={{ color: "var(--color-orange)", fontFamily: "var(--font-mono)", fontSize: "0.91rem", fontWeight: 800, letterSpacing: "4px", textTransform: "uppercase", marginBottom: "15px" }}>
                OUR STORY
              </div>
              <h1 style={{ fontSize: "2.6rem", fontWeight: 900, textTransform: "uppercase", color: "var(--color-white)", lineHeight: 1.15, marginBottom: "20px" }}>
                Driven by <span style={{ color: "var(--color-orange)" }}>Passion</span>, Built on Trust
              </h1>
              <p style={{ color: "#FFFFFF", fontSize: "0.92rem", lineHeight: 1.6, marginBottom: "20px" }}>
                Motovillage Car Workshop Pvt Ltd was born from a passion for automobiles and a commitment to genuine quality service. What began as a technically driven idea in 2013 became a reality on the road in 2018.
              </p>
              <p style={{ color: "#FFFFFF", fontSize: "0.92rem", lineHeight: 1.6, marginBottom: "30px" }}>
                Today, Motovillage is a complete car care ecosystem, offering mechanical repairs, premium detailing, PPF, ceramic coating, and advanced diagnostics — serving over 22,000+ satisfied clients across Gujarat.
              </p>

              <div style={{ color: "var(--color-orange)", fontFamily: "var(--font-mono)", fontSize: "0.85rem", letterSpacing: "4px", textTransform: "uppercase", marginBottom: "20px" }}>
                LEADERSHIP TEAM
              </div>

              {/* Directors Grid */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "15px", borderTop: "1px solid rgba(255, 255, 255, 0.15)", paddingTop: "20px" }}>
                <div>
                  <div style={{ fontSize: "1.05rem", fontWeight: 800, color: "var(--color-orange)" }}>Mayur Shingala</div>
                  <div style={{ fontSize: "0.75rem", color: "var(--color-white)", marginTop: "2px" }}>Managing Director</div>
                  <div style={{ fontSize: "0.65rem", color: "#FFFFFF", opacity: 0.8 }}>B.E. Automobile</div>
                </div>
                <div>
                  <div style={{ fontSize: "1.05rem", fontWeight: 800, color: "var(--color-orange)" }}>Hardik Bhalala</div>
                  <div style={{ fontSize: "0.75rem", color: "var(--color-white)", marginTop: "2px" }}>Managing Director</div>
                  <div style={{ fontSize: "0.65rem", color: "#FFFFFF", opacity: 0.8 }}>B.E. Automobile</div>
                </div>
                <div>
                  <div style={{ fontSize: "1.05rem", fontWeight: 800, color: "var(--color-orange)" }}>Denish Thummar</div>
                  <div style={{ fontSize: "0.75rem", color: "var(--color-white)", marginTop: "2px" }}>Managing Director</div>
                  <div style={{ fontSize: "0.65rem", color: "#FFFFFF", opacity: 0.8 }}>B.E. Automobile</div>
                </div>
              </div>
            </div>

            <div
              ref={visionRef}
              className="glass-panel services-details-glass homepage-section-vision"
              style={{
                position: "absolute",
                right: "1%",
                top: "53%",
                transform: "translateY(-50%) translateX(100px)",
                maxWidth: "600px",
                width: "100%",
                padding: "40px",
                textAlign: "right",
                opacity: 0,
                visibility: "hidden",
                pointerEvents: "none",
                willChange: "transform, opacity",
              }}
            >
              <div style={{ color: "var(--color-orange)", fontFamily: "var(--font-mono)", fontSize: "0.91rem", fontWeight: 800, letterSpacing: "4px", textTransform: "uppercase", marginBottom: "15px" }}>
                VISION & MISSION
              </div>
              <h1 style={{ fontSize: "2.6rem", fontWeight: 900, textTransform: "uppercase", color: "var(--color-white)", lineHeight: 1.15, marginBottom: "25px" }}>
                Setting the Standard <br /> for Automotive Care
              </h1>
              <div style={{ marginBottom: "30px" }}>
                <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--color-orange)", marginBottom: "8px", display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "8px" }}>
                  <span>OUR VISION</span>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-orange)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="m9 12 2 2 4-4" /></svg>
                </div>
                <p style={{ color: "#FFFFFF", fontSize: "0.92rem", lineHeight: 1.6, fontStyle: "italic" }}>
                  "To be the most trusted one-stop car care destination, delivering quality, innovation, and reliable automotive solutions with excellence and customer satisfaction."
                </p>
              </div>

              <div style={{ borderTop: "1px solid rgba(255, 255, 255, 0.15)", paddingTop: "25px" }}>
                <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--color-orange)", marginBottom: "8px", display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "8px" }}>
                  <span>OUR MISSION</span>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-orange)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="m9 12 2 2 4-4" /></svg>
                </div>
                <p style={{ color: "#FFFFFF", fontSize: "0.92rem", lineHeight: 1.6, fontStyle: "italic" }}>
                  "To provide complete car care solutions through expert service, advanced technology, and trusted support, ensuring safety, performance, and reliable customer experiences."
                </p>
              </div>
            </div>

            {/* WORKSHOP CARD 1: MECHANICAL & ELECTRICAL WORK */}
            <div
              ref={workshopRef1}
              className="glass-panel services-details-glass homepage-section-workshop"
              style={{
                position: "absolute",
                right: "1%",
                left: "auto",
                top: "50%",
                transform: "translateY(-50%) translateX(0px)",
                maxWidth: "600px",
                width: "100%",
                padding: "40px",
                textAlign: "right",
                opacity: 0,
                visibility: "hidden",
                pointerEvents: "none",
                willChange: "transform, opacity",
                boxShadow: "0 10px 40px rgba(0, 0, 0, 0.4)",
              }}
            >
              <div style={{ color: "var(--color-orange)", fontFamily: "var(--font-mono)", fontSize: "0.91rem", fontWeight: 800, letterSpacing: "4px", textTransform: "uppercase", marginBottom: "12px" }}>
                Mechanical & Electrical Work
              </div>
              <h1 style={{ fontSize: "2.4rem", fontWeight: 900, textTransform: "uppercase", color: "var(--color-white)", lineHeight: 1.15, marginBottom: "15px" }}>
                Diagnostics & <span style={{ color: "var(--color-orange)" }}>Repairs</span>
              </h1>
              <p style={{ color: "var(--color-orange)", fontSize: "1.05rem", fontWeight: 700, lineHeight: 1.5, margin: 0 }}>
                Complete mechanical and electrical diagnostics, repairs, and tuning for optimal performance and safety.
              </p>
              <hr style={{ border: "none", borderTop: "1px solid rgba(255, 255, 255, 0.15)", margin: "20px 0" }} />
              <p style={{ color: "#E0E0E0", fontSize: "0.92rem", lineHeight: 1.6, marginBottom: "25px", opacity: 0.95 }}>
                Our engineer-led team combines mechanical precision with advanced automotive electronics. We diagnose and repair all mechanical systems (engine, brakes, suspension) and electrical/electronic systems (faulty wiring, malfunctioning sensors, ECM issues, and battery management) using state-of-the-art diagnostic scanners, ensuring your vehicle is safe, reliable, and performing at its peak.
              </p>

              <button
                onClick={() => setExpandedCard(1)}
                style={{
                  background: "transparent",
                  border: "1px solid var(--color-orange)",
                  color: "var(--color-white)",
                  padding: "12px 28px",
                  fontSize: "0.85rem",
                  fontWeight: 800,
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                  borderRadius: "4px",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "var(--color-orange)";
                  e.currentTarget.style.color = "black";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "var(--color-white)";
                }}
              >
                <span>Read More</span>
                <span>→</span>
              </button>
            </div>

            {/* WORKSHOP CARD 2: ALIGNMENT WORK */}
            <div
              ref={workshopRef2}
              className="glass-panel services-details-glass homepage-section-workshop"
              style={{
                position: "absolute",
                right: "1%",
                left: "auto",
                top: "50%",
                transform: "translateY(-50%) translateX(0px)",
                maxWidth: "600px",
                width: "100%",
                padding: "40px",
                textAlign: "right",
                opacity: 0,
                visibility: "hidden",
                pointerEvents: "none",
                willChange: "transform, opacity",
                boxShadow: "0 10px 40px rgba(0, 0, 0, 0.4)",
              }}
            >
              <div style={{ color: "var(--color-orange)", fontFamily: "var(--font-mono)", fontSize: "0.91rem", fontWeight: 800, letterSpacing: "4px", textTransform: "uppercase", marginBottom: "12px" }}>
                Alignment Work
              </div>
              <h1 style={{ fontSize: "2.4rem", fontWeight: 900, textTransform: "uppercase", color: "var(--color-white)", lineHeight: 1.15, marginBottom: "15px" }}>
                3D Wheel <span style={{ color: "var(--color-orange)" }}>Alignment</span>
              </h1>
              <p style={{ color: "var(--color-orange)", fontSize: "1.05rem", fontWeight: 700, lineHeight: 1.5, margin: 0 }}>
                Precision 3D wheel alignment, balancing, and steering calibration for smooth handling and tire longevity.
              </p>
              <hr style={{ border: "none", borderTop: "1px solid rgba(255, 255, 255, 0.15)", margin: "20px 0" }} />
              <p style={{ color: "#E0E0E0", fontSize: "0.92rem", lineHeight: 1.6, marginBottom: "25px", opacity: 0.95 }}>
                Improper wheel alignment leads to uneven tire wear, steering pull, and poor fuel economy. Our workshop uses advanced 3D laser alignment technology to inspect and calibrate the camber, caster, and toe angles of your wheels according to manufacturer specifications. This ensures straight-line tracking, stable handling, and maximum tire life.
              </p>

              <button
                onClick={() => setExpandedCard(2)}
                style={{
                  background: "transparent",
                  border: "1px solid var(--color-orange)",
                  color: "var(--color-white)",
                  padding: "12px 28px",
                  fontSize: "0.85rem",
                  fontWeight: 800,
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                  borderRadius: "4px",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "var(--color-orange)";
                  e.currentTarget.style.color = "black";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "var(--color-white)";
                }}
              >
                <span>Read More</span>
                <span>→</span>
              </button>
            </div>

            {/* WORKSHOP CARD 3: PAINT WORK */}
            <div
              ref={workshopRef3}
              className="glass-panel services-details-glass homepage-section-workshop"
              style={{
                position: "absolute",
                right: "1%",
                left: "auto",
                top: "50%",
                transform: "translateY(-50%) translateX(0px)",
                maxWidth: "600px",
                width: "100%",
                padding: "40px",
                textAlign: "right",
                opacity: 0,
                visibility: "hidden",
                pointerEvents: "none",
                willChange: "transform, opacity",
                boxShadow: "0 10px 40px rgba(0, 0, 0, 0.4)",
              }}
            >
              <div style={{ color: "var(--color-orange)", fontFamily: "var(--font-mono)", fontSize: "0.91rem", fontWeight: 800, letterSpacing: "4px", textTransform: "uppercase", marginBottom: "12px" }}>
                Paint Work
              </div>
              <h1 style={{ fontSize: "2.4rem", fontWeight: 900, textTransform: "uppercase", color: "var(--color-white)", lineHeight: 1.15, marginBottom: "15px" }}>
                Denting & <span style={{ color: "var(--color-orange)" }}>Painting</span>
              </h1>
              <p style={{ color: "var(--color-orange)", fontSize: "1.05rem", fontWeight: 700, lineHeight: 1.5, margin: 0 }}>
                Premium automotive painting, denting, and scratch restoration with computer-matched color precision.
              </p>
              <hr style={{ border: "none", borderTop: "1px solid rgba(255, 255, 255, 0.15)", margin: "20px 0" }} />
              <p style={{ color: "#E0E0E0", fontSize: "0.92rem", lineHeight: 1.6, marginBottom: "25px", opacity: 0.95 }}>
                Whether repairing minor scratches or performing full-body accidental restoration, our paint work matches factory standards. We use computer-matched color mixing, high-quality primers and basecoats, and a dust-free paint booth to ensure a flawless, seamless paint match. Our skilled denting technicians restore the body's original contours before paint is applied, leaving a showroom-quality finish.
              </p>

              <button
                onClick={() => setExpandedCard(3)}
                style={{
                  background: "transparent",
                  border: "1px solid var(--color-orange)",
                  color: "var(--color-white)",
                  padding: "12px 28px",
                  fontSize: "0.85rem",
                  fontWeight: 800,
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                  borderRadius: "4px",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "var(--color-orange)";
                  e.currentTarget.style.color = "black";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "var(--color-white)";
                }}
              >
                <span>Read More</span>
                <span>→</span>
              </button>
            </div>

            {/* WORKSHOP CARD 4: PPF & CERAMIC COATING */}
            <div
              ref={workshopRef4}
              className="glass-panel services-details-glass homepage-section-workshop"
              style={{
                position: "absolute",
                right: "1%",
                left: "auto",
                top: "50%",
                transform: "translateY(-50%) translateX(0px)",
                maxWidth: "600px",
                width: "100%",
                padding: "40px",
                textAlign: "right",
                opacity: 0,
                visibility: "hidden",
                pointerEvents: "none",
                willChange: "transform, opacity",
                boxShadow: "0 10px 40px rgba(0, 0, 0, 0.4)",
              }}
            >
              <div style={{ color: "var(--color-orange)", fontFamily: "var(--font-mono)", fontSize: "0.91rem", fontWeight: 800, letterSpacing: "4px", textTransform: "uppercase", marginBottom: "12px" }}>
                PPF & Ceramic Coating
              </div>
              <h1 style={{ fontSize: "2.4rem", fontWeight: 900, textTransform: "uppercase", color: "var(--color-white)", lineHeight: 1.15, marginBottom: "15px" }}>
                Paint <span style={{ color: "var(--color-orange)" }}>Protection</span>
              </h1>
              <p style={{ color: "var(--color-orange)", fontSize: "1.05rem", fontWeight: 700, lineHeight: 1.5, margin: 0 }}>
                Advanced paint protection systems including self-healing Paint Protection Film (PPF) and ultra-glossy Ceramic Coatings.
              </p>
              <hr style={{ border: "none", borderTop: "1px solid rgba(255, 255, 255, 0.15)", margin: "20px 0" }} />
              <p style={{ color: "#E0E0E0", fontSize: "0.92rem", lineHeight: 1.6, marginBottom: "25px", opacity: 0.95 }}>
                Protect your car's exterior paint from rock chips, key scratches, chemical stains, and UV damage. Our Paint Protection Film (PPF) is a premium, self-healing transparent layer that absorbs impacts, while our Ceramic Coating creates an ultra-durable, hydrophobic chemical shield. Together or individually, they offer maximum protection and a long-lasting showroom gloss.
              </p>

              <button
                onClick={() => setExpandedCard(4)}
                style={{
                  background: "transparent",
                  border: "1px solid var(--color-orange)",
                  color: "var(--color-white)",
                  padding: "12px 28px",
                  fontSize: "0.85rem",
                  fontWeight: 800,
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                  borderRadius: "4px",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "var(--color-orange)";
                  e.currentTarget.style.color = "black";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "var(--color-white)";
                }}
              >
                <span>Read More</span>
                <span>→</span>
              </button>
            </div>
          </div>

          <div
            ref={servicesRef}
            id="services"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              backgroundImage: "url('/servicedesctopback.png')",
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
              transform: "translateY(100vh)",
              opacity: 0,
              pointerEvents: "none",
              zIndex: 3,
              display: "flex",
              visibility: "hidden",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0 8%",
              boxSizing: "border-box",
              willChange: "transform, opacity",
            }}
          >
            <div
              ref={servicesDetailsRef}
              className={`services-details-glass homepage-services-details ${selectedService ? "active" : ""}`}
              style={{
                width: "44%",
                height: "80vh",
                padding: "40px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                textAlign: "left",
                opacity: 0,
                transform: "translateX(-30px)",
                boxSizing: "border-box",
                overflow: "hidden",
                willChange: "transform, opacity",
              }}
            >
              {selectedService ? (
                <div style={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0 }}>
                  {/* Header */}
                  <div style={{ display: "flex", alignItems: "center", gap: "15px", marginBottom: "20px", flexShrink: 0, position: "relative" }}>
                    <div style={{ background: "rgba(255, 90, 0, 0.1)", border: "1px solid var(--color-orange)", borderRadius: "12px", padding: "12px", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 15px rgba(255, 90, 0, 0.15)" }}>
                      <ServiceIcon name={selectedService.icon} size={32} color="var(--color-orange)" />
                    </div>
                    <div style={{ flex: 1 }}>
                      <h2 style={{ fontSize: "1.8rem", fontWeight: 900, textTransform: "uppercase", color: "var(--color-white)", margin: 0, letterSpacing: "0.5px" }}>
                        {selectedService.title}
                      </h2>
                      <span style={{ fontSize: "0.75rem", color: "var(--color-orange)", fontFamily: "var(--font-mono)", letterSpacing: "2px", fontWeight: 700 }}>MOTOVILLAGE PREMIER</span>
                    </div>
                    {/* Mobile Close Button */}
                    <button
                      className="mobile-close-btn"
                      onClick={() => setSelectedService(null)}
                      style={{
                        background: "rgba(255,255,255,0.06)",
                        border: "none",
                        borderRadius: "50%",
                        width: "28px",
                        height: "28px",
                        display: "none",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#FFFFFF",
                        cursor: "pointer",
                        position: "absolute",
                        right: 0,
                        top: 0
                      }}
                    >
                      ✕
                    </button>
                  </div>

                  {/* Scrollable details body */}
                  <div data-lenis-prevent style={{ flex: 1, overflowY: "auto", maxHeight: "calc(80vh - 250px)", paddingRight: "10px", marginBottom: "20px", paddingBottom: "25px" }} className="scroll-container-details">
                    <p style={{ color: "#FFFFFF", fontSize: "0.92rem", lineHeight: 1.6, marginBottom: "20px", opacity: 0.9 }}>
                      {selectedService.detailedDesc}
                    </p>

                    {selectedService.process && (
                      <div style={{ marginBottom: "20px" }}>
                        <div style={{ fontSize: "0.8rem", fontWeight: 800, color: "var(--color-orange)", textTransform: "uppercase", letterSpacing: "2px", marginBottom: "10px" }}>SERVICE PROCESS</div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "8px" }}>
                          {selectedService.process.map((step: string, idx: number) => (
                            <div key={idx} style={{ display: "flex", gap: "10px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "8px", padding: "8px 12px", alignItems: "center" }}>
                              <span style={{ color: "var(--color-orange)", fontWeight: 900, fontSize: "0.85rem" }}>0{idx + 1}</span>
                              <span style={{ color: "#FFFFFF", fontSize: "0.8rem", opacity: 0.85 }}>{step}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div style={{ marginBottom: "10px" }}>
                      <div style={{ fontSize: "0.8rem", fontWeight: 800, color: "var(--color-orange)", textTransform: "uppercase", letterSpacing: "2px", marginBottom: "10px" }}>BENEFITS</div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                        {selectedService.benefits.map((b: string, idx: number) => (
                          <span key={idx} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "20px", padding: "5px 12px", fontSize: "0.7rem", color: "#FFFFFF", fontWeight: 600, letterSpacing: "0.5px" }}>
                            {b}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: "flex", gap: "15px", marginTop: "auto", flexShrink: 0 }}>
                    <button
                      className="btn-primary"
                      onClick={(e) => handleNavLinkClick(e, "contact")}
                      style={{ flex: 1, padding: "12px 20px", fontSize: "0.8rem", border: "none", cursor: "pointer", fontWeight: 700, borderRadius: "8px" }}
                    >
                      Book Service
                    </button>
                    <button
                      onClick={() => setSelectedService(null)}
                      style={{
                        background: "rgba(255, 255, 255, 0.08)",
                        border: "1px solid rgba(255, 255, 255, 0.15)",
                        borderRadius: "8px",
                        color: "#FFFFFF",
                        padding: "12px 20px",
                        fontSize: "0.8rem",
                        cursor: "pointer",
                        fontWeight: 700,
                        transition: "all 0.2s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "rgba(255, 255, 255, 0.15)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "rgba(255, 255, 255, 0.08)";
                      }}
                    >
                      Back
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", height: "100%" }}>
                  <div style={{ color: "var(--color-orange)", fontFamily: "var(--font-mono)", fontSize: "0.91rem", fontWeight: 800, letterSpacing: "4px", textTransform: "uppercase", marginBottom: "15px" }}>
                    SERVICES & DETAILING
                  </div>
                  <h1 style={{ fontSize: "2.4rem", fontWeight: 900, textTransform: "uppercase", color: "var(--color-white)", lineHeight: 1.15, marginBottom: "25px" }}>
                    Gujarat's Premier <br /> Car Care Hub
                  </h1>
                  <p style={{ color: "#FFFFFF", fontSize: "0.92rem", lineHeight: 1.6, opacity: 0.7, marginBottom: "35px" }}>
                    Select any service category from the interactive board on the right to view complete details, processes, engineering standards, and custom packages.
                  </p>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "var(--color-orange)", fontSize: "0.85rem", fontWeight: 700 }}>
                    <span>Click a service card to begin</span>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ animation: "bounceRight 1.5s infinite" }}>
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                      <polyline points="12 5 19 12 12 19"></polyline>
                    </svg>
                  </div>
                </div>
              )}
            </div>

            {/* Right Side: Interactive Board (4x3 Grid) */}
            {/* Right Side: Interactive Board (4x3 Grid) */}
            <div
              ref={servicesGridRef}
              className="homepage-services-grid"
              style={{
                width: "48%",
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "18px",
                opacity: 0,
                transform: "translateX(30px)",
                willChange: "transform, opacity",
              }}
            >
              {servicesData.map((item, idx) => {
                const isSelected = selectedService?.id === item.id;
                return (
                  <div
                    key={item.id}
                    className={`service-grid-card ${isSelected ? "selected" : ""}`}
                    onClick={() => setSelectedService(item)}
                    style={{
                      padding: "22px 15px",
                      textAlign: "center",
                      cursor: "pointer",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "10px",
                      transform: isSelected ? "scale(1.05)" : "scale(1)",
                    }}
                  >
                    <div className="service-card-icon-container" style={{ transition: "transform 0.3s ease" }}>
                      <ServiceIcon name={item.icon} size={28} color={isSelected ? "#FFFFFF" : "rgba(255,255,255,0.7)"} />
                    </div>
                    <div style={{ fontSize: "0.78rem", fontWeight: 800, color: "#FFFFFF", letterSpacing: "0.5px", textTransform: "uppercase" }}>
                      {item.title}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <WorkshopStore ref={workshopStoreRef} />

          <GallerySection ref={gallerySectionRef} />

          <ContactSection ref={contactSectionRef} logoPaths={logoPaths} />
        </div>
      </div>

      {/* Workshop Card Popup Modal */}
      {expandedCard !== null && (() => {
        const servicesData = [
          {
            title: "Mechanical & Electrical Work",
            subtitle: "Diagnostics & Repairs",
            process: [
              { name: "Multi-Point Vehicle Inspection", desc: "Check engine, suspension, brakes, and electrical connections." },
              { name: "Advanced Computerized Diagnostics", desc: "Scan for error codes in the ECM, sensors, and electrical systems." },
              { name: "System Diagnostics & Repair", desc: "Precision mechanical repairs and wiring restoration." },
              { name: "Genuine Parts Replacement", desc: "Install high-quality, authorized replacement parts." },
              { name: "System Calibration & Testing", desc: "Verify proper operation and reset warning lights." }
            ],
            benefits: [
              "Improved Engine & Vehicle Performance",
              "Enhanced Drive Safety & Reliability",
              "Accurate & Fast Diagnostics (Zero Guesswork)",
              "Safer and Fully Integrated Electrical Systems",
              "Lower Long-Term Maintenance Costs & Higher Resale Value"
            ]
          },
          {
            title: "Alignment Work",
            subtitle: "3D Wheel Alignment",
            process: [
              { name: "Steering & Suspension Inspection", desc: "Check for worn bushings, tie rods, or ball joints." },
              { name: "Tire Inspection & Pressure Check", desc: "Inspect tread depth, wear patterns, and adjust tire pressure." },
              { name: "3D Laser Alignment Measurement", desc: "Map wheel angles using high-precision laser sensors." },
              { name: "Angle Calibration", desc: "Adjust camber, caster, and toe settings to factory specifications." },
              { name: "Steering Wheel Centering & Test Drive", desc: "Verify perfect straight-line tracking and control." }
            ],
            benefits: [
              "Prevents Uneven & Premature Tire Wear",
              "Improves Fuel Efficiency & Reduces Rolling Resistance",
              "Corrects Steering Pull for Effortless Straight-Line Driving",
              "Enhances Overall Vehicle Handling and Safety",
              "Protects Steering & Suspension Components from Excessive Stress"
            ]
          },
          {
            title: "Paint Work",
            subtitle: "Denting & Painting",
            process: [
              { name: "Dent Repair & Panel Alignment", desc: "Restore original shape and align body panels." },
              { name: "Surface Preparation", desc: "Sanding, priming, and masking surrounding areas." },
              { name: "Computerized Paint Matching", desc: "Match original color codes and mix paint with high accuracy." },
              { name: "Multi-Layer Paint Application", desc: "Basecoat, color coat, and clear coat applied in a dust-free booth." },
              { name: "Curing & Surface Refinishing", desc: "Professional heating, sanding, and high-gloss polishing." }
            ],
            benefits: [
              "Flawless, Factory-Matched Color & Finish",
              "Complete Restoration of Accident Damage",
              "High-Gloss, Long-Lasting Surface Shine",
              "Complete Protection Against Rust & Weathering",
              "Preserves the Vehicle's Market & Resale Value"
            ]
          },
          {
            title: "PPF & Ceramic Coating",
            subtitle: "Paint Protection Studio",
            process: [
              { name: "Deep Decontamination Wash", desc: "Complete foam wash, clay bar treatment, and surface refinement." },
              { name: "Paint Correction (Polishing)", desc: "Remove minor scratches, swirl marks, and paint oxidation." },
              { name: "Surface Prep & Alcohol Wipe", desc: "Clean all oils and residue to ensure optimal bonding." },
              { name: "Ceramic Coating / PPF Application", desc: "Apply premium coating layers or precisely install PPF sheets." },
              { name: "Curing & Quality Check", desc: "Heat-cure the surfaces and perform a meticulous light inspection." }
            ],
            benefits: [
              "Maximum Protection Against Stone Chips, Scratches & UV Rays",
              "Self-Healing Surface (PPF automatically heals minor scratches under heat)",
              "Hydrophobic Water & Dirt Repellence (Saves time on washing)",
              "Superior Deep-Gloss Showroom Finish",
              "Long-Term Paint Protection & Increased Resale Value"
            ]
          }
        ];

        const service = servicesData[expandedCard - 1];
        if (!service) return null;

        return (
          <div
            className="modal-overlay"
            onClick={() => setExpandedCard(null)}
          >
            <div
              className="modal-content-wrapper"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setExpandedCard(null)}
                style={{
                  position: "absolute",
                  top: "25px",
                  right: "25px",
                  background: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  color: "#FFFFFF",
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  fontSize: "1.2rem",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "var(--color-orange)";
                  e.currentTarget.style.color = "black";
                  e.currentTarget.style.borderColor = "var(--color-orange)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
                  e.currentTarget.style.color = "#FFFFFF";
                  e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.1)";
                }}
              >
                ✕
              </button>

              <div style={{ color: "var(--color-orange)", fontFamily: "var(--font-mono)", fontSize: "0.95rem", fontWeight: 800, letterSpacing: "4px", textTransform: "uppercase", marginBottom: "10px" }}>
                {service.title}
              </div>
              <h2 className="modal-subtitle-text">
                {service.subtitle}
              </h2>

              <div className="modal-grid-layout">
                {/* Process Steps */}
                <div>
                  <h3 style={{ color: "var(--color-orange)", fontSize: "1.2rem", fontWeight: 800, letterSpacing: "1px", marginBottom: "20px", textTransform: "uppercase" }}>
                    Service Process
                  </h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                    {service.process.map((step, idx) => (
                      <div key={idx} style={{ display: "flex", gap: "15px", alignItems: "flex-start" }}>
                        <div style={{ fontFamily: "var(--font-mono)", fontSize: "1.1rem", fontWeight: 800, color: "var(--color-orange)", opacity: 0.8, background: "rgba(255, 110, 0, 0.1)", padding: "4px 8px", borderRadius: "4px" }}>
                          {String(idx + 1).padStart(2, "0")}
                        </div>
                        <div>
                          <h4 style={{ color: "#FFFFFF", fontSize: "0.95rem", fontWeight: 700, marginBottom: "4px" }}>
                            {step.name}
                          </h4>
                          <p style={{ color: "#CCCCCC", fontSize: "0.85rem", lineHeight: 1.5 }}>
                            {step.desc}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Benefits */}
                <div>
                  <h3 style={{ color: "var(--color-orange)", fontSize: "1.2rem", fontWeight: 800, letterSpacing: "1px", marginBottom: "20px", textTransform: "uppercase" }}>
                    Key Benefits
                  </h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                    {service.benefits.map((benefit, idx) => (
                      <div key={idx} style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                        <span style={{ color: "var(--color-orange)", fontSize: "1.2rem", lineHeight: 1 }}>✓</span>
                        <p style={{ color: "#E0E0E0", fontSize: "0.9rem", lineHeight: 1.5, margin: 0 }}>
                          {benefit}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
