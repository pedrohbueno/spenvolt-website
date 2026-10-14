export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

const basic = btoa(
  `${process.env.API_USER}:${process.env.API_PASSWORD}`,
);

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`/api${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${basic}`,
      ...init?.headers,
    },
  });
  if (!res.ok) throw new ApiError(res.status, `API ${res.status}: ${path}`);
  return res.json() as Promise<T>;
}