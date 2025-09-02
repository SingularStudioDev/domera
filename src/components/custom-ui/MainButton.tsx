import { ReactNode } from "react";
import Link from "next/link";

import { ArrowRightIcon } from "lucide-react";

import { cn } from "@/lib/utils";

interface MainButtonProps {
  href?: string;
  onClick?: () => void;
  children: ReactNode;
  variant?: "outline" | "fill";
  className?: string;
  showArrow?: boolean;
}

export default function MainButton({
  href,
  onClick,
  children,
  variant = "outline",
  className = "",
  showArrow = false,
}: MainButtonProps) {
  const baseClasses =
    "flex cursor-pointer items-center gap-5 rounded-full px-8 py-3 font-medium transition-colors duration-200";

  const variantClasses = {
    outline:
      "border border-[#0040FF] text-[#0040FF] hover:bg-[#0040FF] hover:text-white",
    fill: "bg-[#0040FF] text-white border border-[#0040FF] hover:bg-[#003acc] hover:border-[#003acc]",
  };

  const combinedClasses = cn(baseClasses, variantClasses[variant], className);

  // Si tiene onClick, usar button
  if (onClick) {
    return (
      <button onClick={onClick} className={combinedClasses}>
        {children}
        {showArrow && <ArrowRightIcon className="h-5 w-5" />}
      </button>
    );
  }

  // Si tiene href, usar Link
  if (href) {
    return (
      <Link href={href} className={combinedClasses}>
        {children}
        {showArrow && <ArrowRightIcon className="h-5 w-5" />}
      </Link>
    );
  }

  // Fallback a button si no hay ni href ni onClick
  return (
    <button className={combinedClasses}>
      {children}
      {showArrow && <ArrowRightIcon className="h-5 w-5" />}
    </button>
  );
}
