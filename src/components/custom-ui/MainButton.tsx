import { ReactNode } from 'react';
import Link from 'next/link';
import { ArrowRightIcon } from 'lucide-react';

interface MainButtonProps {
  href: string;
  children: ReactNode;
  variant?: 'outline' | 'fill';
  className?: string;
  showArrow?: boolean;
}

export default function MainButton({ 
  href, 
  children, 
  variant = 'outline', 
  className = '',
  showArrow = false 
}: MainButtonProps) {
  const baseClasses = "flex cursor-pointer items-center gap-5 rounded-full px-8 py-3 font-medium transition-colors duration-200";
  
  const variantClasses = {
    outline: "border border-[#0040FF] text-[#0040FF] hover:bg-[#0040FF] hover:text-white",
    fill: "bg-[#0040FF] text-white border border-[#0040FF] hover:bg-[#003acc] hover:border-[#003acc]"
  };

  return (
    <Link
      href={href}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
    >
      {children}
      {showArrow && <ArrowRightIcon className="h-5 w-5" />}
    </Link>
  );
}