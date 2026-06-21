import { createClient } from "./supabase/client";

const supabase = createClient();
const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || ""

async function request(endpoint: string, options: RequestInit = {}) {
  // Retrieve token dynamically from active Supabase session
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;

  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const url = endpoint.startsWith("http") ? endpoint : `${apiBaseUrl}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

export const apiClient = {
  get: (endpoint: string, options?: Omit<RequestInit, "method">) =>
    request(endpoint, { ...options, method: "GET" }),
  post: (endpoint: string, body?: any, options?: Omit<RequestInit, "method" | "body">) =>
    request(endpoint, { ...options, method: "POST", body: body ? JSON.stringify(body) : undefined }),
  put: (endpoint: string, body?: any, options?: Omit<RequestInit, "method" | "body">) =>
    request(endpoint, { ...options, method: "PUT", body: body ? JSON.stringify(body) : undefined }),
  delete: (endpoint: string, options?: Omit<RequestInit, "method">) =>
    request(endpoint, { ...options, method: "DELETE" }),
};
