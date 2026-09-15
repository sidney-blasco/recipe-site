import Link from "next/link";
import { notFound } from "next/navigation";
import { getRecipeById, type RecipeIngredient } from "../../lib/recipes";
import { getDietaryTags } from "../../lib/filters";

function formatIngredient(ingredient: RecipeIngredient): string {
  return [ingredient.amount, ingredient.unit, ingredient.name].filter(Boolean).join(" ");
}

function PlaceholderImage() {
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
        className="h-14 w-14 text-plum/40"
        aria-hidden="true"
      >
        <path d="M7 3v7a2 2 0 0 0 2 2h0a2 2 0 0 0 2-2V3" />
        <path d="M9 12v9" />
        <path d="M17 3c-1.1 0-2 1.34-2 3v4c0 1.1.9 2 2 2s2-.9 2-2V6c0-1.66-.9-3-2-3Z" />
        <path d="M17 12v9" />
      </svg>
    </div>
  );
}

export default async function RecipePage(props: PageProps<"/recipes/[id]">) {
  const { id } = await props.params;
  const recipe = await getRecipeById(id);

  if (!recipe) {
    notFound();
  }

  const dietaryTags = getDietaryTags(recipe.tags);

  return (
    <main className="mx-auto max-w-5xl px-6 pb-24 pt-12 sm:px-8">
      <Link
        href="/"
        className="text-sm text-mauve underline decoration-mauve/40 underline-offset-4 hover:text-plum"
      >
        ← All Recipes
      </Link>

      <h1 className="mt-4 text-4xl sm:text-5xl">{recipe.title}</h1>

      <div className="mt-10 lg:grid lg:grid-cols-[minmax(0,380px)_1fr] lg:items-start lg:gap-12">
        <div>
          <div className="aspect-[4/3] w-full overflow-hidden rounded-2xl bg-lavender">
            {recipe.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={recipe.imageUrl}
                alt={recipe.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <PlaceholderImage />
            )}
          </div>

          <dl className="mt-6 flex flex-col gap-4">
            {recipe.cuisine && (
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-mauve">Cuisine</dt>
                <dd className="mt-1 text-ink/80">{recipe.cuisine}</dd>
              </div>
            )}
            {recipe.mealType && (
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-mauve">Meal Type</dt>
                <dd className="mt-1 text-ink/80">{recipe.mealType}</dd>
              </div>
            )}
            {dietaryTags.length > 0 && (
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-mauve">Dietary</dt>
                <dd className="mt-2 flex flex-wrap gap-2">
                  {dietaryTags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-lavender px-3 py-1 text-xs font-semibold text-plum"
                    >
                      {tag}
                    </span>
                  ))}
                </dd>
              </div>
            )}
          </dl>
        </div>

        <div className="mt-10 flex flex-col gap-10 lg:mt-0">
          <section>
            <h2 className="font-display text-2xl text-plum">Ingredients</h2>
            {recipe.ingredients.length > 0 ? (
              <ul className="mt-4 flex flex-col gap-2.5 border-t border-plum/10 pt-4">
                {recipe.ingredients.map((ingredient, index) => (
                  <li
                    key={`${ingredient.name}-${index}`}
                    className="flex items-baseline gap-3 text-ink/85"
                  >
                    <span className="h-1.5 w-1.5 shrink-0 translate-y-[-2px] rounded-full bg-mauve" aria-hidden="true" />
                    {formatIngredient(ingredient)}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 text-sm text-ink/60">No ingredients listed yet.</p>
            )}
          </section>

          <section>
            <h2 className="font-display text-2xl text-plum">Instructions</h2>
            {recipe.instructions.length > 0 ? (
              <ol className="mt-4 flex list-none flex-col gap-5 border-t border-plum/10 pt-4">
                {recipe.instructions.map((step, index) => (
                  <li key={index} className="flex gap-4">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-plum text-sm font-semibold text-cream">
                      {index + 1}
                    </span>
                    <p className="pt-0.5 text-ink/85">{step}</p>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="mt-4 text-sm text-ink/60">No instructions listed yet.</p>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
