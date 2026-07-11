export const SITE = {
  name: "iDigital",
  domain: "https://iDigitalAgency.co",
  phoneDisplay: "010 6486 2913",
  phoneIntl: "+201064862913",
  whatsappUrl: "https://wa.me/201064862913",
  email: "info@iDigitalAgency.co",
  addressAr: "فاميلي مول، قنا، مصر",
  addressEn: "Family Mall, Qena, Egypt",
  social: {
    facebook: "https://www.facebook.com/iDigitalAgency/",
    instagram: "https://www.instagram.com/idigital.agency",
    linkedin: "https://www.linkedin.com/company/idigital-iagency/",
  },
};

export const NAV_ITEMS = [
  { key: "services", href: "/services" },
  { key: "work", href: "/portfolio" },
  { key: "builder", href: "/build" },
  { key: "audit", href: "/audit" },
  { key: "studio", href: "/about" },
  { key: "journal", href: "/blog" },
  { key: "careers", href: "/careers" },
] as const;

export const SERVICE_KEYS = [
  "web",
  "social",
  "ads",
  "branding",
  "seo",
  "content",
] as const;

export const ADDON_KEYS: Record<(typeof SERVICE_KEYS)[number], string[]> = {
  web: ["multipage", "ecommerce", "app"],
  social: ["coremeta", "tiktok", "weeklyVideo"],
  ads: ["google", "meta", "snapchat"],
  branding: ["identity", "profile", "print"],
  seo: ["local", "technical", "content"],
  content: ["photo", "motion", "reels"],
};
