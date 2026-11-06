import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api, tokenStore } from '../lib/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!tokenStore.get()) {
      setReady(true);
      return;
    }
    const sent = tokenStore.get();
    api('/auth/me')
      .then((d) => {
        if (tokenStore.get() === sent) setUser(d.user);
      })
      .catch((err) => {
        if (err.status === 401 && tokenStore.get() === sent) tokenStore.set(null);
      })
      .finally(() => setReady(true));
  }, []);

  const login = useCallback(async (email, password) => {
    const d = await api('/auth/login', { method: 'POST', body: { email, password } });
    tokenStore.set(d.token);
    setUser(d.user);
    return d.user;
  }, []);

  const loginWithGoogle = useCallback(async (credential) => {
    const d = await api('/auth/google', { method: 'POST', body: { credential } });
    tokenStore.set(d.token);
    setUser(d.user);
    return d.user;
  }, []);

  const applySession = useCallback((d) => {
    tokenStore.set(d.token);
    setUser(d.user);
    return d.user;
  }, []);

  const logout = useCallback(() => {
    tokenStore.set(null);
    setUser(null);
  }, []);

  const isCreator = user?.kind === 'creator' || Boolean(user?.slug);

  return (
    <AuthContext.Provider value={{ user, setUser, ready, login, loginWithGoogle, applySession, logout, isCreator }}>{children}</AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
