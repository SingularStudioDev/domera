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
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
}

export default function MainButton({
  href,
  onClick,
  children,
  variant = "outline",
  className = "",
  showArrow = false,
  type = "button",
  disabled = false,
}: MainButtonProps) {
  const baseClasses = `flex items-center whitespace-nowrap w-fit gap-5 rounded-full  font-medium transition-colors duration-200 ${variant === "fill" ? "pl-5 pr-1 py-1" : "py-3 px-8"}`;

  const variantClasses = {
    outline:
      "border border-[#0040FF] text-[#0040FF] hover:bg-[#0040FF] hover:text-white",
    fill: "bg-[#0040FF] text-white border border-[#0040FF] hover:bg-[#003acc] hover:border-[#003acc]",
  };

  const disabledClasses = disabled
    ? "cursor-not-allowed opacity-50 hover:bg-inherit hover:text-inherit hover:border-inherit"
    : "cursor-pointer";

  const arrowClass =
    variant === "fill"
      ? "bg-white/20 h-5 w-5 p-2 h-full w-full rounded-full text-white"
      : "text-primaryColor";

  const combinedClasses = cn(
    baseClasses,
    variantClasses[variant],
    disabledClasses,
    className,
  );

  // Si tiene onClick, usar button
  if (onClick) {
    return (
      <button
        type={type}
        onClick={disabled ? undefined : onClick}
        disabled={disabled}
        className={combinedClasses}
      >
        {children}
        {showArrow && (
          <div className={arrowClass}>
            <ArrowRightIcon className="h-5 w-5" />
          </div>
        )}
      </button>
    );
  }

  // Si tiene href, usar Link
  if (href && !disabled) {
    return (
      <Link href={href} className={combinedClasses}>
        {children}
        {showArrow && <ArrowRightIcon className="h-5 w-5" />}
      </Link>
    );
  }

  // Si está disabled o es fallback, usar button
  return (
    <button type={type} disabled={disabled} className={combinedClasses}>
      {children}
      {showArrow && <ArrowRightIcon className="h-5 w-5" />}
    </button>
  );
}
