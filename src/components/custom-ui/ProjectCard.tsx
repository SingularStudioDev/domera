'use client';

import { Heart, StarIcon } from 'lucide-react';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

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
  id,
  title,
  price,
  image,
  status,
  date,
  isFavorite = false,
}: ProjectCardProps) => {
  const [favorite, setFavorite] = useState(isFavorite);

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
          <img
            src="/Frame-1.png"
            alt="heart"
            className="h-full w-38 transition duration-300 group-hover:hidden"
          />
          <img
            src="/Frame-2.png"
            alt="heart"
            className="hidden h-full w-38 transition duration-300 group-hover:block"
          />
        </div>

        <div className="absolute right-6 bottom-3 left-3 flex w-full items-end gap-5">
          <div className="relative flex w-[calc(100%-100px)] max-w-[400px] flex-col">
            {/* Bloque superior con curva hacia la derecha */}
            <span className="group-hover:text-primaryColor relative w-fit rounded-t-2xl bg-white px-3 py-2 text-3xl font-medium text-black transition duration-300">
              {title}

              <svg
                className="absolute -right-5 -bottom-[1px] h-[20px] w-[20px]"
                width="160"
                height="160"
                viewBox="0 0 160 160"
                xmlns="http://www.w3.org/2000/svg"
                preserveAspectRatio="none"
              >
                <path
                  d="
    M0 0
    Q2 160 160 160
    H0
    Z
  "
                  fill="#FFF"
                />
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
