const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:6000/api";

export async function apiFetch<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...options?.headers },
    ...options,
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(error.message || "API error");
  }
  return res.json();
}
