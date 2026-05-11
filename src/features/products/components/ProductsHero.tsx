interface ProductsHeroProps {
  badge: string;
  heading: string;
  description: string;
}

export function ProductsHero({ badge, heading, description }: ProductsHeroProps) {
  return (
    <header className="relative mb-10 overflow-hidden rounded-[2rem] border border-gray-200 bg-white px-6 py-10 shadow-2xl ring-1 shadow-gray-200/20 ring-gray-300/20 backdrop-blur-xl sm:px-10 dark:border-white/10 dark:bg-slate-950/85 dark:shadow-cyan-500/10 dark:ring-cyan-400/10">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.1),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(56,189,248,0.08),transparent_35%)] dark:bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.18),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(56,189,248,0.12),transparent_35%)]" />
      <div className="relative max-w-3xl">
        <p className="text-sm tracking-[0.35em] text-cyan-600 uppercase dark:text-cyan-300">
          {badge}
        </p>
        <h1 className="mt-4 text-4xl leading-tight font-black text-gray-900 sm:text-5xl dark:text-white">
          {heading}
        </h1>
        <p className="mt-4 max-w-2xl text-base text-gray-600 sm:text-lg dark:text-slate-300">
          {description}
        </p>
      </div>
    </header>
  );
}
