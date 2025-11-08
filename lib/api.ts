export async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  const res = await fetch(`http://localhost:8000${endpoint}`, {
    ...options,
    credentials: "include", // send cookies (session)
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  if (!res.ok) {
    if (res.status === 401) return { authenticated: false };
    throw new Error(`Request failed: ${res.status}`);
  }

  return res.json();
}
