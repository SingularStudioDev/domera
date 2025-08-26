import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

interface UnitHeaderProps {
  projectSlug: string;
}

const UnitHeader = ({ projectSlug }: UnitHeaderProps) => {
  return (
    <div className="container mx-auto w-full py-6">
      <Link
        href={`/projects/${projectSlug}`}
        className="inline-flex items-center gap-2 text-primaryColor hover:text-blue-800"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a lista de proyectos
      </Link>
    </div>
  );
};

export default UnitHeader;