"use client";

import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { usePathname } from "@/i18n/navigation";
import { Link } from "@/i18n/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { NAV_ITEMS } from "@/lib/constants";
import Logo from "./Logo";

export default function Header() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-cream/90 backdrop-blur-md border-b border-line"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 md:px-8">
        <Link href="/" className="relative z-10 flex items-center gap-2">
          <Logo className="h-9 w-auto" />
        </Link>

        <nav className="hidden items-center gap-9 md:flex">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className="text-sm font-medium text-ink/80 transition hover:text-magenta"
            >
              {t(item.key)}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-4 md:flex">
          <LocaleSwitch locale={locale} pathname={pathname} />
          <Link
            href="/contact"
            className="rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-magenta"
          >
            {t("contact")}
          </Link>
        </div>

        <button
          aria-label="menu"
          onClick={() => setOpen((v) => !v)}
          className="relative z-10 flex h-10 w-10 items-center justify-center md:hidden"
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden border-t border-line bg-cream md:hidden"
          >
            <div className="flex flex-col gap-1 px-5 py-4">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.key}
                  href={item.href}
                  className="rounded-lg px-3 py-3 text-base font-medium text-ink hover:bg-blush"
                >
                  {t(item.key)}
                </Link>
              ))}
              <Link
                href="/contact"
                className="mt-2 rounded-full bg-ink px-5 py-3 text-center text-sm font-semibold text-white"
              >
                {t("contact")}
              </Link>
              <div className="mt-3 flex justify-center">
                <LocaleSwitch locale={locale} pathname={pathname} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

function LocaleSwitch({
  locale,
  pathname,
}: {
  locale: string;
  pathname: string;
}) {
  const other = locale === "ar" ? "en" : "ar";
  const label = locale === "ar" ? "EN" : "AR";
  return (
    <Link
      href={pathname}
      locale={other}
      className="rounded-full border border-line px-3.5 py-1.5 text-xs font-semibold tracking-wide text-ink/70 transition hover:border-magenta hover:text-magenta"
    >
      {label}
    </Link>
  );
}
