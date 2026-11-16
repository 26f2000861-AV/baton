import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Sanitizes and validates external URLs for safe rendering in href attributes (SEC-10).
 * Prevents client-side XSS via javascript:, data:, or malformed protocols.
 * Allows strictly valid http: and https: protocols.
 */
export function sanitizeSafeUrl(rawUrl: string | null | undefined): string | null {
  if (!rawUrl || typeof rawUrl !== 'string') return null
  const trimmed = rawUrl.trim()
  if (!trimmed) return null

  try {
    const parsed = new URL(trimmed)
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return null
    }
    // Hostname must be a valid domain, IP, or localhost
    if (!parsed.hostname || !/^[a-zA-Z0-9.-]+(:[0-9]+)?$/.test(parsed.host)) {
      return null
    }
    return parsed.href
  } catch {
    // Malformed URL or non-standard URI scheme (e.g. vault:, slack:)
    return null
  }
}
