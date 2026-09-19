import { useState, type FormEvent } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { ArrowRight, Eye, EyeOff, Sparkles } from 'lucide-react';
import { api, TOKEN_KEY } from '../api/client';
import { useAuth } from '../auth';
import { ErrorBox } from '../components';
import { STORE_URL } from '../brand';
export function AuthPage({ register = false }: { register?: boolean }) {
  const { user, refresh } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  if (user) return <Navigate to="/dashboard" replace/>;
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError('');
    const values = Object.fromEntries(new FormData(event.currentTarget));
    try {
      const result = await api<{ access_token: string }>(register ? '/auth/register' : '/auth/login', { method: 'POST', body: JSON.stringify(values) });
      localStorage.setItem(TOKEN_KEY, result.access_token); await refresh(); navigate('/dashboard', { replace: true });
    } catch (e) { setError((e as Error).message); } finally { setBusy(false); }
  }
  return <div className="auth-page"><section className="auth-story"><div className="logo light">ПРАКТИУМ<span>КАБИНЕТ</span></div><div><p className="eyebrow">ДЛЯ ПОКУПАТЕЛЕЙ ПРАКТИУМ</p><h1>Всё нужное<br/>для дома.<br/><em>И всё о заказах.</em></h1><p>Выбирайте товары, следите за заявками<br/>и получайте бонусы в одном месте.</p></div><span className="auth-note"><Sparkles size={18}/>Дополнение к магазину ПРАКТИУМ</span></section><section className="auth-form-wrap"><form onSubmit={submit} className="auth-form" key={String(register)}><p className="eyebrow">КАБИНЕТ ПОКУПАТЕЛЯ</p><h1>{register ? 'Создать аккаунт' : 'Войти в кабинет'}</h1><p className="muted">{register ? 'Сохраняйте свои заявки и получайте бонусы.' : 'Проверьте статус своих заявок и историю бонусов.'}</p>{error && <ErrorBox message={error}/>}{register && <label>Ваше имя<input name="name" required maxLength={120} autoComplete="name" placeholder="Как к вам обращаться"/></label>}<label>Email<input name="email" type="email" required autoComplete="email" placeholder="you@example.com"/></label>{register && <label>Телефон <span className="muted">необязательно</span><input name="phone" type="tel" maxLength={40} autoComplete="tel" placeholder="+7 900 000-00-00"/></label>}<label>Пароль<span className="password-field"><input name="password" type={showPassword ? 'text' : 'password'} required minLength={8} maxLength={72} autoComplete={register ? 'new-password' : 'current-password'} placeholder="Не менее 8 символов"/><button type="button" className="password-toggle" onClick={() => setShowPassword(value => !value)} aria-label={showPassword ? 'Скрыть пароль' : 'Показать пароль'} title={showPassword ? 'Скрыть пароль' : 'Показать пароль'}>{showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}</button></span></label><button className="primary full" disabled={busy}>{busy ? 'Подождите…' : register ? 'Создать аккаунт' : 'Войти'}<ArrowRight size={18}/></button><p className="auth-switch">{register ? 'Уже есть аккаунт? ' : 'Ещё нет аккаунта? '}<Link onClick={() => setError('')} to={register ? '/login' : '/register'}>{register ? 'Войти' : 'Зарегистрироваться'}</Link></p><a className="store-inline-link" href={STORE_URL} target="_blank" rel="noreferrer">Вернуться в магазин <ArrowRight size={16}/></a></form></section></div>;
}

