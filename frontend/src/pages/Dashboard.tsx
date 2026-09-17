import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, ShoppingBag, ClipboardList, Sparkles, Globe } from 'lucide-react';
import { useAuth } from '../auth';
import { STORE_URL, ProductVisual } from '../brand';
import { PageTitle, useData, ErrorBox, Empty, Loading } from '../components';
import { type Order, statuses, date, number } from '../types';

export function Dashboard() {
  const { user } = useAuth();
  const { data, loading, error, retry } = useData<Order[]>('/me/orders');
  return <>
    <PageTitle eyebrow="ПРАКТИУМ · ЛИЧНЫЙ КАБИНЕТ" title={`Здравствуйте, ${user!.name.split(' ')[0]}!`}><span className="member-pill"><span/>Покупатель</span></PageTitle>
    <p className="intro">Сохраняйте историю заявок, следите за статусом и получайте бонусы за покупки.</p>
    <div className="dashboard-hero">
      <section className="balance-card"><div className="balance-top"><span>ВАШИ БОНУСЫ</span><Sparkles size={23}/></div><div className="balance-number">{number(user!.bonus_balance)}<span>бонусов</span></div><p>Начисления после завершения заказа</p><Link to="/bonuses">История начислений <ArrowUpRight size={19}/></Link><div className="balance-ring"/></section>
      <section className="promo"><span className="small-tag">МАГАЗИН ПРАКТИУМ</span><h2>Всё нужное для дома<br/>в одном месте.</h2><p>Товары для уюта, заботы о себе и жизни каждый день.</p><Link to="/catalog" className="primary">Выбрать товар <ArrowRight size={18}/></Link><div className="promo-mark" aria-hidden="true">П</div></section>
    </div>
    <div className="quick-grid">
      <Link to="/catalog" className="quick-card"><span className="quick-icon"><ShoppingBag size={21}/></span><div><strong>Подобрать товар</strong><span>Каталог и заявка</span></div><ArrowUpRight size={18}/></Link>
      <Link to="/orders" className="quick-card"><span className="quick-icon"><ClipboardList size={21}/></span><div><strong>Мои заявки</strong><span>Статусы и детали</span></div><ArrowUpRight size={18}/></Link>
      <a href={STORE_URL} target="_blank" rel="noreferrer" className="quick-card"><span className="quick-icon"><Globe size={21}/></span><div><strong>Основной магазин</strong><span>Открыть сайт ПРАКТИУМ</span></div><ArrowUpRight size={18}/></a>
    </div>
    <section className="section"><div className="section-heading"><h2>Последние заявки</h2><Link to="/orders">Все заявки <ArrowRight size={17}/></Link></div>{loading ? <Loading/> : error ? <ErrorBox message={error} retry={retry}/> : !data?.length ? <div className="card"><Empty>Пока заявок нет. Выберите товар в каталоге кабинета.</Empty><Link className="empty-link" to="/catalog">Открыть каталог <ArrowRight size={16}/></Link></div> : <div className="card order-list">{data.slice(0, 3).map(order => <Link to="/orders" className="order-row" key={order.id}><ProductVisual product={order.product} compact/><div><strong>{order.product.title}</strong><small>Заявка №{order.id} · {date(order.created_at)}</small></div><span className={`status ${order.status}`}>{statuses[order.status]}</span></Link>)}</div>}</section>
    <div className="club-note"><Sparkles size={22}/><div><strong>Бонусы за завершённые покупки</strong><p>Они появятся в истории начислений после подтверждения и выполнения заявки.</p></div><Link to="/bonuses"><ArrowUpRight size={22}/><span className="sr-only">Мои бонусы</span></Link></div>
  </>;
}
