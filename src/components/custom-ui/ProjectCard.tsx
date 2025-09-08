"use client";

import { useMemo } from "react";
import Link from "next/link";

import {
  BedDoubleIcon,
  Building2,
  CarFrontIcon,
  ShoppingCartIcon,
} from "lucide-react";

interface ProjectFeature {
  name: string;
  hasFeature: boolean;
}

interface ProjectCardProps {
  slug: string;
  title: string;
  price: string;
  image: string;
  status: string;
  date: string;
  features?: ProjectFeature[];
}

const sortFeatures = (features: ProjectFeature[]) => {
  return features.sort((a, b) => {
    // Studio always first
    if (a.name === "studio") return -1;
    if (b.name === "studio") return 1;

    // Bedrooms in middle
    const aIsBedroom = a.name.includes("bedroom");
    const bIsBedroom = b.name.includes("bedroom");

    if (aIsBedroom && !bIsBedroom) return -1;
    if (!aIsBedroom && bIsBedroom) return 1;

    // Sort bedrooms by number (1_bedroom, 2_bedroom, etc.)
    if (aIsBedroom && bIsBedroom) {
      const aNum = parseInt(a.name.match(/(\d+)_bedroom/)?.[1] || "0");
      const bNum = parseInt(b.name.match(/(\d+)_bedroom/)?.[1] || "0");
      return aNum - bNum;
    }

    // Parking and commercial at bottom (keep original order)
    return 0;
  });
};

const ProjectCard = ({
  slug,
  title,
  price,
  image,
  status,
  date,
  features = [],
}: ProjectCardProps) => {
  const projectFeatures = useMemo(() => {
    const featuresWithTrue = features.filter(
      (feature) => feature.hasFeature === true,
    );
    return sortFeatures(featuresWithTrue);
  }, [features]);

  const getFeatureIcon = (featureName: string) => {
    const isBedroomFeature =
      featureName.includes("bedroom") || featureName === "studio";
    const iconProps = {
      size: 19,
      className: ` ${isBedroomFeature ? "mr-2" : ""}`,
    };

    switch (featureName) {
      case "parking":
        return <CarFrontIcon {...iconProps} />;
      case "studio":
      case "1_bedroom":
      case "2_bedroom":
      case "3_bedroom":
      case "4_bedroom":
      case "5_bedroom":
        return <BedDoubleIcon {...iconProps} />;
      case "commercial":
        return <ShoppingCartIcon {...iconProps} />;
      default:
        return <Building2 {...iconProps} />;
    }
  };

  const getBedroomNumber = (featureName: string) => {
    if (featureName === "studio") {
      return "0";
    }
    const match = featureName.match(/(\d+)_bedroom/);
    return match ? match[1] : null;
  };

  return (
    <Link
      href={`/projects/${slug}`}
      className="hover:border-primaryColor relative block overflow-hidden rounded-3xl border bg-white transition duration-300 hover:shadow-sm"
    >
      {/* Image */}
      <div className="group relative h-[567px] overflow-hidden md:h-[547px]">
        <img
          src={image}
          alt={title}
          className="h-full w-full object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = "/project-placeholder.png";
          }}
        />

        {/* Status Badge */}
        <div className="group-hover:text-primaryColor absolute top-3 left-3 flex gap-2 text-black transition duration-300">
          <span className="rounded-2xl bg-white px-4 py-1 text-lg shadow-sm">
            {status}
          </span>

          <span className="rounded-2xl bg-white px-4 py-1 text-lg shadow-sm">
            {date}
          </span>
        </div>

        {/* Top Right Icons */}
        <div className="absolute top-3 right-3 flex flex-col gap-2">
          {/* Features */}
          {projectFeatures.length > 0 && (
            <div className="flex flex-col flex-wrap gap-2">
              {projectFeatures.map((feature) => {
                const bedroomNumber = getBedroomNumber(feature.name);
                return (
                  <div
                    key={feature.name}
                    className="group-hover:text-primaryColor relative flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-white text-black shadow-sm"
                    title={feature.name}
                  >
                    {getFeatureIcon(feature.name)}
                    {bedroomNumber && (
                      <span className="absolute top-4 right-0 min-w-[16px] rounded-full bg-white px-1 py-0.5 text-center text-xs leading-none">
                        x{bedroomNumber}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="absolute bottom-0 flex w-full items-end gap-5">
          <div className="group-hover:text-primaryColor relative flex w-full flex-col gap-2 bg-white py-3 pr-4 pl-6 text-black transition duration-300">
            {/* Bloque superior con curva hacia la derecha */}
            <h3 className="w-full bg-white text-3xl font-medium">{title}</h3>

            {/* Bloque inferior  TODO: Revisar este precio se guarda ya formateado o se trae normal y yo lo formateo*/}
            <p className="w-full bg-white text-xl">Desde: {price}</p>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProjectCard;
