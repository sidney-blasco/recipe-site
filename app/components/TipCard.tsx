type TipCardProps = {
  title: string;
  excerpt: string;
  date: string;
  imageUrl?: string | null;
};

function PlaceholderIcon() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.25}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-8 w-8 text-ink-faded/50"
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
    <article className="flex flex-col gap-5 rounded-panel bg-blush p-3 transition-colors duration-200 hover:bg-stone sm:flex-row sm:items-start">
      <div className="aspect-[4/3] w-full shrink-0 overflow-hidden rounded-photo bg-ground sm:w-48">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={title}
            className="h-full w-full object-cover"
          />
        ) : (
          <PlaceholderIcon />
        )}
      </div>

      <div className="flex flex-col gap-1 px-2 pb-2 sm:px-0 sm:pt-2 sm:pr-4">
        <span className="sc text-[0.95rem]">{date}</span>
        <h2 className="m-0 text-[1.6rem] leading-[1.15] text-ink">{title}</h2>
        <p className="mt-1 mb-0 italic text-ink-faded">{excerpt}</p>
      </div>
    </article>
  );
}
