interface UnitGalleryProps {
  images: string[];
  unitNumber: string;
}

export default function UnitGallery({ images, unitNumber }: UnitGalleryProps) {
  return (
    <div className="container mx-auto mb-16">
      <h3 className="mb-6 text-3xl font-bold text-black">Galería</h3>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {images.slice(1).map((image, index) => (
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
