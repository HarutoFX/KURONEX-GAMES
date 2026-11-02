/**
 * KURONEX GAMES — Decoupled Base HTTP Client
 *
 * Configurable via `NEXT_PUBLIC_API_URL`.
 * Allows switching the entire frontend from Next.js internal routes
 * to any external backend (Go, NestJS, Rust, FastAPI, .NET) with 0 UI changes.
 */

const BASE_URL = (process.env.NEXT_PUBLIC_API_URL || "/api").replace(/\/+$/, "");

export class ApiError extends Error {
  public code: string;
  public status: number;
  public details?: unknown;

  constructor(message: string, status: number = 500, code: string = "INTERNAL_ERROR", details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export interface RequestOptions extends RequestInit {
  timeoutMs?: number;
  params?: Record<string, string | number | boolean | undefined>;
}

export async function apiClient<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { timeoutMs = 12000, params, headers, ...restOptions } = options;

  let url = endpoint.startsWith("http") ? endpoint : `${BASE_URL}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;

  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += (url.includes("?") ? "&" : "?") + queryString;
    }
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      ...restOptions,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...headers,
      },
    });

    clearTimeout(timeoutId);

    if (res.status === 204) {
      return {} as T;
    }

    const json = await res.json().catch(() => ({}));

    if (!res.ok) {
      const errorMessage = json.error?.message || json.error || `HTTP ${res.status} error`;
      const errorCode = json.error?.code || `HTTP_${res.status}`;
      throw new ApiError(errorMessage, res.status, errorCode, json);
    }

    return json as T;
  } catch (err: unknown) {
    clearTimeout(timeoutId);
    if (err instanceof ApiError) {
      throw err;
    }
    if (err instanceof Error && err.name === "AbortError") {
      throw new ApiError("Request timeout exceeded", 408, "TIMEOUT");
    }
    const message = err instanceof Error ? err.message : "Network error occurred";
    throw new ApiError(message, 0, "NETWORK_ERROR");
  }
}
