import { useCallback, useEffect, useState } from 'react';

const KEY = 'gfm_theme';
const EVENT = 'gfm-theme';

function stored() {
  try {
    const v = localStorage.getItem(KEY);
    return v === 'light' || v === 'dark' ? v : null;
  } catch {
    return null;
  }
}

const system = () => (window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

const current = () => document.documentElement.dataset.theme || stored() || system();

function apply(theme) {
  document.documentElement.dataset.theme = theme;
  window.dispatchEvent(new Event(EVENT));
}

export function useTheme() {
  const [theme, setThemeState] = useState(current);

  useEffect(() => {
    const sync = () => setThemeState(current());
    const mq = window.matchMedia?.('(prefers-color-scheme: dark)');
    const onSystem = () => {
      if (!stored()) apply(system());
    };
    window.addEventListener(EVENT, sync);
    mq?.addEventListener?.('change', onSystem);
    return () => {
      window.removeEventListener(EVENT, sync);
      mq?.removeEventListener?.('change', onSystem);
    };
  }, []);

  const setTheme = useCallback((next) => {
    try {
      localStorage.setItem(KEY, next);
    } catch {}
    apply(next);
  }, []);

  return { theme, setTheme, toggle: () => setTheme(theme === 'dark' ? 'light' : 'dark') };
}
