interface ProductsHeroProps {
  badge: string;
  heading: string;
  description: string;
}

export function ProductsHero({ badge, heading, description }: ProductsHeroProps) {
  return (
    <header className="border-border bg-card relative mb-10 overflow-hidden rounded-[2rem] border px-6 py-10 shadow-lg ring-1 shadow-teal-500/10 ring-teal-500/10 backdrop-blur-xl sm:px-10">
      <div className="bg-[radial-gradient(circle_at_top_right,rgba(20,184,166,0.18),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(244,63,94,0.12),transparent_35%),linear-gradient(120deg,theme(colors.card),rgba(245,158,11,0.08),theme(colors.card))] pointer-events-none absolute inset-0" />
      <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-teal-500 via-amber-400 to-rose-500" />
      <div className="relative max-w-3xl">
        <p className="text-sm font-semibold tracking-[0.35em] text-teal-600 uppercase dark:text-teal-300">
          {badge}
        </p>
        <h1 className="text-foreground mt-4 text-4xl leading-tight font-black sm:text-5xl">
          {heading}
        </h1>
        <p className="text-muted-foreground mt-4 max-w-2xl text-base sm:text-lg">{description}</p>
      </div>
    </header>
  );
}
