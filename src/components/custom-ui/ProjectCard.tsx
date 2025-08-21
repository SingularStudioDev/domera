'use client';

import { 
  Heart, 
  StarIcon, 
  Car, 
  Home, 
  Bed, 
  Building2,
  Store 
} from 'lucide-react';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface ProjectFeature {
  name: string;
  hasFeature: boolean;
}

interface ProjectCardProps {
  id: string;
  title: string;
  price: string;
  image: string;
  status: string;
  date: string;
  isFavorite?: boolean;
  features?: ProjectFeature[];
}

const ProjectCard = ({
  id,
  title,
  price,
  image,
  status,
  date,
  isFavorite = false,
  features = [],
}: ProjectCardProps) => {
  const [favorite, setFavorite] = useState(isFavorite);

  const getFeatureIcon = (featureName: string) => {
    const iconProps = { size: 16, className: "text-gray-600" };
    
    switch (featureName) {
      case 'parking':
        return <Car {...iconProps} />;
      case 'studio':
        return <Home {...iconProps} />;
      case '1_bedroom':
      case '2_bedroom':
      case '3_bedroom':
      case '4_bedroom':
      case '5_bedroom':
        return <Bed {...iconProps} />;
      case 'commercial':
        return <Store {...iconProps} />;
      default:
        return <Building2 {...iconProps} />;
    }
  };

  return (
    <Link
      href={`/projects/${id}`}
      className="relative block overflow-hidden rounded-3xl bg-white shadow-md transition-shadow duration-300 hover:shadow-xl"
    >
      {/* Image */}
      <div className="group relative h-[567px] overflow-hidden md:h-[547px]">
        <img src={image} alt={title} className="h-full w-full object-cover" />

        {/* Status Badge */}
        <div className="group-hover:text-primaryColor absolute top-3 left-3 flex gap-2 text-black transition duration-300">
          <span className="rounded-2xl bg-white px-6 py-2 text-lg">
            {status}
          </span>

          <span className="rounded-2xl bg-white px-6 py-2 text-lg">{date}</span>
        </div>

        {/* Top Right Icons */}
        <div className="absolute top-3 right-3 flex flex-col space-y-2">
           {/* Features */}
           {features.length > 0 && (
              <div className="mt-2 flex flex-col flex-wrap gap-2">
                {features.map((feature) => (
                  <div
                    key={feature.name}
                    className={`flex h-8 w-8 items-center justify-center rounded-full ${
                      feature.hasFeature 
                    ? 'bg-white border-2 border-white' 
                        : 'bg-gray-300 border-2 border-gray-300'
                    }`}
                    title={feature.name}
                  >
                    {getFeatureIcon(feature.name)}
                  </div>
                ))}
              </div>
            )}
        </div>

        <div className="absolute right-6 bottom-3 left-3 flex w-full items-end gap-5">
          <div className="relative flex w-[calc(100%-100px)] max-w-[400px] flex-col">
            {/* Bloque superior con curva hacia la derecha */}
            <span className="group-hover:text-primaryColor relative w-fit rounded-t-2xl bg-white px-3 py-2 text-3xl font-medium text-black transition duration-300">
              {title.length > 12 ? `${title.slice(0, 12)}...` : title}

              <svg
                className="absolute -right-5 -bottom-[1px] h-[20px] w-[20px]"
                width="160"
                height="160"
                viewBox="0 0 160 160"
                xmlns="http://www.w3.org/2000/svg"
                preserveAspectRatio="none"
              >
                <path d="M0 0 Q2 160 160 160 H0 Z" fill="#FFF" />
              </svg>
            </span>

            {/* Bloque inferior */}
            <span className="group-hover:text-primaryColor w-fit min-w-[280px] rounded-tr-2xl rounded-b-2xl bg-white px-3 py-2 text-xl text-black transition duration-300">
              Desde: {price}
            </span>
          </div>

          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white">
            <StarIcon className="group-hover:text-primaryColor h-7 w-7 text-black transition duration-300" />
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProjectCard;
