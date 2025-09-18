// =============================================================================
// VERIFICATION TYPES
// TypeScript types for KYC verification using Didit
// =============================================================================

import type { VerificationStatus } from "@prisma/client";

// =============================================================================
// DIDIT API TYPES
// =============================================================================

export interface DiditConfig {
  apiKey: string;
  clientSecret: string;
  webhookSecret: string;
  webhookUrl: string;
  workflowId: string;
  baseUrl: string;
  authUrl: string;
}

export interface DiditAuthRequest {
  grant_type: "client_credentials";
}

export interface DiditAuthResponse {
  access_token: string;
  token_type: "Bearer";
  expires_in: number;
}

export interface DiditSessionRequest {
  workflow_id: string;   // Required: Workflow ID from Didit Console
  vendor_data?: string;  // Optional: User UUID for tracking
  callback?: string;     // Optional: Callback URL after verification
}

export interface DiditSessionResponse {
  session_id: string;
  session_number: number;
  session_token: string;
  url: string;  // Didit uses "url" not "verification_url"
  vendor_data: string;
  metadata: any;
  status: string;
  callback: string;
  workflow_id: string;
}

export interface DiditWebhookPayload {
  session_id: string;
  status: DiditVerificationStatus;
  webhook_type: "status.updated" | "data.updated";
  created_at: number;
  timestamp: number;
  vendor_data: string; // User UUID
  workflow_id: string;
  decision?: DiditDecision;
}

export type DiditVerificationStatus =
  | "Not Started"
  | "In Progress"
  | "In Review"
  | "Approved"
  | "Declined"
  | "Expired"
  | "Abandoned";

export interface DiditDecision {
  verification_result: "PASS" | "FAIL" | "REVIEW";
  verification_score?: number;
  document_analysis?: {
    document_type: string;
    document_country: string;
    document_validity: boolean;
    extracted_data: Record<string, any>;
  };
  biometric_analysis?: {
    liveness_check: boolean;
    face_match_score: number;
  };
  risk_assessment?: {
    risk_level: "LOW" | "MEDIUM" | "HIGH";
    risk_factors: string[];
  };
}

// =============================================================================
// APPLICATION TYPES
// =============================================================================

export interface VerificationSession {
  id: string;
  sessionId: string; // Didit session ID
  sessionToken?: string;
  status: VerificationStatus;
  userId: string;
  verificationUrl?: string;
  decision?: DiditDecision;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserVerificationInfo {
  isVerified: boolean;
  verificationCompletedAt?: Date;
  latestSession?: VerificationSession;
}

// =============================================================================
// ACTION TYPES
// =============================================================================

export interface VerificationActionResult {
  success: boolean;
  data?: unknown;
  error?: string;
}

export interface StartVerificationInput {
  userId: string;
  callbackUrl?: string;
  features?: string[];
}

export interface StartVerificationResult {
  sessionId: string;
  verificationUrl: string;
  status: VerificationStatus;
}

export interface VerificationStatusResult {
  status: VerificationStatus;
  isVerified: boolean;
  canRetry: boolean;
  session?: VerificationSession;
}

// =============================================================================
// ERROR TYPES
// =============================================================================

export class VerificationError extends Error {
  constructor(
    message: string,
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = "VerificationError";
  }
}

export class DiditApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public response?: any
  ) {
    super(message);
    this.name = "DiditApiError";
  }
}

// =============================================================================
// UTILITY TYPES
// =============================================================================

export type VerificationFeature =
  | "id_verification"
  | "liveness"
  | "face_match"
  | "nfc_verification"
  | "age_estimation"
  | "aml_screening"
  | "address_verification";

export interface VerificationMetrics {
  totalAttempts: number;
  successfulVerifications: number;
  failedVerifications: number;
  pendingVerifications: number;
  averageCompletionTime?: number;
}

// =============================================================================
// HELPER FUNCTIONS TYPES
// =============================================================================

export type StatusMapper = (diditStatus: DiditVerificationStatus) => VerificationStatus;

export interface WebhookValidationResult {
  isValid: boolean;
  error?: string;
}

export interface VerificationConfig {
  requiredForOperations: boolean;
  requiredForAmountThreshold?: number;
  enforcementDate?: Date;
  allowedRetries: number;
  sessionExpirationHours: number;
}