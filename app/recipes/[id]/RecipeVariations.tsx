import Link from "next/link";
import type { RecipeVariation } from "../../lib/recipes";

function PlaceholderThumb() {
  return (
    <span className="flex h-full w-full items-center justify-center bg-ground">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.25}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-5 w-5 text-ink-faded/50"
        aria-hidden="true"
      >
        <path d="M7 3v7a2 2 0 0 0 2 2h0a2 2 0 0 0 2-2V3" />
        <path d="M9 12v9" />
        <path d="M17 3c-1.1 0-2 1.34-2 3v4c0 1.1.9 2 2 2s2-.9 2-2V6c0-1.66-.9-3-2-3Z" />
        <path d="M17 12v9" />
      </svg>
    </span>
  );
}

export default function RecipeVariations({ variations }: { variations: RecipeVariation[] }) {
  return (
    <aside className="mt-12 lg:mt-8 lg:w-72 lg:shrink-0">
      <div className="lg:sticky lg:top-24">
        <h2 className="m-0 mb-4 text-h4 leading-tight">Variations</h2>
        <ul className="flex flex-col gap-2.5">
          {variations.map((variation) => (
            <li key={variation.id}>
              <Link
                href={`/recipes/${variation.id}`}
                className="flex items-center gap-3 rounded-[20px] bg-stone p-2 no-underline transition-colors duration-200 hover:bg-blush"
              >
                <span className="h-14 w-14 shrink-0 overflow-hidden rounded-[12px] bg-ground">
                  {variation.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={variation.imageUrl}
                      alt={variation.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <PlaceholderThumb />
                  )}
                </span>
                <span className="display-it text-[1.1rem] leading-snug text-wine">{variation.title}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
