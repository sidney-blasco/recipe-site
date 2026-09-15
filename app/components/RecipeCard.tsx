type RecipeCardProps = {
  title: string;
  category: string;
  imageUrl?: string | null;
};

export default function RecipeCard({ title, category, imageUrl }: RecipeCardProps) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-plum/10 bg-white/60 transition-shadow hover:shadow-md">
      <div className="aspect-[4/3] w-full overflow-hidden bg-lavender">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-lavender to-mauve/40">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-10 w-10 text-plum/40"
              aria-hidden="true"
            >
              <path d="M7 3v7a2 2 0 0 0 2 2h0a2 2 0 0 0 2-2V3" />
              <path d="M9 12v9" />
              <path d="M17 3c-1.1 0-2 1.34-2 3v4c0 1.1.9 2 2 2s2-.9 2-2V6c0-1.66-.9-3-2-3Z" />
              <path d="M17 12v9" />
            </svg>
          </div>
        )}
      </div>
      <div className="flex flex-col gap-1 px-5 py-4">
        <span className="text-xs font-semibold uppercase tracking-wide text-mauve">
          {category}
        </span>
        <h3 className="font-display text-lg leading-snug text-plum">{title}</h3>
      </div>
    </article>
  );
}
