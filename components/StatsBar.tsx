import { useTranslations } from "next-intl";

const KEYS = ["clients", "projects", "countries", "years"] as const;

export default function StatsBar() {
  const t = useTranslations("stats");

  return (
    <div className="relative z-10 -mt-14 mb-4">
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-4">
          {KEYS.map((key) => (
            <div
              key={key}
              className="flex flex-col items-center gap-1 bg-white px-4 py-7 text-center"
            >
              <span className="font-display text-3xl font-bold text-magenta sm:text-4xl">
                {t(`${key}.value`)}
              </span>
              <span className="text-xs text-ink/55 sm:text-sm">
                {t(`${key}.label`)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
