const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

interface ApiOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
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
    ...(body !== undefined && { body: JSON.stringify(body) }),
    ...rest,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Request failed' }));
    throw new ApiError(res.status, error.message ?? 'Request failed');
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
