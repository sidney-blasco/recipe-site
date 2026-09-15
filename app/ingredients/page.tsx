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
                <ul className="mt-4 grid grid-cols-1 gap-x-8 gap-y-1 sm:grid-cols-2">
                  {group.ingredients.map((ingredient) => (
                    <li key={ingredient.name}>
                      <Link
                        href={`/?ingredient=${encodeURIComponent(ingredient.name)}`}
                        className="flex items-center justify-between gap-3 rounded-lg px-2 py-1.5 text-ink/80 transition-colors hover:bg-lavender hover:text-plum"
                      >
                        <span>{ingredient.name}</span>
                        <span className="text-sm text-ink/40">
                          {ingredient.count} {ingredient.count === 1 ? "recipe" : "recipes"}
                        </span>
                      </Link>
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
