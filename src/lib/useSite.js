import { useEffect, useState } from 'react';
import { api } from './api.js';

let cache;

export function refreshSite(creator) {
  cache = Promise.resolve({ slug: creator.slug, creator });
}

export function useSite() {
  const [state, setState] = useState({ status: 'loading' });

  useEffect(() => {
    if (!cache) {
      cache = api('/pages/default').catch((err) => {
        cache = null;
        throw err;
      });
    }
    let alive = true;
    cache
      .then((d) => alive && setState({ status: 'ready', creator: d.creator }))
      .catch((err) => alive && setState({ status: 'error', message: err.message }));
    return () => {
      alive = false;
    };
  }, []);

  return state;
}
