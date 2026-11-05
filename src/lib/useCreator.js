import { useCallback, useEffect, useState } from 'react';
import { api } from './api.js';

const cache = new Map();

export function primeCreator(creator) {
  if (creator?.slug) cache.set(creator.slug, creator);
}

export function useCreator(slug) {
  const [state, setState] = useState(() =>
    cache.has(slug) ? { status: 'ready', creator: cache.get(slug) } : { status: 'loading' }
  );

  const load = useCallback(() => {
    api(`/pages/${slug}/profile`)
      .then((d) => {
        cache.set(slug, d.creator);
        setState({ status: 'ready', creator: d.creator });
      })
      .catch((err) => setState({ status: err.status === 404 ? 'missing' : 'error', message: err.message }));
  }, [slug]);

  useEffect(() => {
    if (cache.has(slug)) setState({ status: 'ready', creator: cache.get(slug) });
    else setState({ status: 'loading' });
    load();
  }, [slug, load]);

  return { ...state, reload: load };
}
