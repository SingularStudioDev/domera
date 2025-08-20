import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowLeft,
  BedIcon,
  ShowerHeadIcon,
  RulerIcon,
  CompassIcon,
} from 'lucide-react';

interface Unit {
  id: string;
  title: string;
  description: string;
  bedrooms: number;
  bathrooms: number;
  area: string;
  orientation: string;
  price: string;
  type: string;
  image: string;
  available: boolean;
  statusIcon: boolean | string;
}

interface UnitCardProps {
  unit: Unit;
  projectId: string;
}

export default function UnitCard({ unit, projectId }: UnitCardProps) {
  return (
    <div className="group hover:border-primaryColor overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition duration-300">
      <div className="relative">
        <Image
          src={unit.image}
          alt={unit.title}
          width={414}
          height={267}
          className="h-64 w-full rounded-t-2xl object-cover"
        />
        <div className="absolute top-3 left-3 flex gap-2">
          <span className="flex items-center justify-center rounded-2xl bg-gray-200 px-4 py-2 text-sm font-medium text-black">
            {unit.type}
          </span>
          <span className="rounded-2xl bg-gray-200 px-4 py-2 text-sm font-medium text-black">
            {unit.statusIcon ? (
              <svg
                width="26"
                height="25"
                viewBox="0 0 26 25"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M14.3125 0.84375L17.3594 7.07812L24.0625 8.0625C24.625 8.15625 25.0938 8.53125 25.2812 9.09375C25.4688 9.60938 25.3281 10.2188 24.9062 10.5938L20.0312 15.4219L21.2031 22.2656C21.2969 22.8281 21.0625 23.3906 20.5938 23.7188C20.125 24.0938 19.5156 24.0938 19 23.8594L13 20.625L6.95312 23.8594C6.48438 24.0938 5.875 24.0938 5.40625 23.7188C4.9375 23.3906 4.70312 22.8281 4.79688 22.2656L5.92188 15.4219L1.04688 10.5938C0.671875 10.2188 0.53125 9.60938 0.671875 9.09375C0.859375 8.53125 1.32812 8.15625 1.89062 8.0625L8.64062 7.07812L11.6406 0.84375C11.875 0.328125 12.3906 0 13 0C13.5625 0 14.0781 0.328125 14.3125 0.84375Z"
                  fill="#0040FF"
                />
              </svg>
            ) : (
              <svg
                width="26"
                height="25"
                viewBox="0 0 26 25"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12.9531 0C13.4219 0 13.7969 0.28125 13.9844 0.65625L17.2188 7.26562L24.3906 8.34375C24.8125 8.39062 25.1406 8.71875 25.2812 9.09375C25.4219 9.51562 25.3281 9.9375 25 10.2656L19.7969 15.4219L21.0156 22.6875C21.1094 23.1094 20.9219 23.5781 20.5938 23.8125C20.2188 24.0469 19.75 24.0938 19.375 23.9062L12.9531 20.4375L6.53125 23.9062C6.15625 24.0938 5.73438 24.0469 5.35938 23.8125C5.03125 23.5781 4.84375 23.1094 4.89062 22.6875L6.15625 15.4219L0.953125 10.2656C0.625 9.9375 0.53125 9.51562 0.671875 9.09375C0.8125 8.71875 1.14062 8.39062 1.5625 8.34375L8.73438 7.26562L11.9688 0.65625C12.1562 0.28125 12.5312 0 12.9531 0ZM12.9531 3.70312L10.5156 8.8125C10.3281 9.14062 10.0469 9.375 9.67188 9.42188L4.09375 10.2188L8.125 14.2031C8.40625 14.4844 8.5 14.8594 8.45312 15.2344L7.51562 20.8125L12.4375 18.1875C12.7656 18 13.1875 18 13.5156 18.1875L18.4375 20.8125L17.5 15.2344C17.4062 14.8594 17.5469 14.4844 17.8281 14.2031L21.8125 10.2188L16.2812 9.42188C15.9062 9.375 15.5781 9.14062 15.4375 8.8125L12.9531 3.70312Z"
                  fill="black"
                />
              </svg>
            )}
          </span>
        </div>
      </div>

      <div className="p-4">
        <div className="mb-4">
          <h4 className="group-hover:text-primaryColor mb-1 text-2xl font-semibold text-black transition duration-300">
            {unit.title}
          </h4>
          <p className="text-black">{unit.description}</p>
        </div>

        <div className="mb-6 flex w-full justify-between pr-10">
          {unit.bedrooms > 0 && (
            <div className="flex items-center gap-2">
              <BedIcon className="h-5 w-5" />
              <div className="text-black">{unit.bedrooms}</div>
            </div>
          )}
          {unit.bathrooms > 0 && (
            <div className="flex items-center gap-2">
              <ShowerHeadIcon className="h-5 w-5" />
              <div className="text-black">{unit.bathrooms}</div>
            </div>
          )}
          <div className="flex items-center gap-2">
            <RulerIcon className="h-5 w-5" />
            <div className="text-black">{unit.area}</div>
          </div>
          <div className="flex items-center gap-2">
            <CompassIcon className="h-5 w-5" />
            <div className="text-black">{unit.orientation}</div>
          </div>
        </div>

        <div className="flex items-end justify-between">
          <div>
            <p className="mb-1 font-semibold text-black">Precio</p>
            <p className="group-hover:text-primaryColor text-3xl font-bold text-black transition duration-300">
              {unit.price}
            </p>
          </div>

          <Link
            href={`/projects/${projectId}/units/${unit.id}`}
            className="border-primaryColor text-primaryColor hover:bg-primaryColor flex items-center gap-2 rounded-full border bg-white px-4 py-2 text-sm font-medium transition-colors hover:text-white"
          >
            Comprar
            <ArrowLeft className="h-4 w-4 rotate-180" />
          </Link>
        </div>
      </div>
    </div>
  );
}
