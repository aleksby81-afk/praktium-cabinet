import { ArrowUpRight, ClipboardList, ShoppingBag, Truck, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';
import { STORE_URL } from '../brand';
import { PageTitle } from '../components';

export function Content() {
  return <><PageTitle eyebrow="ПОКУПКИ В ПРАКТИУМ" title="Как это работает"/><p className="intro">Кабинет помогает сохранить заявку и следить за её статусом.</p><div className="steps-grid">
    <article className="card step-card"><span className="quick-icon"><ShoppingBag/></span><span className="step-number">01</span><h2>Выберите товар</h2><p>Посмотрите ассортимент в кабинете или на основном сайте магазина.</p><Link to="/catalog">Открыть каталог <ArrowUpRight size={16}/></Link></article>
    <article className="card step-card"><span className="quick-icon"><ClipboardList/></span><span className="step-number">02</span><h2>Оставьте заявку</h2><p>Укажите количество и пожелания. Цена и доставка уточняются при подтверждении.</p><Link to="/orders">Мои заявки <ArrowUpRight size={16}/></Link></article>
    <article className="card step-card"><span className="quick-icon"><Truck/></span><span className="step-number">03</span><h2>Следите за статусом</h2><p>Проверяйте ход обработки в кабинете. Магазин указывает доставку через Ozon Доставку по России.</p><Link to="/orders">Проверить статус <ArrowUpRight size={16}/></Link></article>
  </div><p className="integration-note">Заявки из формы на основном сайте пока не поступают в этот кабинет автоматически. Для истории и отслеживания оформляйте заявку здесь.</p></>;
}

export function Social() {
  return <><PageTitle eyebrow="НАШ МАГАЗИН" title="О ПРАКТИУМ"/><p className="intro">Товары для дома, уюта, здоровья и ухода за собой.</p><div className="social-list"><a className="card social-card" href={STORE_URL} target="_blank" rel="noreferrer"><span className="quick-icon"><Globe/></span><div><h2>Основной сайт ПРАКТИУМ</h2><p>Каталог, описание покупки, отзывы и ответы на вопросы</p></div><ArrowUpRight/></a></div><p className="integration-note">Для вопросов и заказа используйте контакты, указанные на основном сайте. Здесь вы можете создать отдельную заявку и отслеживать её статус.</p></>;
}
