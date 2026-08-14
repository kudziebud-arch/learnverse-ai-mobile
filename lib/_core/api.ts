import { Platform } from "react-native";
import { getApiBaseUrl } from "@/constants/oauth";
import * as Auth from "./auth";

type ApiUser = {
  id: number;
  openId: string;
  name: string | null;
  email: string | null;
  loginMethod: string | null;
  lastSignedIn: string;
};

export async function apiCall<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options.headers as Record<string, string>) || {}),
  };
  if (Platform.OS !== "web") {
    const sessionToken = await Auth.getSessionToken();
    if (sessionToken) headers.Authorization = `Bearer ${sessionToken}`;
  }
  const baseUrl = getApiBaseUrl();
  const cleanBaseUrl = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const url = baseUrl ? `${cleanBaseUrl}${cleanEndpoint}` : endpoint;
  const response = await fetch(url, { ...options, headers, credentials: "include" });
  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage = errorText || `API call failed: ${response.statusText}`;
    try {
      const errorJson = JSON.parse(errorText) as { error?: string; message?: string };
      errorMessage = errorJson.error || errorJson.message || errorMessage;
    } catch {
      // Preserve the response text when the server did not return JSON.
    }
    throw new Error(errorMessage);
  }
  const contentType = response.headers.get("content-type");
  if (contentType?.includes("application/json")) return response.json() as Promise<T>;
  const text = await response.text();
  return (text ? JSON.parse(text) : {}) as T;
}

export async function exchangeOAuthCode(code: string, state: string): Promise<{ sessionToken: string; user: ApiUser }> {
  const params = new URLSearchParams({ code, state });
  const result = await apiCall<{ app_session_id: string; user: ApiUser }>(`/api/oauth/mobile?${params.toString()}`);
  return { sessionToken: result.app_session_id, user: result.user };
}

export async function logout(): Promise<void> {
  await apiCall<void>("/api/auth/logout", { method: "POST" });
}

export async function getMe(): Promise<ApiUser | null> {
  try {
    const result = await apiCall<{ user: ApiUser | null }>("/api/auth/me");
    return result.user || null;
  } catch {
    return null;
  }
}

export async function establishSession(token: string): Promise<boolean> {
  try {
    const baseUrl = getApiBaseUrl();
    const response = await fetch(`${baseUrl}/api/auth/session`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      credentials: "include",
    });
    return response.ok;
  } catch {
    return false;
  }
}
