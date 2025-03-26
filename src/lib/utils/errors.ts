/**
 * Standardized error handling for server actions
 */
export function handleError(
  error: unknown,
  defaultMessage: string = "Something went wrong"
) {
  console.error(error);

  return {
    success: false,
    error: error instanceof Error ? error.message : defaultMessage,
  };
}
