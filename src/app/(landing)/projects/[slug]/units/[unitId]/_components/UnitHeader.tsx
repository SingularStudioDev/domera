import Link from "next/link";

import { ArrowLeft } from "lucide-react";

interface UnitHeaderProps {
  projectSlug: string;
}

export default function UnitHeader({ projectSlug }: UnitHeaderProps) {
  return (
    <div className="container mx-auto w-full py-6">
      <Link
        href={`/projects/${projectSlug}`}
        className="text-primaryColor inline-flex items-center gap-2 hover:text-blue-800"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a lista de proyectos
      </Link>
    </div>
  );
}
