function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Variável de ambiente ausente: ${name}`);
  return value;
}

export const env = {
  apiUrl: required('API_URL'),
  apiUser: required('APP_SECURITY_USER'),
  apiPassword: required('APP_SECURITY_PASSWORD'),
};