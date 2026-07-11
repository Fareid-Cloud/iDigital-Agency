import { getTranslations, getLocale } from "next-intl/server";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { ArrowUpRight } from "lucide-react";
import { getFeaturedProjects, getProjects } from "@/lib/sanity/queries";
import { urlFor } from "@/lib/sanity/image";

export default async function PortfolioPreview({
  hideHeading = false,
  all = false,
}: {
  hideHeading?: boolean;
  all?: boolean;
}) {
  const t = await getTranslations("portfolio");
  const locale = await getLocale();
  const projects = all ? await getProjects() : await getFeaturedProjects();

  return (
    <section className="bg-blush/40 py-24">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        {!hideHeading && (
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div className="max-w-xl">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-magenta">
                {t("eyebrow")}
              </p>
              <h2 className="text-balance mt-4 font-display text-3xl font-bold text-ink sm:text-4xl">
                {t("title")}
              </h2>
              <p className="mt-3 text-ink/60">{t("sub")}</p>
            </div>
            <Link
              href="/portfolio"
              className="inline-flex items-center gap-1.5 rounded-full border border-ink/15 px-5 py-2.5 text-sm font-semibold text-ink transition hover:border-magenta hover:text-magenta"
            >
              {t("viewAll")}
              <ArrowUpRight size={15} />
            </Link>
          </div>
        )}

        {projects.length === 0 ? (
          <div className="mt-14 rounded-2xl border border-dashed border-ink/15 bg-white/60 px-8 py-20 text-center text-ink/40">
            {t("empty")}
          </div>
        ) : (
          <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((p) => (
              <Link
                key={p._id}
                href={`/portfolio/${p.slug.current}`}
                className="group relative overflow-hidden rounded-2xl bg-white"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image
                    src={urlFor(p.coverImage).width(700).height(520).url()}
                    alt={locale === "ar" ? p.titleAr : p.titleEn}
                    fill
                    className="object-cover transition duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />
                </div>
                <div className="p-5">
                  <h3 className="font-display font-bold text-ink">
                    {locale === "ar" ? p.titleAr : p.titleEn}
                  </h3>
                  {p.client && (
                    <p className="mt-1 text-sm text-ink/50">{p.client}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
