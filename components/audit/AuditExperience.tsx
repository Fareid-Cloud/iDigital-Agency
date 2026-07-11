"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { AnimatePresence, motion, animate } from "framer-motion";
import {
  Globe,
  Lock,
  RotateCcw,
  ScanLine,
  Search,
  Sparkles,
  TriangleAlert,
  CircleCheck,
  Lightbulb,
  ArrowUpRight,
} from "lucide-react";
import { InstagramIcon } from "@/components/icons/BrandIcons";
import { Link } from "@/i18n/navigation";
import { SITE } from "@/lib/constants";

/* ---------------------------------- types --------------------------------- */

type Phase = "form" | "scanning" | "results" | "error";

type AuditResult = {
  ok: boolean;
  mode: "site" | "instagram";
  meta: {
    url?: string;
    host?: string;
    handle?: string;
    title?: string | null;
    description?: string | null;
    ogImage?: string | null;
  };
  scores: { seo: number; tech: number; brand: number; conversion: number };
  estimated: boolean;
  findings: { strengths: string[]; issues: string[]; ideas: string[] };
};

const INDUSTRIES = [
  "clinic",
  "restaurant",
  "ecommerce",
  "realestate",
  "recruitment",
  "education",
  "services",
  "other",
] as const;

const SCAN_STEPS = ["connecting", "reading", "meta", "structure", "signals", "scoring"] as const;
const SCORE_KEYS = ["seo", "tech", "brand", "conversion"] as const;

const MIN_THEATER_MS = 5200;

/* ================================ component ================================ */

export default function AuditExperience() {
  const t = useTranslations("audit");
  const locale = useLocale();

  const [phase, setPhase] = useState<Phase>("form");
  const [form, setForm] = useState({ name: "", industry: "", link: "" });
  const [result, setResult] = useState<AuditResult | null>(null);
  const [scanStep, setScanStep] = useState(0);

  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };
  useEffect(() => clearTimers, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.link.trim()) return;

    setPhase("scanning");
    setScanStep(0);

    // staged log animation (runs regardless of API latency)
    SCAN_STEPS.forEach((_, i) => {
      timers.current.push(
        setTimeout(() => setScanStep(i), (i * MIN_THEATER_MS) / SCAN_STEPS.length)
      );
    });

    const started = Date.now();
    let data: AuditResult | null = null;
    try {
      const res = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, locale }),
      });
      if (res.ok) data = (await res.json()) as AuditResult;
    } catch {
      /* handled below */
    }

    const wait = Math.max(0, MIN_THEATER_MS - (Date.now() - started));
    timers.current.push(
      setTimeout(() => {
        if (data?.ok) {
          setResult(data);
          setPhase("results");
        } else {
          setPhase("error");
        }
      }, wait)
    );
  }

  function reset() {
    clearTimers();
    setResult(null);
    setPhase("form");
  }

  const displayTarget =
    result?.mode === "instagram"
      ? `instagram.com/${result.meta.handle}`
      : result?.meta.host ?? form.link.replace(/^https?:\/\//, "");

  const waText = useMemo(() => {
    const intro =
      locale === "ar"
        ? `أهلاً، أنا ${form.name || "عميل"} (مجال: ${form.industry || "-"}). عملت فحص رقمي لـ ${form.link} على موقعكم وعايز أراجع النتايج مع خبير.`
        : `Hi, I'm ${form.name || "a client"} (${form.industry || "-"}). I ran a digital audit for ${form.link} on your site and want to review the results with an expert.`;
    return `${SITE.whatsappUrl}?text=${encodeURIComponent(intro)}`;
  }, [form, locale]);

  /* --------------------------------- render -------------------------------- */

  return (
    <div className="mx-auto max-w-6xl px-5 pb-24 md:px-8">
      <AnimatePresence mode="wait">
        {/* ================================ FORM ================================ */}
        {phase === "form" && (
          <motion.form
            key="form"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            onSubmit={submit}
            className="mx-auto max-w-xl rounded-3xl border border-line bg-white p-6 shadow-xl shadow-magenta/5 sm:p-9"
          >
            <div className="flex flex-col gap-4">
              <input
                required
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder={t("form.name")}
                className="rounded-xl border border-line bg-cream px-4 py-3.5 text-sm outline-none transition focus:border-magenta"
              />
              <select
                required
                value={form.industry}
                onChange={(e) => setForm((f) => ({ ...f, industry: e.target.value }))}
                className={`rounded-xl border border-line bg-cream px-4 py-3.5 text-sm outline-none transition focus:border-magenta ${form.industry ? "text-ink" : "text-ink/40"}`}
              >
                <option value="" disabled>
                  {t("form.industry")}
                </option>
                {INDUSTRIES.map((key) => (
                  <option key={key} value={t(`industries.${key}`)}>
                    {t(`industries.${key}`)}
                  </option>
                ))}
              </select>
              <div>
                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 start-4 flex items-center text-ink/35">
                    <Globe size={16} />
                  </span>
                  <input
                    required
                    dir="ltr"
                    value={form.link}
                    onChange={(e) => setForm((f) => ({ ...f, link: e.target.value }))}
                    placeholder={t("form.link")}
                    className="w-full rounded-xl border border-line bg-cream px-4 py-3.5 ps-11 text-start text-sm outline-none transition focus:border-magenta"
                  />
                </div>
                <p className="mt-2 flex items-center gap-1.5 text-xs text-ink/40">
                  <InstagramIcon size={12} />
                  {t("form.linkHint")}
                </p>
              </div>

              <button
                type="submit"
                className="mt-2 flex items-center justify-center gap-2 rounded-full bg-magenta px-6 py-4 text-sm font-semibold text-white shadow-lg shadow-magenta/25 transition hover:bg-magenta-light"
              >
                <ScanLine size={16} />
                {t("form.submit")}
              </button>
            </div>
          </motion.form>
        )}

        {/* ============================== SCANNING ============================== */}
        {phase === "scanning" && (
          <motion.div
            key="scanning"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            className="mx-auto max-w-3xl"
          >
            <BrowserFrame urlText={form.link.replace(/^https?:\/\//, "")}>
              <div className="relative min-h-[280px] overflow-hidden bg-aubergine-deep p-5 sm:min-h-[320px]">
                {/* scan beam */}
                <motion.div
                  animate={{ top: ["0%", "100%", "0%"] }}
                  transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
                  className="pointer-events-none absolute inset-x-0 h-16 bg-gradient-to-b from-transparent via-magenta/30 to-transparent"
                />
                {/* skeleton "page" being read */}
                <div className="pointer-events-none absolute inset-5 flex flex-col gap-3 opacity-25">
                  <div className="h-8 w-2/5 rounded bg-white/40" />
                  <div className="h-3 w-4/5 rounded bg-white/25" />
                  <div className="h-3 w-3/5 rounded bg-white/25" />
                  <div className="mt-3 grid grid-cols-3 gap-3">
                    <div className="h-20 rounded-lg bg-white/20" />
                    <div className="h-20 rounded-lg bg-white/20" />
                    <div className="h-20 rounded-lg bg-white/20" />
                  </div>
                </div>

                {/* terminal log */}
                <div className="relative z-10 font-mono text-[13px] leading-7" dir="ltr">
                  {SCAN_STEPS.slice(0, scanStep + 1).map((step, i) => (
                    <motion.p
                      key={step}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="text-white/80"
                    >
                      <span className="text-magenta-light">➜</span>{" "}
                      <span className={i === scanStep ? "text-white" : "text-white/50"}>
                        {t(`scan.${step}`)}
                      </span>
                      {i === scanStep && (
                        <motion.span
                          animate={{ opacity: [1, 0, 1] }}
                          transition={{ duration: 0.9, repeat: Infinity }}
                          className="text-magenta-light"
                        >
                          _
                        </motion.span>
                      )}
                    </motion.p>
                  ))}
                </div>
              </div>
            </BrowserFrame>
          </motion.div>
        )}

        {/* =============================== RESULTS =============================== */}
        {phase === "results" && result && (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-10"
          >
            {/* the scanned target, now "captured" */}
            <div className="mx-auto w-full max-w-3xl">
              <BrowserFrame urlText={displayTarget} done>
                <div className="flex flex-col gap-4 bg-white p-6 sm:flex-row sm:items-center">
                  {result.meta.ogImage ? (
                    // external unknown host — plain img by design
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={result.meta.ogImage}
                      alt=""
                      className="h-28 w-44 shrink-0 rounded-xl border border-line object-cover"
                    />
                  ) : (
                    <div className="flex h-28 w-44 shrink-0 items-center justify-center rounded-xl bg-blush text-magenta">
                      {result.mode === "instagram" ? <InstagramIcon size={28} /> : <Globe size={28} />}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="truncate font-display text-lg font-bold text-ink">
                      {result.meta.title ??
                        (result.mode === "instagram" ? `@${result.meta.handle}` : result.meta.host)}
                    </p>
                    <p className="mt-1 line-clamp-2 text-sm text-ink/55">
                      {result.meta.description ?? t("sub")}
                    </p>
                    {result.estimated && (
                      <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-blush px-3 py-1 text-xs font-medium text-magenta">
                        <Sparkles size={12} />
                        {t("estimated")}
                      </p>
                    )}
                  </div>
                </div>
              </BrowserFrame>
            </div>

            {/* gauges */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-6">
              {SCORE_KEYS.map((key, i) => (
                <Gauge
                  key={key}
                  label={t(`scores.${key}`)}
                  value={result.scores[key]}
                  delay={i * 0.18}
                />
              ))}
            </div>

            {/* findings */}
            <div className="grid gap-5 lg:grid-cols-3">
              <FindingsCard
                tone="good"
                icon={<CircleCheck size={17} />}
                title={t("strengths")}
                items={result.findings.strengths}
              />
              <FindingsCard
                tone="bad"
                icon={<TriangleAlert size={17} />}
                title={t("issues")}
                items={result.findings.issues}
              />
              <FindingsCard
                tone="idea"
                icon={<Lightbulb size={17} />}
                title={t("ideas")}
                items={result.findings.ideas}
              />
            </div>

            {/* expert handoff */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="relative overflow-hidden rounded-3xl bg-aubergine-deep px-7 py-10 text-center sm:px-12"
            >
              <div className="pointer-events-none absolute -left-16 -top-16 h-56 w-56 rounded-full bg-magenta/25 blur-[90px]" />
              <div className="pointer-events-none absolute -bottom-16 -right-16 h-56 w-56 rounded-full bg-magenta/20 blur-[90px]" />
              <h3 className="relative font-display text-2xl font-bold text-white sm:text-3xl">
                {t("expertTitle")}
              </h3>
              <p className="relative mx-auto mt-3 max-w-lg text-sm text-white/60 sm:text-base">
                {t("expertSub")}
              </p>
              <div className="relative mt-8 flex flex-wrap items-center justify-center gap-4">
                <a
                  href={waText}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-full bg-magenta px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-magenta/30 transition hover:bg-magenta-light"
                >
                  {t("expertCta")}
                  <ArrowUpRight size={15} />
                </a>
                <button
                  onClick={reset}
                  className="flex items-center gap-2 rounded-full border border-white/20 px-7 py-3.5 text-sm font-semibold text-white/70 transition hover:border-white/50 hover:text-white"
                >
                  <RotateCcw size={14} />
                  {t("again")}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* ================================ ERROR ================================ */}
        {phase === "error" && (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-auto max-w-md rounded-3xl border border-line bg-white p-9 text-center"
          >
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blush text-magenta">
              <Search size={20} />
            </span>
            <p className="mt-4 text-sm text-ink/70">{t("error")}</p>
            <button
              onClick={reset}
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-sm font-semibold text-white transition hover:bg-magenta"
            >
              <RotateCcw size={14} />
              {t("again")}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ============================== sub-components ============================= */

function BrowserFrame({
  urlText,
  done = false,
  children,
}: {
  urlText: string;
  done?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-2xl shadow-ink/10">
      <div className="flex items-center gap-3 border-b border-line bg-cream px-4 py-3" dir="ltr">
        <span className="flex gap-1.5">
          <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
          <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
          <span className="h-3 w-3 rounded-full bg-[#28c840]" />
        </span>
        <span className="flex min-w-0 flex-1 items-center gap-2 rounded-lg bg-white px-3 py-1.5 text-xs text-ink/60">
          <Lock size={11} className={done ? "text-green-600" : "text-ink/40"} />
          <span className="truncate">{urlText}</span>
        </span>
      </div>
      {children}
    </div>
  );
}

function Gauge({ label, value, delay }: { label: string; value: number; delay: number }) {
  const [display, setDisplay] = useState(0);
  const r = 42;
  const c = 2 * Math.PI * r;

  useEffect(() => {
    const controls = animate(0, value, {
      duration: 1.6,
      delay,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return () => controls.stop();
  }, [value, delay]);

  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-line bg-white p-5">
      <div className="relative h-24 w-24">
        <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
          <circle cx="50" cy="50" r={r} fill="none" strokeWidth="9" className="stroke-blush" />
          <motion.circle
            cx="50"
            cy="50"
            r={r}
            fill="none"
            strokeWidth="9"
            strokeLinecap="round"
            className="stroke-magenta"
            strokeDasharray={c}
            initial={{ strokeDashoffset: c }}
            animate={{ strokeDashoffset: c - (c * value) / 100 }}
            transition={{ duration: 1.6, delay, ease: [0.22, 1, 0.36, 1] }}
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center font-display text-xl font-bold text-ink">
          {display}
        </span>
      </div>
      <span className="text-center text-xs font-semibold text-ink/60">{label}</span>
    </div>
  );
}

function FindingsCard({
  tone,
  icon,
  title,
  items,
}: {
  tone: "good" | "bad" | "idea";
  icon: React.ReactNode;
  title: string;
  items: string[];
}) {
  const toneStyles = {
    good: "bg-green-50 text-green-700",
    bad: "bg-red-50 text-red-600",
    idea: "bg-blush text-magenta",
  }[tone];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: tone === "good" ? 0.3 : tone === "bad" ? 0.45 : 0.6 }}
      className="rounded-2xl border border-line bg-white p-6"
    >
      <div className="flex items-center gap-2.5">
        <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${toneStyles}`}>
          {icon}
        </span>
        <h3 className="font-display font-bold text-ink">{title}</h3>
      </div>
      <ul className="mt-4 flex flex-col gap-3">
        {items.map((item, i) => (
          <motion.li
            key={i}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 + i * 0.12 }}
            className="text-sm leading-relaxed text-ink/70"
          >
            {item}
          </motion.li>
        ))}
      </ul>
    </motion.div>
  );
}
