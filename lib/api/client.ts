import 'server-only';

const baseUrl = process.env.API_URL?.replace(/\/+$/, '');
const basic = btoa(`${process.env.APP_SECURITY_USER}:${process.env.APP_SECURITY_PASSWORD}`);

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export async function api<T>(path: string, init?: RequestInit & { token?: string }): Promise<T> {
  const { token, ...rest } = init ?? {};
  const res = await fetch(`${baseUrl}/api${path}`, {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': basic,                                  // identifica o site
      ...(token ? { Authorization: `Bearer ${token}` } : {}), // identifica o usuário
      ...rest.headers,
    },
  });
  if (!res.ok) throw new ApiError(res.status, `API ${res.status}: ${path}`);
  return res.json() as Promise<T>;
}