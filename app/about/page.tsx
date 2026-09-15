import Link from "next/link";
import RecipeCard from "../components/RecipeCard";
import { getRecipes, placeholderRecipes, pickFeaturedRecipes } from "../lib/recipes";
import { getAboutContent } from "../lib/about";
import { checkIsAdmin } from "../lib/require-admin";
import EditableAbout from "./EditableAbout";

const FEATURED_LIMIT = 6;

export default async function AboutPage() {
  const recipes = await getRecipes();
  const cards = recipes.length > 0 ? recipes : placeholderRecipes;
  const featured = pickFeaturedRecipes(cards, FEATURED_LIMIT);
  const about = await getAboutContent();
  const isAdmin = await checkIsAdmin();

  return (
    <main className="mx-auto max-w-5xl px-6 pb-24 pt-16 sm:px-8">
      <h1 className="text-4xl sm:text-5xl">About</h1>

      <EditableAbout about={about} isAdmin={isAdmin} />

      <section className="mt-20">
        <h2 className="font-display text-3xl text-plum">Favorites</h2>
        <p className="mt-2 text-ink/70">A handful of the recipes I keep coming back to.</p>

        {featured.length > 0 ? (
          <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-2 xl:grid-cols-3">
            {featured.map((recipe) => {
              const card = (
                <RecipeCard
                  title={recipe.title}
                  category={recipe.cuisine ?? recipe.mealType ?? "Recipe"}
                  imageUrl={recipe.imageUrl}
                />
              );
              return recipes.length > 0 ? (
                <Link key={recipe.id} href={`/recipes/${recipe.id}`}>
                  {card}
                </Link>
              ) : (
                <div key={recipe.id}>{card}</div>
              );
            })}
          </div>
        ) : (
          <div className="mt-8 rounded-2xl border border-dashed border-plum/20 px-6 py-16 text-center">
            <p className="text-lg text-plum">No favorites yet.</p>
            <p className="mt-2 text-sm text-ink/60">Add some recipes and your favorites will show up here.</p>
          </div>
        )}
      </section>
    </main>
  );
}
