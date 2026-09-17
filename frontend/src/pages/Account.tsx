import { useEffect, useState, type FormEvent } from 'react';
import { ArrowDownLeft, ArrowUpRight, LogOut, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../auth';
import { ProductVisual } from '../brand';
import { Empty, ErrorBox, Loading, PageTitle, useData } from '../components';
import { type Order, type Bonus, statuses, money, priceLabel, number, date } from '../types';
export function Orders() {
  const { data, loading, error, retry } = useData<Order[]>('/me/orders');
  return <><PageTitle eyebrow="ОТ ВЫБОРА ДО ПОЛУЧЕНИЯ" title="Мои заявки"><button className="secondary" onClick={retry}>Обновить</button></PageTitle><p className="intro">Здесь видны заявки, отправленные через кабинет ПРАКТИУМ.</p>{loading ? <Loading/> : error ? <ErrorBox message={error} retry={retry}/> : !data?.length ? <Empty>Вы пока не оформляли заявки. <Link to="/catalog">Перейти в каталог</Link></Empty> : <div className="orders-grid">{data.map(order => <article className="card order-detail" key={order.id}><div className="order-meta"><span>Заявка №{order.id} · {date(order.created_at)}</span><span className={`status ${order.status}`}>{statuses[order.status]}</span></div><div className="order-product"><ProductVisual product={order.product} compact/><div><p className="eyebrow">{order.product.collection}</p><h2>{order.product.title}</h2><p>{order.quantity} шт. × {priceLabel(order.unit_price)}</p></div><strong>{Number(order.unit_price) > 0 ? money(Math.round(Number(order.unit_price) * 100) * order.quantity / 100) : 'Уточняется'}</strong></div>{order.comment && <p className="order-comment">{order.comment}</p>}</article>)}</div>}</>;
}
export function Bonuses() {
  const { user, refresh } = useAuth();
  const { data, loading, error, retry } = useData<Bonus[]>('/me/bonuses');
  useEffect(() => { void refresh(); }, []);
  return <><PageTitle eyebrow="ПРИЯТНО БЫТЬ В КЛУБЕ" title="Мои бонусы"/><section className="balance-card bonus-wide"><div className="balance-top"><span>ДОСТУПНЫЙ БАЛАНС</span><Sparkles/></div><div className="balance-number">{number(user!.bonus_balance)}<span>бонусов</span></div><p>Приветственные начисления и кэшбэк за выполненные заказы</p></section><section className="section"><div className="section-heading"><h2>История операций</h2><button className="text-button" onClick={() => { retry(); void refresh(); }}>Обновить</button></div>{loading ? <Loading/> : error ? <ErrorBox message={error} retry={retry}/> : !data?.length ? <Empty>Операций пока нет.</Empty> : <div className="card">{data.map(b => <div className="bonus-row" key={b.id}><span className={`bonus-icon ${Number(b.amount) < 0 ? 'negative' : ''}`}>{Number(b.amount) < 0 ? <ArrowUpRight/> : <ArrowDownLeft/>}</span><div><strong>{b.reason}</strong><small>{date(b.created_at)}</small></div><strong className={Number(b.amount) < 0 ? 'debit' : 'credit'}>{Number(b.amount) > 0 ? '+' : ''}{number(b.amount)}</strong></div>)}</div>}</section><p className="muted">Начисление происходит после завершения заказа. Списание бонусов при оформлении появится в следующих версиях.</p></>;
}
export function Profile() {
  const { user, refresh, logout } = useAuth();
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError(''); setSaved(false);
    const data = Object.fromEntries(new FormData(event.currentTarget));
    try { await api('/me', { method: 'PATCH', body: JSON.stringify(data) }); setSaved(true); await refresh(); }
    catch (e) { setError((e as Error).message); } finally { setBusy(false); }
  }
  return <><PageTitle eyebrow="ДАВАЙТЕ ОСТАВАТЬСЯ НА СВЯЗИ" title="Мой профиль"/><div className="profile-layout"><form className="card profile-form" onSubmit={submit}><h2>Личные данные</h2><label>Имя<input name="name" defaultValue={user!.name} required maxLength={120} autoComplete="name"/></label><label>Email<input value={user!.email} disabled type="email"/><small className="muted">Email используется для входа в аккаунт.</small></label><label>Телефон<input name="phone" defaultValue={user!.phone} type="tel" maxLength={40} autoComplete="tel"/></label>{error && <ErrorBox message={error}/>} {saved && <p className="success" role="status">Изменения сохранены</p>}<button disabled={busy} className="primary">{busy ? 'Сохраняем…' : 'Сохранить изменения'}</button></form><aside className="card profile-aside"><span className="avatar large">{user!.name.slice(0, 1)}</span><h2>{user!.name}</h2><p>В клубе с {date(user!.created_at)}</p><button className="secondary" onClick={logout}><LogOut size={18}/>Выйти</button></aside></div></>;
}
