import { notFound } from "next/navigation";
import RecipeForm from "../../RecipeForm";
import { updateRecipe } from "../../actions";
import { getRecipeById } from "../../../../lib/recipes";
import { classifyTags } from "../../../../lib/filters";

export default async function EditRecipePage(props: PageProps<"/admin/recipes/[id]/edit">) {
  const { id } = await props.params;
  const recipe = await getRecipeById(id);

  if (!recipe) {
    notFound();
  }

  const { dietary, occasion, seasonal, skillLevel } = classifyTags(recipe.tags);
  const boundUpdate = updateRecipe.bind(null, recipe.id);

  return (
    <main className="mx-auto max-w-3xl px-6 py-16 sm:px-8">
      <h1 className="text-4xl sm:text-5xl">Edit Recipe</h1>
      <div className="mt-10">
        <RecipeForm
          formAction={boundUpdate}
          submitLabel="Save Changes"
          initial={{
            title: recipe.title,
            cuisine: recipe.cuisine ?? "",
            mealType: recipe.mealType ?? "",
            dietary,
            occasion,
            seasonal,
            skillLevel: skillLevel ?? "",
            ingredients: recipe.ingredients,
            instructions: recipe.instructions,
            imageUrl: recipe.imageUrl,
            description: recipe.description ?? "",
            prepTime: recipe.prepTime ?? "",
            cookTime: recipe.cookTime ?? "",
            totalTime: recipe.totalTime ?? "",
            servings: recipe.servings ?? "",
            notes: recipe.notes ?? "",
          }}
        />
      </div>
    </main>
  );
}
