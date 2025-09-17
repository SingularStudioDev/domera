// =============================================================================
// EMAIL SERVICE - RESEND
// Handle all email communications for the platform
// =============================================================================

import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

// =============================================================================
// TYPES
// =============================================================================

interface WelcomeEmailData {
  to: string;
  firstName: string;
  lastName: string;
  organizationName: string;
  operationType: "reservation" | "purchase";
  units: Array<{
    unitNumber: string;
    projectName: string;
  }>;
  totalAmount: number;
  temporaryPassword: string;
  confirmationToken: string;
  confirmationUrl: string;
}

interface EmailResult {
  success: boolean;
  error?: string;
  messageId?: string;
}

// =============================================================================
// EMAIL TEMPLATES
// =============================================================================

function generateWelcomeEmailHtml(data: WelcomeEmailData): string {
  const operationTypeText = data.operationType === "reservation" ? "Reserva" : "Compra";
  const unitsText = data.units.map(u => `${u.unitNumber} - ${u.projectName}`).join(", ");

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Bienvenido a ${data.organizationName}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          background: #0066cc;
          color: white;
          padding: 20px;
          text-align: center;
          border-radius: 8px 8px 0 0;
        }
        .content {
          background: #f9f9f9;
          padding: 30px;
          border-radius: 0 0 8px 8px;
        }
        .highlight {
          background: #e8f4fd;
          padding: 15px;
          border-radius: 5px;
          margin: 20px 0;
        }
        .button {
          display: inline-block;
          background: #0066cc;
          color: white;
          padding: 15px 30px;
          text-decoration: none;
          border-radius: 5px;
          margin: 20px 0;
        }
        .credentials {
          background: #fff3cd;
          border: 1px solid #ffeaa7;
          padding: 15px;
          border-radius: 5px;
          margin: 20px 0;
        }
        .footer {
          text-align: center;
          color: #666;
          font-size: 12px;
          margin-top: 30px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>¡Bienvenido a ${data.organizationName}!</h1>
        <p>Hemos creado tu ${operationTypeText.toLowerCase()} exitosamente</p>
      </div>

      <div class="content">
        <h2>Hola ${data.firstName} ${data.lastName},</h2>

        <p>¡Felicitaciones! Hemos procesado tu ${operationTypeText.toLowerCase()} para las siguientes unidades:</p>

        <div class="highlight">
          <strong>Unidades seleccionadas:</strong><br>
          ${unitsText}<br><br>
          <strong>Tipo de operación:</strong> ${operationTypeText}<br>
          <strong>Monto total:</strong> USD $${data.totalAmount.toLocaleString()}
        </div>

        <p>Para completar el proceso, necesitas <strong>aceptar esta operación</strong> ingresando a tu cuenta.</p>

        <div class="credentials">
          <strong>📧 Credenciales de acceso:</strong><br>
          <strong>Email:</strong> ${data.to}<br>
          <strong>Contraseña temporal:</strong> <code>${data.temporaryPassword}</code><br>
          <small>⚠️ Recomendamos cambiar tu contraseña después del primer ingreso</small>
        </div>

        <div style="text-align: center;">
          <a href="${data.confirmationUrl}" class="button">Aceptar Operación</a>
        </div>

        <p><strong>¿Qué sigue?</strong></p>
        <ol>
          <li>Haz clic en "Aceptar Operación" arriba</li>
          <li>Ingresa con las credenciales proporcionadas</li>
          <li>Revisa los detalles de tu ${operationTypeText.toLowerCase()}</li>
          <li>Confirma la operación</li>
        </ol>

        <p><strong>Importante:</strong> Este enlace expira en 30 días. Si tienes alguna pregunta, contacta a ${data.organizationName}.</p>
      </div>

      <div class="footer">
        <p>Este es un email automático. Por favor no responder a este mensaje.</p>
        <p>© ${new Date().getFullYear()} ${data.organizationName}. Todos los derechos reservados.</p>
      </div>
    </body>
    </html>
  `;
}

function generateWelcomeEmailText(data: WelcomeEmailData): string {
  const operationTypeText = data.operationType === "reservation" ? "Reserva" : "Compra";
  const unitsText = data.units.map(u => `${u.unitNumber} - ${u.projectName}`).join(", ");

  return `
¡Bienvenido a ${data.organizationName}!

Hola ${data.firstName} ${data.lastName},

¡Felicitaciones! Hemos procesado tu ${operationTypeText.toLowerCase()} para las siguientes unidades:

Unidades seleccionadas: ${unitsText}
Tipo de operación: ${operationTypeText}
Monto total: USD $${data.totalAmount.toLocaleString()}

Para completar el proceso, necesitas aceptar esta operación ingresando a tu cuenta.

CREDENCIALES DE ACCESO:
Email: ${data.to}
Contraseña temporal: ${data.temporaryPassword}
⚠️ Recomendamos cambiar tu contraseña después del primer ingreso

PARA ACEPTAR LA OPERACIÓN:
Ingresa a: ${data.confirmationUrl}

¿QUÉ SIGUE?
1. Haz clic en el enlace de arriba
2. Ingresa con las credenciales proporcionadas
3. Revisa los detalles de tu ${operationTypeText.toLowerCase()}
4. Confirma la operación

IMPORTANTE: Este enlace expira en 30 días. Si tienes alguna pregunta, contacta a ${data.organizationName}.

---
Este es un email automático. Por favor no responder a este mensaje.
© ${new Date().getFullYear()} ${data.organizationName}. Todos los derechos reservados.
  `;
}

// =============================================================================
// EMAIL FUNCTIONS
// =============================================================================

export async function sendWelcomeEmail(data: WelcomeEmailData): Promise<EmailResult> {
  try {
    if (!process.env.RESEND_API_KEY) {
      return {
        success: false,
        error: "RESEND_API_KEY no está configurada",
      };
    }

    const operationTypeText = data.operationType === "reservation" ? "Reserva" : "Compra";

    const result = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "noreply@domera.uy",
      to: [data.to],
      subject: `${operationTypeText} creada exitosamente - ${data.organizationName}`,
      html: generateWelcomeEmailHtml(data),
      text: generateWelcomeEmailText(data),
    });

    if (result.error) {
      return {
        success: false,
        error: result.error.message,
      };
    }

    return {
      success: true,
      messageId: result.data?.id,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error desconocido",
    };
  }
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

export function generateConfirmationUrl(token: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return `${baseUrl}/accept-operation/${token}`;
}