import Link from "next/link";
import PageHeader from "../components/PageHeader";
import { getRecipes } from "../lib/recipes";
import { buildIngredientIndex } from "../lib/ingredients";

const ALL_LETTERS = [..."ABCDEFGHIJKLMNOPQRSTUVWXYZ", "#"];

export default async function IngredientsPage() {
  const recipes = await getRecipes();
  const groups = buildIngredientIndex(recipes);
  const availableLetters = new Set(groups.map((group) => group.letter));

  return (
    <main className="page pb-16">
      <PageHeader
        title="Ingredient Index"
        dek="Every ingredient across the collection. Jump to a letter, or tap an ingredient to see the recipes that use it."
      />

      {groups.length === 0 ? (
        <div className="panel mt-12 bg-blush text-center">
          <p className="display-it m-0 text-h4 text-ink">No ingredients yet.</p>
          <p className="mt-2 mb-0 text-small italic text-ink-faded">
            Add a recipe with some ingredients and they&apos;ll show up here.
          </p>
        </div>
      ) : (
        <>
          <nav
            aria-label="Jump to letter"
            className="z-10 mt-10 flex flex-wrap justify-center gap-0.5 rounded-panel bg-blush px-3 py-2.5 lg:sticky lg:top-[4.5rem]"
          >
            {ALL_LETTERS.map((letter) =>
              availableLetters.has(letter) ? (
                <a
                  key={letter}
                  href={`#letter-${letter}`}
                  className="display flex size-8 items-center justify-center rounded-pill text-[1.1rem] text-wine no-underline transition-colors duration-200 hover:bg-ground"
                >
                  {letter}
                </a>
              ) : (
                <span
                  key={letter}
                  aria-hidden="true"
                  className="display flex size-8 items-center justify-center rounded-pill text-[1.1rem] text-ink-faded/40"
                >
                  {letter}
                </span>
              )
            )}
          </nav>

          <div className="panel mt-6 bg-blush">
            <div className="mx-auto flex max-w-[40rem] flex-col gap-10">
              {groups.map((group) => (
                <section key={group.letter} id={`letter-${group.letter}`} className="scroll-mt-24 lg:scroll-mt-40">
                  <h2 className="m-0 text-h3 leading-none text-wine">{group.letter}</h2>
                  <ul className="mt-3 flex flex-col">
                    {group.ingredients.map((ingredient) => (
                      <li key={ingredient.name} className="dotted-rule">
                        {/* Native <details>: starts collapsed; Enter/Space on the summary toggles it. */}
                        <details className="group">
                          <summary className="flex cursor-pointer list-none items-center gap-2 rounded-[12px] px-2 py-1.5 transition-colors duration-200 hover:bg-ground [&::-webkit-details-marker]:hidden">
                            <svg
                              aria-hidden="true"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                              className="h-4 w-4 shrink-0 text-ink-faded group-open:rotate-90"
                            >
                              <path
                                fillRule="evenodd"
                                d="M7.21 14.77a.75.75 0 0 1 .02-1.06L11.168 10 7.23 6.29a.75.75 0 1 1 1.04-1.08l4.5 4.25a.75.75 0 0 1 0 1.08l-4.5 4.25a.75.75 0 0 1-1.06-.02Z"
                                clipRule="evenodd"
                              />
                            </svg>
                            <span>
                              {ingredient.name}{" "}
                              <span className="text-small text-ink-faded">({ingredient.recipes.length})</span>
                            </span>
                          </summary>
                          <ul className="mt-0.5 mb-2 flex flex-col pl-8">
                            {ingredient.recipes.map((recipe) => (
                              <li key={recipe.id}>
                                <Link
                                  href={`/recipes/${recipe.id}`}
                                  className="display-it block rounded-[12px] px-2 py-0.5 text-[1.05rem] no-underline transition-colors duration-200 hover:bg-ground"
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
          </div>
        </>
      )}
    </main>
  );
}
