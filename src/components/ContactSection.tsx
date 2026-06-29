"use client";

import React, { useRef, useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { createPortal } from "react-dom";
import "../styles/contact-section.css";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
interface PathData {
  d: string;
  fill: string;
  transform: string;
}

interface ContactSectionProps {
  logoPaths: PathData[];
}

export interface ContactSectionHandle {
  update: (progress: number) => void;
  openModal: () => void;
}

const ContactSection = forwardRef<ContactSectionHandle, ContactSectionProps>(({ logoPaths }, ref) => {
  // ── Refs ──────────────────────────────────────────────────────────────────
  const containerRef = useRef<HTMLDivElement>(null);
  const contactCardRef = useRef<HTMLDivElement>(null);
  const contactMapRef = useRef<HTMLDivElement>(null);

  // ── State ─────────────────────────────────────────────────────────────────
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);

  const [formValues, setFormValues] = useState({
    name: "",
    phone: "",
    car: "",
    service: "",
    date: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // ── Service Names Mapping ──
  const SERVICE_NAMES: Record<string, string> = {
    general: "General Periodic Maintenance",
    tuning: "ECU Calibration & Tuning",
    detail: "PPF & Detailing Showroom",
    diagnostic: "Advanced Computer Diagnostics",
    mechanical: "Mechanical & Engine Repair",
    ceramic: "Ceramic Coating & Paint Correction",
    suspension: "Brake & Suspension Upgrade",
    ac: "AC Service & Gas Recharge",
    custom: "Custom Modification & Wrapping",
  };

  const getTodayDateString = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const parts = dateStr.split("-");
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`; // DD/MM/YYYY
    }
    return dateStr;
  };

  const openModal = () => {
    setFormValues({
      name: "",
      phone: "",
      car: "",
      service: "",
      date: "",
    });
    setErrors({});
    setIsBookModalOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    const fieldName = id.replace("book-", ""); // book-name -> name
    setFormValues((prev) => ({ ...prev, [fieldName]: value }));

    // Clear error for this field dynamically
    if (errors[fieldName]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[fieldName];
        return next;
      });
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};

    // Validate Name
    const nameVal = formValues.name.trim();
    if (!nameVal) {
      newErrors.name = "Name is required";
    } else if (nameVal.length < 3) {
      newErrors.name = "Name must be at least 3 characters";
    } else if (!/^[a-zA-Z\s]+$/.test(nameVal)) {
      newErrors.name = "Name should only contain letters and spaces";
    }

    // Validate Phone (10 digits starting with 6-9)
    const phoneVal = formValues.phone.trim();
    if (!phoneVal) {
      newErrors.phone = "Phone number is required";
    } else if (!/^[6-9]\d{9}$/.test(phoneVal)) {
      newErrors.phone = "Enter a valid 10-digit number starting with 6-9";
    }

    // Validate Car Make & Model
    const carVal = formValues.car.trim();
    if (!carVal) {
      newErrors.car = "Car details are required";
    } else if (carVal.length < 3) {
      newErrors.car = "Car details must be at least 3 characters";
    }

    // Validate Service Selection
    if (!formValues.service) {
      newErrors.service = "Please select a service";
    }

    // Validate Date
    if (!formValues.date) {
      newErrors.date = "Preferred date is required";
    } else {
      const todayStr = getTodayDateString();
      if (formValues.date < todayStr) {
        newErrors.date = "Preferred date cannot be in the past";
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const serviceLabel = SERVICE_NAMES[formValues.service] || formValues.service;
    const formattedDate = formatDate(formValues.date);

    const message = `🚗 *New Service Booking - Motovillage* 🚗

👤 *Customer Details:*
• *Name:* ${nameVal}
• *Phone:* ${phoneVal}

🚘 *Vehicle Details:*
• *Car:* ${carVal}

🛠️ *Service Details:*
• *Service Type:* ${serviceLabel}
• *Preferred Date:* ${formattedDate}`;

    const whatsappNumber = "919904655559";
    const whatsappUrl = `https://api.whatsapp.com/send?phone=${whatsappNumber}&text=${encodeURIComponent(message)}`;

    window.open(whatsappUrl, "_blank");
    setIsBookModalOpen(false);
  };

  // ── Mobile detection ──────────────────────────────────────────────────────
  useEffect(() => {
    setMounted(true);
    const check = () => setIsMobile(window.innerWidth <= 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // ── Expose methods imperatively to avoid React re-renders ──
  useImperativeHandle(ref, () => ({
    openModal,
    update: (progress: number) => {
      let slideOffset = 100;
      let slideUnit = "vh";
      let contactOp = 0;

      // Contact section starts active at progress > 0.886
      if (isMobile) {
        if (progress > 0.61905) {
          if (progress <= 0.64286) {
            slideOffset = 100;
            slideUnit = "vh";
            contactOp = 0;
          } else if (progress <= 0.91) {
            const t = (progress - 0.64286) / (0.91 - 0.64286);
            slideOffset = 300 - t * 300;
            slideUnit = "vh";
            contactOp = slideOffset < 0 ? 1 : Math.max(0, 1 - slideOffset / 100);
          } else {
            const t2 = (progress - 0.91) / 0.09;
            const easeT2 = t2 * t2 * (3 - 2 * t2);
            const extraHeight = containerRef.current
              ? (containerRef.current.scrollHeight - (typeof window !== "undefined" ? window.innerHeight : 800))
              : 400;
            slideOffset = -Math.max(0, extraHeight) * easeT2;
            slideUnit = "px";
            contactOp = 1;
          }
        } else {
          slideOffset = 100;
          slideUnit = "vh";
          contactOp = 0;
        }
      } else {
        if (progress > 0.886) {
          if (progress <= 0.91) {
            // Slide in range (0.886 to 0.91)
            const t = (progress - 0.886) / 0.024;
            const easeT = t * t * (3 - 2 * t); // Smoothstep easing
            slideOffset = 100 - 100 * easeT;
            slideUnit = "vh";
            contactOp = easeT;
          } else {
            // Visible + footer reveal scroll range (0.91 to 1.00)
            const t = Math.min(1, (progress - 0.91) / 0.09);
            const easeT = t * t * (3 - 2 * t); // Smoothstep easing
            slideOffset = isMobile ? 0 : -270 * easeT;
            slideUnit = isMobile ? "vh" : "px";
            contactOp = 1;
          }
        } else {
          slideOffset = 100;
          slideUnit = "vh";
          contactOp = 0;
        }
      }

      if (containerRef.current) {
        containerRef.current.style.transform = `translateY(${slideOffset}${slideUnit})`;
        containerRef.current.style.opacity = contactOp > 0.01 ? "1" : "0";
        containerRef.current.style.pointerEvents = contactOp > 0.95 ? "auto" : "none";
        containerRef.current.style.visibility = contactOp > 0.01 ? "visible" : "hidden";
      }

      // 3D tilt calculations based on entry progress
      const tiltAngle = (1 - contactOp) * 20;
      const slideDist = (1 - contactOp) * 80;

      if (contactCardRef.current) {
        contactCardRef.current.style.transform = `translateX(${-slideDist}px) rotateY(${tiltAngle}deg)`;
        contactCardRef.current.style.opacity = `${contactOp}`;
      }
      if (contactMapRef.current) {
        contactMapRef.current.style.transform = `translateX(${slideDist}px) rotateY(${-tiltAngle}deg)`;
        contactMapRef.current.style.opacity = `${contactOp}`;
      }
    }
  }));

  // ── FooterLogo — renders SVG from passed logoPaths prop ──
  const FooterLogo = () => (
    <svg
      viewBox="0 0 2172 724"
      style={{ height: "80px", width: "auto", display: "block" }}
    >
      {logoPaths.map((p: PathData, idx: number) => {
        if (p.transform.includes("translate(0,0)")) return null;
        return (
          <path
            key={`footer-logo-path-${idx}`}
            d={p.d}
            fill={p.fill}
            transform={p.transform}
          />
        );
      })}
    </svg>
  );

  return (
    <>
      {/* ── Contact Section ── */}
      <div
        id="contact"
        ref={containerRef}
        className="contact-section-container"
        style={{
          position: "fixed",
          left: 0,
          top: 0,
          width: "100%",
          display: "flex",
          flexDirection: "column",
          opacity: 0,
          visibility: "hidden",
          pointerEvents: "none",
          willChange: "transform, opacity",
          zIndex: 8,
          background: "#0c0d12",
        }}
      >
        <div className="contact-main-content-wrapper">
          <div className="contact-top-grid">

            {/* Left Column: Heading */}
            <div
              ref={contactCardRef}
              className="contact-heading-col"
              style={{
                willChange: "transform, opacity",
              }}
            >
              <div>
                <div className="contact-connect-title">
                  Connect
                  <span className="title-underline" />
                </div>
                <h2 className="contact-main-heading">
                  We are based in<br />
                  <span className="accent-text">Rajkot, Gujarat</span>
                </h2>
              </div>
              <div className="contact-left-address" style={{ marginTop: "auto", borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "15px" }}>
                <p style={{ margin: 0, color: "rgba(255, 255, 255, 0.7)", fontSize: "0.88rem", lineHeight: "1.5" }}>
                  <strong style={{ color: "#fff" }}>Motovillage Car Workshop PVT. LTD.</strong><br />
                  Nirvana Rd, Near Mavdi Bypass,<br />
                  Rajkot, Gujarat - 360005.
                </p>
              </div>
            </div>

            {/* Right Column: Info Blocks */}
            <div
              ref={contactMapRef}
              className="contact-info-col"
              style={{
                willChange: "transform, opacity",
              }}
            >
              {/* Call & Email */}
              <div className="info-block">
                <div className="info-icon-wrapper">
                  <svg className="info-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                  </svg>
                </div>
                <h3 className="info-block-label">Call & Email</h3>
                <p className="info-block-text">
                  Call: <a href="tel:+919904655559" className="info-link">+91 99046 55559</a><br />
                  Email: <a href="mailto:info.motovillagecarworkshop@gmail.com" className="info-link">info.motovillagecarworkshop@gmail.com</a>
                </p>
              </div>

              {/* Google Reviews */}
              <div className="info-block">
                <div className="info-icon-wrapper" style={{ color: "#FBBC05", background: "rgba(251, 188, 5, 0.1)" }}>
                  <svg className="info-icon" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                  </svg>
                </div>
                <h3 className="info-block-label">Google Reviews</h3>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: "4px" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                    <div style={{ display: "flex", gap: "2px", color: "#FBBC05", fontSize: "0.85rem" }}>
                      <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
                    </div>
                    <p className="info-block-text" style={{ margin: 0, fontWeight: 700, color: "#ffffff", fontSize: "0.88rem" }}>
                      5.0 / 5.0 Rating
                    </p>
                    <p className="info-block-text" style={{ margin: 0, fontSize: "0.78rem", color: "rgba(255,255,255,0.4)" }}>
                      Based on 350+ reviews
                    </p>
                  </div>
                  <a
                    href="https://www.google.com/search?sca_esv=70f987ef10da5f9f&sxsrf=APpeQnsPYRrb7l2fdImCmkiPIbX2DEzbXA:1782559551315&si=APenkKm7iecQ4G6P-TsbSMFKIQtv3EFIqRAFw-i8uEbk55Z-_9Sb_OViMTUf4Wd83N65frBsu7fLRrkyQqJkeBdbmMMi_-TI0YD1S38k2lqsbpY2d6AzA7QPwY2Q22ZfqJ8y4Te1rQVUV-jBqnEQQ2CmO-YBv_4oXuGg_4Joh2MiLU0E9ckohtY%3D&q=Motovillage+Car+Workshop+PVT.+LTD.+Reviews&sa=X&ved=2ahUKEwjSg-Pmp6eVAxVMxjgGHdhFNzAQ0bkNegQIMRAH&biw=1366&bih=652&dpr=1"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="google-review-btn"
                  >
                    Review
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="7" y1="17" x2="17" y2="7"></line>
                      <polyline points="7 7 17 7 17 17"></polyline>
                    </svg>
                  </a>
                </div>
              </div>

              {/* Book Service CTA */}
              <div className="info-block-cta-card">
                <h3 className="cta-card-title">Book a service</h3>
                <p className="cta-card-desc">Experience premium vehicle care</p>
                <button className="contact-cta-btn" onClick={openModal}>
                  Book Service
                </button>
              </div>
            </div>
          </div>

          {/* Bottom: Google Maps Embed */}
          <div className="contact-bottom-map">
            <div className="contact-map-wrapper">
              <iframe
                title="Motovillage Car Workshop Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3691.5647714578135!2d70.72301747587834!3d22.279167643759902!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3959cb000625f817%3A0xd78f8689430332e9!2sMotovillage%20Car%20Workshop%20PVT.%20LTD.!5e0!3m2!1sen!2sin!4v1719202517621!5m2!1sen!2sin"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>

        {/* ── Footer ── */}
        <footer className="footer-container">
          <div className="footer-header-section">
            <h2 className="footer-main-title">GET IN TOUCH</h2>
            <span className="footer-main-title-underline" />
          </div>

          <div className="footer-grid">
            {/* Footer Left */}
            <div className="footer-left-col">
              <div className="footer-logo-box">
                <FooterLogo />
              </div>
              <p className="footer-desc-text">
                Since 2015, Motovillage has been Rajkot's definitive statement in
                premium car service and workshop solutions.
              </p>
              <div className="footer-social-links">
                <a href="https://www.facebook.com/share/1JdSfcxVTH/" target="_blank" rel="noopener noreferrer" className="footer-social-icon" aria-label="Facebook">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                  </svg>
                </a>
                <a href="https://www.instagram.com/motovillage_car_workshop" target="_blank" rel="noopener noreferrer" className="footer-social-icon" aria-label="Instagram">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                  </svg>
                </a>
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="footer-social-icon" aria-label="LinkedIn">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                    <rect x="2" y="9" width="4" height="12"></rect>
                    <circle cx="4" cy="4" r="2"></circle>
                  </svg>
                </a>
                <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="footer-social-icon" aria-label="YouTube">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path>
                    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon>
                  </svg>
                </a>
              </div>
            </div>

            {/* Footer Right */}
            <div className="footer-right-col">
              <h3 className="footer-column-title">Contact Us</h3>
              <div className="footer-info-item">
                <div className="footer-info-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                  </svg>
                </div>
                <span className="footer-info-text">
                  <a href="tel:+919904655559">+91 99046 55559</a>
                </span>
              </div>
              <div className="footer-info-item">
                <div className="footer-info-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                </div>
                <span className="footer-info-text">
                  Nirvana Rd, Near Mavdi Bypass, Rajkot, Gujarat - 360005
                </span>
              </div>
              <div className="footer-info-item">
                <div className="footer-info-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <polyline points="22,6 12,13 2,6"></polyline>
                  </svg>
                </div>
                <span className="footer-info-text">
                  <a href="mailto:info.motovillagecarworkshop@gmail.com">info.motovillagecarworkshop@gmail.com</a>
                </span>
              </div>
              <div className="footer-info-item">
                <div className="footer-info-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                </div>
                <span className="footer-info-text">8:00 AM - 8:00 PM / Sunday Closed</span>
              </div>
            </div>
          </div>

          <div className="footer-bottom-bar">
            <span className="footer-copyright-text">
              <span>&copy; {new Date().getFullYear()} Motovillage. All Rights Reserved.</span>
              <span className="footer-separator-pipe">|</span>
              <span className="footer-branding-wrap">
                Website managed by
                <a
                  href="https://scorviro.vercel.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-scorviro-link"
                >
                  <span className="scorviro-logo-box">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="#ffffff">
                      <polygon points="12,5 4,18 20,18" />
                    </svg>
                  </span>
                  <span className="scorviro-link-text">scorviro</span>
                </a>
              </span>
            </span>
          </div>
        </footer>
      </div>

      {/* ── Book Service Popup Modal ── */}
      {isBookModalOpen && mounted && typeof document !== "undefined" && createPortal(
        <div
          className="book-modal-overlay"
          onClick={() => setIsBookModalOpen(false)}
          data-lenis-prevent
        >
          <div
            className="book-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="book-modal-close"
              onClick={() => setIsBookModalOpen(false)}
              aria-label="Close book modal"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>

            <div className="book-modal-header">
              <span className="dot" />
              <h3 className="book-modal-title">Book A Service</h3>
              <p className="book-modal-subtitle">
                Schedule your premium service at Rajkot's finest workshop
              </p>
            </div>

            <form
              className="book-modal-form"
              noValidate
              onSubmit={handleSubmit}
            >
              <div className={`form-group ${errors.name ? "has-error" : ""}`}>
                <label htmlFor="book-name">Name</label>
                <input
                  type="text"
                  id="book-name"
                  value={formValues.name}
                  onChange={handleInputChange}
                  placeholder="Your full name"
                />
                {errors.name && <span className="error-text">{errors.name}</span>}
              </div>
              <div className={`form-group ${errors.phone ? "has-error" : ""}`}>
                <label htmlFor="book-phone">Phone Number</label>
                <input
                  type="tel"
                  id="book-phone"
                  value={formValues.phone}
                  onChange={handleInputChange}
                  placeholder="Your mobile number"
                />
                {errors.phone && <span className="error-text">{errors.phone}</span>}
              </div>
              <div className={`form-group ${errors.car ? "has-error" : ""}`}>
                <label htmlFor="book-car">Car Make & Model</label>
                <input
                  type="text"
                  id="book-car"
                  value={formValues.car}
                  onChange={handleInputChange}
                  placeholder="e.g. Audi A4, Fortuner, Creta"
                />
                {errors.car && <span className="error-text">{errors.car}</span>}
              </div>
              <div className={`form-group ${errors.service ? "has-error" : ""}`}>
                <label htmlFor="book-service">Select Service</label>
                <select
                  id="book-service"
                  value={formValues.service}
                  onChange={handleInputChange}
                >
                  <option value="">Choose a service...</option>
                  <option value="general">General Periodic Maintenance</option>
                  <option value="tuning">ECU Calibration & Tuning</option>
                  <option value="detail">PPF & Detailing Showroom</option>
                  <option value="diagnostic">Advanced Computer Diagnostics</option>
                  <option value="mechanical">Mechanical & Engine Repair</option>
                  <option value="ceramic">Ceramic Coating & Paint Correction</option>
                  <option value="suspension">Brake & Suspension Upgrade</option>
                  <option value="ac">AC Service & Gas Recharge</option>
                  <option value="custom">Custom Modification & Wrapping</option>
                </select>
                {errors.service && <span className="error-text">{errors.service}</span>}
              </div>
              <div className={`form-group ${errors.date ? "has-error" : ""}`}>
                <label htmlFor="book-date">Preferred Date</label>
                <input
                  type="date"
                  id="book-date"
                  value={formValues.date}
                  onChange={handleInputChange}
                  min={getTodayDateString()}
                  style={{ colorScheme: "dark" }}
                />
                {errors.date && <span className="error-text">{errors.date}</span>}
              </div>
              <button type="submit" className="btn-primary form-submit-btn">
                Confirm Booking
              </button>
            </form>
          </div>
        </div>,
        document.body
      )}
    </>
  );
});

ContactSection.displayName = "ContactSection";

export default ContactSection;
