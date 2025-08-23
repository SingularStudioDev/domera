import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ProjectInfo() {
  return (
    <div className="container mx-auto mt-5 mb-20 flex flex-col items-start justify-between gap-4 px-4 md:flex-row md:items-center md:gap-0 md:px-0">
      <Link
        href="/projects"
        className="text-primaryColor hover:text-shadow-primaryColor-hover inline-flex items-center gap-2 font-medium"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a lista de proyectos
      </Link>

      <button className="text-primaryColor hover:text-shadow-primaryColor-hover font-medium">
        Descargar PDF
      </button>
    </div>
  );
}
