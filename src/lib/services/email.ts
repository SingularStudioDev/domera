// =============================================================================
// EMAIL SERVICE
// Email service using Resend for transactional emails
// =============================================================================

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Send email using Resend
 */
export async function sendEmail(options: EmailOptions): Promise<EmailResult> {
  try {
    const resendApiKey = process.env.RESEND_API_KEY;
    
    if (!resendApiKey) {
      console.warn('[EMAIL] No RESEND_API_KEY found, using development mode (console log)');
      
      // Development mode - log to console
      console.log('[EMAIL] === 2FA CODE EMAIL (DEV MODE) ===');
      console.log('[EMAIL] To:', options.to);
      console.log('[EMAIL] Subject:', options.subject);
      console.log('[EMAIL] From:', options.from || 'Domera <noreply@domera.uy>');
      
      // Extract the 6-digit code from HTML for easy copying
      const codeMatch = options.html.match(/(\d{6})/);
      if (codeMatch) {
        console.log('[EMAIL] 🔑 2FA CODE:', codeMatch[1]);
        console.log('[EMAIL] =====================================');
      }
      
      return {
        success: true,
        messageId: `dev_mock_${Date.now()}`
      };
    }

    // Production mode - send via Resend
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: options.from || 'Domera Security <security@domera.uy>',
        to: [options.to],
        subject: options.subject,
        html: options.html,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('[EMAIL] Resend API error:', errorData);
      throw new Error(`Resend API error: ${response.status} ${errorData}`);
    }

    const data = await response.json();
    console.log('[EMAIL] Email sent successfully via Resend:', data.id);

    return {
      success: true,
      messageId: data.id
    };

  } catch (error) {
    console.error('[EMAIL] Error sending email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    };
  }
}

/**
 * Send 2FA verification code email
 */
export async function send2FAEmail(
  email: string,
  code: string,
  ipAddress?: string,
  userAgent?: string
): Promise<EmailResult> {
  return sendEmail({
    to: email,
    subject: 'Código de verificación - Acceso Super Administrador',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Código de verificación</h2>
        <p>Has solicitado acceso como Super Administrador en Domera.</p>
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
          <h3 style="font-size: 32px; font-weight: bold; letter-spacing: 4px; margin: 0; color: #1f2937;">${code}</h3>
        </div>
        <p>Este código expira en 10 minutos.</p>
        <p style="color: #dc2626; font-weight: bold;">Si no solicitaste este acceso, ignora este email.</p>
        <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 12px;">
          Detalles de seguridad:<br>
          IP: ${ipAddress || 'No disponible'}<br>
          Navegador: ${userAgent || 'No disponible'}<br>
          Fecha: ${new Date().toLocaleString('es-UY')}
        </p>
      </div>
    `
  });
}