import { useEffect, useState } from 'react';
import { getTheme, getThemeList } from '../logic/sceneData';
import type { MazeTheme } from '../logic/types';

function ThemeSwatches({ theme, size = 'sm' }: { theme: MazeTheme; size?: 'sm' | 'md' }) {
  const swatchClass = size === 'md' ? 'h-5 w-5' : 'h-3 w-3';

  return (
    <span className="inline-flex gap-0.5">
      <span
        className={`${swatchClass} rounded-sm border border-white/20`}
        style={{ backgroundColor: theme.empty }}
        aria-hidden
      />
      <span
        className={`${swatchClass} rounded-sm border border-white/20`}
        style={{ backgroundColor: theme.solidFill }}
        aria-hidden
      />
      <span
        className={`${swatchClass} rounded-sm border border-dashed`}
        style={{
          backgroundColor: theme.empty,
          borderColor: theme.passStroke,
        }}
        aria-hidden
      />
    </span>
  );
}

export function ThemePicker({
  theme,
  onChange,
}: {
  theme: MazeTheme;
  onChange: (theme: MazeTheme) => void;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return undefined;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false);
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open]);

  function selectTheme(themeId: string) {
    onChange(getTheme(themeId));
    setOpen(false);
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full items-center justify-between gap-2 rounded-lg border border-white/10 bg-slate-900/80 px-3 py-2 text-left text-sm transition hover:bg-slate-800"
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <span className="font-medium text-slate-200">Theme</span>
        <span className="flex items-center gap-2 text-slate-400">
          <ThemeSwatches theme={theme} size="md" />
          <span className="text-slate-300">{theme.title}</span>
        </span>
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-label="Close theme picker"
            className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-[1px]"
            onClick={() => setOpen(false)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="theme-picker-title"
            className="fixed left-1/2 top-1/2 z-50 w-[min(92vw,18rem)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-white/10 bg-slate-900 p-4 shadow-2xl shadow-slate-950/50"
          >
            <h3 id="theme-picker-title" className="mb-3 text-sm font-semibold text-white">
              Color theme
            </h3>
            <ul className="space-y-2">
              {getThemeList().map(({ id, title }) => {
                const option = getTheme(id);
                const selected = option.id === theme.id;

                return (
                  <li key={id}>
                    <button
                      type="button"
                      onClick={() => selectTheme(id)}
                      className={`flex w-full items-center justify-between gap-3 rounded-xl border px-3 py-2.5 text-left transition ${
                        selected
                          ? 'border-emerald-500/50 bg-emerald-500/10'
                          : 'border-white/10 bg-slate-950/50 hover:bg-slate-800'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <ThemeSwatches theme={option} size="md" />
                        <span className="text-sm font-medium text-slate-100">{title}</span>
                      </span>
                      {selected && (
                        <span className="text-xs font-semibold text-emerald-400">Active</span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
