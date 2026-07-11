import { getTranslations, getLocale } from "next-intl/server";
import Image from "next/image";
import { LinkedinIcon, InstagramIcon } from "./icons/BrandIcons";
import { getTeam } from "@/lib/sanity/queries";
import { urlFor } from "@/lib/sanity/image";

export default async function TeamSection() {
  const t = await getTranslations("about");
  const locale = await getLocale();
  const team = await getTeam();

  if (team.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-5 py-24 md:px-8">
      <div className="max-w-xl">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-magenta">
          {t("teamEyebrow")}
        </p>
        <h2 className="text-balance mt-4 font-display text-3xl font-bold text-ink sm:text-4xl">
          {t("teamTitle")}
        </h2>
      </div>

      <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {team.map((member) => (
          <div key={member._id} className="group text-center">
            <div className="relative mx-auto aspect-square w-full max-w-[220px] overflow-hidden rounded-2xl bg-blush">
              <Image
                src={urlFor(member.photo).width(500).height(500).url()}
                alt={member.name}
                fill
                className="object-cover transition duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 flex items-end justify-center gap-2 bg-gradient-to-t from-ink/70 via-transparent to-transparent p-4 opacity-0 transition group-hover:opacity-100">
                {member.linkedin && (
                  <a
                    href={member.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-ink transition hover:bg-magenta hover:text-white"
                  >
                    <LinkedinIcon size={14} />
                  </a>
                )}
                {member.instagram && (
                  <a
                    href={member.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-ink transition hover:bg-magenta hover:text-white"
                  >
                    <InstagramIcon size={14} />
                  </a>
                )}
              </div>
            </div>
            <h3 className="mt-4 font-display font-bold text-ink">
              {member.name}
            </h3>
            <p className="text-sm text-ink/50">
              {locale === "ar" ? member.roleAr : member.roleEn}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
