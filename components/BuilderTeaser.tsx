import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ArrowUpRight, LayoutGrid } from "lucide-react";

export default function BuilderTeaser() {
  const t = useTranslations("builder");

  return (
    <section className="mx-auto max-w-7xl px-5 pb-24 md:px-8">
      <Link
        href="/build"
        className="group relative flex flex-col items-start gap-6 overflow-hidden rounded-3xl bg-ink px-7 py-10 transition hover:opacity-95 sm:flex-row sm:items-center sm:justify-between sm:px-10"
      >
        <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-magenta/30 blur-[80px]" />
        <div className="relative flex items-center gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-magenta text-white">
            <LayoutGrid size={20} />
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-magenta-light">
              {t("eyebrow")}
            </p>
            <h3 className="mt-1 font-display text-xl font-bold text-white sm:text-2xl">
              {t("title")}
            </h3>
          </div>
        </div>
        <span className="relative flex shrink-0 items-center gap-1.5 rounded-full bg-white px-6 py-3 text-sm font-semibold text-ink transition group-hover:bg-blush">
          {t("eyebrow")}
          <ArrowUpRight size={15} />
        </span>
      </Link>
    </section>
  );
}
