import { useEffect, useState, type ReactNode } from 'react';
import { api } from './api/client';
import { PackageOpen, RefreshCw } from 'lucide-react';
export function useData<T>(path: string) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [version, setVersion] = useState(0);
  useEffect(() => {
    let alive = true; setLoading(true); setError('');
    api<T>(path).then(value => { if (alive) setData(value); }).catch(e => { if (alive) setError(e.message); }).finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [path, version]);
  return { data, error, loading, retry: () => setVersion(v => v + 1) };
}
export function ErrorBox({ message, retry }: { message: string; retry?: () => void }) { return <div role="alert" className="error">{message}{retry && <button onClick={retry} className="text-button"><RefreshCw size={16}/>Повторить</button>}</div>; }
export function Loading() { return <div className="loading" role="status"><span/>Загружаем данные…</div>; }
export function Empty({ children }: { children: ReactNode }) { return <div className="empty"><PackageOpen size={36}/><p>{children}</p></div>; }
export function PageTitle({ eyebrow, title, children }: { eyebrow: string; title: string; children?: ReactNode }) { return <header className="page-title"><div><p className="eyebrow">{eyebrow}</p><h1>{title}</h1></div>{children}</header>; }
