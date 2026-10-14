import Link from "next/link";
import { getRecipes } from "../lib/recipes";
import { buildIngredientIndex } from "../lib/ingredients";

const ALL_LETTERS = [..."ABCDEFGHIJKLMNOPQRSTUVWXYZ", "#"];

export default async function IngredientsPage() {
  const recipes = await getRecipes();
  const groups = buildIngredientIndex(recipes);
  const availableLetters = new Set(groups.map((group) => group.letter));

  return (
    <main className="mx-auto max-w-4xl px-6 pb-24 pt-16 sm:px-8">
      <div className="text-center">
        <h1 className="text-4xl sm:text-5xl">Ingredient Index</h1>
        <p className="mt-4 text-lg text-ink/80">
          Every ingredient across the collection. Jump to a letter, or tap an
          ingredient to see the recipes that use it.
        </p>
      </div>

      {groups.length === 0 ? (
        <div className="mt-16 rounded-2xl border border-dashed border-plum/20 px-6 py-16 text-center">
          <p className="text-lg text-plum">No ingredients yet.</p>
          <p className="mt-2 text-sm text-ink/60">
            Add a recipe with some ingredients and they&apos;ll show up here.
          </p>
        </div>
      ) : (
        <>
          <nav
            aria-label="Jump to letter"
            className="sticky top-0 z-10 -mx-6 mt-10 flex flex-wrap justify-center gap-1 bg-cream/95 px-6 py-3 backdrop-blur sm:mx-0 sm:rounded-full sm:border sm:border-plum/10"
          >
            {ALL_LETTERS.map((letter) =>
              availableLetters.has(letter) ? (
                <a
                  key={letter}
                  href={`#letter-${letter}`}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold text-plum transition-colors hover:bg-lavender"
                >
                  {letter}
                </a>
              ) : (
                <span
                  key={letter}
                  aria-hidden="true"
                  className="flex h-8 w-8 items-center justify-center rounded-full text-sm text-ink/25"
                >
                  {letter}
                </span>
              )
            )}
          </nav>

          <div className="mt-10 flex flex-col gap-10">
            {groups.map((group) => (
              <section key={group.letter} id={`letter-${group.letter}`} className="scroll-mt-24">
                <h2 className="border-b border-plum/15 pb-2 font-display text-2xl text-plum">
                  {group.letter}
                </h2>
                <ul className="mt-4 flex flex-col gap-y-1">
                  {group.ingredients.map((ingredient) => (
                    <li key={ingredient.name}>
                      {/* Native <details>: starts collapsed; Enter/Space on the summary toggles it. */}
                      <details className="group">
                        <summary className="flex cursor-pointer list-none items-center gap-2 rounded-lg px-2 py-1.5 text-ink/80 transition-colors hover:bg-lavender hover:text-plum focus-visible:outline-2 focus-visible:outline-plum [&::-webkit-details-marker]:hidden">
                          <svg
                            aria-hidden="true"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            className="h-4 w-4 shrink-0 text-ink/40 transition-transform group-open:rotate-90"
                          >
                            <path
                              fillRule="evenodd"
                              d="M7.21 14.77a.75.75 0 0 1 .02-1.06L11.168 10 7.23 6.29a.75.75 0 1 1 1.04-1.08l4.5 4.25a.75.75 0 0 1 0 1.08l-4.5 4.25a.75.75 0 0 1-1.06-.02Z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span>
                            {ingredient.name}{" "}
                            <span className="text-sm text-ink/40">({ingredient.recipes.length})</span>
                          </span>
                        </summary>
                        <ul className="mt-1 flex flex-col pl-8">
                          {ingredient.recipes.map((recipe) => (
                            <li key={recipe.id}>
                              <Link
                                href={`/recipes/${recipe.id}`}
                                className="block rounded-lg px-2 py-0.5 text-sm text-ink/60 transition-colors hover:bg-lavender hover:text-plum"
                              >
                                {recipe.title}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </details>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </>
      )}
    </main>
  );
}
