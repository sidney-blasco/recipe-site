import Link from "next/link";
import { notFound } from "next/navigation";
import { getRecipeById, getRecipeOptions, getRecipeVariations } from "../../lib/recipes";
import { getDietaryTags } from "../../lib/filters";
import { getCommentsForRecipe } from "../../lib/comments";
import { checkIsAdmin } from "../../lib/require-admin";
import CommentsSection from "./CommentsSection";
import EditableRecipe from "./EditableRecipe";
import RecipeVariations from "./RecipeVariations";

export default async function RecipePage(props: PageProps<"/recipes/[id]">) {
  const { id } = await props.params;
  const recipe = await getRecipeById(id);

  if (!recipe) {
    notFound();
  }

  const dietaryTags = getDietaryTags(recipe.tags);
  const comments = await getCommentsForRecipe(recipe.id);
  const isAdmin = await checkIsAdmin();
  const recipeOptions = isAdmin ? (await getRecipeOptions()).filter((option) => option.id !== recipe.id) : [];
  const variations = await getRecipeVariations(recipe.id);
  const hasVariations = variations.length > 0;

  const breadcrumbCategory = recipe.cuisine ?? recipe.mealType;
  const breadcrumbHref = recipe.cuisine
    ? `/?cuisine=${encodeURIComponent(recipe.cuisine)}`
    : recipe.mealType
      ? `/?type=${encodeURIComponent(recipe.mealType)}`
      : null;

  const crumbLink = "no-underline decoration-wine/40 underline-offset-4 hover:text-wine hover:underline";

  return (
    <main className="page pt-6 pb-16">
      <div className={hasVariations ? "lg:flex lg:items-start lg:gap-10" : "mx-auto max-w-[54rem]"}>
        <div className="min-w-0 lg:flex-1">
          {/* 1. Breadcrumb */}
          <nav aria-label="Breadcrumb" className="sc flex flex-wrap items-center justify-center gap-1.5">
            <Link href="/" className={`text-ink-faded ${crumbLink}`}>
              Recipes
            </Link>
            {breadcrumbCategory && (
              <>
                <span aria-hidden="true">›</span>
                {breadcrumbHref ? (
                  <Link href={breadcrumbHref} className={`text-ink-faded ${crumbLink}`}>
                    {breadcrumbCategory}
                  </Link>
                ) : (
                  <span>{breadcrumbCategory}</span>
                )}
              </>
            )}
            <span aria-hidden="true">›</span>
            <span className="text-ink">{recipe.title}</span>
          </nav>

          {/* 2-4. Title/byline, description, photo, and recipe card — inline-editable for admins */}
          <EditableRecipe recipe={recipe} dietaryTags={dietaryTags} isAdmin={isAdmin} recipeOptions={recipeOptions} />

          {/* 5. Comments */}
          <CommentsSection recipeId={recipe.id} initialComments={comments} />
        </div>

        {/* 6. Variations — other recipes based on this one */}
        {hasVariations && <RecipeVariations variations={variations} />}
      </div>
    </main>
  );
}
