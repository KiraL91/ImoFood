import { env } from "@/lib/env";

type ApiClientOptions = RequestInit;

export async function apiClient<TResponse>(
  path: string,
  options: ApiClientOptions = {},
): Promise<TResponse> {
  if (!env.NEXT_PUBLIC_API_BASE_URL) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL is not configured yet.");
  }

  // Backend later: centralize auth headers, error mapping and retries here.
  const response = await fetch(new URL(path, env.NEXT_PUBLIC_API_BASE_URL), {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`);
  }

  return response.json() as Promise<TResponse>;
}
