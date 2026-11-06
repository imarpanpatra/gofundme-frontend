import { useEffect, useRef, useState } from 'react';
import { useI18n } from '../i18n/index.jsx';
import { useTheme } from '../lib/theme.js';

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '1934199762-jh82prahuornnf1m98tvr2jgt77fm3uk.apps.googleusercontent.com';
const SCRIPT_URL = 'https://accounts.google.com/gsi/client';

let loader;
function loadGoogle() {
  if (window.google?.accounts?.id) return Promise.resolve(window.google);
  if (!loader) {
    loader = new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = SCRIPT_URL;
      s.async = true;
      s.onload = () => resolve(window.google);
      s.onerror = () => {
        loader = null;
        reject(new Error('Could not load Google sign-in'));
      };
      document.head.appendChild(s);
    });
  }
  return loader;
}

export default function GoogleButton({ mode = 'signin', onCredential, onError }) {
  const { lang, t } = useI18n();
  const { theme } = useTheme();
  const ref = useRef(null);
  const handler = useRef(onCredential);
  const [failed, setFailed] = useState(false);
  handler.current = onCredential;

  useEffect(() => {
    let alive = true;
    loadGoogle()
      .then((google) => {
        if (!alive || !ref.current) return;
        google.accounts.id.initialize({
          client_id: CLIENT_ID,
          callback: (res) => handler.current?.(res.credential),
          ux_mode: 'popup',
          auto_select: false,
          cancel_on_tap_outside: true,
        });
        ref.current.innerHTML = '';
        google.accounts.id.renderButton(ref.current, {
          type: 'standard',
          theme: theme === 'dark' ? 'filled_black' : 'outline',
          size: 'large',
          shape: 'pill',
          text: mode === 'signup' ? 'signup_with' : 'continue_with',
          logo_alignment: 'center',
          width: Math.max(200, Math.min(400, ref.current.clientWidth || 320)),
          locale: lang,
        });
      })
      .catch(() => {
        if (!alive) return;
        setFailed(true);
        onError?.(t('auth.googleUnavailable'));
      });
    return () => {
      alive = false;
    };
  }, [lang, theme, mode]);

  if (failed) return null;
  return <div ref={ref} className="google-btn" />;
}
