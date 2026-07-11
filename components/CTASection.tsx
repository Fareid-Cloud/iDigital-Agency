import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { SITE } from "@/lib/constants";

type CtaKey = "home" | "services" | "portfolio" | "project" | "about" | "blog" | "careers";

export default function CTASection({ variant = "home" }: { variant?: CtaKey }) {
  const t = useTranslations("ctas");
  const tContact = useTranslations("contact");

  return (
    <section className="relative overflow-hidden bg-aubergine-deep py-24">
      <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-magenta/25 blur-[100px]" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-magenta/20 blur-[100px]" />
      <div className="relative mx-auto max-w-3xl px-5 text-center md:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-magenta-light">
          {t(`${variant}.eyebrow`)}
        </p>
        <h2 className="text-balance mt-4 font-display text-3xl font-bold text-white sm:text-4xl">
          {t(`${variant}.title`)}
        </h2>
        <p className="mt-4 text-white/60">{t(`${variant}.sub`)}</p>
        <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/contact"
            className="rounded-full bg-magenta px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-magenta/30 transition hover:bg-magenta-light"
          >
            {tContact("form.submit")}
          </Link>
          <a
            href={SITE.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border border-white/20 px-8 py-3.5 text-sm font-semibold text-white transition hover:border-white/50"
          >
            {tContact("whatsapp")}
          </a>
        </div>
      </div>
    </section>
  );
}
