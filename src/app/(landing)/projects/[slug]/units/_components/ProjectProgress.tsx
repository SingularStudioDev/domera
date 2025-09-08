"use client";

import { useState } from "react";

import { ChevronLeft, ChevronRight } from "lucide-react";

import { useImageParser } from "@/hooks/useJsonArrayParser";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";

interface ProjectProgressProps {
  progressImages: string[] | string;
}

export default function ProjectProgress({
  progressImages,
}: ProjectProgressProps) {
  const { images, hasImages, imageCount } = useImageParser(progressImages);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Función para obtener las 3 imágenes visibles basadas en el índice actual
  const getVisibleImages = () => {
    if (images.length <= 3) {
      // Si hay 3 o menos imágenes, mostrar todas
      return images;
    }

    const visibleImages = [];
    for (let i = 0; i < 3; i++) {
      const imageIndex = (currentIndex + i) % images.length;
      visibleImages.push(images[imageIndex]);
    }
    return visibleImages;
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  if (!hasImages) {
    return (
      <div className="py-4 md:py-0">
        <h3 className="mb-1 text-3xl font-semibold text-black md:mb-2">
          Avances de obra
        </h3>
        <div className="flex h-[200px] items-center justify-center rounded-2xl bg-gray-100">
          <span className="text-gray-400">
            No hay imágenes de progreso disponibles
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="py-4 md:py-0">
      <h3 className="mb-1 text-3xl font-semibold text-black md:mb-2">
        Avances de obra
      </h3>

      {/* Vista móvil: Carrusel individual */}
      <div className="md:hidden">
        <Carousel
          opts={{
            align: "start",
            loop: false,
          }}
          className="w-full max-w-sm"
        >
          <CarouselContent>
            {images.map((img, index) => (
              <CarouselItem key={index} className="w-full">
                <div className="p-1">
                  <img
                    src={img}
                    alt={`Avance ${index + 1}`}
                    className="h-[40dvh] w-full rounded-2xl object-cover"
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>

      {/* Vista desktop: 3 imágenes visibles con navegación de una en una */}
      <div className="hidden md:block">
        {images.length <= 3 ? (
          // Si hay 3 o menos imágenes, mostrar todas sin navegación
          <div className="grid grid-cols-3 gap-2">
            {images.map((img, index) => (
              <div key={index} className="relative aspect-square">
                <img
                  src={img}
                  alt={`Avance ${index + 1}`}
                  className="h-[40dvh] w-full rounded-2xl object-cover"
                />
              </div>
            ))}
          </div>
        ) : (
          // Si hay más de 3 imágenes, mostrar 3 con navegación
          <div className="relative">
            <div className="grid grid-cols-3 gap-2">
              {getVisibleImages().map((img, index) => {
                const actualIndex = (currentIndex + index) % images.length;
                return (
                  <div key={actualIndex} className="relative aspect-square">
                    <img
                      src={img}
                      alt={`Avance ${actualIndex + 1}`}
                      className="h-[40dvh] w-full rounded-2xl object-cover"
                    />
                  </div>
                );
              })}
            </div>

            {/* Controles de navegación */}
            <button
              onClick={goToPrevious}
              className="absolute top-1/2 left-[-50px] flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-md hover:bg-gray-50"
              aria-label="Imagen anterior"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <button
              onClick={goToNext}
              className="absolute top-1/2 right-[-50px] flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-md hover:bg-gray-50"
              aria-label="Imagen siguiente"
            >
              <ChevronRight className="h-5 w-5" />
            </button>

            {/* Indicadores - uno por cada imagen */}
            <div className="mt-4 flex justify-center space-x-2">
              {images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`h-2 w-2 rounded-full ${
                    index === currentIndex ? "bg-black" : "bg-gray-300"
                  }`}
                  aria-label={`Ir a imagen ${index + 1}`}
                />
              ))}
            </div>

            {/* Contador */}
            <div className="mt-2 text-center text-sm text-gray-500">
              Mostrando imagen {currentIndex + 1} de {imageCount} (3 visibles)
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
