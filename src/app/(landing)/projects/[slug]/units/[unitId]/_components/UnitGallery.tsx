interface UnitGalleryProps {
  images: string[];
  unitNumber: string;
}

export default function UnitGallery({ images, unitNumber }: UnitGalleryProps) {
  // Filter out the first image (which is typically used as the main display image)
  // This maintains the existing behavior while being more explicit
  const galleryImages = images.length > 1 ? images.slice(1) : [];
  
  if (galleryImages.length === 0) {
    return null;
  }

  return (
    <div className="container mx-auto my-18">
      <h3 className="mb-6 text-3xl font-bold text-black">Galería</h3>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {galleryImages.map((image, index) => (
          <img
            key={index}
            src={image}
            alt={`Unidad ${unitNumber} - Imagen ${index + 2}`}
            className="h-64 w-full rounded-lg object-cover"
          />
        ))}
      </div>
    </div>
  );
}
