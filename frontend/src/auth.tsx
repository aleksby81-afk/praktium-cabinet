import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { api, TOKEN_KEY } from './api/client';
import type { Client } from './types';
type Auth = { user: Client | null; loading: boolean; error: string; refresh: () => Promise<void>; logout: () => void };
const Context = createContext<Auth>(null!);
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  async function refresh() {
    setError('');
    try { setUser(localStorage.getItem(TOKEN_KEY) ? await api<Client>('/me') : null); }
    catch (e) { setError((e as Error).message); }
    finally { setLoading(false); }
  }
  function logout() { localStorage.removeItem(TOKEN_KEY); setUser(null); setError(''); }
  useEffect(() => { void refresh(); window.addEventListener('auth-expired', logout); return () => window.removeEventListener('auth-expired', logout); }, []);
  return <Context.Provider value={{ user, loading, error, refresh, logout }}>{children}</Context.Provider>;
}
export const useAuth = () => useContext(Context);
