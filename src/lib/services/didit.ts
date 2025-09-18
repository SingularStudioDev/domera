// =============================================================================
// DIDIT KYC SERVICE
// Service integration for Didit identity verification API
// =============================================================================

"use server";

import crypto from "crypto";

import type { VerificationStatus } from "@prisma/client";

import {
  DiditApiError,
  VerificationError,
} from "@/lib/types/verification";
import type {
  DiditConfig,
  DiditAuthRequest,
  DiditAuthResponse,
  DiditSessionRequest,
  DiditSessionResponse,
  DiditVerificationStatus,
  DiditWebhookPayload,
  WebhookValidationResult
} from "@/lib/types/verification";
import {
  mapDiditStatusToInternal,
  processWebhookData,
} from "@/lib/utils/verification";

// =============================================================================
// CONFIGURATION
// =============================================================================

function getDiditConfig(): DiditConfig {
  // Dynamically construct webhook URL from NEXTAUTH_URL
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  const webhookUrl = `${baseUrl}/api/verification/webhook`;

  const config = {
    apiKey: process.env.DIDIT_API_KEY,
    clientSecret: process.env.DIDIT_CLIENT_SECRET,
    webhookSecret: process.env.DIDIT_WEBHOOK_SECRET,
    webhookUrl: webhookUrl,
    workflowId: process.env.DIDIT_WORKFLOW_ID,
    baseUrl: process.env.DIDIT_BASE_URL || "https://verification.didit.me/v2",
    authUrl: process.env.DIDIT_AUTH_URL || "https://apx.didit.me",
  };

  if (!config.apiKey || !config.webhookSecret || !config.webhookUrl || !config.workflowId) {
    throw new Error("Missing required Didit configuration");
  }

  return config as DiditConfig;
}

// =============================================================================
// TOKEN MANAGEMENT
// =============================================================================

// Simple in-memory token cache
let cachedAccessToken: string | null = null;
let tokenExpiresAt: number | null = null;

/**
 * Get access token from Didit auth endpoint
 */
async function getDiditAccessToken(): Promise<string> {
  // Check if we have a valid token
  if (cachedAccessToken && tokenExpiresAt && Date.now() < tokenExpiresAt) {
    return cachedAccessToken;
  }

  try {
    const config = getDiditConfig();
    const credentials = Buffer.from(`${config.apiKey}:${config.clientSecret}`).toString('base64');

    const response = await fetch(`${config.authUrl}/auth/v2/token/`, {
      method: "POST",
      headers: {
        "Authorization": `Basic ${credentials}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "client_credentials"
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new DiditApiError(
        `Failed to get access token: ${error}`,
        response.status,
        error
      );
    }

    const data = await response.json() as DiditAuthResponse;
    cachedAccessToken = data.access_token;
    // Set expiration to 5 minutes before actual expiry for safety
    tokenExpiresAt = Date.now() + (data.expires_in - 300) * 1000;

    return cachedAccessToken;
  } catch (error) {
    if (error instanceof DiditApiError) {
      throw error;
    }
    throw new DiditApiError(
      `Network error getting access token: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

// =============================================================================
// API FUNCTIONS
// =============================================================================

/**
 * Create a new verification session with Didit
 */
async function createDiditSession(request: DiditSessionRequest): Promise<DiditSessionResponse> {
  try {
    const config = getDiditConfig();

    // Try direct API key authentication first
    const response = await fetch(`${config.baseUrl}/session/`, {
      method: "POST",
      headers: {
        "x-api-key": config.apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new DiditApiError(
        `Failed to create verification session: ${error}`,
        response.status,
        error
      );
    }

    const data = await response.json();
    return data as DiditSessionResponse;
  } catch (error) {
    if (error instanceof DiditApiError) {
      throw error;
    }
    throw new DiditApiError(
      `Network error creating verification session: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Get session decision/results from Didit
 */
async function getDiditSessionDecision(sessionId: string): Promise<any> {
  try {
    const config = getDiditConfig();
    const accessToken = await getDiditAccessToken();

    const response = await fetch(`${config.baseUrl}/session/${sessionId}/decision/`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new DiditApiError(
        `Failed to get session decision: ${error}`,
        response.status,
        error
      );
    }

    return await response.json();
  } catch (error) {
    if (error instanceof DiditApiError) {
      throw error;
    }
    throw new DiditApiError(
      `Network error getting session decision: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Validate webhook signature
 */
function validateDiditWebhookSignature(payload: string, signature: string): WebhookValidationResult {
  try {
    const config = getDiditConfig();

    if (!signature.startsWith("sha256=")) {
      return {
        isValid: false,
        error: "Invalid signature format",
      };
    }

    const receivedSignature = signature.substring(7); // Remove 'sha256=' prefix
    const expectedSignature = crypto
      .createHmac("sha256", config.webhookSecret)
      .update(payload)
      .digest("hex");

    const isValid = crypto.timingSafeEqual(
      Buffer.from(receivedSignature, "hex"),
      Buffer.from(expectedSignature, "hex")
    );

    return { isValid };
  } catch (error) {
    return {
      isValid: false,
      error: `Signature validation error: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

// Utility functions moved to @/lib/utils/verification

// =============================================================================
// SERVICE FUNCTIONS
// =============================================================================

/**
 * Create a new verification session for a user
 */
export async function createVerificationSession(
  userId: string,
  callbackUrl?: string
): Promise<DiditSessionResponse> {
  try {
    const config = getDiditConfig();

    const request: DiditSessionRequest = {
      workflow_id: config.workflowId,
      vendor_data: userId,
      callback: callbackUrl || `${process.env.NEXTAUTH_URL}/verification/callback`,
    };

    return await createDiditSession(request);
  } catch (error) {
    if (error instanceof DiditApiError) {
      throw new VerificationError(
        `Failed to create verification session: ${error.message}`,
        "SESSION_CREATION_FAILED",
        error
      );
    }
    throw error;
  }
}

/**
 * Get verification decision for a session
 */
export async function getVerificationDecision(sessionId: string): Promise<any> {
  try {
    return await getDiditSessionDecision(sessionId);
  } catch (error) {
    if (error instanceof DiditApiError) {
      throw new VerificationError(
        `Failed to get verification decision: ${error.message}`,
        "DECISION_FETCH_FAILED",
        error
      );
    }
    throw error;
  }
}

/**
 * Validate webhook payload and signature
 */
export async function validateWebhook(
  payload: string,
  signature: string
): Promise<{ isValid: boolean; data?: DiditWebhookPayload; error?: string }> {
  try {
    // Validate signature first
    const signatureValidation = validateDiditWebhookSignature(payload, signature);
    if (!signatureValidation.isValid) {
      return {
        isValid: false,
        error: signatureValidation.error || "Invalid webhook signature",
      };
    }

    // Parse payload
    const data = JSON.parse(payload) as DiditWebhookPayload;

    // Basic payload validation
    if (!data.session_id || !data.status || !data.vendor_data) {
      return {
        isValid: false,
        error: "Missing required webhook data",
      };
    }

    // Validate timestamp (within 5 minutes)
    const now = Math.floor(Date.now() / 1000);
    const maxAge = 5 * 60; // 5 minutes
    if (Math.abs(now - data.timestamp) > maxAge) {
      return {
        isValid: false,
        error: "Webhook timestamp too old",
      };
    }

    return {
      isValid: true,
      data,
    };
  } catch (error) {
    return {
      isValid: false,
      error: `Webhook validation error: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

// processWebhookData and error helpers moved to @/lib/utils/verification

// =============================================================================
// EXPORTS
// =============================================================================

export {
  type DiditConfig,
  type DiditAuthRequest,
  type DiditAuthResponse,
  type DiditSessionRequest,
  type DiditSessionResponse,
  type DiditWebhookPayload,
  type DiditVerificationStatus,
};