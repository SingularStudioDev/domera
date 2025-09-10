import { ImageType } from "@/types/project-images";
import { ProjectImagesManager } from "@/lib/utils/project-images";
import { useProjectImages } from "@/hooks/useProjectImages";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { OptimizedImageUpload } from "@/components/image-upload";

interface ProjectMainImageDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  value: {
    images: string[];
    name: string;
  };
  onChange: (data: { images: string[] }) => void;
  onCardImageChange?: (files: File[]) => void;
  disabled?: boolean;
  projectId?: string;
}

export function ProjectMainImageDialog({
  isOpen,
  onOpenChange,
  value,
  onChange,
  onCardImageChange,
  disabled = false,
  projectId,
}: ProjectMainImageDialogProps) {
  const { cardImage } = useProjectImages(value.images);

  const handleMainImageChange = (imageUrls: string[], files: File[] = []) => {
    // New approach: work with ProjectImagesManager instead of direct index manipulation
    const imageManager = new ProjectImagesManager(value.images);

    if (imageUrls.length > 0) {
      // If there's already a card image, replace it
      if (imageManager.hasCardImage()) {
        const existingCardImage = imageManager.getCardImage();
        if (existingCardImage) {
          const updatedManager = imageManager
            .removeImage(existingCardImage.url, ImageType.CARD)
            .addImage(imageUrls[0], ImageType.CARD, 0, {
              isMain: true,
              uploadedAt: new Date().toISOString(),
              altText: "Imagen principal del proyecto",
            });
          onChange({ images: updatedManager.toArray() });
        }
      } else {
        // Add new card image
        const updatedManager = imageManager.addImage(
          imageUrls[0],
          ImageType.CARD,
          0,
          {
            isMain: true,
            uploadedAt: new Date().toISOString(),
            altText: "Imagen principal del proyecto",
          },
        );
        onChange({ images: updatedManager.toArray() });
      }
    } else {
      // Remove card image if exists
      if (imageManager.hasCardImage()) {
        const existingCardImage = imageManager.getCardImage();
        if (existingCardImage) {
          const updatedManager = imageManager.removeImage(
            existingCardImage.url,
            ImageType.CARD,
          );
          onChange({ images: updatedManager.toArray() });
        }
      }
    }

    // Also notify parent about file changes for deferred upload
    if (onCardImageChange && files.length > 0) {
      onCardImageChange(files);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] w-full max-w-4xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Imagen Principal del Proyecto</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div>
            <h4 className="text-md mb-3 font-medium">
              Seleccionar Imagen Principal
            </h4>
            <OptimizedImageUpload
              value={cardImage ? [cardImage.url] : []}
              onChange={handleMainImageChange}
              entityType="project"
              maxImages={1}
              placeholder="Seleccionar imagen principal"
              aspectRatio="aspect-video"
              disabled={disabled}
              showUploadButton={true}
              entityId={projectId}
              deferUpload={true}
            />
            <p className="mt-2 text-xs text-gray-500">
              Esta imagen aparecerá en las tarjetas de proyecto y será la imagen
              principal.
            </p>
          </div>

          <div>
            <h4 className="text-md mb-3 font-medium">
              Vista Previa en ProjectCard
            </h4>
            <div className="relative block overflow-hidden rounded-3xl border bg-white transition-shadow duration-300">
              <div className="group relative h-[300px] overflow-hidden">
                {cardImage ? (
                  <img
                    src={cardImage.url}
                    alt={
                      cardImage.metadata?.altText ||
                      value.name ||
                      "Vista previa"
                    }
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gray-200">
                    <div className="text-center text-gray-500">
                      <svg
                        className="mx-auto mb-2 h-12 w-12"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 002 2z"
                        />
                      </svg>
                      <p className="text-sm">No hay imagen seleccionada</p>
                    </div>
                  </div>
                )}

                <div className="absolute top-3 left-3 flex gap-2 text-black">
                  <span className="rounded-2xl bg-white px-4 py-1 text-lg shadow-sm">
                    Pre-venta
                  </span>
                  <span className="rounded-2xl bg-white px-4 py-1 text-lg shadow-sm">
                    2024
                  </span>
                </div>

                <div className="absolute bottom-0 flex w-full items-end gap-5">
                  <div className="relative flex w-full flex-col gap-2 bg-white py-3 pr-4 pl-6 text-black">
                    <h3 className="w-full bg-white text-2xl font-medium">
                      {value.name || "Nombre del Proyecto"}
                    </h3>
                    <p className="w-full bg-white text-lg">Desde: $XXX.XXX</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button type="button" onClick={() => onOpenChange(false)}>
            Guardar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
