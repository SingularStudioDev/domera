"use client";

import React, { useCallback, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OptimizedImageUpload } from "@/components/image-upload/OptimizedImageUpload";
import { Camera, Image as ImageIcon, Star } from "lucide-react";

interface UnitImageUploadProps {
  value: string[];
  onChange: (urls: string[]) => void;
  onFilesChange?: (files: File[]) => void;
  onPathsChange?: (paths: string[]) => void;
  onMainImageChange?: (mainImageUrl: string | undefined) => void;
  unitId?: string;
  disabled?: boolean;
  className?: string;
  deferUpload?: boolean;
}

export const UnitImageUpload: React.FC<UnitImageUploadProps> = ({
  value = [],
  onChange,
  onFilesChange,
  onPathsChange,
  onMainImageChange,
  unitId,
  disabled = false,
  className,
  deferUpload = false,
}) => {
  const handleImageChange = useCallback(
    (urls: string[]) => {
      // Simple approach: just update the images array directly without complex management
      onChange(urls);
    },
    [onChange]
  );

  // Track which image is selected as main (by index, not by reordering)
  const [mainImageIndex, setMainImageIndex] = useState(0);

  const setAsMainImage = useCallback(
    (url: string) => {
      const index = value.findIndex(imageUrl => imageUrl === url);
      if (index !== -1) {
        setMainImageIndex(index);
        // Notify parent component about the main image change
        if (onMainImageChange) {
          onMainImageChange(url);
        }
      }
    },
    [value, onMainImageChange]
  );

  return (
    <div className={className}>
      {/* Galería de Imágenes Unificada */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <ImageIcon className="h-5 w-5 text-blue-500" />
            Imágenes de la Unidad
            <Badge variant="secondary" className="ml-auto">
              {value.length}/20
            </Badge>
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Sube todas las imágenes de la unidad. Puedes seleccionar cuál será la imagen principal usando las acciones rápidas.
          </p>
        </CardHeader>
        <CardContent>
          <OptimizedImageUpload
            value={value}
            onChange={handleImageChange}
            onFilesChange={onFilesChange}
            onPathsChange={onPathsChange}
            entityType="unit"
            entityId={unitId}
            maxImages={20}
            placeholder="Seleccionar imágenes de la unidad"
            aspectRatio="aspect-[4/3]"
            disabled={disabled}
            showUploadButton={true}
            deferUpload={deferUpload}
            mainImageUrl={value.length > mainImageIndex ? value[mainImageIndex] : undefined}
          />

          {/* Opciones para seleccionar imagen principal */}
          {value.length > 0 && (
            <div className="mt-4 space-y-2">
              <p className="text-sm font-medium text-gray-700">
                <Star className="h-4 w-4 inline mr-1 text-yellow-500" />
                Seleccionar imagen principal:
              </p>
              <div className="flex flex-wrap gap-2">
                {value.slice(0, 5).map((imageUrl, index) => (
                  <Button
                    key={imageUrl}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setAsMainImage(imageUrl)}
                    disabled={disabled}
                    className="text-xs"
                  >
                    <Camera className="h-3 w-3 mr-1" />
                    Imagen {index + 1}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resumen */}
      {value.length > 0 && (
        <Card className="bg-muted/50 mt-4">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between text-sm">
              <span>Total de imágenes: {value.length}</span>
              <div className="flex gap-4">
                <span>Principal: {value.length > 0 ? 1 : 0}</span>
                <span>Galería: {value.length > 1 ? value.length - 1 : 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};