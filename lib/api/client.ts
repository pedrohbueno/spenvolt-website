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

  // DELETE responde 204 sem corpo: res.json() falharia mesmo com a exclusão feita.
  const body = await res.text();
  return (body ? JSON.parse(body) : undefined) as T;
}