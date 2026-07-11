"use client";

import { useRef } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

/**
 * Magnetic — wraps any element; on desktop the element is gently attracted
 * to the cursor while hovered, then springs back. No-op on touch devices.
 */
export default function Magnetic({
  children,
  strength = 0.3,
  className = "",
}: {
  children: React.ReactNode;
  strength?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 180, damping: 15, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 180, damping: 15, mass: 0.4 });

  function onMove(e: React.PointerEvent) {
    if (e.pointerType !== "mouse") return;
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    x.set((e.clientX - (rect.left + rect.width / 2)) * strength);
    y.set((e.clientY - (rect.top + rect.height / 2)) * strength);
  }

  function onLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.div
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      style={{ x: sx, y: sy }}
      className={`inline-block ${className}`}
    >
      {children}
    </motion.div>
  );
}
