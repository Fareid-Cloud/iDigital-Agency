import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { MessageCircle } from "lucide-react";
import { FacebookIcon, InstagramIcon, LinkedinIcon } from "./icons/BrandIcons";
import { SITE, NAV_ITEMS, SERVICE_KEYS } from "@/lib/constants";
import Logo from "./Logo";

export default function Footer() {
  const t = useTranslations();
  const locale = useLocale();
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-line/60 bg-aubergine-deep text-white">
      <div className="mx-auto max-w-7xl px-5 py-16 md:px-8">
        <div className="grid gap-12 md:grid-cols-[1.3fr_1fr_1fr_1.2fr]">
          <div>
            <div className="[&_span:last-child]:text-white">
              <Logo />
            </div>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/60">
              {t("footer.tagline")}
            </p>
            <div className="mt-6 flex gap-3">
              <SocialIcon href={SITE.social.facebook}>
                <FacebookIcon size={16} />
              </SocialIcon>
              <SocialIcon href={SITE.social.instagram}>
                <InstagramIcon size={16} />
              </SocialIcon>
              <SocialIcon href={SITE.social.linkedin}>
                <LinkedinIcon size={16} />
              </SocialIcon>
              <SocialIcon href={SITE.whatsappUrl}>
                <MessageCircle size={16} />
              </SocialIcon>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white/90">
              {t("footer.servicesTitle")}
            </h4>
            <ul className="mt-4 space-y-2.5">
              {SERVICE_KEYS.map((key) => (
                <li key={key}>
                  <Link
                    href="/services"
                    className="text-sm text-white/55 transition hover:text-magenta-light"
                  >
                    {t(`services.items.${key}.title`)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white/90">
              {t("footer.companyTitle")}
            </h4>
            <ul className="mt-4 space-y-2.5">
              {NAV_ITEMS.map((item) => (
                <li key={item.key}>
                  <Link
                    href={item.href}
                    className="text-sm text-white/55 transition hover:text-magenta-light"
                  >
                    {t(`nav.${item.key}`)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white/90">
              {t("footer.contactTitle")}
            </h4>
            <ul className="mt-4 space-y-2.5 text-sm text-white/55">
              <li>
                <a href={`mailto:${SITE.email}`} className="hover:text-magenta-light">
                  {SITE.email}
                </a>
              </li>
              <li>
                <a href={`tel:${SITE.phoneIntl}`} className="hover:text-magenta-light" dir="ltr">
                  {SITE.phoneDisplay}
                </a>
              </li>
              <li>{locale === "ar" ? SITE.addressAr : SITE.addressEn}</li>
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 text-xs text-white/40 sm:flex-row">
          <p>
            © {year} iDigital. {t("footer.rights")}.
          </p>
        </div>
      </div>
    </footer>
  );
}

function SocialIcon({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-white/70 transition hover:border-magenta hover:bg-magenta hover:text-white"
    >
      {children}
    </a>
  );
}
