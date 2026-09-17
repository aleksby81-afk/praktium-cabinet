import { HeartPulse, House, Shirt, Sparkles, ExternalLink } from 'lucide-react';
import type { Product } from './types';

export const STORE_URL = 'https://aleksby81-afk.github.io/Praktium_magazin/';

export function StoreLink({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <a className={className} href={`${STORE_URL}#catalog`} target="_blank" rel="noreferrer">{children}<ExternalLink size={16}/></a>;
}

export function ProductVisual({ product, compact = false }: { product: Product; compact?: boolean }) {
  if (product.image_url) return <img src={product.image_url} alt={product.title} loading="lazy"/>;
  const Icon = product.collection === 'Здоровье' ? HeartPulse : product.collection === 'Дом и уют' ? House : product.collection === 'Одежда' ? Shirt : Sparkles;
  return <span className={`product-visual ${compact ? 'compact' : ''}`} role="img" aria-label={product.collection}><Icon strokeWidth={1.4}/><span>ПРАКТИУМ</span></span>;
}
