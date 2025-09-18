// =============================================================================
// VERIFICATION UTILITY FUNCTIONS
// Utility functions for verification that don't require server actions
// =============================================================================

import type { VerificationStatus } from "@prisma/client";

import {
  VerificationError,
  DiditApiError,
} from "@/lib/types/verification";
import type {
  DiditVerificationStatus,
  DiditWebhookPayload,
} from "@/lib/types/verification";

// =============================================================================
// STATUS MAPPING UTILITIES
// =============================================================================

/**
 * Map Didit verification status to our internal status
 */
export function mapDiditStatusToInternal(diditStatus: DiditVerificationStatus): VerificationStatus {
  switch (diditStatus) {
    case "Not Started":
      return "NOT_STARTED";
    case "In Progress":
      return "IN_PROGRESS";
    case "In Review":
      return "IN_REVIEW";
    case "Approved":
      return "APPROVED";
    case "Declined":
      return "DECLINED";
    case "Expired":
      return "EXPIRED";
    case "Abandoned":
      return "ABANDONED";
    default:
      console.warn(`Unknown Didit status: ${diditStatus}`);
      return "NOT_STARTED";
  }
}

/**
 * Check if a verification status is final (no further changes expected)
 */
export function isVerificationFinal(status: VerificationStatus): boolean {
  return ["APPROVED", "DECLINED", "EXPIRED", "ABANDONED"].includes(status);
}

/**
 * Check if user can retry verification based on current status
 */
export function canRetryVerification(status: VerificationStatus): boolean {
  return ["DECLINED", "EXPIRED", "ABANDONED"].includes(status);
}

// =============================================================================
// WEBHOOK PROCESSING UTILITIES
// =============================================================================

/**
 * Process webhook data and return verification update info
 */
export function processWebhookData(webhookData: DiditWebhookPayload) {
  const internalStatus = mapDiditStatusToInternal(webhookData.status);
  const isVerified = internalStatus === "APPROVED";
  const isFinal = isVerificationFinal(internalStatus);

  return {
    sessionId: webhookData.session_id,
    userId: webhookData.vendor_data,
    status: internalStatus,
    isVerified,
    isFinal,
    decision: webhookData.decision,
    timestamp: new Date(webhookData.timestamp * 1000),
  };
}

// =============================================================================
// ERROR TYPE GUARDS
// =============================================================================

export function isDiditApiError(error: unknown): error is DiditApiError {
  return error instanceof Error && error.name === "DiditApiError";
}

export function isVerificationError(error: unknown): error is VerificationError {
  return error instanceof Error && error.name === "VerificationError";
}