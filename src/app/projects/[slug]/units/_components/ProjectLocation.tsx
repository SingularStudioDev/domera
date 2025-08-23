import Image from 'next/image';
import { SquareArrowOutUpRightIcon } from 'lucide-react';

interface ProjectLocationProps {
  planFiles: string[];
}

export default function ProjectLocation({ planFiles }: ProjectLocationProps) {
  return (
    <div className="flex w-full flex-col items-start md:flex-row md:gap-10">
      <div className="w-full">
        <h3 className="mb-6 text-3xl font-semibold text-black">Ubicación</h3>
        <div className="mb-8 overflow-hidden rounded-2xl border border-gray-300">
          <Image
            src="/map-location-68c752.png"
            alt="Ubicación del proyecto"
            width={640}
            height={400}
            className="h-[200px] w-full object-cover md:h-[500px]"
          />
        </div>
      </div>

      <div className="w-full">
        <h3 className="mb-6 text-3xl font-semibold text-black">Master plan</h3>
        <div className="space-y-0">
          {planFiles.map((file, index) => (
            <div
              key={index}
              className={`${index === 0 ? 'border-t' : ''} hover:text-primaryColor flex cursor-pointer items-center justify-between border-b border-gray-300 p-4 text-black transition duration-300`}
            >
              <span className="font-medium">{file}</span>
              <button className="cursor-pointer text-xl">
                <SquareArrowOutUpRightIcon className="h-5 w-5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
