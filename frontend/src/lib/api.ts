const API_BASE = process.env.NEXT_PUBLIC_API_URL || "/api/v1";

export class ApiError extends Error {
 constructor(
 public status: number,
 public code: string,
 message: string,
 public details?: Array<{ field: string; message: string }>
 ) {
 super(message);
 this.name = "ApiError";
 }
}

async function request<T>(
 endpoint: string,
 options: RequestInit = {}
): Promise<T> {
 const url = `${API_BASE}${endpoint}`;

 const headers: HeadersInit = {
 "Content-Type": "application/json",
 ...options.headers,
 };

 const response = await fetch(url, {
 ...options,
 headers,
 credentials: "include",
 });

 if (!response.ok) {
 let error;
 try {
 const err = await response.json();
 error = new ApiError(
 response.status,
 err.error?.code || "UNKNOWN_ERROR",
 err.error?.message || "An unexpected error occurred",
 err.error?.details
 );
 } catch {
 error = new ApiError(response.status, "UNKNOWN_ERROR", "An unexpected error occurred");
 }
 throw error;
 }

 // Handle 204 No Content
 if (response.status === 204) {
 return undefined as T;
 }

 return response.json();
}

// ---- Agencies ----
export const agencyApi = {
 getMe: () => request<{ success: boolean; data: any }>("/agencies/me"),
 update: (data: Record<string, unknown>) =>
 request<{ success: boolean; data: any }>("/agencies/me", {
 method: "PATCH",
 body: JSON.stringify(data),
 }),
};

// ---- Brands ----
export const brandsApi = {
 list: (params?: Record<string, string>) => {
 const qs = params
 ? "?" + new URLSearchParams(params).toString()
 : "";
 return request<{ success: boolean; data: any[]; meta: any }>(`/brands${qs}`);
 },
 create: (data: Record<string, unknown>) =>
 request<{ success: boolean; data: any }>("/brands", {
 method: "POST",
 body: JSON.stringify(data),
 }),
 get: (id: string) =>
 request<{ success: boolean; data: any }>(`/brands/${id}`),
 update: (id: string, data: Record<string, unknown>) =>
 request<{ success: boolean; data: any }>(`/brands/${id}`, {
 method: "PATCH",
 body: JSON.stringify(data),
 }),
 remove: (id: string) =>
 request(`/brands/${id}`, { method: "DELETE" }),
 scan: (id: string, data?: Record<string, unknown>) =>
 request<{ success: boolean; data: any }>(`/brands/${id}/scan`, {
 method: "POST",
 body: JSON.stringify(data || {}),
 }),
 getAnalytics: (id: string, params?: Record<string, string>) => {
 const qs = params
 ? "?" + new URLSearchParams(params).toString()
 : "";
 return request<{ success: boolean; data: any }>(`/brands/${id}/analytics${qs}`);
 },
};

// ---- Queries ----
export const queriesApi = {
 list: (brandId: string, params?: Record<string, string>) => {
 const qs = params
 ? "?" + new URLSearchParams(params).toString()
 : "";
 return request<{ success: boolean; data: any[]; meta: any }>(
 `/brands/${brandId}/queries${qs}`
 );
 },
 get: (id: string) =>
 request<{ success: boolean; data: any }>(`/queries/${id}`),
 getMentions: (queryId: string) =>
 request<{ success: boolean; data: any[] }>(`/queries/${queryId}/mentions`),
};

// ---- Mentions ----
export const mentionsApi = {
 list: (brandId: string, params?: Record<string, string>) => {
 const qs = params
 ? "?" + new URLSearchParams(params).toString()
 : "";
 return request<{ success: boolean; data: any[]; meta: any }>(
 `/brands/${brandId}/mentions${qs}`
 );
 },
 getFeed: (brandId: string, params?: Record<string, string>) => {
 const qs = params
 ? "?" + new URLSearchParams(params).toString()
 : "";
 return request<{ success: boolean; data: any[]; meta: any }>(
 `/brands/${brandId}/mentions/feed${qs}`
 );
 },
 getSentimentTrends: (brandId: string, params?: Record<string, string>) => {
 const qs = params
 ? "?" + new URLSearchParams(params).toString()
 : "";
 return request<{ success: boolean; data: any[] }>(
 `/brands/${brandId}/mentions/sentiment-trends${qs}`
 );
 },
};

// ---- Competitors ----
export const competitorsApi = {
 list: (brandId: string) =>
 request<{ success: boolean; data: any[] }>(`/brands/${brandId}/competitors`),
 add: (brandId: string, data: { name: string; keywords: string[] }) =>
 request<{ success: boolean; data: any }>(`/brands/${brandId}/competitors`, {
 method: "POST",
 body: JSON.stringify(data),
 }),
 remove: (brandId: string, competitorId: string) =>
 request(`/brands/${brandId}/competitors/${competitorId}`, {
 method: "DELETE",
 }),
 getComparison: (brandId: string, params?: Record<string, string>) => {
 const qs = params
 ? "?" + new URLSearchParams(params).toString()
 : "";
 return request<{ success: boolean; data: any }>(
 `/brands/${brandId}/competitors/comparison${qs}`
 );
 },
};

// ---- Reports ----
export const reportsApi = {
 list: (brandId: string, params?: Record<string, string>) => {
 const qs = params
 ? "?" + new URLSearchParams(params).toString()
 : "";
 return request<{ success: boolean; data: any[]; meta: any }>(
 `/brands/${brandId}/reports${qs}`
 );
 },
 create: (brandId: string, data: Record<string, unknown>) =>
 request<{ success: boolean; data: any }>(`/brands/${brandId}/reports`, {
 method: "POST",
 body: JSON.stringify(data),
 }),
 get: (id: string) =>
 request<{ success: boolean; data: any }>(`/reports/${id}`),
 download: (id: string, format = "pdf") =>
 request<{ success: boolean; data: { url: string } }>(
 `/reports/${id}/download?format=${format}`
 ),
 resend: (id: string, data?: { to?: string[]; message?: string }) =>
 request<{ success: boolean; data: any }>(`/reports/${id}/resend`, {
 method: "POST",
 body: JSON.stringify(data || {}),
 }),
};

// ---- Scan Jobs ----
export const scanJobsApi = {
 list: (params?: Record<string, string>) => {
 const qs = params
 ? "?" + new URLSearchParams(params).toString()
 : "";
 return request<{ success: boolean; data: any[] }>(`/scan-jobs${qs}`);
 },
 get: (id: string) =>
 request<{ success: boolean; data: any }>(`/scan-jobs/${id}`),
 cancel: (id: string) =>
 request<{ success: boolean; data: any }>(`/scan-jobs/${id}/cancel`, {
 method: "POST",
 }),
};

// ---- Prompt Templates ----
export const templatesApi = {
 list: (params?: Record<string, string>) => {
 const qs = params
 ? "?" + new URLSearchParams(params).toString()
 : "";
 return request<{ success: boolean; data: any[] }>(`/prompt-templates${qs}`);
 },
 create: (data: Record<string, unknown>) =>
 request<{ success: boolean; data: any }>("/prompt-templates", {
 method: "POST",
 body: JSON.stringify(data),
 }),
 update: (id: string, data: Record<string, unknown>) =>
 request<{ success: boolean; data: any }>(`/prompt-templates/${id}`, {
 method: "PATCH",
 body: JSON.stringify(data),
 }),
 remove: (id: string) =>
 request(`/prompt-templates/${id}`, { method: "DELETE" }),
};

// ---- Status ----
export const statusApi = {
 getPlatforms: () =>
 request<{ success: boolean; data: any[] }>("/status/platforms"),
 getHealth: () =>
 request<{ status: string; version: string; services: Record<string, unknown> }>(
 "/health"
 ),
};
