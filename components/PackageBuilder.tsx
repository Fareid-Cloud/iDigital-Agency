"use client";

import { useMemo, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { AnimatePresence, motion } from "framer-motion";
import { X, MessageCircle, RotateCcw, Check } from "lucide-react";
import { SERVICE_KEYS, ADDON_KEYS, SITE } from "@/lib/constants";
import { SERVICE_ICONS } from "@/lib/serviceIcons";

type ServiceKey = (typeof SERVICE_KEYS)[number];

function tierFromScore(score: number): "starter" | "growth" | "fullscale" {
  if (score <= 2) return "starter";
  if (score <= 8) return "growth";
  return "fullscale";
}

export default function PackageBuilder() {
  const t = useTranslations();
  const locale = useLocale();

  const [selected, setSelected] = useState<ServiceKey[]>([]);
  const [addons, setAddons] = useState<Record<string, string[]>>({});

  function toggleService(key: ServiceKey) {
    setSelected((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  }

  function toggleAddon(service: ServiceKey, addonId: string) {
    setAddons((prev) => {
      const current = prev[service] ?? [];
      const next = current.includes(addonId)
        ? current.filter((a) => a !== addonId)
        : [...current, addonId];
      return { ...prev, [service]: next };
    });
  }

  function removeService(key: ServiceKey) {
    setSelected((prev) => prev.filter((k) => k !== key));
  }

  function reset() {
    setSelected([]);
    setAddons({});
  }

  const score = useMemo(() => {
    const addonCount = Object.values(addons).reduce(
      (sum, list) => sum + list.length,
      0
    );
    return selected.length + addonCount;
  }, [selected, addons]);

  const tier = tierFromScore(score);

  const whatsappMessage = useMemo(() => {
    if (selected.length === 0) return "";
    const lines = selected.map((key) => {
      const title = t(`services.items.${key}.title`);
      const chosenAddons = (addons[key] ?? []).map((id) =>
        t(`builder.items.${key}.addons.${id}`)
      );
      return chosenAddons.length
        ? `- ${title}: ${chosenAddons.join("، ")}`
        : `- ${title}`;
    });
    const intro =
      locale === "ar"
        ? "أهلاً، عايز عرض سعر للباقة دي:"
        : "Hi, I'd like a quote for this bundle:";
    return `${intro}\n${lines.join("\n")}`;
  }, [selected, addons, t, locale]);

  const waHref = `${SITE.whatsappUrl}${
    whatsappMessage ? `?text=${encodeURIComponent(whatsappMessage)}` : ""
  }`;

  return (
    <div className="mx-auto max-w-7xl px-5 pb-24 md:px-8">
      <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr]">
        {/* Palette + Board */}
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-[0.25em] text-magenta">
            {t("builder.paletteTitle")}
          </h2>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {SERVICE_KEYS.map((key) => {
              const Icon = SERVICE_ICONS[key];
              const isActive = selected.includes(key);
              return (
                <button
                  key={key}
                  onClick={() => toggleService(key)}
                  className={`group flex flex-col items-center gap-2 rounded-2xl border p-4 text-center transition ${
                    isActive
                      ? "border-magenta bg-blush/70"
                      : "border-line bg-white hover:border-magenta/40"
                  }`}
                >
                  <span
                    className={`flex h-10 w-10 items-center justify-center rounded-xl transition ${
                      isActive
                        ? "bg-magenta text-white"
                        : "bg-blush text-magenta"
                    }`}
                  >
                    {isActive ? <Check size={18} /> : <Icon size={18} />}
                  </span>
                  <span className="text-xs font-semibold text-ink">
                    {t(`services.items.${key}.title`)}
                  </span>
                </button>
              );
            })}
          </div>

          <h2 className="mt-10 text-xs font-semibold uppercase tracking-[0.25em] text-magenta">
            {t("builder.boardTitle")}
          </h2>
          <div className="mt-4 min-h-[200px] rounded-2xl border border-dashed border-ink/15 bg-blush/20 p-4">
            {selected.length === 0 ? (
              <div className="flex h-full min-h-[160px] items-center justify-center text-center text-sm text-ink/40">
                {t("builder.boardEmpty")}
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <AnimatePresence initial={false}>
                  {selected.map((key) => {
                    const Icon = SERVICE_ICONS[key];
                    return (
                      <motion.div
                        key={key}
                        layout
                        initial={{ opacity: 0, y: 16, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.25, ease: "easeOut" }}
                        className="rounded-2xl border border-line bg-white p-4"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-magenta/10 text-magenta">
                              <Icon size={16} />
                            </span>
                            <span className="text-sm font-bold text-ink">
                              {t(`services.items.${key}.title`)}
                            </span>
                          </div>
                          <button
                            onClick={() => removeService(key)}
                            aria-label={t("builder.remove")}
                            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-ink/40 transition hover:bg-ink/5 hover:text-ink"
                          >
                            <X size={15} />
                          </button>
                        </div>

                        <p className="mt-3 text-xs text-ink/45">
                          {t("builder.addonsHint")}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {ADDON_KEYS[key].map((addonId) => {
                            const active = (addons[key] ?? []).includes(
                              addonId
                            );
                            return (
                              <button
                                key={addonId}
                                onClick={() => toggleAddon(key, addonId)}
                                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                                  active
                                    ? "border-magenta bg-magenta text-white"
                                    : "border-line bg-white text-ink/60 hover:border-magenta/40"
                                }`}
                              >
                                {t(`builder.items.${key}.addons.${addonId}`)}
                              </button>
                            );
                          })}
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>

        {/* Summary */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl border border-line bg-aubergine-deep p-6 text-white sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-magenta-light">
              {t("builder.summaryTitle")}
            </p>

            {selected.length === 0 ? (
              <p className="mt-6 text-sm text-white/50">
                {t("builder.summaryEmpty")}
              </p>
            ) : (
              <div className="mt-6 flex flex-col gap-3">
                {selected.map((key) => (
                  <div key={key} className="text-sm text-white/80">
                    <span className="font-semibold text-white">
                      {t(`services.items.${key}.title`)}
                    </span>
                    {(addons[key] ?? []).length > 0 && (
                      <span className="text-white/50">
                        {" — "}
                        {(addons[key] ?? [])
                          .map((id) => t(`builder.items.${key}.addons.${id}`))
                          .join("، ")}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="mt-8">
              <div className="flex items-center justify-between text-xs text-white/50">
                <span>{t("builder.tier.label")}</span>
              </div>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white/10">
                <motion.div
                  animate={{
                    width:
                      tier === "starter"
                        ? "33%"
                        : tier === "growth"
                          ? "66%"
                          : "100%",
                  }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="h-full rounded-full bg-gradient-to-r from-magenta-light to-magenta"
                />
              </div>
              <p className="mt-2 font-display text-lg font-bold text-white">
                {t(`builder.tier.${tier}`)}
              </p>
            </div>

            <div className="mt-8 flex flex-col gap-3">
              <a
                href={waHref}
                target="_blank"
                rel="noopener noreferrer"
                aria-disabled={selected.length === 0}
                className={`flex items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold transition ${
                  selected.length === 0
                    ? "pointer-events-none bg-white/10 text-white/30"
                    : "bg-magenta text-white hover:bg-magenta-light"
                }`}
              >
                {t("builder.ctaWhatsapp")}
                <MessageCircle size={16} />
              </a>
              {selected.length > 0 && (
                <button
                  onClick={reset}
                  className="flex items-center justify-center gap-2 rounded-full border border-white/15 px-6 py-3 text-xs font-semibold text-white/60 transition hover:border-white/30 hover:text-white"
                >
                  <RotateCcw size={13} />
                  {t("builder.ctaReset")}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
