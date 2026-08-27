import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom';
import {
  Compass,
  Home,
  Landmark,
  Users,
  UserRound,
  PlusCircle,
  Bell,
  Search,
  Moon,
  Sun,
  LogOut,
  Shield,
  Archive,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../api/client.js';
import { useEffect, useState } from 'react';
import { Avatar } from '../components/Avatar.jsx';

const links = [
  { to: '/home', label: 'Home', icon: Home },
  { to: '/explore', label: 'Explore', icon: Compass },
  { to: '/venues', label: 'Venues', icon: Landmark },
  { to: '/groups', label: 'Groups', icon: Users },
  { to: '/students', label: 'Students', icon: UserRound },
  { to: '/archive', label: 'Archive', icon: Archive },
];

export function AppLayout() {
  const { user, setUser, isStaff } = useAuth();
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const [unread, setUnread] = useState(0);
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'));

  useEffect(() => {
    if (!user) return;
    api.get('/notifications').then(({ data }) => setUnread(data.data.unread || 0)).catch(() => {});
  }, [user]);

  function toggleDark() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle('dark', next);
  }

  async function logout() {
    await api.post('/auth/logout');
    setUser(null);
    navigate('/');
  }

  return (
    <div className="min-h-screen bg-stone-100 text-navy-950 dark:bg-navy-950 dark:text-stone-100">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-white focus:px-3 focus:py-2">
        Skip to content
      </a>
      <header className="sticky top-0 z-40 border-b border-stone-200/80 bg-white/90 backdrop-blur dark:border-navy-800 dark:bg-navy-900/90">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3">
          <Link to="/" className="font-display text-lg text-navy-900 dark:text-gold-400">
            IUB LFE
          </Link>
          <form
            className="hidden flex-1 md:block"
            onSubmit={(e) => {
              e.preventDefault();
              navigate(`/search?q=${encodeURIComponent(q)}`);
            }}
          >
            <label className="relative block">
              <span className="sr-only">Search photographs, venues, and students</span>
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-stone-400" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search Cox's Bazar, Group 07, student name…"
                className="w-full rounded-full border border-stone-200 bg-stone-50 py-2 pl-9 pr-4 text-sm outline-none focus:border-gold-500 dark:border-navy-700 dark:bg-navy-800"
              />
            </label>
          </form>
          <div className="ml-auto flex items-center gap-2">
            <button type="button" onClick={toggleDark} className="rounded-full p-2 hover:bg-stone-100 dark:hover:bg-navy-800" aria-label="Toggle dark mode">
              {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            {user ? (
              <>
                <Link to="/upload" className="hidden items-center gap-2 rounded-full bg-navy-900 px-4 py-2 text-sm text-white sm:inline-flex">
                  <PlusCircle className="h-4 w-4" />
                  Upload
                </Link>
                <Link to="/notifications" className="relative rounded-full p-2 hover:bg-stone-100 dark:hover:bg-navy-800" aria-label="Notifications">
                  <Bell className="h-5 w-5" />
                  {unread > 0 && (
                    <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-gold-500" />
                  )}
                </Link>
                <Link to="/profile">
                  <Avatar user={user} size="sm" />
                </Link>
              </>
            ) : (
              <Link to="/login" className="rounded-full bg-navy-900 px-4 py-2 text-sm text-white">
                Sign in
              </Link>
            )}
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-6xl gap-6 px-4 py-6">
        <aside className="hidden w-52 shrink-0 md:block">
          <nav className="sticky top-24 space-y-1">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium ${
                    isActive ? 'bg-navy-900 text-white' : 'text-stone-700 hover:bg-white dark:text-stone-200 dark:hover:bg-navy-800'
                  }`
                }
              >
                <l.icon className="h-4 w-4" />
                {l.label}
              </NavLink>
            ))}
            {isStaff && (
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium ${
                    isActive ? 'bg-gold-500 text-navy-950' : 'text-stone-700 hover:bg-white'
                  }`
                }
              >
                <Shield className="h-4 w-4" />
                Admin
              </NavLink>
            )}
            {user && (
              <button type="button" onClick={logout} className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-stone-600 hover:bg-white">
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            )}
          </nav>
        </aside>
        <main id="main" className="min-w-0 flex-1 pb-20 md:pb-0">
          <Outlet />
        </main>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-stone-200 bg-white/95 md:hidden dark:border-navy-800 dark:bg-navy-900">
        <div className="flex justify-around py-2">
          {links.slice(0, 4).map((l) => (
            <NavLink key={l.to} to={l.to} className={({ isActive }) => `flex flex-col items-center gap-1 px-2 text-[11px] ${isActive ? 'text-navy-900' : 'text-stone-500'}`}>
              <l.icon className="h-5 w-5" />
              {l.label}
            </NavLink>
          ))}
          <NavLink to={user ? '/upload' : '/login'} className="flex flex-col items-center gap-1 px-2 text-[11px] text-gold-500">
            <PlusCircle className="h-5 w-5" />
            Upload
          </NavLink>
        </div>
      </nav>
    </div>
  );
}
