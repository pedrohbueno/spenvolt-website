function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Variável de ambiente ausente: ${name}`);
  return value;
}

export const env = {
  apiUrl: process.env.API_URL ?? 'http://localhost:8080',
  apiUser: required('API_USER'),
  apiPassword: required('API_PASSWORD'),
};