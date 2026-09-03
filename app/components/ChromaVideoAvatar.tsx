"use client";

import React, { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";

interface ChromaVideoAvatarProps {
  videoSrc: string;
  isGreenScreen?: boolean;
  onClick?: () => void;
  characterName?: string;
  speechText?: string;
  className?: string;
  heightClass?: string;
  position?: 'left' | 'right';
}

export default function ChromaVideoAvatar({
  videoSrc,
  isGreenScreen = true,
  onClick,
  characterName = "Asistente Virtual",
  speechText = "¡Hola! ¿Dudas sobre tu casa? Haz clic aquí 👋",
  className = "",
  heightClass = "h-[200px] sm:h-[250px]",
  position = "left",
}: ChromaVideoAvatarProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let animFrameId: number;
    let isCancelled = false;

    setIsVideoLoaded(false);
    setHasError(false);

    const handleLoadedMetadata = () => {
      setIsVideoLoaded(true);
      video.play().catch(() => {
        // Fallback for strict browser policies
      });
    };

    const handleError = () => {
      setHasError(true);
    };

    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("error", handleError);

    if (isGreenScreen) {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });

      const render = () => {
        if (isCancelled) return;

        if (video.readyState >= 2 && ctx) {
          const vw = video.videoWidth || 1280;
          const vh = video.videoHeight || 720;

          // Precise bounding box for the character (including waving hand)
          // Detected bounds: minX: 244, maxX: 660, minY: 44, maxY: 712
          let sx = 0;
          let sy = 0;
          let sw = vw;
          let sh = vh;

          if (vw === 1280 && vh === 720) {
            sx = 210; // generous safety margin before hand at 244
            sw = 475; // reaches 685, cleanly containing character without empty space
            sy = 30;  // above helmet
            sh = 690; // reaches feet
          } else if (vw > vh * 1.2) {
            // General landscape fallback
            sw = Math.round(vh * 0.7);
            sx = Math.max(0, Math.round(vw * 0.18));
            sy = 0;
            sh = vh;
          }

          if (canvas.width !== sw || canvas.height !== sh) {
            canvas.width = sw;
            canvas.height = sh;
          }

          ctx.drawImage(video, sx, sy, sw, sh, 0, 0, sw, sh);
          const frame = ctx.getImageData(0, 0, sw, sh);
          const d = frame.data;
          const len = d.length;

          // Real-time green screen removal with edge despill
          for (let i = 0; i < len; i += 4) {
            const r = d[i];
            const g = d[i + 1];
            const b = d[i + 2];

            const maxRB = r > b ? r : b;
            const diff = g - maxRB;

            if (diff > 35 && g > 75) {
              // Definitive green pixel -> make transparent
              d[i + 3] = 0;
            } else if (diff > 15 && g > 65) {
              // Smooth edge feathering
              const factor = 1.0 - (diff - 15) / 20;
              d[i + 3] = Math.round(d[i + 3] * Math.max(0, Math.min(1, factor)));
              // Remove green spill from the edge
              d[i + 1] = maxRB;
            } else if (g > maxRB) {
              // Mild despill on foreground borders
              d[i + 1] = maxRB;
            }
          }

          ctx.putImageData(frame, 0, 0);
        }

        animFrameId = requestAnimationFrame(render);
      };

      animFrameId = requestAnimationFrame(render);
    }

    return () => {
      isCancelled = true;
      cancelAnimationFrame(animFrameId);
      if (video) {
        video.removeEventListener("loadedmetadata", handleLoadedMetadata);
        video.removeEventListener("error", handleError);
      }
    };
  }, [videoSrc, isGreenScreen]);

  return (
    <div
      className={`relative inline-flex flex-col items-center select-none group cursor-pointer ${className}`}
      onClick={onClick}
      title={characterName}
    >
      {/* Hidden processing video */}
      <video
        ref={videoRef}
        src={videoSrc}
        loop
        autoPlay
        muted
        playsInline
        crossOrigin="anonymous"
        className={isGreenScreen ? "hidden" : `w-auto ${heightClass} object-contain rounded-2xl drop-shadow-2xl`}
      />

      {/* Floating speech bubble */}
      <motion.div
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.3 }}
        className={`absolute -top-10 sm:-top-11 ${
          position === 'left' ? 'left-0 sm:left-2' : 'right-0 sm:right-1'
        } bg-white/95 backdrop-blur-md text-slate-800 text-[11px] sm:text-xs font-semibold py-1.5 px-3 rounded-2xl shadow-[0_8px_20px_rgba(0,0,0,0.15)] border border-sky-200/80 flex items-center gap-2 whitespace-nowrap z-20 pointer-events-none group-hover:scale-105 transition-transform`}
      >
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
        <span>{speechText}</span>
        {/* Dialogue arrow */}
        <div
          className={`absolute -bottom-1.5 ${
            position === 'left' ? 'left-8' : 'right-8'
          } w-3 h-3 bg-white/95 border-r border-b border-sky-200/80 transform rotate-45`}
        />
      </motion.div>

      {/* Character Display Container */}
      <motion.div
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.98 }}
        className="relative z-10 flex flex-col items-center"
      >
        {isGreenScreen ? (
          <canvas
            ref={canvasRef}
            width={475}
            height={690}
            className={`w-auto ${heightClass} object-contain drop-shadow-[0_12px_24px_rgba(0,0,0,0.25)] filter`}
            style={{
              imageRendering: "auto",
              maxWidth: "100%",
              aspectRatio: "475 / 690",
            }}
          />
        ) : null}

        {/* Fallback if video failed */}
        {hasError && (
          <div className="w-24 h-24 bg-gradient-to-tr from-sky-500 to-indigo-600 rounded-full flex items-center justify-center text-white shadow-xl">
            <span className="text-xs font-bold text-center px-2">Bot</span>
          </div>
        )}

        {/* Realistic ground shadow beneath character */}
        <div className="w-24 sm:w-28 h-3.5 bg-slate-950/20 rounded-full blur-[3px] -mt-2 transition-transform group-hover:scale-95 group-hover:opacity-80" />
      </motion.div>
    </div>
  );
}
