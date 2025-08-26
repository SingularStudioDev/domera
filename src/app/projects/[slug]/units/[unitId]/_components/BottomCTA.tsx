import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

const BottomCTA = () => {
  return (
    <div className="mb-16 flex w-full items-center justify-center text-center">
      <Link
        href="/checkout"
        className="flex w-fit items-center justify-center rounded-full bg-primaryColor px-12 py-4 text-xl font-medium text-white transition-colors hover:bg-blue-700"
      >
        Comprar unidad
        <ArrowRight className="ml-2 h-5 w-5" />
      </Link>
    </div>
  );
};

export default BottomCTA;