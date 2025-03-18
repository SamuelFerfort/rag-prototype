/**
 * Custom application error types
 */

export interface AppError extends Error {
  code?: string;
  statusCode?: number;
  context?: Record<string, any>;
}

/**
 * Safe error handling function that works with any error type
 * @param error Any error object
 * @returns A standardized error message
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  return "An unknown error occurred";
}
