import Link from "next/link";
import { getRecipes } from "../../lib/recipes";
import DeleteRecipeButton from "./DeleteRecipeButton";

export default async function AdminRecipesPage() {
  const recipes = await getRecipes();

  return (
    <main className="mx-auto max-w-5xl px-6 py-16 sm:px-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-4xl sm:text-5xl">Manage Recipes</h1>
        <Link
          href="/admin/recipes/new"
          className="rounded-full bg-plum px-5 py-2.5 text-sm font-semibold text-cream transition-opacity hover:opacity-90"
        >
          + Add New Recipe
        </Link>
      </div>

      {recipes.length === 0 ? (
        <p className="mt-10 text-ink/60">No recipes yet. Add your first one above.</p>
      ) : (
        <ul className="mt-10 flex flex-col divide-y divide-plum/10 border-t border-plum/10">
          {recipes.map((recipe) => (
            <li key={recipe.id} className="flex flex-wrap items-center justify-between gap-4 py-4">
              <div>
                <p className="font-display text-lg text-plum">{recipe.title}</p>
                <p className="text-sm text-ink/60">
                  {[recipe.cuisine, recipe.mealType].filter(Boolean).join(" · ") || "—"}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Link
                  href={`/recipes/${recipe.id}`}
                  className="rounded-full border border-plum/30 px-4 py-1.5 text-sm font-semibold text-plum transition-colors hover:bg-lavender"
                >
                  Edit
                </Link>
                <DeleteRecipeButton id={recipe.id} title={recipe.title} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
