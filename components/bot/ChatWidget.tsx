"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import { AnimatePresence, motion } from "framer-motion";
import { Send, X } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { SERVICE_ICONS } from "@/lib/serviceIcons";
import type { SERVICE_KEYS } from "@/lib/constants";

type ServiceKey = (typeof SERVICE_KEYS)[number];

type Msg = {
  role: "user" | "assistant";
  text: string;
  bundle?: ServiceKey[] | null;
};

export default function ChatWidget() {
  const t = useTranslations("bot");
  const tServices = useTranslations("services.items");
  const locale = useLocale();

  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, busy, open]);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || busy) return;

    const next: Msg[] = [...messages, { role: "user", text: trimmed }];
    setMessages(next);
    setInput("");
    setBusy(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: next.map(({ role, text }) => ({ role, text })),
        }),
      });
      const data = await res.json();
      if (data?.ok) {
        setMessages((m) => [
          ...m,
          { role: "assistant", text: data.text, bundle: data.bundle },
        ]);
      } else {
        setMessages((m) => [...m, { role: "assistant", text: t("offline") }]);
      }
    } catch {
      setMessages((m) => [...m, { role: "assistant", text: t("offline") }]);
    } finally {
      setBusy(false);
    }
  }

  const quickKeys = ["services", "bundle", "audit"] as const;

  return (
    <div className="fixed bottom-5 end-5 z-[60]" dir={locale === "ar" ? "rtl" : "ltr"}>
      {/* ------------------------------- panel -------------------------------- */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="absolute bottom-[76px] end-0 flex h-[520px] w-[min(380px,calc(100vw-2.5rem))] flex-col overflow-hidden rounded-3xl border border-line bg-white shadow-2xl shadow-ink/20"
          >
            {/* header */}
            <div className="relative flex items-center gap-3 bg-aubergine-deep px-5 py-4">
              <div className="pointer-events-none absolute -end-8 -top-10 h-28 w-28 rounded-full bg-magenta/30 blur-[50px]" />
              <span className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-white p-1.5">
                <Image src="/brand/logo-mark.png" alt="" width={22} height={30} className="object-contain" />
              </span>
              <div className="relative min-w-0 flex-1">
                <p className="font-display text-sm font-bold text-white">{t("name")}</p>
                <p className="flex items-center gap-1.5 text-xs text-white/50">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
                  {t("tagline")}
                </p>
              </div>
              <button
                onClick={() => setOpen(false)}
                aria-label={t("close")}
                className="relative flex h-8 w-8 items-center justify-center rounded-full text-white/60 transition hover:bg-white/10 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            {/* messages */}
            <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto bg-cream px-4 py-4">
              <Bubble role="assistant" text={t("greeting")} />

              {messages.length === 0 && (
                <div className="flex flex-wrap gap-2 ps-1 pt-1">
                  {quickKeys.map((key) => (
                    <button
                      key={key}
                      onClick={() => send(t(`quick.${key}`))}
                      className="rounded-full border border-magenta/30 bg-white px-3.5 py-2 text-xs font-medium text-magenta transition hover:bg-magenta hover:text-white"
                    >
                      {t(`quick.${key}`)}
                    </button>
                  ))}
                </div>
              )}

              {messages.map((m, i) => (
                <div key={i}>
                  <Bubble role={m.role} text={m.text} />
                  {m.bundle && <BundleCard bundle={m.bundle} tServices={tServices} t={t} />}
                </div>
              ))}

              {busy && (
                <div className="flex w-fit items-center gap-1.5 rounded-2xl rounded-es-md bg-white px-4 py-3 shadow-sm">
                  {[0, 1, 2].map((d) => (
                    <motion.span
                      key={d}
                      animate={{ opacity: [0.25, 1, 0.25] }}
                      transition={{ duration: 1, repeat: Infinity, delay: d * 0.18 }}
                      className="h-1.5 w-1.5 rounded-full bg-magenta"
                    />
                  ))}
                </div>
              )}
            </div>

            {/* input */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                send(input);
              }}
              className="flex items-center gap-2 border-t border-line bg-white p-3"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={t("placeholder")}
                className="min-w-0 flex-1 rounded-full border border-line bg-cream px-4 py-2.5 text-sm outline-none transition focus:border-magenta"
              />
              <button
                type="submit"
                disabled={busy || !input.trim()}
                aria-label="send"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-magenta text-white transition hover:bg-magenta-light disabled:opacity-40"
              >
                <Send size={16} className="ltr-flip" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ------------------------------ launcher ------------------------------ */}
      <motion.button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? t("close") : t("open")}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        animate={open ? {} : { y: [0, -5, 0] }}
        transition={open ? {} : { duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        className="relative flex h-14 w-14 items-center justify-center rounded-full bg-aubergine-deep shadow-[0_10px_35px_-6px_rgba(176,24,107,0.6)]"
      >
        <span className="absolute inset-0 rounded-full bg-magenta/30 blur-md" />
        <span className="relative flex h-full w-full items-center justify-center rounded-full border border-magenta/40 bg-aubergine-deep p-3">
          {open ? (
            <X size={20} className="text-white" />
          ) : (
            <Image src="/brand/logo-mark.png" alt="" width={18} height={28} className="object-contain brightness-[3]" />
          )}
        </span>
        {!open && (
          <motion.span
            animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
            className="absolute inset-0 rounded-full border-2 border-magenta"
          />
        )}
      </motion.button>
    </div>
  );
}

/* ------------------------------ sub-components ----------------------------- */

function Bubble({ role, text }: { role: "user" | "assistant"; text: string }) {
  const isUser = role === "user";
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${isUser ? "justify-end" : "justify-start"}`}
    >
      <p
        className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-relaxed ${
          isUser
            ? "rounded-ee-md bg-magenta text-white"
            : "rounded-es-md bg-white text-ink shadow-sm"
        }`}
      >
        {text}
      </p>
    </motion.div>
  );
}

function BundleCard({
  bundle,
  tServices,
  t,
}: {
  bundle: ServiceKey[];
  tServices: ReturnType<typeof useTranslations>;
  t: ReturnType<typeof useTranslations>;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: 0.15 }}
      className="mt-2 max-w-[85%] overflow-hidden rounded-2xl border border-magenta/25 bg-white shadow-sm"
    >
      <p className="bg-blush px-4 py-2 text-xs font-bold text-magenta">
        {t("bundleCard")}
      </p>
      <div className="flex flex-col gap-2.5 px-4 py-3">
        {bundle.map((key) => {
          const Icon = SERVICE_ICONS[key];
          return (
            <span key={key} className="flex items-center gap-2.5 text-sm text-ink">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-magenta/10 text-magenta">
                <Icon size={14} />
              </span>
              {tServices(`${key}.title`)}
            </span>
          );
        })}
      </div>
      <Link
        href="/build"
        className="block bg-magenta px-4 py-2.5 text-center text-xs font-semibold text-white transition hover:bg-magenta-light"
      >
        {t("openBuilder")}
      </Link>
    </motion.div>
  );
}
