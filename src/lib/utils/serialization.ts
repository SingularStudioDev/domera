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

  // If it's already a number, return as is
  if (typeof value === "number") {
    return value;
  }

  // If it has a toNumber method (Decimal objects), use it
  if (value && typeof value.toNumber === "function") {
    return value.toNumber();
  }

  // If it's a string that represents a number, parse it
  if (typeof value === "string" && !isNaN(parseFloat(value))) {
    return parseFloat(value);
  }

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
    // Serialize project if it exists
    project: unit.project ? serializeProject(unit.project) : null,
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
    // Serialize operation units if they exist
    operationUnits: operation.operationUnits?.map((operationUnit: any) => ({
      ...operationUnit,
      priceAtReservation: serializeDecimal(operationUnit.priceAtReservation),
      unit: operationUnit.unit ? serializeUnit(operationUnit.unit) : null,
    })) || [],
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
    // Check if this is a Date
    if (obj instanceof Date) {
      return obj.toISOString();
    }

    // Check if this object has a toNumber method (Decimal)
    if (typeof obj.toNumber === "function") {
      return obj.toNumber();
    }

    const serialized: any = {};

    for (const [key, value] of Object.entries(obj)) {
      if (value instanceof Date) {
        serialized[key] = value.toISOString();
      } else if (value && typeof value.toNumber === "function") {
        serialized[key] = value.toNumber();
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
