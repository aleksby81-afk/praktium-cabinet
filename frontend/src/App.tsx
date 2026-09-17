import { NavLink, Navigate, Outlet, Route, Routes, Link } from 'react-router-dom';
import { Home, ShoppingBag, ClipboardList, Sparkles, UserRound, ArrowUpRight, BookOpen, Globe, LogOut } from 'lucide-react';
import { useAuth } from './auth';
import { TOKEN_KEY } from './api/client';
import { ErrorBox, Loading } from './components';
import { AuthPage } from './pages/AuthPage';
import { Dashboard } from './pages/Dashboard';
import { Catalog } from './pages/Catalog';
import { Orders, Bonuses, Profile } from './pages/Account';
import { Content, Social } from './pages/Content';
import { STORE_URL } from './brand';
const navigation = [
  { to: '/dashboard', label: 'Главная', Icon: Home },
  { to: '/catalog', label: 'Каталог', Icon: ShoppingBag },
  { to: '/orders', label: 'Заявки', Icon: ClipboardList },
  { to: '/bonuses', label: 'Бонусы', Icon: Sparkles },
  { to: '/profile', label: 'Профиль', Icon: UserRound },
];
function Layout() {
  const { user, loading, error, refresh, logout } = useAuth();
  if (loading) return <Loading/>;
  if (!localStorage.getItem(TOKEN_KEY)) return <Navigate to="/login" replace/>;
  if (!user) return <main className="recovery"><h1>Личный кабинет</h1><ErrorBox message={error || 'Не удалось загрузить профиль'} retry={() => void refresh()}/><button onClick={logout} className="secondary">Выйти</button></main>;
  return <div className="app-shell">
    <aside className="sidebar"><Link to="/dashboard" className="logo">ПРАКТИУМ<span>КАБИНЕТ</span></Link><p className="sidebar-caption">ДЛЯ ПОКУПАТЕЛЯ</p><nav>{navigation.map(({ to, label, Icon }) => <NavLink key={to} to={to}><Icon size={20}/>{label}</NavLink>)}</nav><div className="sidebar-secondary"><a href={STORE_URL} target="_blank" rel="noreferrer"><Globe size={20}/>Вернуться в магазин<ArrowUpRight size={16}/></a><NavLink to="/content"><BookOpen size={20}/>Как это работает</NavLink><NavLink to="/social"><Globe size={20}/>О магазине<ArrowUpRight size={16}/></NavLink></div><div className="sidebar-bottom"><span className="avatar">{user.name.slice(0, 1).toUpperCase()}</span><div><strong>{user.name}</strong><small>Покупатель</small></div><button onClick={logout} aria-label="Выйти" className="icon-button"><LogOut size={18}/></button></div></aside>
    <div className="main-wrap"><header className="topbar"><Link to="/dashboard" className="mobile-logo">ПРАКТИУМ<span>КАБИНЕТ</span></Link><span className="desktop-only">Всё для дома — и всё о ваших заявках</span><a href={STORE_URL} target="_blank" rel="noreferrer" className="top-link">В магазин <ArrowUpRight size={15}/></a><Link to="/profile" className="avatar small" aria-label="Открыть профиль">{user.name.slice(0, 1).toUpperCase()}</Link></header><main className="main-content"><Outlet/></main><footer className="footer"><span>ПРАКТИУМ · Кабинет покупателя</span><a href={STORE_URL} target="_blank" rel="noreferrer">Открыть магазин <ArrowUpRight size={14}/></a></footer></div>
    <nav className="bottom-nav" aria-label="Основная навигация">{navigation.map(({ to, label, Icon }) => <NavLink key={to} to={to}><Icon size={21}/><span>{label}</span></NavLink>)}</nav>
  </div>;
}
export default function App() { return <Routes><Route path="/login" element={<AuthPage/>}/><Route path="/register" element={<AuthPage register/>}/><Route element={<Layout/>}><Route path="/dashboard" element={<Dashboard/>}/><Route path="/catalog" element={<Catalog/>}/><Route path="/orders" element={<Orders/>}/><Route path="/bonuses" element={<Bonuses/>}/><Route path="/profile" element={<Profile/>}/><Route path="/content" element={<Content/>}/><Route path="/social" element={<Social/>}/></Route><Route path="/" element={<Navigate to="/dashboard" replace/>}/><Route path="*" element={<div className="recovery"><h1>Страница не найдена</h1><Link className="primary" to="/dashboard">На главную</Link></div>}/></Routes>; }
