"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { ArrowDown, Sparkles } from "lucide-react";
import { Link } from "@/i18n/navigation";
import FluidCanvas from "./hero/FluidCanvas";
import Magnetic from "./hero/Magnetic";

/**
 * Hero v2 — full-bleed WebGL liquid-silk background in brand colors,
 * staggered word-reveal headline, magnetic CTAs, floating brand orb.
 */

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.055, delayChildren: 0.15 } },
};

const wordUp = {
  hidden: { y: "110%", opacity: 0 },
  show: {
    y: "0%",
    opacity: 1,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
  },
};

const fadeUp = {
  hidden: { y: 24, opacity: 0 },
  show: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export default function Hero() {
  const t = useTranslations("hero");
  const words = t("headline").split(" ");

  return (
    <section className="relative isolate min-h-[92vh] overflow-hidden bg-aubergine-deep">
      <FluidCanvas />

      {/* readability scrim behind the copy, fading out toward the visual side */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-aubergine-deep/80 via-transparent to-aubergine-deep/30" />

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="relative mx-auto flex min-h-[92vh] max-w-7xl flex-col justify-center px-5 pb-28 pt-24 md:px-8"
      >
        <motion.p
          variants={fadeUp}
          className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-magenta-light"
        >
          <Sparkles size={14} />
          {t("eyebrow")}
        </motion.p>

        <h1 className="mt-6 max-w-4xl font-display text-4xl font-bold leading-[1.15] text-white sm:text-5xl lg:text-6xl">
          {words.map((word, i) => (
            <span key={i} className="inline-block overflow-hidden pb-[0.12em] align-bottom">
              <motion.span variants={wordUp} className="inline-block">
                {word}
                {i < words.length - 1 ? "\u00A0" : ""}
              </motion.span>
            </span>
          ))}
        </h1>

        <motion.p
          variants={fadeUp}
          className="text-balance mt-7 max-w-xl text-base leading-relaxed text-white/70 sm:text-lg"
        >
          {t("sub")}
        </motion.p>

        <motion.div
          variants={fadeUp}
          className="mt-10 flex flex-wrap items-center gap-5"
        >
          <Magnetic>
            <Link
              href="/contact"
              className="block rounded-full bg-magenta px-8 py-4 text-sm font-semibold text-white shadow-[0_12px_40px_-8px_rgba(176,24,107,0.7)] transition hover:bg-magenta-light"
            >
              {t("ctaPrimary")}
            </Link>
          </Magnetic>
          <Magnetic strength={0.22}>
            <Link
              href="/portfolio"
              className="block rounded-full border border-white/25 bg-white/5 px-8 py-4 text-sm font-semibold text-white backdrop-blur-sm transition hover:border-white/60 hover:bg-white/10"
            >
              {t("ctaSecondary")}
            </Link>
          </Magnetic>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4 }}
        className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 md:block"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
          className="flex flex-col items-center gap-2 text-white/45"
        >
          <span className="text-[10px] uppercase tracking-[0.3em]">
            {t("scroll")}
          </span>
          <ArrowDown size={16} />
        </motion.div>
      </motion.div>
    </section>
  );
}
