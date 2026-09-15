export type Photo = {
  id: string;
  src: string | null;
  alt: string;
};

// Placeholder gallery — mixes food shots and behind-the-scenes photos with no
// distinction in the data model. Swap `src` in for a real image URL per photo
// whenever you have one; until then each renders a placeholder tile.
export const placeholderPhotos: Photo[] = Array.from({ length: 10 }, (_, index) => ({
  id: `placeholder-photo-${index + 1}`,
  src: null,
  alt: `Placeholder photo ${index + 1}`,
}));
