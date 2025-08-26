'use client';

import React, { useState, useCallback } from 'react';
import { cn } from '@/utils/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ProjectImageCarouselProps {
  images: string[];
  projectName: string;
  slug: string;
  className?: string;
}

const ProjectImageCarousel: React.FC<ProjectImageCarouselProps> = ({
  images,
  projectName,
  slug,
  className,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Images are already filtered in the parent component
  const hasFinalImages = images.length > 0;

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  }, [images.length]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prevIndex) =>
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  }, [images.length]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        goToPrevious();
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        goToNext();
      }
    },
    [goToPrevious, goToNext]
  );

  // Handle empty or single image arrays
  if (!hasFinalImages) {
    return (
      <div
        className={cn(
          'relative flex h-64 w-full items-center justify-center rounded-lg bg-gray-100 md:h-96',
          className
        )}
      >
        <span className="text-lg text-gray-400">
          No hay imágenes disponibles
        </span>
      </div>
    );
  }

  if (images.length === 1) {
    return (
      <div className={cn('relative w-full', className)}>
        <img
          src={images[0]}
          alt={`Imagen de ${projectName}`}
          className="h-[80dvh] w-full rounded-lg object-cover"
        />
      </div>
    );
  }

  return (
    <div
      className={cn('group relative w-full', className)}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="region"
      aria-label={`Carrusel de imágenes de ${projectName}`}
    >
      {/* Main image container */}
      <div className="relative overflow-hidden rounded-lg">
        <img
          src={images[currentIndex]}
          alt={`Imagen ${currentIndex + 1} de ${projectName}`}
          className="h-[80dvh] w-full object-cover transition-opacity duration-300"
        />

        <div className="absolute inset-0 z-10 rounded-b-3xl bg-gradient-to-r from-black/35 via-transparent to-black/35"></div>

        {/* Navigation buttons */}
        <button
          onClick={goToPrevious}
          className="absolute top-1/2 left-4 z-20 flex h-8 w-8 -translate-y-1/2 cursor-pointer items-center justify-center focus:outline-none"
          aria-label="Imagen anterior"
        >
          <ChevronLeft className="h-6 w-6 text-white md:h-8 md:w-8" />
        </button>

        <button
          onClick={goToNext}
          className="absolute top-1/2 right-4 z-20 flex h-8 w-8 -translate-y-1/2 cursor-pointer items-center justify-center focus:outline-none"
          aria-label="Imagen siguiente"
        >
          <ChevronRight className="h-6 w-6 text-white md:h-8 md:w-8" />
        </button>

        {/* Image counter */}
        <div className="absolute right-4 bottom-4 z-10">
          <div className="rounded-full bg-black/10 px-3 py-1 text-sm font-medium text-white backdrop-blur-sm">
            {currentIndex + 1}/{images.length} imágenes
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectImageCarousel;
