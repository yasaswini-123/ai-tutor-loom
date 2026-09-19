/**
 * Standalone error reporting utility for AI Study Companion.
 * Logs boundary-caught React errors to the console.
 * Replace this with your preferred monitoring solution (e.g. Sentry) in production.
 */

export function reportError(error: unknown, context: Record<string, unknown> = {}) {
  const message =
    error instanceof Response
      ? `Response ${error.status}${error.url ? ` at ${error.url}` : ""}`
      : error instanceof Error
        ? error.message
        : String(error);

  console.error("[AI Study Companion Error]", message, context);
}
