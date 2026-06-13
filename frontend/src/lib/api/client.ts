import { env } from "@/lib/env";
import {
  expireStoredAuthSession,
  getStoredAccessToken,
} from "@/features/auth/auth-storage";

type ApiClientOptions = RequestInit;

export async function apiClient<TResponse>(
  path: string,
  options: ApiClientOptions = {},
): Promise<TResponse> {
  if (!env.NEXT_PUBLIC_API_BASE_URL) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL is not configured yet.");
  }

  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");

  const accessToken = getStoredAccessToken();

  if (accessToken && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  const response = await fetch(new URL(path, env.NEXT_PUBLIC_API_BASE_URL), {
    ...options,
    headers,
  });

  if (response.status === 401 && accessToken) {
    expireStoredAuthSession();
  }

  if (!response.ok) {
    let message = `API request failed with status ${response.status}`;

    try {
      const errorBody = (await response.json()) as { message?: string | string[] };

      if (Array.isArray(errorBody.message)) {
        message = errorBody.message.join(", ");
      } else if (errorBody.message) {
        message = errorBody.message;
      }
    } catch {
      // Keep the status-based error when the backend does not return JSON.
    }

    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as TResponse;
  }

  const contentType = response.headers.get("content-type");

  if (!contentType?.includes("application/json")) {
    return undefined as TResponse;
  }

  return response.json() as Promise<TResponse>;
}
