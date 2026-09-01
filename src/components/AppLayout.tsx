import { Link, Outlet } from 'react-router-dom';

export function AppLayout() {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 border-b border-white/10 bg-slate-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <Link to="/" className="group flex items-center gap-2">
            <span className="text-lg font-bold tracking-tight text-white group-hover:text-indigo-300">
              Simple Game Hub
            </span>
          </Link>
          <Link
            to="/"
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm font-medium text-slate-200 transition hover:bg-white/10"
          >
            All games
          </Link>
        </div>
      </header>
      <Outlet />
    </div>
  );
}
