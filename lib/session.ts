const SESSION_KEYS = ['token', 'token_expiration', 'name', 'residenceId'];

export function subscribeToSession(callback: () => void) {
  window.addEventListener('storage', callback);
  return () => window.removeEventListener('storage', callback);
}

export function getSessionName() {
  return sessionStorage.getItem('name') ?? '';
}

// TODO(API): o token ainda não garante o campo de e-mail; ajustar quando o payload tiver.
export function getSessionEmail() {
  try {
    const payload = JSON.parse(atob((sessionStorage.getItem('token') ?? '').split('.')[1]));
    return String(payload.email ?? payload.sub ?? '');
  } catch {
    return '';
  }
}

export function clearSession() {
  SESSION_KEYS.forEach((key) => sessionStorage.removeItem(key));
}
