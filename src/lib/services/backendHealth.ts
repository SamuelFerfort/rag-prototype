const API_URL = process.env.DOCUMENT_PROCESSOR_URL;

export async function checkBackendHealth() {
  try {
    const response = await fetch(`${API_URL}/health`, {
      method: "GET",
      cache: "no-store",
    });

    if (!response.ok) {
      return { status: "unhealthy", error: response.statusText };
    }

    return { status: "healthy" };
  } catch (error) {
    return {
      status: "unhealthy",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
