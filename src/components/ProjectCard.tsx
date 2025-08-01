'use client';

import { Heart, StarIcon } from 'lucide-react';
import { useState } from 'react';
import Image from 'next/image';

interface ProjectCardProps {
  id: string;
  title: string;
  price: string;
  image: string;
  status: string;
  date: string;
  isFavorite?: boolean;
}

const ProjectCard = ({
  title,
  price,
  image,
  status,
  date,
  isFavorite = false,
}: ProjectCardProps) => {
  const [favorite, setFavorite] = useState(isFavorite);

  return (
    <div className="relative overflow-hidden rounded-3xl bg-white shadow-md transition-shadow duration-300 hover:shadow-xl">
      {/* Image */}
      <div className="relative h-[547px] overflow-hidden">
        <img src={image} alt={title} className="h-full w-full object-cover" />

        {/* Status Badge */}
        <div className="absolute top-3 left-3 flex gap-2">
          <span className="rounded-2xl bg-white px-6 py-2 text-lg text-black">
            {status}
          </span>

          <span className="rounded-2xl bg-white px-6 py-2 text-lg text-black">
            {date}
          </span>
        </div>

        {/* Top Right Icons */}
        <div className="absolute top-3 right-3 flex flex-col space-y-2">
          <img src="/Frame-1.png" alt="heart" className="h-full w-38" />
        </div>

        <div className="absolute right-6 bottom-3 left-3 flex w-full items-end gap-5">
          <div className="flex w-[calc(100%-100px)] max-w-[400px] flex-col gap-2 rounded-2xl bg-white px-6 py-2">
            <span className="text-3xl font-medium text-black">{title}</span>

            <span className="text-xl text-black">Desde: {price}</span>
          </div>

          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white">
            <StarIcon className="h-7 w-7 text-black" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
