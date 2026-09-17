const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8000').replace(/\/$/, '');
export const TOKEN_KEY = 'brand_access_token';
export class ApiError extends Error {
  constructor(public status: number, message: string) { super(message); }
}
export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem(TOKEN_KEY);
  let response: Response;
  try {
    response = await fetch(API_URL + path, { ...options, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...options.headers }, signal: options.signal || AbortSignal.timeout(20000) });
  } catch {
    throw new ApiError(0, 'Не удалось связаться с сервером. Проверьте подключение и попробуйте снова.');
  }
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    if (response.status === 401 && !path.startsWith('/auth/')) {
      localStorage.removeItem(TOKEN_KEY);
      window.dispatchEvent(new Event('auth-expired'));
    }
    const message = typeof data?.detail === 'string' ? data.detail : response.status === 422 ? 'Проверьте поля формы: значения не прошли проверку.' : response.status >= 500 ? 'Сервер временно недоступен. Попробуйте позже.' : 'Не удалось выполнить запрос.';
    throw new ApiError(response.status, message);
  }
  return data as T;
}
