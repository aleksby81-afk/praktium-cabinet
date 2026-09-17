import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Check, Plus, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { ProductVisual, StoreLink } from '../brand';
import { Empty, ErrorBox, Loading, PageTitle, useData } from '../components';
import { priceLabel, money, type Product } from '../types';
function OrderModal({ product, close }: { product: Product; close: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  useEffect(() => { dialog.current?.showModal(); const previous = document.body.style.overflow; document.body.style.overflow = 'hidden'; return () => { document.body.style.overflow = previous; }; }, []);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError('');
    const comment = new FormData(event.currentTarget).get('comment');
    try { await api('/orders', { method: 'POST', body: JSON.stringify({ product_id: product.id, quantity, comment }) }); setDone(true); }
    catch (e) { setError((e as Error).message); } finally { setBusy(false); }
  }
  return <dialog ref={dialog} onCancel={event => { event.preventDefault(); if (!busy) close(); }} aria-labelledby="modal-title"><button className="icon-button modal-close" onClick={close} disabled={busy} aria-label="Закрыть"><X/></button>{done ? <div className="modal-success"><span><Check size={30}/></span><h2 id="modal-title">Заявка отправлена</h2><p>Следите за статусом здесь. Менеджер уточнит стоимость и детали заказа.</p><Link className="primary" to="/orders">К моим заявкам</Link></div> : <form onSubmit={submit}><p className="eyebrow">ПРАКТИУМ · ВАШ ВЫБОР</p><h2 id="modal-title">Оставить заявку</h2><div className="modal-product"><ProductVisual product={product} compact/><div><strong>{product.title}</strong><p>{priceLabel(product.price)}</p></div></div><label>Количество<input autoFocus type="number" min={1} max={1000} step={1} required value={quantity} onChange={event => setQuantity(Number(event.target.value))}/></label><label>Комментарий<textarea name="comment" maxLength={2000} rows={3} placeholder="Цвет, размер или пожелания"/></label><div className="total"><span>{Number(product.price) > 0 ? 'Итого' : 'Стоимость'}</span><strong>{Number(product.price) > 0 ? money(Math.round(Number(product.price) * 100) * quantity / 100) : 'Уточняется'}</strong></div>{error && <ErrorBox message={error}/>}<button disabled={busy} className="primary full">{busy ? 'Отправляем…' : 'Отправить заявку'}</button><p className="demo-note">Оплата сейчас не требуется. Стоимость и доставку согласуют при подтверждении.</p></form>}</dialog>;
}
export function Catalog() {
  const { data, loading, error, retry } = useData<Product[]>('/products');
  const [collection, setCollection] = useState('Все категории');
  const [selected, setSelected] = useState<Product | null>(null);
  const collections = ['Все категории', ...new Set(data?.map(p => p.collection))];
  const filtered = data?.filter(p => collection === 'Все категории' || p.collection === collection);
  return <><PageTitle eyebrow="ТОВАРЫ ДЛЯ ДОМА И КАЖДОГО ДНЯ" title="Каталог"/><p className="intro">Выберите товар и оставьте заявку. Цена и доставка уточняются при подтверждении.</p><StoreLink className="store-inline-link">Смотреть магазин</StoreLink>{loading ? <Loading/> : error ? <ErrorBox message={error} retry={retry}/> : <><div className="filters" aria-label="Категории">{collections.map(c => <button key={c} className={c === collection ? 'selected' : ''} aria-pressed={c === collection} onClick={() => setCollection(c)}>{c}</button>)}</div>{!filtered?.length ? <Empty>В этой категории пока нет товаров.</Empty> : <div className="product-grid">{filtered.map(product => <article className="product-card" key={product.id}><div className="product-image"><ProductVisual product={product}/><span>{product.collection}</span></div><div className="product-info"><h2>{product.title}</h2><p>{product.description}</p><div><strong>{priceLabel(product.price)}</strong><small className={product.in_stock ? 'stock' : ''}>{product.in_stock ? 'Доступен для заявки' : 'Нет в наличии'}</small></div><button className="secondary full" disabled={!product.in_stock} onClick={() => setSelected(product)}><Plus size={17}/>Оставить заявку</button></div></article>)}</div>}</>}{selected && <OrderModal product={selected} close={() => setSelected(null)}/>}</>;
}
