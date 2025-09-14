import { formatCurrency } from "@/utils/utils";
import type { Project } from "@prisma/client";

import type { ProjectDisplayData, ProjectFeature } from "./types";

/**
 * Formats a project from the database for display in the UI
 * Extracts features, formats pricing, dates, images, and location data
 */
export const formatProjectForDisplay = (
  project: Project,
): ProjectDisplayData => {
  const price = project.basePrice
    ? formatCurrency(parseFloat(project.basePrice.toString()))
    : "Consultar precio";

  const status = project.neighborhood || project.city;
  const date = project.estimatedCompletion
    ? new Date(project.estimatedCompletion).toLocaleDateString("es-UY", {
        month: "short",
        year: "numeric",
      })
    : "Fecha TBD";

  // Convert Decimal coordinates to numbers
  const convertToNumber = (value: unknown): number => {
    if (value === null || value === undefined) return 0;
    if (typeof value === "number") return value;
    if (
      typeof value === "object" &&
      value !== null &&
      "toNumber" in value &&
      typeof (value as { toNumber(): number }).toNumber === "function"
    ) {
      return (value as { toNumber(): number }).toNumber();
    }
    if (typeof value === "string") return parseFloat(value) || 0;
    return 0;
  };

  const latitude = convertToNumber(project.latitude);
  const longitude = convertToNumber(project.longitude);

  // Create features array from boolean fields
  const projectWithFeatures = project as Project & {
    hasParking?: boolean;
    hasStudio?: boolean;
    has1Bedroom?: boolean;
    has2Bedroom?: boolean;
    has3Bedroom?: boolean;
    has4Bedroom?: boolean;
    has5Bedroom?: boolean;
    hasCommercial?: boolean;
  };

  const features: ProjectFeature[] = [
    { name: "parking", hasFeature: projectWithFeatures.hasParking || false },
    { name: "studio", hasFeature: projectWithFeatures.hasStudio || false },
    { name: "1_bedroom", hasFeature: projectWithFeatures.has1Bedroom || false },
    { name: "2_bedroom", hasFeature: projectWithFeatures.has2Bedroom || false },
    { name: "3_bedroom", hasFeature: projectWithFeatures.has3Bedroom || false },
    { name: "4_bedroom", hasFeature: projectWithFeatures.has4Bedroom || false },
    { name: "5_bedroom", hasFeature: projectWithFeatures.has5Bedroom || false },
    {
      name: "commercial",
      hasFeature: projectWithFeatures.hasCommercial || false,
    },
  ];

  return {
    id: project.id,
    title: project.name,
    slug: project.slug,
    price,
    images: project.images,
    status,
    date,
    features,
    latitude,
    longitude,
    neighborhood: project.neighborhood || undefined,
    city: project.city || undefined,
  };
};

/**
 * Filters projects to only include those with valid coordinates
 */
export const filterProjectsWithValidCoordinates = (
  projects: ProjectDisplayData[],
): ProjectDisplayData[] => {
  return projects.filter((project) => {
    const isValid =
      project.latitude !== undefined &&
      project.longitude !== undefined &&
      project.latitude !== null &&
      project.longitude !== null &&
      !isNaN(project.latitude) &&
      !isNaN(project.longitude) &&
      project.latitude >= -90 &&
      project.latitude <= 90 &&
      project.longitude >= -180 &&
      project.longitude <= 180 &&
      project.latitude !== 0 &&
      project.longitude !== 0 &&
      Math.abs(project.latitude) > 0.0001 &&
      Math.abs(project.longitude) > 0.0001;

    if (!isValid) {
      console.log("Filtered out project:", project.title, {
        latitude: project.latitude,
        longitude: project.longitude,
        latType: typeof project.latitude,
        lngType: typeof project.longitude,
      });
    }

    return isValid;
  });
};

/**
 * Calculate map center from all projects
 */
export const calculateMapCenter = (projects: ProjectDisplayData[]) => {
  if (projects.length === 0) {
    return { lat: -34.9011, lng: -56.1645 }; // Montevideo default
  }

  const avgLat =
    projects.reduce((sum, p) => sum + p.latitude, 0) / projects.length;
  const avgLng =
    projects.reduce((sum, p) => sum + p.longitude, 0) / projects.length;

  // Validate calculated center and fallback to default if invalid
  if (
    isNaN(avgLat) ||
    isNaN(avgLng) ||
    !isFinite(avgLat) ||
    !isFinite(avgLng)
  ) {
    console.warn("Invalid map center calculated, using default:", {
      avgLat,
      avgLng,
    });
    return { lat: -34.9011, lng: -56.1645 }; // Montevideo default
  }

  return { lat: avgLat, lng: avgLng };
};

/**
 * Calculate appropriate zoom level based on project spread
 */
export const calculateZoom = (projects: ProjectDisplayData[]) => {
  if (projects.length <= 1) {
    return 15; // Close zoom for single project
  }

  const lats = projects.map((p) => p.latitude);
  const lngs = projects.map((p) => p.longitude);

  const latSpread = Math.max(...lats) - Math.min(...lats);
  const lngSpread = Math.max(...lngs) - Math.min(...lngs);
  const maxSpread = Math.max(latSpread, lngSpread);

  // Adjust zoom based on spread
  if (maxSpread > 0.1) return 10; // Wide spread
  if (maxSpread > 0.05) return 12; // Medium spread
  if (maxSpread > 0.01) return 13; // Small spread
  return 14; // Very close projects
};
