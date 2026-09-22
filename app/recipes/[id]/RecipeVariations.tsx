import Link from "next/link";
import type { RecipeVariation } from "../../lib/recipes";

function PlaceholderThumb() {
  return (
    <span className="flex h-full w-full items-center justify-center bg-gradient-to-br from-lavender to-mauve/40">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-5 w-5 text-plum/40"
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
    <aside className="mt-10 lg:mt-0 lg:w-72 lg:shrink-0">
      <div className="lg:sticky lg:top-8">
        <h2 className="mb-4 font-display text-xl text-plum">Variations</h2>
        <ul className="flex flex-col gap-3">
          {variations.map((variation) => (
            <li key={variation.id}>
              <Link
                href={`/recipes/${variation.id}`}
                className="flex items-center gap-3 rounded-xl border border-plum/10 bg-white/60 p-2 transition-colors hover:bg-lavender"
              >
                <span className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-lavender">
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
                <span className="text-sm font-semibold leading-snug text-plum">{variation.title}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
