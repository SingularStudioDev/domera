// =============================================================================
// SECURITY UTILITIES
// Utility functions for generating secure tokens and handling security operations
// =============================================================================

import crypto from 'crypto';

/**
 * Generate a cryptographically secure random token
 */
export function generateSecureToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Generate a secure 6-digit numeric code for 2FA
 */
export function generate2FACode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Generate a cryptographically secure random string
 */
export function generateSecureString(length: number = 16): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  
  for (let i = 0; i < length; i++) {
    const randomIndex = crypto.randomInt(0, chars.length);
    result += chars[randomIndex];
  }
  
  return result;
}

/**
 * Validate IP address format
 */
export function isValidIPAddress(ip: string): boolean {
  const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
  
  return ipv4Regex.test(ip) || ipv6Regex.test(ip);
}

/**
 * Extract real IP address from request headers
 */
export function extractRealIP(headers: Headers): string | undefined {
  // Check various headers that proxies might use
  const possibleHeaders = [
    'x-forwarded-for',
    'x-real-ip',
    'x-client-ip',
    'cf-connecting-ip', // Cloudflare
    'fastly-client-ip', // Fastly
    'true-client-ip',   // Akamai
    'x-cluster-client-ip'
  ];

  for (const header of possibleHeaders) {
    const value = headers.get(header);
    if (value) {
      // x-forwarded-for can contain multiple IPs, get the first one
      const ip = value.split(',')[0].trim();
      if (isValidIPAddress(ip)) {
        return ip;
      }
    }
  }

  return undefined;
}

/**
 * Hash a value using SHA-256
 */
export function hashValue(value: string): string {
  return crypto.createHash('sha256').update(value).digest('hex');
}

/**
 * Create a time-based expiry (in minutes from now)
 */
export function createExpiry(minutes: number): Date {
  return new Date(Date.now() + minutes * 60 * 1000);
}

/**
 * Check if a timestamp is expired
 */
export function isExpired(expiryDate: Date): boolean {
  return new Date() > expiryDate;
}

/**
 * Rate limiting utility - check if action is allowed
 */
export function checkRateLimit(
  attempts: number,
  maxAttempts: number,
  timeWindow: number, // in minutes
  lastAttempt?: Date
): { allowed: boolean; resetTime?: Date } {
  if (!lastAttempt) {
    return { allowed: true };
  }

  const now = new Date();
  const windowStart = new Date(now.getTime() - timeWindow * 60 * 1000);

  // If last attempt was outside the time window, reset
  if (lastAttempt < windowStart) {
    return { allowed: true };
  }

  // If within window but under limit
  if (attempts < maxAttempts) {
    return { allowed: true };
  }

  // Rate limited - calculate when they can try again
  const resetTime = new Date(lastAttempt.getTime() + timeWindow * 60 * 1000);
  return { allowed: false, resetTime };
}

/**
 * Sanitize user agent string for logging
 */
export function sanitizeUserAgent(userAgent: string | null): string {
  if (!userAgent) return 'Unknown';
  
  // Limit length and remove potentially harmful characters
  return userAgent
    .slice(0, 500)
    .replace(/[<>]/g, '')
    .trim();
}

/**
 * Create a secure session fingerprint
 */
export function createSessionFingerprint(
  ipAddress: string,
  userAgent: string,
  additionalData?: Record<string, string>
): string {
  const data = {
    ip: ipAddress,
    ua: userAgent,
    ...additionalData
  };
  
  return hashValue(JSON.stringify(data));
}

/**
 * Validate session fingerprint
 */
export function validateSessionFingerprint(
  storedFingerprint: string,
  currentIP: string,
  currentUserAgent: string,
  additionalData?: Record<string, string>
): boolean {
  const currentFingerprint = createSessionFingerprint(
    currentIP,
    currentUserAgent,
    additionalData
  );
  
  return storedFingerprint === currentFingerprint;
}