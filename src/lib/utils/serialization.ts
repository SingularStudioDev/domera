// =============================================================================
// DATA SERIALIZATION UTILITIES
// Utilities to handle Prisma Decimal serialization for client components
// =============================================================================

import { Decimal } from "@prisma/client/runtime/library";

/**
 * Converts Prisma Decimal objects to numbers for client serialization
 */
export function serializeDecimal(value: any): number | null {
  if (value === null || value === undefined) {
    return null;
  }

  // Check for Decimal instance
  if (value instanceof Decimal) {
    return value.toNumber();
  }

  // Check if it's a Decimal-like object with toNumber method
  if (
    typeof value === "object" &&
    value !== null &&
    "toNumber" in value &&
    typeof value.toNumber === "function"
  ) {
    return value.toNumber();
  }

  // If it's already a number, return as is
  if (typeof value === "number") {
    return value;
  }

  // If it's a string that represents a number, parse it
  if (typeof value === "string" && !isNaN(parseFloat(value))) {
    return parseFloat(value);
  }

  // Debug logging for problematic values
  console.warn("serializeDecimal: Could not serialize value", {
    value,
    type: typeof value,
    constructor: value?.constructor?.name,
  });

  return null;
}

/**
 * Serializes a project object, converting all Decimal fields to numbers
 */
export function serializeProject(project: any): any {
  if (!project) return null;

  return {
    ...project,
    latitude: serializeDecimal(project.latitude),
    longitude: serializeDecimal(project.longitude),
    basePrice: serializeDecimal(project.basePrice),
    // Serialize units if they exist
    units: project.units?.map((unit: any) => serializeUnit(unit)) || [],
    // Handle dates
    startDate: project.startDate?.toISOString() || null,
    estimatedCompletion: project.estimatedCompletion?.toISOString() || null,
    actualCompletion: project.actualCompletion?.toISOString() || null,
    createdAt: project.createdAt?.toISOString() || null,
    updatedAt: project.updatedAt?.toISOString() || null,
  };
}

/**
 * Serializes a unit object, converting all Decimal fields to numbers
 */
export function serializeUnit(unit: any): any {
  if (!unit) return null;

  return {
    ...unit,
    price: serializeDecimal(unit.price),
    totalArea: serializeDecimal(unit.totalArea),
    builtArea: serializeDecimal(unit.builtArea),
    // Handle dates
    createdAt: unit.createdAt?.toISOString() || null,
    updatedAt: unit.updatedAt?.toISOString() || null,
  };
}

/**
 * Serializes an organization object
 */
export function serializeOrganization(org: any): any {
  if (!org) return null;

  return {
    ...org,
    // Handle dates
    createdAt: org.createdAt?.toISOString() || null,
    updatedAt: org.updatedAt?.toISOString() || null,
  };
}

/**
 * Serializes an operation object, converting all Decimal fields to numbers
 */
export function serializeOperation(operation: any): any {
  if (!operation) return null;

  return {
    ...operation,
    totalAmount: serializeDecimal(operation.totalAmount),
    platformFee: serializeDecimal(operation.platformFee),
    // Handle dates
    startedAt: operation.startedAt?.toISOString() || null,
    completedAt: operation.completedAt?.toISOString() || null,
    cancelledAt: operation.cancelledAt?.toISOString() || null,
    createdAt: operation.createdAt?.toISOString() || null,
    updatedAt: operation.updatedAt?.toISOString() || null,
  };
}

/**
 * Generic function to serialize any object that might contain Decimal fields
 */
export function serializeObject(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => serializeObject(item));
  }

  if (typeof obj === "object") {
    const serialized: any = {};

    for (const [key, value] of Object.entries(obj)) {
      if (value instanceof Decimal) {
        serialized[key] = value.toNumber();
      } else if (value instanceof Date) {
        serialized[key] = value.toISOString();
      } else if (typeof value === "object") {
        serialized[key] = serializeObject(value);
      } else {
        serialized[key] = value;
      }
    }

    return serialized;
  }

  return obj;
}
