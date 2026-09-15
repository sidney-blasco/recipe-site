import PhotoGallery from "../components/PhotoGallery";
import { getPhotos, placeholderPhotos } from "../lib/photos";

export default async function PhotosPage() {
  const photos = await getPhotos();
  const cards = photos.length > 0 ? photos : placeholderPhotos;

  return (
    <main className="mx-auto max-w-5xl px-6 pb-24 pt-16 sm:px-8">
      <div className="text-center">
        <h1 className="text-4xl sm:text-5xl">Photos</h1>
        <p className="mt-4 text-lg text-ink/80">
          A mix of what&apos;s cooking and what&apos;s happening behind the scenes.
        </p>
      </div>

      <div className="mt-14">
        <PhotoGallery photos={cards} />
      </div>
    </main>
  );
}
