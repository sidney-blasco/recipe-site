import Link from "next/link";
import { notFound } from "next/navigation";
import { getRecipeById, type RecipeIngredient } from "../../lib/recipes";
import { getDietaryTags } from "../../lib/filters";
import { getCommentsForRecipe } from "../../lib/comments";
import IngredientChecklist from "./IngredientChecklist";
import CommentsSection from "./CommentsSection";

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

function RecipeFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex-1 text-center">
      <dt className="text-xs font-semibold uppercase tracking-wide text-mauve">{label}</dt>
      <dd className="mt-1 text-ink/85">{value}</dd>
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
  const comments = await getCommentsForRecipe(recipe.id);
  const formattedIngredients = recipe.ingredients.map(formatIngredient);
  const descriptionParagraphs = recipe.description
    ? recipe.description.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean)
    : [];

  const breadcrumbCategory = recipe.cuisine ?? recipe.mealType;
  const breadcrumbHref = recipe.cuisine
    ? `/?cuisine=${encodeURIComponent(recipe.cuisine)}`
    : recipe.mealType
      ? `/?type=${encodeURIComponent(recipe.mealType)}`
      : null;

  const facts = [
    { label: "Prep Time", value: recipe.prepTime },
    { label: "Cook Time", value: recipe.cookTime },
    { label: "Total Time", value: recipe.totalTime },
    { label: "Servings", value: recipe.servings },
  ].filter((fact): fact is { label: string; value: string } => Boolean(fact.value));

  return (
    <main className="mx-auto max-w-3xl px-6 pb-24 pt-12 sm:px-8">
      {/* 1. Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-sm">
        <Link
          href="/"
          className="text-mauve underline decoration-mauve/40 underline-offset-4 hover:text-plum"
        >
          Recipes
        </Link>
        {breadcrumbCategory && (
          <>
            <span className="text-ink/40" aria-hidden="true">
              &gt;
            </span>
            {breadcrumbHref ? (
              <Link
                href={breadcrumbHref}
                className="text-mauve underline decoration-mauve/40 underline-offset-4 hover:text-plum"
              >
                {breadcrumbCategory}
              </Link>
            ) : (
              <span className="text-ink/70">{breadcrumbCategory}</span>
            )}
          </>
        )}
        <span className="text-ink/40" aria-hidden="true">
          &gt;
        </span>
        <span className="text-ink/70">{recipe.title}</span>
      </nav>

      {/* 2. Title + byline */}
      <h1 className="mt-4 text-4xl sm:text-5xl">{recipe.title}</h1>
      <p className="mt-2 text-sm font-semibold uppercase tracking-wide text-mauve">Convivial · Sid</p>

      {/* 3. Description intro */}
      {descriptionParagraphs.length > 0 && (
        <div className="mt-6 flex flex-col gap-4 text-lg text-ink/80">
          {descriptionParagraphs.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
      )}

      <div className="mt-10 aspect-[16/9] w-full overflow-hidden rounded-2xl bg-lavender">
        {recipe.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={recipe.imageUrl} alt={recipe.title} className="h-full w-full object-cover" />
        ) : (
          <PlaceholderImage />
        )}
      </div>

      {/* 4. Recipe card */}
      <div className="mt-10 rounded-2xl border-2 border-plum/20 bg-white/60 p-6 sm:p-8">
        <h2 className="text-center font-display text-3xl text-plum">{recipe.title}</h2>

        {recipe.description && (
          <p className="mx-auto mt-3 max-w-xl text-center text-sm italic text-ink/70">{recipe.description}</p>
        )}

        {facts.length > 0 && (
          <dl className="mt-6 flex flex-wrap justify-center divide-x divide-plum/15 border-y border-plum/15 py-4">
            {facts.map((fact) => (
              <RecipeFact key={fact.label} label={fact.label} value={fact.value} />
            ))}
          </dl>
        )}

        {dietaryTags.length > 0 && (
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {dietaryTags.map((tag) => (
              <span key={tag} className="rounded-full bg-lavender px-3 py-1 text-xs font-semibold text-plum">
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="mt-8 grid grid-cols-1 gap-10 sm:grid-cols-2">
          <section>
            <h3 className="font-display text-xl text-plum">Ingredients</h3>
            {formattedIngredients.length > 0 ? (
              <IngredientChecklist ingredients={formattedIngredients} />
            ) : (
              <p className="mt-4 text-sm text-ink/60">No ingredients listed yet.</p>
            )}
          </section>

          <section>
            <h3 className="font-display text-xl text-plum">Instructions</h3>
            {recipe.instructions.length > 0 ? (
              <ol className="mt-4 flex list-none flex-col gap-5">
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

        {recipe.notes && (
          <section className="mt-10 border-t border-plum/15 pt-6">
            <h3 className="font-display text-xl text-plum">Notes</h3>
            <p className="mt-3 whitespace-pre-line text-ink/85">{recipe.notes}</p>
          </section>
        )}
      </div>

      {/* 5. Comments */}
      <CommentsSection recipeId={recipe.id} initialComments={comments} />
    </main>
  );
}
