"use client";

import React, { useCallback, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OptimizedImageUpload } from "@/components/image-upload/OptimizedImageUpload";
import { UnitImagesManager } from "@/lib/utils/unit-images";
import { UnitImageType, UnitImageTypeValue } from "@/types/unit-images";
import { Camera, Image as ImageIcon, Star } from "lucide-react";

interface UnitImageUploadProps {
  value: string[];
  onChange: (urls: string[]) => void;
  onFilesChange?: (files: File[]) => void;
  onPathsChange?: (paths: string[]) => void;
  unitId?: string;
  disabled?: boolean;
  className?: string;
}

export const UnitImageUpload: React.FC<UnitImageUploadProps> = ({
  value = [],
  onChange,
  onFilesChange,
  onPathsChange,
  unitId,
  disabled = false,
  className,
}) => {
  // Inicializar el manager con las imágenes actuales usando useMemo
  const imagesManager = useMemo(() => new UnitImagesManager(value), [value]);
  const mainImages = useMemo(() => imagesManager.getImagesByType(UnitImageType.MAIN), [imagesManager]);
  const galleryImages = useMemo(() => imagesManager.getImagesByType(UnitImageType.GALLERY), [imagesManager]);

  const handleImageChange = useCallback(
    (urls: string[], type: UnitImageTypeValue) => {
      try {
        let updatedManager = imagesManager;

        // Remover todas las imágenes del tipo actual
        const currentImages = imagesManager.getImagesByType(type);
        for (const image of currentImages) {
          updatedManager = updatedManager.removeImage(image.url, type);
        }

        // Agregar las nuevas imágenes del tipo especificado
        for (let i = 0; i < urls.length; i++) {
          const url = urls[i];
          updatedManager = updatedManager.addImage(url, type, i);
        }

        // Actualizar el array de URLs en el formato esperado
        const updatedUrls = updatedManager.toLegacyStringArray();
        onChange(updatedUrls);
      } catch (error) {
        console.error('Error updating images:', error);
      }
    },
    [imagesManager, onChange]
  );

  const handleMainImageChange = useCallback(
    (urls: string[]) => {
      handleImageChange(urls, UnitImageType.MAIN);
    },
    [handleImageChange]
  );

  const handleGalleryImageChange = useCallback(
    (urls: string[]) => {
      handleImageChange(urls, UnitImageType.GALLERY);
    },
    [handleImageChange]
  );

  const setAsMainImage = useCallback(
    (url: string) => {
      try {
        const updatedManager = imagesManager.setMainImage(url);
        const updatedUrls = updatedManager.toLegacyStringArray();
        onChange(updatedUrls);
      } catch (error) {
        console.error('Error setting main image:', error);
      }
    },
    [imagesManager, onChange]
  );

  return (
    <div className={className}>
      <div className="space-y-6">
        {/* Imagen Principal */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Star className="h-5 w-5 text-yellow-500" />
              Imagen Principal
              <Badge variant="secondary" className="ml-auto">
                {mainImages.length}/1
              </Badge>
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Esta será la imagen principal que se mostrará en las tarjetas y vista de la unidad.
            </p>
          </CardHeader>
          <CardContent>
            <OptimizedImageUpload
              value={mainImages.map(img => img.url)}
              onChange={handleMainImageChange}
              onFilesChange={onFilesChange}
              onPathsChange={onPathsChange}
              entityType="unit"
              entityId={unitId}
              maxImages={1}
              placeholder="Seleccionar imagen principal de la unidad"
              aspectRatio="aspect-[4/3]"
              disabled={disabled}
              showUploadButton={true}
              deferUpload={false}
            />
          </CardContent>
        </Card>

        {/* Galería de Imágenes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <ImageIcon className="h-5 w-5 text-blue-500" />
              Galería de Imágenes
              <Badge variant="secondary" className="ml-auto">
                {galleryImages.length}/20
              </Badge>
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Imágenes adicionales que se mostrarán en la galería de la unidad. Estas imágenes se pueden reordenar.
            </p>
          </CardHeader>
          <CardContent>
            <OptimizedImageUpload
              value={galleryImages.map(img => img.url)}
              onChange={handleGalleryImageChange}
              onFilesChange={onFilesChange}
              onPathsChange={onPathsChange}
              entityType="unit"
              entityId={unitId}
              maxImages={20}
              placeholder="Seleccionar imágenes para la galería"
              aspectRatio="aspect-[4/3]"
              disabled={disabled}
              showUploadButton={true}
              deferUpload={false}
            />
            
            {/* Opciones adicionales para imágenes de galería */}
            {galleryImages.length > 0 && (
              <div className="mt-4 space-y-2">
                <p className="text-sm font-medium text-gray-700">Acciones rápidas:</p>
                <div className="flex flex-wrap gap-2">
                  {galleryImages.slice(0, 3).map((image, index) => (
                    <Button
                      key={image.url}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setAsMainImage(image.url)}
                      disabled={disabled}
                      className="text-xs"
                    >
                      <Camera className="h-3 w-3 mr-1" />
                      Usar imagen {index + 1} como principal
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Resumen */}
        {(mainImages.length > 0 || galleryImages.length > 0) && (
          <Card className="bg-muted/50">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between text-sm">
                <span>Total de imágenes: {mainImages.length + galleryImages.length}</span>
                <div className="flex gap-4">
                  <span>Principal: {mainImages.length}</span>
                  <span>Galería: {galleryImages.length}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};