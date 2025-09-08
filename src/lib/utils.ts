import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatUnitType(type: string): string {
  const translations: Record<string, string> = {
    apartment: "Apartamento",
    commercial_space: "Local comercial",
    garage: "Garage",
    storage: "Depósito",
    office: "Oficina",
  };

  return translations[type] || type.charAt(0).toUpperCase() + type.slice(1);
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("es-UY", {
    style: "currency",
    currency: "UYU",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}
