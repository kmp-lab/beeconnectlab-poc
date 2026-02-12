const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface ApiOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function api<T = unknown>(
  path: string,
  options: ApiOptions = {},
): Promise<T> {
  const { body, headers, ...rest } = options;

  const res = await fetch(`${API_BASE}${path}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
    ...rest,
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({ message: res.statusText }));
    throw new ApiError(res.status, data.message || res.statusText);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}
