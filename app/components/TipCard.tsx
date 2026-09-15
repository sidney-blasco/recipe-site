type TipCardProps = {
  title: string;
  excerpt: string;
  date: string;
  imageUrl?: string | null;
};

function PlaceholderIcon() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-lavender to-mauve/40">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-8 w-8 text-plum/40"
        aria-hidden="true"
      >
        <path d="M9 18h6" />
        <path d="M10 22h4" />
        <path d="M12 2a6 6 0 0 0-4 10.5c.6.5 1 1.2 1 2.1V16h6v-1.4c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 2Z" />
      </svg>
    </div>
  );
}

export default function TipCard({ title, excerpt, date, imageUrl }: TipCardProps) {
  return (
    <article className="group flex flex-col gap-5 border-b border-plum/10 py-8 first:pt-0 last:border-0 last:pb-0 sm:flex-row sm:items-start">
      <div className="aspect-[4/3] w-full shrink-0 overflow-hidden rounded-2xl bg-lavender sm:w-44">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <PlaceholderIcon />
        )}
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-mauve">{date}</span>
        <h2 className="font-display text-2xl text-plum">{title}</h2>
        <p className="text-ink/80">{excerpt}</p>
      </div>
    </article>
  );
}
