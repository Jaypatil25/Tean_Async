const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") ??
  "http://localhost:5000";

export type AuthUser = {
  _id: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
  bio?: string;
  avatarUrl?: string;
  country?: string;
  city?: string;
  postalCode?: string;
  taxId?: string;
  createdAt?: string;
  updatedAt?: string;
};

type ApiError = {
  message?: string;
};

type LoginResponse = {
  message: string;
  token: string;
  user: AuthUser;
};

type SignupPayload = {
  name: string;
  email: string;
  password: string;
};

type LoginPayload = {
  email: string;
  password: string;
};

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });

  const data = (await response.json().catch(() => ({}))) as T & ApiError;

  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data;
}

export async function getCurrentUser(token: string) {
  return request<{ user: AuthUser }>("/api/auth/me", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function signup(payload: SignupPayload) {
  return request<{ message: string; user: AuthUser }>("/api/auth/signup", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function login(payload: LoginPayload) {
  return request<LoginResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function logout(token: string) {
  return request<{ message: string }>("/api/auth/logout", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}
