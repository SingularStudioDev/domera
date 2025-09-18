// =============================================================================
// VERIFICATION WEBHOOK ENDPOINT
// Handles webhook notifications from Didit KYC service
// =============================================================================

import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

import {
  markUserVerified,
  updateVerificationSession,
} from "@/lib/dal/verification";
import {
  validateWebhook,
} from "@/lib/services/didit";
import {
  processWebhookData,
} from "@/lib/utils/verification";
import { extractRealIP } from "@/lib/utils/security";

// =============================================================================
// WEBHOOK HANDLER
// =============================================================================

export async function POST(request: NextRequest) {
  try {
    // Get headers for security validation
    const headersList = await headers();
    const signature = headersList.get("X-Didit-Signature");
    const ipAddress = extractRealIP(headersList);
    const userAgent = headersList.get("User-Agent");

    // Validate signature header presence
    if (!signature) {
      console.warn("Webhook received without signature");
      return NextResponse.json(
        { error: "Missing signature" },
        { status: 401 }
      );
    }

    // Get request payload
    const payload = await request.text();

    // Validate webhook signature and payload
    const validation = await validateWebhook(payload, signature);
    if (!validation.isValid) {
      console.warn("Invalid webhook signature:", validation.error);
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 401 }
      );
    }

    const webhookData = validation.data!;
    console.log("Received webhook:", {
      sessionId: webhookData.session_id,
      status: webhookData.status,
      userId: webhookData.vendor_data,
    });

    // Process webhook data
    const processedData = processWebhookData(webhookData);

    // Update verification session in database
    const sessionUpdateResult = await updateVerificationSession(
      processedData.sessionId,
      processedData.status,
      processedData.decision,
      ipAddress,
      userAgent
    );

    if (!sessionUpdateResult.data) {
      console.error("Failed to update verification session:", sessionUpdateResult.error);
      return NextResponse.json(
        { error: "Failed to update session" },
        { status: 500 }
      );
    }

    // If verification is approved, mark user as verified
    if (processedData.isVerified) {
      const userUpdateResult = await markUserVerified(
        processedData.userId,
        ipAddress,
        userAgent
      );

      if (!userUpdateResult.data) {
        console.error("Failed to mark user as verified:", userUpdateResult.error);
        // Don't fail the webhook for this - the session status is already updated
      } else {
        console.log("User marked as verified:", processedData.userId);
      }
    }

    // Log webhook processing for audit
    console.log("Webhook processed successfully:", {
      sessionId: processedData.sessionId,
      userId: processedData.userId,
      status: processedData.status,
      isVerified: processedData.isVerified,
      isFinal: processedData.isFinal,
    });

    // TODO: Send notification to user about verification status change
    // await sendVerificationStatusNotification(processedData.userId, processedData.status);

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Webhook processing error:", error);

    // Return 500 to trigger Didit's retry mechanism
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// =============================================================================
// METHOD NOT ALLOWED
// =============================================================================

export async function GET() {
  return NextResponse.json(
    { error: "Method not allowed" },
    { status: 405 }
  );
}

export async function PUT() {
  return NextResponse.json(
    { error: "Method not allowed" },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { error: "Method not allowed" },
    { status: 405 }
  );
}