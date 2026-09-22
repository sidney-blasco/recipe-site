import RecipeForm from "../RecipeForm";
import { createRecipe } from "../actions";
import { getRecipeOptions } from "../../../lib/recipes";

export default async function NewRecipePage() {
  const recipeOptions = await getRecipeOptions();

  return (
    <main className="mx-auto max-w-3xl px-6 py-16 sm:px-8">
      <h1 className="text-4xl sm:text-5xl">Add New Recipe</h1>
      <div className="mt-10">
        <RecipeForm formAction={createRecipe} submitLabel="Create Recipe" recipeOptions={recipeOptions} />
      </div>
    </main>
  );
}
