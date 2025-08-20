import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from '@/components/ui/carousel';

interface ProjectProgressProps {
  progressImages: string[];
}

export default function ProjectProgress({
  progressImages,
}: ProjectProgressProps) {
  return (
    <div className="py-4 md:py-0">
      <h3 className="mb-1 text-3xl font-semibold text-black md:mb-2">
        Avances de obra
      </h3>
      <p className="mb-6">Agosto 2025</p>

      <div className="md:hidden">
        <Carousel
          opts={{
            align: 'start',
            loop: false,
          }}
          className="w-full max-w-sm"
        >
          <CarouselContent>
            {progressImages.map((img, index) => (
              <CarouselItem key={index} className="w-full">
                <div className="p-1">
                  <img
                    src={img}
                    alt={`Avance ${index + 1}`}
                    className="h-[200px] w-full rounded-2xl object-cover"
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>

      <div className="hidden md:grid md:grid-cols-3 md:gap-2">
        {progressImages.map((img, index) => (
          <div key={index} className="relative aspect-square">
            <img
              src={img}
              alt={`Avance ${index + 1}`}
              className="max-h-[300px] w-full rounded-2xl object-cover"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
