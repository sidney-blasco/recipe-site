import PageHeader from "../components/PageHeader";
import PhotoGallery from "../components/PhotoGallery";
import { getPhotos, placeholderPhotos } from "../lib/photos";

export default async function PhotosPage() {
  const photos = await getPhotos();
  const cards = photos.length > 0 ? photos : placeholderPhotos;

  return (
    <main className="page pb-16">
      <PageHeader
        title="Photos"
        dek={<>A mix of what&apos;s cooking and what&apos;s happening behind the scenes.</>}
      />

      <div className="mt-12">
        <PhotoGallery photos={cards} />
      </div>
    </main>
  );
}
