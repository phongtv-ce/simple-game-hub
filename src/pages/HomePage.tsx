import { Link } from 'react-router-dom';
import { GameThumbnail } from '../components/GameThumbnail';
import { GAMES } from '../games/registry';

export function HomePage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <section className="mb-10 text-center">
        <p className="text-sm font-medium uppercase tracking-[0.28em] text-indigo-300/80">
          Browser games
        </p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-white sm:text-5xl">
          Simple Game Hub
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-base text-slate-300">
          A collection of classic games in one React app. Each game keeps its logic separate from
          UI components.
        </p>
      </section>

      <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {GAMES.map((game) => (
          <li key={game.id}>
            <Link
              to={game.path}
              className="group flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-lg shadow-slate-950/20 transition hover:border-white/20 hover:bg-white/8 hover:shadow-indigo-950/30"
            >
              <div className="p-3 pb-0">
                <GameThumbnail id={game.id} accent={game.accent} />
              </div>
              <div className="flex flex-1 flex-col p-5 pt-4">
                <div
                  className={`mb-3 inline-flex w-fit rounded-full bg-gradient-to-r ${game.accent} px-3 py-1 text-xs font-semibold uppercase tracking-wider text-slate-950`}
                >
                  Play
                </div>
                <h2 className="text-xl font-semibold text-white group-hover:text-indigo-200">
                  {game.title}
                </h2>
                <p className="mt-2 flex-1 text-sm leading-6 text-slate-400">{game.description}</p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
