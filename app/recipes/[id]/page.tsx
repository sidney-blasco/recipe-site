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

  return (
    <main className={`mx-auto px-6 pb-24 pt-12 sm:px-8 ${hasVariations ? "max-w-6xl" : "max-w-3xl"}`}>
      <div className={hasVariations ? "lg:flex lg:items-start lg:gap-10" : ""}>
        <div className={hasVariations ? "min-w-0 lg:max-w-3xl lg:flex-1" : ""}>
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
