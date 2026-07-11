"use client";

import { motion } from "framer-motion";

// Three morph states of a liquid ribbon echoing the iDigital "i" swoosh.
const PATHS = [
  "M120 40 C170 40 190 80 165 115 C130 165 95 190 110 250 C125 310 190 330 175 400 C165 445 120 460 95 430 C70 400 90 360 70 310 C45 250 55 190 85 140 C100 115 90 70 120 40 Z",
  "M125 35 C180 45 195 90 160 125 C120 165 100 200 120 255 C145 315 200 320 180 395 C168 442 115 465 90 425 C68 390 100 355 75 305 C42 245 60 185 95 135 C112 108 95 65 125 35 Z",
  "M118 45 C165 30 200 70 170 110 C138 155 90 185 115 245 C140 305 195 335 170 405 C155 448 110 455 92 420 C75 388 95 350 65 305 C38 255 50 195 90 145 C108 122 92 72 118 45 Z",
];

export default function BrandBlob() {
  return (
    <div className="relative h-full w-full">
      <svg
        viewBox="0 0 260 500"
        className="h-full w-full drop-shadow-[0_30px_60px_rgba(176,24,107,0.35)]"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="blobGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#e2569c" />
            <stop offset="55%" stopColor="#b0186b" />
            <stop offset="100%" stopColor="#5c0f43" />
          </linearGradient>
        </defs>
        <motion.path
          fill="url(#blobGradient)"
          initial={PATHS[0]}
          animate={{ d: PATHS }}
          transition={{
            duration: 10,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut",
          }}
        />
      </svg>

      {/* the sphere echoing the dot above the logo's swoosh */}
      <motion.div
        animate={{ y: [0, -14, 0] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute left-[38%] top-[2%] h-14 w-14 rounded-full bg-gradient-to-br from-magenta-light to-magenta shadow-lg shadow-magenta/40 sm:h-16 sm:w-16"
      />
    </div>
  );
}
