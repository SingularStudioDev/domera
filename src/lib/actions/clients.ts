"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";

import {
  getOrganizationClients,
  getClientDetails,
  getOrganizationClientStats,
  checkEmailAvailability,
  getAvailableUnitsByProject,
  validateUnitsAvailability,
  createClientWithOperation,
  acceptOperation
} from "@/lib/dal/clients";

const GetClientsSchema = z.object({
  page: z.number().min(1).default(1),
  pageSize: z.number().min(1).max(100).default(10),
  organizationId: z.string().min(1),
  status: z.enum(["all", "active", "completed", "cancelled"]).optional(),
  search: z.string().optional(),
});

const GetClientDetailsSchema = z.object({
  clientId: z.string().min(1),
  organizationId: z.string().min(1),
});

const GetClientStatsSchema = z.object({
  organizationId: z.string().min(1),
});

const CheckEmailSchema = z.object({
  email: z.string().email(),
  organizationId: z.string().min(1),
});

const GetAvailableUnitsSchema = z.object({
  organizationId: z.string().min(1),
});

const ValidateUnitsSchema = z.object({
  unitIds: z.array(z.string().min(1)).min(1).max(2),
  organizationId: z.string().min(1),
});

const CreateClientSchema = z.object({
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  email: z.string().email(),
  phone: z.string().optional(),
  documentType: z.string().optional(),
  documentNumber: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  organizationId: z.string().min(1),
  operationType: z.enum(["reservation", "purchase"]),
  unitIds: z.array(z.string().min(1)).min(1).max(2),
  totalAmount: z.number().positive(),
  notes: z.string().optional(),
  installments: z.number().min(1).optional(),
  firstDueDate: z.date().optional(),
  createdBy: z.string().min(1),
});

const AcceptOperationSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(1),
});

export async function getClientsAction(input: z.infer<typeof GetClientsSchema>) {
  const validatedInput = GetClientsSchema.parse(input);
  
  const result = await getOrganizationClients(validatedInput);
  
  if (!result.data) {
    throw new Error(result.error || "Error al obtener clientes");
  }
  
  return result.data;
}

export async function getClientDetailsAction(input: z.infer<typeof GetClientDetailsSchema>) {
  const validatedInput = GetClientDetailsSchema.parse(input);
  
  const result = await getClientDetails(
    validatedInput.clientId, 
    validatedInput.organizationId
  );
  
  if (!result.data) {
    throw new Error(result.error || "Error al obtener clientes");
  }
  
  return result.data;
}

export async function getClientStatsAction(input: z.infer<typeof GetClientStatsSchema>) {
  const validatedInput = GetClientStatsSchema.parse(input);

  const result = await getOrganizationClientStats(validatedInput.organizationId);

  if (!result.data) {
    throw new Error(result.error || "Error al obtener estadísticas");
  }

  return result.data;
}

export async function checkEmailAction(input: z.infer<typeof CheckEmailSchema>) {
  const validatedInput = CheckEmailSchema.parse(input);

  const result = await checkEmailAvailability(
    validatedInput.email,
    validatedInput.organizationId
  );

  if (!result.data) {
    throw new Error(result.error || "Error al verificar email");
  }

  return result.data;
}

export async function getAvailableUnitsAction(input: z.infer<typeof GetAvailableUnitsSchema>) {
  const validatedInput = GetAvailableUnitsSchema.parse(input);

  const result = await getAvailableUnitsByProject(validatedInput.organizationId);

  if (!result.data) {
    throw new Error(result.error || "Error al obtener unidades");
  }

  return result.data;
}

export async function validateUnitsAction(input: z.infer<typeof ValidateUnitsSchema>) {
  const validatedInput = ValidateUnitsSchema.parse(input);

  const result = await validateUnitsAvailability(
    validatedInput.unitIds,
    validatedInput.organizationId
  );

  if (!result.data) {
    throw new Error(result.error || "Error al validar unidades");
  }

  return result.data;
}

export async function createClientAction(input: z.infer<typeof CreateClientSchema>) {
  const validatedInput = CreateClientSchema.parse(input);

  const result = await createClientWithOperation(validatedInput);

  if (!result.data) {
    throw new Error(result.error || "Error al crear cliente");
  }

  // Serialize data to convert Decimal objects to numbers
  const serializedData = JSON.parse(JSON.stringify(result.data));

  // Transform specific Decimal fields if they exist
  if (serializedData.operation) {
    serializedData.operation = {
      ...serializedData.operation,
      totalAmount: serializedData.operation.totalAmount ? Number(serializedData.operation.totalAmount) : null,
      platformFee: serializedData.operation.platformFee ? Number(serializedData.operation.platformFee) : null,
    };
  }

  // Revalidate the clients list
  revalidatePath(`/dashboard/clients`);

  return serializedData;
}

export async function acceptOperationAction(input: z.infer<typeof AcceptOperationSchema>) {
  const validatedInput = AcceptOperationSchema.parse(input);

  const result = await acceptOperation(
    validatedInput.token,
    validatedInput.password
  );

  if (!result.data) {
    throw new Error(result.error || "Error al aceptar operación");
  }

  return result.data;
}