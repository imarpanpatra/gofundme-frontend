const TOKEN_KEY = 'gfm_token';

export const API_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

export const assetUrl = (path) => (path && path.startsWith('/') ? `${API_URL}${path}` : path || '');

export const tokenStore = {
  get: () => {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },
  set: (t) => {
    try {
      if (t) localStorage.setItem(TOKEN_KEY, t);
      else localStorage.removeItem(TOKEN_KEY);
    } catch {}
  },
};

export async function api(path, { method = 'GET', body, form } = {}) {
  const headers = {};
  const token = tokenStore.get();
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body !== undefined) headers['Content-Type'] = 'application/json';

  let res;
  try {
    res = await fetch(`${API_URL}/api${path}`, {
      method,
      headers,
      body: form || (body !== undefined ? JSON.stringify(body) : undefined),
    });
  } catch {
    throw new Error('Could not reach the server. Check your connection and try again.');
  }
  if (!(res.headers.get('content-type') || '').includes('application/json')) {
    console.error(`Expected JSON from ${API_URL || window.location.origin}/api${path}. Is VITE_API_URL set for this build?`);
    throw new Error('The server returned an unexpected response. Please try again later.');
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.error || `Request failed (${res.status})`);
    err.status = res.status;
    throw err;
  }
  return data;
}
