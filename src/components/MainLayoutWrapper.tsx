"use client";

import React, { useState, useEffect, useRef } from "react";
import PremiumLoader from "./PremiumLoader";
import DesktopHomepage from "./DesktopHomepage";
import useIsMobile from "../hooks/useIsMobile";

interface PathData {
  d: string;
  fill: string;
  transform: string;
}

interface MainLayoutWrapperProps {
  logoPaths: PathData[];
}



const generateInterleavedIndices = (mobileMode = false) => {
  const indices: number[] = [];
  const visited = new Set<number>();

  const add = (idx: number) => {
    if (idx >= 1 && idx <= 1466 && !visited.has(idx)) {
      indices.push(idx);
      visited.add(idx);
    }
  };

  if (mobileMode) {
    // Mobile Mode: 50 evenly-spaced skeleton keyframes across the full range
    // This guarantees getClosestLoadedImage always finds a frame within radius 15
    for (let i = 1; i <= 1466; i += 30) add(i);
    add(1466); // Always include the last frame
  } else {
    // Desktop Mode: full 1466 frames, interleaved progressively
    // Pass 1: Sparse (every 32nd frame)
    for (let i = 1; i <= 1466; i += 32) add(i);

    // Pass 2: every 16th frame
    for (let i = 17; i <= 1466; i += 32) add(i);

    // Pass 3: every 8th frame
    for (let i = 9; i <= 1466; i += 16) add(i);

    // Pass 4: every 4th frame
    for (let i = 5; i <= 1466; i += 8) add(i);

    // Pass 5: every 2nd frame
    for (let i = 3; i <= 1466; i += 4) add(i);

    // Pass 6: all remaining
    for (let i = 2; i <= 1466; i += 2) add(i);
  }

  return indices;
};

export default function MainLayoutWrapper({ logoPaths }: MainLayoutWrapperProps) {
  const isMobile = useIsMobile(1024);
  const [isLoaderComplete, setIsLoaderComplete] = useState(false);
  const [preloadProgress, setPreloadProgress] = useState(0);

  const preloadedImagesRef = useRef<{ [key: number]: HTMLImageElement }>({});
  const loadProgressRef = useRef(0);
  const blobUrlsRef = useRef<string[]>([]);

  useEffect(() => {
    if (isMobile === null) return;

    document.body.style.overflow = "hidden";
    document.body.style.height = "100vh";
    document.body.style.touchAction = "none";

    // Mobile detection — use same threshold as useIsMobile hook
    const isMobileDevice = isMobile;
    let indices = generateInterleavedIndices(isMobileDevice ?? false);
    const limit = isMobileDevice ? 4 : 12; // Mobile: 4 concurrent, Desktop: 12 concurrent workers
    let indexCursor = 0;
    let loadedCount = 0;
    let totalDownloadTime = 0;
    let speedDecisionMade = false;

    const loadImageWithCache = async (url: string): Promise<{ src: string; isBlob: boolean }> => {
      try {
        if (typeof window === "undefined" || !("caches" in window)) return { src: url, isBlob: false };
        const cache = await caches.open("motorvillage-final-v1");
        let cachedResponse = await cache.match(url);

        if (!cachedResponse) {
          const fetchResponse = await fetch(url);
          if (fetchResponse.ok) {
            await cache.put(url, fetchResponse.clone());
            cachedResponse = fetchResponse;
          } else {
            return { src: url, isBlob: false };
          }
        }

        const blob = await cachedResponse.blob();
        const blobUrl = URL.createObjectURL(blob);
        blobUrlsRef.current.push(blobUrl); // Save URL pointer to revoke on unmount
        return { src: blobUrl, isBlob: true };
      } catch (e) {
        console.warn("Frame cache load failed:", e);
        return { src: url, isBlob: false };
      }
    };

    const loadNext = async () => {
      if (indexCursor >= indices.length) return;

      const frameIdx = indices[indexCursor++];
      const paddedNum = frameIdx <= 576 ? String(frameIdx).padStart(6, "0") : String(frameIdx);
      const paddedUrl = `/motovillagedesktop/motocar_${paddedNum}.webp`;

      const startTime = performance.now();
      try {
        // On mobile, skip Cache API + Blob pipeline to save memory.
        // The browser's native HTTP cache handles caching automatically.
        const srcUrl = isMobileDevice ? paddedUrl : (await loadImageWithCache(paddedUrl)).src;
        const endTime = performance.now();

        if (loadedCount < 30) {
          totalDownloadTime += (endTime - startTime);
        }

        const img = new Image();
        img.decoding = "async"; // Schedule decode off critical path

        await new Promise<void>((resolve, reject) => {
          img.onload = () => {
            img.decode().then(resolve).catch(resolve);
          };
          img.onerror = () => {
            reject(new Error(`Failed to load: ${paddedUrl}`));
          };
          img.src = srcUrl;
        });

        loadedCount++;
        preloadedImagesRef.current[frameIdx] = img;
        loadProgressRef.current = loadedCount / indices.length;

        // Dynamic Network Speed-Based Loading Decision (at 30 frames)
        if (loadedCount === 30 && !speedDecisionMade) {
          speedDecisionMade = true;
          const avgTime = totalDownloadTime / 30;

          if (avgTime >= 450) {
            // Slow connection (downlink < 1.1 Mbps): keep only every 6th frame
            const remaining = indices.slice(indexCursor).filter(idx => idx % 6 === 1);
            indices = indices.slice(0, indexCursor).concat(remaining);
          } else if (avgTime >= 150) {
            // Medium connection (downlink 1.1 - 3.3 Mbps): keep only every 3rd frame
            const remaining = indices.slice(indexCursor).filter(idx => idx % 3 === 1);
            indices = indices.slice(0, indexCursor).concat(remaining);
          }
        }

        if (loadedCount % 10 === 0 || loadedCount === indices.length) {
          const rawProgress = Math.round((loadedCount / indices.length) * 105);
          setPreloadProgress(Math.min(100, rawProgress));
        }

        loadNext();
      } catch {
        if (loadedCount < 30) {
          totalDownloadTime += 500; // Penalize failure with 500ms
        }
        loadedCount++;
        loadNext();
      }
    };

    for (let i = 0; i < limit; i++) {
      loadNext();
    }

    const urls = blobUrlsRef.current;
    return () => {
      document.body.style.overflow = "unset";
      document.body.style.height = "auto";
      document.body.style.touchAction = "auto";

      // Clean up object URLs to prevent memory leaks when component unmounts
      urls.forEach((url) => {
        URL.revokeObjectURL(url);
      });
    };
  }, [isMobile]);

  useEffect(() => {
    if (isLoaderComplete) {
      document.body.style.overflow = "unset";
      document.body.style.height = "auto";
      document.body.style.touchAction = "auto";
    }
  }, [isLoaderComplete]);

  // Don't render anything until we know the device type (prevents hydration mismatch)
  if (isMobile === null) return <div style={{ background: "#000", height: "100vh" }} />;

  // ── DESKTOP & MOBILE SHARED LOGIC ──
  return (
    <main
      style={{
        position: "relative",
        width: "100%",
        minHeight: "100vh",
        background: "#000000",
      }}
    >
      <DesktopHomepage
        logoPaths={logoPaths}
        isVisible={true}
        preloadedImages={preloadedImagesRef}
        isLoaderComplete={isLoaderComplete}
        loadProgressRef={loadProgressRef}
        isMobile={isMobile}
      />

      {!isLoaderComplete && (
        <PremiumLoader
          paths={logoPaths}
          onTransitionStart={() => { }}
          onComplete={() => setIsLoaderComplete(true)}
          isUnlocked={true}
          onUnlock={() => { }}
          preloadProgress={preloadProgress}
        />
      )}
    </main>
  );
}
