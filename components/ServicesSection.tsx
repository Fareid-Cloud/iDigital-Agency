import { useTranslations } from "next-intl";
import { ArrowUpRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { SERVICE_KEYS } from "@/lib/constants";
import { SERVICE_ICONS } from "@/lib/serviceIcons";

export default function ServicesSection({
  hideHeading = false,
}: {
  hideHeading?: boolean;
}) {
  const t = useTranslations("services");

  return (
    <section className="mx-auto max-w-7xl px-5 py-24 md:px-8">
      {!hideHeading && (
        <div className="max-w-xl">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-magenta">
            {t("eyebrow")}
          </p>
          <h2 className="text-balance mt-4 font-display text-3xl font-bold text-ink sm:text-4xl">
            {t("title")}
          </h2>
          <p className="mt-3 text-ink/60">{t("sub")}</p>
        </div>
      )}

      <div className={`grid gap-6 sm:grid-cols-2 lg:grid-cols-3 ${hideHeading ? "" : "mt-14"}`}>
        {SERVICE_KEYS.map((key) => {
          const Icon = SERVICE_ICONS[key];
          return (
            <Link
              key={key}
              href="/build"
              className="group flex flex-col rounded-2xl border border-line bg-white p-7 transition hover:-translate-y-1 hover:border-magenta/40 hover:shadow-xl hover:shadow-magenta/5"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blush text-magenta transition group-hover:bg-magenta group-hover:text-white">
                <Icon size={20} />
              </div>
              <h3 className="mt-5 font-display text-lg font-bold text-ink">
                {t(`items.${key}.title`)}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ink/60">
                {t(`items.${key}.desc`)}
              </p>
              <span className="mt-4 flex items-center gap-1.5 text-sm font-semibold text-magenta transition group-hover:gap-2.5">
                {t(`items.${key}.cta`)}
                <ArrowUpRight size={14} />
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
