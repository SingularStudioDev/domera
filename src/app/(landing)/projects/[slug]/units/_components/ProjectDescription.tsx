import OrganizationDisplay from "@/components/custom-ui/OrganizationDisplay";

interface Organization {
  id: string;
  name: string;
  logoUrl?: string | null;
}

interface ProjectDescriptionProps {
  description: string;
  adress: string;
  organization: Organization;
}

export default function ProjectDescription({
  description,
  adress,
  organization,
}: ProjectDescriptionProps) {
  return (
    <div className="grid grid-cols-1 flex-col items-start justify-between lg:grid-cols-3">
      <div className="flex flex-col gap-2 lg:col-span-2">
        <h2 className="mb-2 text-3xl font-bold text-black md:mb-6">
          Descripción
        </h2>
        <p className="pr-20 text-black">{description}</p>
      </div>

      <div className="lg:col-span-1">
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
              <OrganizationDisplay organization={organization} />
            </div>
          </div>

          <div>
            <p className="mb-2 font-semibold text-black">Construye:</p>
            <div className="flex gap-4">
              <OrganizationDisplay organization={organization} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
