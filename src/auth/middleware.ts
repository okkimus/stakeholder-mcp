import { logger } from "../utils/logger";

/**
 * Validates an API key against the configured key
 */
export function validateApiKey(providedKey: string | undefined | null): boolean {
  const configuredKey = process.env.STAKEHOLDER_MCP_API_KEY;

  // If no API key is configured, allow all requests (development mode)
  if (!configuredKey) {
    logger.warn("No STAKEHOLDER_MCP_API_KEY configured. Running in open mode.");
    return true;
  }

  if (!providedKey) {
    return false;
  }

  // Constant-time comparison to prevent timing attacks
  if (providedKey.length !== configuredKey.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < providedKey.length; i++) {
    result |= providedKey.charCodeAt(i) ^ configuredKey.charCodeAt(i);
  }

  return result === 0;
}

/**
 * Extract API key from Authorization header
 * Supports: "Bearer <key>" or raw key
 */
export function extractApiKey(authHeader: string | undefined | null): string | null {
  if (!authHeader) {
    return null;
  }

  // Support Bearer token format
  if (authHeader.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }

  // Support raw key
  return authHeader;
}

/**
 * Middleware-style auth check for HTTP requests
 */
export function authenticateRequest(request: Request): { authenticated: boolean; error?: string } {
  const authHeader = request.headers.get("Authorization");
  const apiKey = extractApiKey(authHeader);

  if (!validateApiKey(apiKey)) {
    logger.warn("Authentication failed", {
      hasAuthHeader: !!authHeader,
      ip: request.headers.get("x-forwarded-for") ?? "unknown",
    });

    return {
      authenticated: false,
      error: "Invalid or missing API key",
    };
  }

  return { authenticated: true };
}
