"use client";

import { hasOrganizationLogo } from "@/lib/utils/organization";

interface Organization {
  id: string;
  name: string;
  logoUrl?: string | null;
}

interface OrganizationDisplayProps {
  organization: Organization;
  className?: string;
  width?: number;
  height?: number;
  showFallback?: boolean;
}

export default function OrganizationDisplay({
  organization,
  className = "h-7 w-auto md:h-8",
  width = 154,
  height = 30,
  showFallback = true,
}: OrganizationDisplayProps) {
  const hasLogo = hasOrganizationLogo(organization);

  if (hasLogo && organization.logoUrl) {
    return (
      <img
        src={organization.logoUrl}
        alt={`Logo de ${organization.name}`}
        width={width}
        height={height}
        className={className}
        onError={(e) => {
          // If image fails to load and fallback is enabled, show name
          if (showFallback) {
            const target = e.target as HTMLImageElement;
            // Hide the image and show fallback
            target.style.display = "none";
            const parent = target.parentElement;
            if (parent && !parent.querySelector(".org-name-fallback")) {
              const nameElement = document.createElement("span");
              nameElement.className = "org-name-fallback font-bold text-black";
              nameElement.textContent = organization.name;
              parent.appendChild(nameElement);
            }
          }
        }}
      />
    );
  }

  // Fallback to organization name
  if (showFallback) {
    return <span className="font-bold text-black">{organization.name}</span>;
  }

  return null;
}
