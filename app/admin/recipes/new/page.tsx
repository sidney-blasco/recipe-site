import RecipeForm from "../RecipeForm";
import { createRecipe } from "../actions";

export default function NewRecipePage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16 sm:px-8">
      <h1 className="text-4xl sm:text-5xl">Add New Recipe</h1>
      <div className="mt-10">
        <RecipeForm formAction={createRecipe} submitLabel="Create Recipe" />
      </div>
    </main>
  );
}
