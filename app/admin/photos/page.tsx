import { getPhotos } from "../../lib/photos";
import UploadPhotosForm from "./UploadPhotosForm";
import DeletePhotoButton from "./DeletePhotoButton";

export default async function AdminPhotosPage() {
  const photos = await getPhotos();

  return (
    <main className="mx-auto max-w-5xl px-6 py-16 sm:px-8">
      <h1 className="text-4xl sm:text-5xl">Manage Photos</h1>
      <p className="mt-4 text-ink/70">
        Upload new photos to the gallery, or remove ones you no longer want shown.
      </p>

      <div className="mt-8 rounded-2xl border border-plum/15 bg-white/60 p-6">
        <UploadPhotosForm />
      </div>

      {photos.length === 0 ? (
        <p className="mt-10 text-ink/60">No photos yet. Upload your first one above.</p>
      ) : (
        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {photos.map((photo) => (
            <div key={photo.id} className="flex flex-col gap-2">
              <div className="aspect-square w-full overflow-hidden rounded-2xl bg-lavender">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photo.src ?? undefined} alt={photo.alt} className="h-full w-full object-cover" />
              </div>
              <DeletePhotoButton id={photo.id} url={photo.src ?? ""} alt={photo.alt} />
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
