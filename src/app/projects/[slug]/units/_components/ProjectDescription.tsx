import Image from 'next/image';

interface ProjectDescriptionProps {
  description: string;
  adress: string;
}

export default function ProjectDescription({
  description,
  adress,
}: ProjectDescriptionProps) {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col items-start justify-between md:flex-row">
        <div className="flex flex-col gap-2">
          <h2 className="mb-2 text-3xl font-bold text-black md:mb-6">
            Descripción
          </h2>
          <p className="mb-8 max-w-[600px] whitespace-pre-line text-black">
            {description}
          </p>
        </div>

        <div>
          <div className="flex flex-col">
            <p className="mb-2 font-semibold text-black">Direccion:</p>
            <p className="mb-8 max-w-[600px] whitespace-pre-line text-black">
              {adress}
            </p>
          </div>

          <div className="flex gap-5 md:gap-10">
            <div>
              <p className="mb-2 font-semibold text-black">Desarrolla:</p>
              <div className="flex gap-4">
                <Image
                  src="/developer-logo-7b3d8c.png"
                  alt="Developer"
                  width={154}
                  height={30}
                  className="h-7 w-auto md:h-8"
                />
              </div>
            </div>

            <div>
              <p className="mb-2 font-semibold text-black">Construye:</p>
              <div className="flex gap-4">
                <Image
                  src="/constructor-logo-7b3d8c.png"
                  alt="Constructor"
                  width={154}
                  height={30}
                  className="h-7 w-auto md:h-8"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
