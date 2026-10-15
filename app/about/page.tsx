import Link from "next/link";
import { Sprig } from "../components/Ornaments";
import PageHeader from "../components/PageHeader";
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
    <main className="page pb-16">
      <PageHeader title="About" />

      <EditableAbout about={about} isAdmin={isAdmin} />

      <Sprig className="my-12" />

      <section>
        <h2 className="m-0 text-h2 leading-[1.1]">Favorites</h2>
        <p className="mt-1 mb-0 max-w-measure italic text-ink-faded">A handful of the recipes I keep coming back to.</p>

        {featured.length > 0 ? (
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {featured.map((recipe) => {
              const card = (
                <RecipeCard
                  title={recipe.title}
                  category={recipe.cuisine ?? recipe.mealType ?? "Recipe"}
                  imageUrl={recipe.imageUrl}
                />
              );
              return recipes.length > 0 ? (
                <Link key={recipe.id} href={`/recipes/${recipe.id}`} className="block rounded-panel no-underline">
                  {card}
                </Link>
              ) : (
                <div key={recipe.id}>{card}</div>
              );
            })}
          </div>
        ) : (
          <div className="panel mt-8 bg-stone text-center">
            <p className="display-it m-0 text-h4 text-ink">No favorites yet.</p>
            <p className="mt-2 mb-0 text-small italic text-ink-faded">Add some recipes and your favorites will show up here.</p>
          </div>
        )}
      </section>
    </main>
  );
}
