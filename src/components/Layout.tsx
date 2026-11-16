import { NavLink, Outlet } from 'react-router-dom';
import { Droplet, FileWarning, Home, LogIn, LogOut, ShieldCheck, Siren } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { cn } from '../lib/utils';

const links = [
  { to: '/', label: 'Home', icon: Home, end: true },
  { to: '/reports', label: 'Reports', icon: FileWarning },
  { to: '/donors', label: 'Blood Donors', icon: Droplet },
  { to: '/emergency', label: 'Emergency', icon: Siren },
];

export default function Layout() {
  const { user, profile, isAdmin, signIn, logOut } = useAuth();
  const navLinks = isAdmin ? [...links, { to: '/admin', label: 'Admin', icon: ShieldCheck }] : links;

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-20 border-b border-border bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <NavLink to="/" className="flex items-center gap-2 font-semibold tracking-tight">
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-white">
              <Siren className="size-4" aria-hidden="true" />
            </span>
            Smart City Patch
          </NavLink>

          <div className="flex items-center gap-3">
            {user ? (
              <>
                <span className="hidden text-sm text-muted sm:inline">{profile?.name ?? user.email}</span>
                <button type="button" onClick={logOut} className="btn-secondary">
                  <LogOut className="size-4" aria-hidden="true" />
                  Sign out
                </button>
              </>
            ) : (
              <button type="button" onClick={() => signIn().catch(console.error)} className="btn-primary">
                <LogIn className="size-4" aria-hidden="true" />
                Sign in
              </button>
            )}
          </div>
        </div>

        <nav aria-label="Main" className="mx-auto max-w-6xl overflow-x-auto px-4">
          <ul className="flex gap-1 pb-2">
            {navLinks.map(({ to, label, icon: Icon, end }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-1.5 text-sm transition-colors',
                      isActive ? 'bg-surface text-foreground' : 'text-muted hover:text-foreground',
                    )
                  }
                >
                  <Icon className="size-4" aria-hidden="true" />
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        <Outlet />
      </main>

      <footer className="border-t border-border py-6 text-center text-xs text-muted">
        Smart City Patch &middot; In a life-threatening emergency, call 999 immediately.
      </footer>
    </div>
  );
}
