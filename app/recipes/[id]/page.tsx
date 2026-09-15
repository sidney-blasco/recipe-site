import Link from "next/link";
import { notFound } from "next/navigation";
import { getRecipeById } from "../../lib/recipes";
import { getDietaryTags } from "../../lib/filters";
import { getCommentsForRecipe } from "../../lib/comments";
import { checkIsAdmin } from "../../lib/require-admin";
import CommentsSection from "./CommentsSection";
import EditableRecipe from "./EditableRecipe";

export default async function RecipePage(props: PageProps<"/recipes/[id]">) {
  const { id } = await props.params;
  const recipe = await getRecipeById(id);

  if (!recipe) {
    notFound();
  }

  const dietaryTags = getDietaryTags(recipe.tags);
  const comments = await getCommentsForRecipe(recipe.id);
  const isAdmin = await checkIsAdmin();

  const breadcrumbCategory = recipe.cuisine ?? recipe.mealType;
  const breadcrumbHref = recipe.cuisine
    ? `/?cuisine=${encodeURIComponent(recipe.cuisine)}`
    : recipe.mealType
      ? `/?type=${encodeURIComponent(recipe.mealType)}`
      : null;

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

      {/* 2-4. Title/byline, description, photo, and recipe card — inline-editable for admins */}
      <EditableRecipe recipe={recipe} dietaryTags={dietaryTags} isAdmin={isAdmin} />

      {/* 5. Comments */}
      <CommentsSection recipeId={recipe.id} initialComments={comments} />
    </main>
  );
}
