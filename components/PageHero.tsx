export default function PageHero({
  eyebrow,
  title,
  sub,
}: {
  eyebrow: string;
  title: string;
  sub?: string;
}) {
  return (
    <section className="relative overflow-hidden bg-aubergine-deep pb-20 pt-28 md:pb-24 md:pt-36">
      <div className="pointer-events-none absolute -right-20 top-0 h-64 w-64 rounded-full bg-magenta/25 blur-[100px]" />
      <div className="relative mx-auto max-w-4xl px-5 text-center md:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-magenta-light">
          {eyebrow}
        </p>
        <h1 className="text-balance mt-4 font-display text-3xl font-bold text-white sm:text-4xl md:text-5xl">
          {title}
        </h1>
        {sub && (
          <p className="text-balance mt-4 text-white/60 md:text-lg">{sub}</p>
        )}
      </div>
    </section>
  );
}
