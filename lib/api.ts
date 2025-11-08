const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE_URL}${endpoint}`;

  const res = await fetch(url, {
    ...options,
    // CRITICAL: This sends the HttpOnly session cookie
    credentials: "include", 
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  // If the response is a 401 (Unauthorized),
  // return a standard object that our auth store can check.
  if (res.status === 401) {
    return { ok: false, error: "Not authenticated" };
  }

  // If the response is not 'ok' but also not a 401,
  // try to parse the error message from the backend.
  if (!res.ok) {
    let errorData;
    try {
      errorData = await res.json();
    } catch (e) {
      errorData = { error: `HTTP error! status: ${res.status}` };
    }
    // Throw an error to be caught by the store's try/catch block
    throw new Error(errorData.error || "An unknown API error occurred");
  }

  // If we're here, the request was successful
  return res.json();
}