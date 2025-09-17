// =============================================================================
// CLIENTS DATA ACCESS LAYER
// Database operations for client management based on operations
// =============================================================================

import type { User, Operation, OperationStatus, OperationType, Unit } from "@prisma/client";
import * as bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import {
  buildPaginationOptions,
  failure,
  formatPaginatedResult,
  getDbClient,
  logAudit,
  success,
  type PaginatedResult,
  type Result,
} from "./base";
import { sendWelcomeEmail, sendSimpleWelcomeEmail, generateConfirmationUrl } from "@/lib/email/resend";

// =============================================================================
// TYPES AND INTERFACES
// =============================================================================

interface CreateClientInput {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  documentType?: string;
  documentNumber?: string;
  address?: string;
  city?: string;
  organizationId: string;
  operationType: OperationType;
  unitIds: string[];
  totalAmount: number;
  notes?: string;
  installments?: number;
  firstDueDate?: Date;
  createdBy: string;
}

interface PaymentPlanInput {
  totalAmount: number;
  installments: number;
  firstDueDate: Date;
}

interface ConfirmationTokenData {
  operationId: string;
  email: string;
  temporaryPassword: string;
}

interface AvailableUnit {
  id: string;
  unitNumber: string;
  floor?: number;
  unitType: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  totalArea?: number;
  project: {
    id: string;
    name: string;
    slug: string;
  };
}

interface ClientFiltersInput {
  page: number;
  pageSize: number;
  organizationId: string;
  status?: "all" | "active" | "completed" | "cancelled";
  search?: string;
}

interface ClientData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  totalOperations: number;
  activeOperations: number;
  completedOperations: number;
  totalInvestment: number;
  lastOperationDate: Date;
  operations: Array<{
    id: string;
    status: OperationStatus;
    totalAmount: number;
    startedAt: Date;
    units: Array<{
      unitNumber: string;
      project: {
        name: string;
        slug: string;
      };
    }>;
  }>;
}

// =============================================================================
// CLIENT OPERATIONS
// =============================================================================

/**
 * Get clients for an organization based on their operations
 */
export async function getOrganizationClients(
  filters: ClientFiltersInput,
): Promise<Result<PaginatedResult<ClientData>>> {
  try {
    const client = getDbClient();
    
    // Build where clause for operations
    const operationWhere: any = {
      organizationId: filters.organizationId,
    };

    if (filters.status && filters.status !== "all") {
      switch (filters.status) {
        case "active":
          operationWhere.status = {
            notIn: ["completed", "cancelled"],
          };
          break;
        case "completed":
          operationWhere.status = "completed";
          break;
        case "cancelled":
          operationWhere.status = "cancelled";
          break;
      }
    }

    // Build user search filter
    const userWhere: any = {};
    if (filters.search) {
      userWhere.OR = [
        {
          firstName: {
            contains: filters.search,
            mode: "insensitive",
          },
        },
        {
          lastName: {
            contains: filters.search,
            mode: "insensitive",
          },
        },
        {
          email: {
            contains: filters.search,
            mode: "insensitive",
          },
        },
      ];
    }

    // Get users who have operations with this organization
    const users = await client.user.findMany({
      where: {
        ...userWhere,
        operations: {
          some: operationWhere,
        },
      },
      include: {
        operations: {
          where: operationWhere,
          include: {
            operationUnits: {
              include: {
                unit: {
                  include: {
                    project: {
                      select: {
                        name: true,
                        slug: true,
                      },
                    },
                  },
                },
              },
            },
          },
          orderBy: {
            startedAt: "desc",
          },
        },
      },
      orderBy: [
        {
          operations: {
            _count: "desc", // Order by number of operations
          },
        },
        {
          lastName: "asc",
        },
      ],
    });

    // Transform data to client format
    const clientsData: ClientData[] = users.map((user) => {
      const operations = user.operations;
      const activeOps = operations.filter(op => 
        !["completed", "cancelled"].includes(op.status)
      );
      const completedOps = operations.filter(op => op.status === "completed");
      const totalInvestment = operations.reduce(
        (sum, op) => sum + op.totalAmount.toNumber(), 
        0
      );

      return {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        totalOperations: operations.length,
        activeOperations: activeOps.length,
        completedOperations: completedOps.length,
        totalInvestment,
        lastOperationDate: operations[0]?.startedAt || user.createdAt,
        operations: operations.map(op => ({
          id: op.id,
          status: op.status,
          totalAmount: op.totalAmount.toNumber(),
          startedAt: op.startedAt,
          units: op.operationUnits.map(ou => ({
            unitNumber: ou.unit.unitNumber,
            project: {
              name: ou.unit.project.name,
              slug: ou.unit.project.slug,
            },
          })),
        })),
      };
    });

    // Apply pagination
    const paginationOptions = buildPaginationOptions(
      filters.page,
      filters.pageSize,
    );
    
    const startIndex = (filters.page - 1) * filters.pageSize;
    const endIndex = startIndex + filters.pageSize;
    const paginatedClients = clientsData.slice(startIndex, endIndex);

    const result = formatPaginatedResult(
      paginatedClients,
      clientsData.length,
      filters.page,
      filters.pageSize,
    );

    return success(result);
  } catch (error) {
    return failure(
      error instanceof Error ? error.message : "Error desconocido",
    );
  }
}

/**
 * Get client details by ID for an organization
 */
export async function getClientDetails(
  clientId: string,
  organizationId: string,
): Promise<Result<ClientData>> {
  try {
    const client = getDbClient();

    const user = await client.user.findFirst({
      where: {
        id: clientId,
        operations: {
          some: {
            organizationId,
          },
        },
      },
      include: {
        operations: {
          where: {
            organizationId,
          },
          include: {
            operationUnits: {
              include: {
                unit: {
                  include: {
                    project: {
                      select: {
                        name: true,
                        slug: true,
                      },
                    },
                  },
                },
              },
            },
          },
          orderBy: {
            startedAt: "desc",
          },
        },
      },
    });

    if (!user) {
      return failure("Cliente no encontrado o no pertenece a esta organización");
    }

    const operations = user.operations;
    const activeOps = operations.filter(op => 
      !["completed", "cancelled"].includes(op.status)
    );
    const completedOps = operations.filter(op => op.status === "completed");
    const totalInvestment = operations.reduce(
      (sum, op) => sum + op.totalAmount.toNumber(), 
      0
    );

    const clientData: ClientData = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      totalOperations: operations.length,
      activeOperations: activeOps.length,
      completedOperations: completedOps.length,
      totalInvestment,
      lastOperationDate: operations[0]?.startedAt || user.createdAt,
      operations: operations.map(op => ({
        id: op.id,
        status: op.status,
        totalAmount: op.totalAmount.toNumber(),
        startedAt: op.startedAt,
        units: op.operationUnits.map(ou => ({
          unitNumber: ou.unit.unitNumber,
          project: {
            name: ou.unit.project.name,
            slug: ou.unit.project.slug,
          },
        })),
      })),
    };

    return success(clientData);
  } catch (error) {
    return failure(
      error instanceof Error ? error.message : "Error desconocido",
    );
  }
}

/**
 * Get organization client statistics
 */
export async function getOrganizationClientStats(
  organizationId: string,
): Promise<Result<{
  totalClients: number;
  activeClients: number;
  totalRevenue: number;
  averageInvestment: number;
}>> {
  try {
    const client = getDbClient();

    // Get all users with operations in this organization
    const users = await client.user.findMany({
      where: {
        operations: {
          some: {
            organizationId,
          },
        },
      },
      include: {
        operations: {
          where: {
            organizationId,
          },
          select: {
            status: true,
            totalAmount: true,
          },
        },
      },
    });

    const totalClients = users.length;
    const activeClients = users.filter(user => 
      user.operations.some(op => !["completed", "cancelled"].includes(op.status))
    ).length;

    const totalRevenue = users.reduce((sum, user) => {
      return sum + user.operations.reduce((opSum, op) => 
        opSum + op.totalAmount.toNumber(), 0
      );
    }, 0);

    const averageInvestment = totalClients > 0 ? totalRevenue / totalClients : 0;

    return success({
      totalClients,
      activeClients,
      totalRevenue,
      averageInvestment,
    });
  } catch (error) {
    return failure(
      error instanceof Error ? error.message : "Error desconocido",
    );
  }
}

// =============================================================================
// CLIENT CREATION OPERATIONS
// =============================================================================

/**
 * Generate a secure temporary password
 */
function generateSecurePassword(): string {
  const charset = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  let password = "";
  for (let i = 0; i < 12; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
}

/**
 * Generate payment plan for operation
 */
function generatePaymentPlan(input: PaymentPlanInput) {
  const { totalAmount, installments, firstDueDate } = input;
  const installmentAmount = Math.round((totalAmount / installments) * 100) / 100;

  const payments = [];
  for (let i = 1; i <= installments; i++) {
    const dueDate = new Date(firstDueDate);
    dueDate.setMonth(dueDate.getMonth() + (i - 1));

    payments.push({
      installmentNumber: i,
      amount: i === installments
        ? totalAmount - (installmentAmount * (installments - 1)) // Adjust last payment for rounding
        : installmentAmount,
      dueDate,
      status: "pending" as const,
    });
  }

  return payments;
}

/**
 * Generate operation steps based on operation type
 */
function generateOperationSteps(operationType: OperationType) {
  if (operationType === "reservation") {
    return [
      { stepName: "documentos_iniciales", stepOrder: 1 },
      { stepName: "validacion_documentos", stepOrder: 2 },
      { stepName: "asignacion_profesional", stepOrder: 3 },
      { stepName: "firma_boleto", stepOrder: 4 },
    ];
  } else {
    return [
      { stepName: "documentos_iniciales", stepOrder: 1 },
      { stepName: "generacion_plan_pagos", stepOrder: 2 },
      { stepName: "pago_seña", stepOrder: 3 },
      { stepName: "seguimiento_cuotas", stepOrder: 4 },
      { stepName: "validacion_documentos", stepOrder: 5 },
      { stepName: "asignacion_profesional", stepOrder: 6 },
      { stepName: "firma_escritura", stepOrder: 7 },
    ];
  }
}

/**
 * Generate confirmation token for operation
 */
function generateConfirmationToken(data: ConfirmationTokenData): string {
  const secret = process.env.JWT_SECRET || "fallback-secret";
  return jwt.sign(data, secret, { expiresIn: "30d" });
}

/**
 * Verify confirmation token
 */
export function verifyConfirmationToken(token: string): ConfirmationTokenData | null {
  try {
    const secret = process.env.JWT_SECRET || "fallback-secret";
    return jwt.verify(token, secret) as ConfirmationTokenData;
  } catch {
    return null;
  }
}

/**
 * Check if email is available for new user in organization
 */
export async function checkEmailAvailability(
  email: string,
  organizationId: string,
): Promise<Result<{ available: boolean; existingUser?: { id: string; firstName: string; lastName: string } }>> {
  try {
    const client = getDbClient();

    const existingUser = await client.user.findFirst({
      where: {
        email,
        operations: {
          some: {
            organizationId,
          },
        },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
      },
    });

    return success({
      available: !existingUser,
      existingUser: existingUser || undefined,
    });
  } catch (error) {
    return failure(
      error instanceof Error ? error.message : "Error desconocido",
    );
  }
}

/**
 * Get available units by project for organization
 */
export async function getAvailableUnitsByProject(
  organizationId: string,
): Promise<Result<Record<string, AvailableUnit[]>>> {
  try {
    const client = getDbClient();

    const units = await client.unit.findMany({
      where: {
        status: "available",
        project: {
          organizationId,
        },
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
      orderBy: [
        { project: { name: "asc" } },
        { unitNumber: "asc" },
      ],
    });

    const unitsByProject: Record<string, AvailableUnit[]> = {};

    units.forEach((unit) => {
      const projectKey = unit.project.id;
      if (!unitsByProject[projectKey]) {
        unitsByProject[projectKey] = [];
      }

      unitsByProject[projectKey].push({
        id: unit.id,
        unitNumber: unit.unitNumber,
        floor: unit.floor,
        unitType: unit.unitType,
        price: unit.price.toNumber(),
        bedrooms: unit.bedrooms,
        bathrooms: unit.bathrooms,
        totalArea: unit.totalArea?.toNumber(),
        project: unit.project,
      });
    });

    return success(unitsByProject);
  } catch (error) {
    return failure(
      error instanceof Error ? error.message : "Error desconocido",
    );
  }
}

/**
 * Validate units availability and business rules
 */
export async function validateUnitsAvailability(
  unitIds: string[],
  organizationId: string,
): Promise<Result<{ valid: boolean; errors: string[] }>> {
  try {
    const client = getDbClient();
    const errors: string[] = [];

    if (unitIds.length === 0) {
      errors.push("Debe seleccionar al menos una unidad");
    }

    if (unitIds.length > 2) {
      errors.push("No puede seleccionar más de 2 unidades");
    }

    const units = await client.unit.findMany({
      where: {
        id: { in: unitIds },
        project: {
          organizationId,
        },
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (units.length !== unitIds.length) {
      errors.push("Una o más unidades no fueron encontradas");
    }

    const unavailableUnits = units.filter(unit => unit.status !== "available");
    if (unavailableUnits.length > 0) {
      errors.push(
        `Las siguientes unidades no están disponibles: ${unavailableUnits.map(u => u.unitNumber).join(", ")}`
      );
    }

    const projectIds = [...new Set(units.map(unit => unit.project.id))];
    if (projectIds.length > 1) {
      errors.push("Todas las unidades deben pertenecer al mismo proyecto");
    }

    return success({
      valid: errors.length === 0,
      errors,
    });
  } catch (error) {
    return failure(
      error instanceof Error ? error.message : "Error desconocido",
    );
  }
}

/**
 * Create client with operation - Complete transaction
 */
export async function createClientWithOperation(
  input: CreateClientInput,
  ipAddress?: string,
  userAgent?: string,
): Promise<Result<{
  user: User;
  operation: Operation;
  confirmationToken: string;
  temporaryPassword: string;
  emailSent: boolean;
}>> {
  try {
    const client = getDbClient();

    const temporaryPassword = generateSecurePassword();
    const hashedPassword = await bcrypt.hash(temporaryPassword, 12);

    let createdUser: User;
    let createdOperation: Operation;

    try {
      createdUser = await client.user.create({
        data: {
          email: input.email,
          password: hashedPassword,
          firstName: input.firstName,
          lastName: input.lastName,
          phone: input.phone,
          documentType: input.documentType,
          documentNumber: input.documentNumber,
          address: input.address,
          city: input.city,
          createdBy: input.createdBy,
        },
      });

      createdOperation = await client.operation.create({
        data: {
          userId: createdUser.id,
          organizationId: input.organizationId,
          operationType: input.operationType,
          status: "pending_user_acceptance",
          totalAmount: input.totalAmount,
          notes: input.notes,
          createdBy: input.createdBy,
        },
      });

      for (const unitId of input.unitIds) {
        const unit = await client.unit.findUnique({
          where: { id: unitId },
          select: { price: true },
        });

        if (!unit) {
          throw new Error(`Unidad con ID ${unitId} no encontrada`);
        }

        await client.operationUnit.create({
          data: {
            operationId: createdOperation.id,
            unitId,
            priceAtReservation: unit.price,
          },
        });

        await client.unit.update({
          where: { id: unitId },
          data: {
            status: input.operationType === "reservation" ? "reserved" : "in_process"
          },
        });
      }

      const steps = generateOperationSteps(input.operationType);
      for (const step of steps) {
        await client.operationStep.create({
          data: {
            operationId: createdOperation.id,
            stepName: step.stepName,
            stepOrder: step.stepOrder,
          },
        });
      }

      if (input.operationType === "purchase" && input.installments && input.firstDueDate) {
        const payments = generatePaymentPlan({
          totalAmount: input.totalAmount,
          installments: input.installments,
          firstDueDate: input.firstDueDate,
        });

        for (const payment of payments) {
          await client.payment.create({
            data: {
              operationId: createdOperation.id,
              installmentNumber: payment.installmentNumber,
              amount: payment.amount,
              dueDate: payment.dueDate,
              status: payment.status,
            },
          });
        }
      }

      const confirmationToken = generateConfirmationToken({
        operationId: createdOperation.id,
        email: input.email,
        temporaryPassword,
      });

      // Send welcome email
      const units = await client.unit.findMany({
        where: { id: { in: input.unitIds } },
        include: {
          project: {
            select: {
              name: true,
            },
          },
        },
      });

      const organization = await client.organization.findUnique({
        where: { id: input.organizationId },
        select: { name: true },
      });

      const emailResult = await sendWelcomeEmail({
        to: input.email,
        firstName: input.firstName,
        lastName: input.lastName,
        organizationName: organization?.name || "Domera",
        operationType: input.operationType,
        units: units.map(unit => ({
          unitNumber: unit.unitNumber,
          projectName: unit.project.name,
        })),
        totalAmount: input.totalAmount,
        temporaryPassword,
        confirmationToken,
        confirmationUrl: generateConfirmationUrl(confirmationToken),
      });

      if (!emailResult.success) {
        console.error("Failed to send welcome email:", emailResult.error);
        // Note: We don't fail the operation if email fails
      }

      await logAudit(client, {
        userId: input.createdBy,
        organizationId: input.organizationId,
        tableName: "users",
        recordId: createdUser.id,
        action: "INSERT",
        newValues: {
          email: input.email,
          firstName: input.firstName,
          lastName: input.lastName,
        },
        ipAddress,
        userAgent,
      });

      await logAudit(client, {
        userId: input.createdBy,
        organizationId: input.organizationId,
        tableName: "operations",
        recordId: createdOperation.id,
        action: "INSERT",
        newValues: {
          operationType: input.operationType,
          status: "pending_user_acceptance",
          totalAmount: input.totalAmount,
        },
        ipAddress,
        userAgent,
      });

      return success({
        user: createdUser,
        operation: createdOperation,
        confirmationToken,
        temporaryPassword,
        emailSent: emailResult?.success || false,
      });

    } catch (error) {
      throw error;
    }

  } catch (error) {
    return failure(
      error instanceof Error ? error.message : "Error desconocido",
    );
  }
}

/**
 * Accept operation by user with confirmation token
 */
export async function acceptOperation(
  token: string,
  password: string,
): Promise<Result<{ operationId: string; userId: string }>> {
  try {
    const client = getDbClient();

    const tokenData = verifyConfirmationToken(token);
    if (!tokenData) {
      return failure("Token de confirmación inválido o expirado");
    }

    const user = await client.user.findUnique({
      where: { email: tokenData.email },
    });

    if (!user) {
      return failure("Usuario no encontrado");
    }

    const passwordValid = await bcrypt.compare(password, user.password);
    if (!passwordValid) {
      return failure("Contraseña incorrecta");
    }

    const operation = await client.operation.findUnique({
      where: { id: tokenData.operationId },
    });

    if (!operation) {
      return failure("Operación no encontrada");
    }

    if (operation.status !== "pending_user_acceptance") {
      return failure("Esta operación ya ha sido procesada");
    }

    const newStatus = operation.operationType === "reservation" ? "initiated" : "completed";

    await client.operation.update({
      where: { id: operation.id },
      data: {
        status: newStatus,
        completedAt: operation.operationType === "purchase" ? new Date() : undefined,
      },
    });

    if (operation.operationType === "purchase") {
      const operationUnits = await client.operationUnit.findMany({
        where: { operationId: operation.id },
        select: { unitId: true },
      });

      for (const ou of operationUnits) {
        await client.unit.update({
          where: { id: ou.unitId },
          data: { status: "sold" },
        });
      }
    }

    return success({
      operationId: operation.id,
      userId: user.id,
    });

  } catch (error) {
    return failure(
      error instanceof Error ? error.message : "Error desconocido",
    );
  }
}

// =============================================================================
// CLIENT-ONLY CREATION (NO OPERATION)
// =============================================================================

interface CreateClientOnlyInput {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  documentType?: string;
  documentNumber?: string;
  address?: string;
  city?: string;
  organizationId: string;
  createdBy: string;
}

/**
 * Create client only - No operation, just welcome email
 */
export async function createClientOnly(
  input: CreateClientOnlyInput,
  ipAddress?: string,
  userAgent?: string,
): Promise<Result<{
  user: User;
  temporaryPassword: string;
  emailSent: boolean;
}>> {
  try {
    const client = getDbClient();

    const temporaryPassword = generateSecurePassword();
    const hashedPassword = await bcrypt.hash(temporaryPassword, 12);

    const createdUser = await client.user.create({
      data: {
        email: input.email,
        password: hashedPassword,
        firstName: input.firstName,
        lastName: input.lastName,
        phone: input.phone,
        documentType: input.documentType,
        documentNumber: input.documentNumber,
        address: input.address,
        city: input.city,
        createdBy: input.createdBy,
      },
    });

    // Send simple welcome email (no operation details)
    const organization = await client.organization.findUnique({
      where: { id: input.organizationId },
      select: { name: true },
    });

    const emailResult = await sendSimpleWelcomeEmail({
      to: input.email,
      firstName: input.firstName,
      lastName: input.lastName,
      organizationName: organization?.name || "Domera",
      temporaryPassword,
    });

    if (!emailResult.success) {
      console.error("Failed to send welcome email:", emailResult.error);
      // Note: We don't fail the operation if email fails
    }

    // Log audit
    await logAudit(client, {
      userId: input.createdBy,
      organizationId: input.organizationId,
      tableName: "users",
      recordId: createdUser.id,
      action: "INSERT",
      newValues: {
        email: input.email,
        firstName: input.firstName,
        lastName: input.lastName,
      },
      ipAddress,
      userAgent,
    });

    return success({
      user: createdUser,
      temporaryPassword,
      emailSent: emailResult?.success || false,
    });

  } catch (error) {
    return failure(
      error instanceof Error ? error.message : "Error desconocido",
    );
  }
}

// =============================================================================
// EMAIL RESEND FUNCTIONS
// =============================================================================

/**
 * Resend simple welcome email to existing client
 */
export async function resendClientWelcomeEmail(
  userId: string,
  organizationId: string,
): Promise<Result<{ emailSent: boolean }>> {
  try {
    const client = getDbClient();

    // Get user details
    const user = await client.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      return failure("Usuario no encontrado o no pertenece a esta organización");
    }

    // Get organization details
    const organization = await client.organization.findUnique({
      where: { id: organizationId },
      select: { name: true },
    });

    // Generate new temporary password
    const temporaryPassword = generateSecurePassword();
    const hashedPassword = await bcrypt.hash(temporaryPassword, 12);

    // Update user password
    await client.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    // Send email
    const emailResult = await sendSimpleWelcomeEmail({
      to: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      organizationName: organization?.name || "Domera",
      temporaryPassword,
    });

    return success({
      emailSent: emailResult.success,
    });

  } catch (error) {
    return failure(
      error instanceof Error ? error.message : "Error desconocido",
    );
  }
}

/**
 * Resend operation confirmation email to existing client
 */
export async function resendOperationConfirmationEmail(
  operationId: string,
  organizationId: string,
): Promise<Result<{ emailSent: boolean }>> {
  try {
    const client = getDbClient();

    // Get operation with user and units details
    const operation = await client.operation.findFirst({
      where: {
        id: operationId,
        organizationId,
      },
      include: {
        user: true,
        operationUnits: {
          include: {
            unit: {
              include: {
                project: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!operation) {
      return failure("Operación no encontrada");
    }

    // Generate new temporary password and confirmation token
    const temporaryPassword = generateSecurePassword();
    const hashedPassword = await bcrypt.hash(temporaryPassword, 12);

    // Update user password
    await client.user.update({
      where: { id: operation.userId },
      data: { password: hashedPassword },
    });

    const confirmationToken = generateConfirmationToken({
      operationId: operation.id,
      email: operation.user.email,
      temporaryPassword,
    });

    // Get organization details
    const organization = await client.organization.findUnique({
      where: { id: organizationId },
      select: { name: true },
    });

    // Prepare units data for email
    const units = operation.operationUnits.map(ou => ({
      unitNumber: ou.unit.unitNumber,
      projectName: ou.unit.project.name,
    }));

    // Send operation confirmation email
    const emailResult = await sendWelcomeEmail({
      to: operation.user.email,
      firstName: operation.user.firstName,
      lastName: operation.user.lastName,
      organizationName: organization?.name || "Domera",
      operationType: operation.operationType,
      units,
      totalAmount: operation.totalAmount.toNumber(),
      temporaryPassword,
      confirmationToken,
      confirmationUrl: generateConfirmationUrl(confirmationToken),
    });

    return success({
      emailSent: emailResult.success,
    });

  } catch (error) {
    return failure(
      error instanceof Error ? error.message : "Error desconocido",
    );
  }
}