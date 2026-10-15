type RecipeCardProps = {
  title: string;
  category: string;
  imageUrl?: string | null;
};

export default function RecipeCard({ title, category, imageUrl }: RecipeCardProps) {
  return (
    <article className="flex h-full flex-col rounded-panel bg-stone p-3 transition-colors duration-200 hover:bg-blush">
      <div className="aspect-[4/3] w-full overflow-hidden rounded-photo bg-ground">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl} alt={title} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.25}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-10 w-10 text-ink-faded/50"
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
      <div className="flex flex-col gap-0.5 px-2 pt-3.5 pb-2">
        <span className="sc text-[0.95rem]">{category}</span>
        <h3 className="m-0 text-[1.45rem] leading-[1.15] text-ink">{title}</h3>
      </div>
    </article>
  );
}
