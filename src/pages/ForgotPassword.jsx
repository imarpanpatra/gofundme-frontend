import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout.jsx';
import { MailIcon } from '../components/icons.jsx';
import { api } from '../lib/api.js';
import { useI18n } from '../i18n/index.jsx';

export default function ForgotPassword() {
  const { t } = useI18n();
  const location = useLocation();
  const [email, setEmail] = useState(location.state?.email || '');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [sentTo, setSentTo] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await api('/auth/forgot', { method: 'POST', body: { email } });
      setSentTo(email.trim());
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthLayout>
      {sentTo ? (
        <div className="auth-card auth-done">
          <span className="auth-done-icon">
            <MailIcon width={26} height={26} />
          </span>
          <h1>{t('forgot.sentTitle')}</h1>
          <p className="muted">{t('forgot.sent', { email: sentTo })}</p>
          <p className="muted auth-small">{t('forgot.spam')}</p>
          <Link to="/login" className="support-btn auth-done-btn">
            {t('forgot.back')}
          </Link>
        </div>
      ) : (
        <form className="auth-card" onSubmit={submit}>
          <h1>{t('forgot.title')}</h1>
          <p className="muted">{t('forgot.intro')}</p>
          <input
            className="input-box input-sm"
            type="email"
            placeholder={t('auth.email')}
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          {error && <p className="form-error">{error}</p>}
          <button type="submit" className="support-btn" disabled={busy}>
            {busy ? <span className="dot-flashing" /> : t('forgot.send')}
          </button>
          <p className="auth-switch">
            <Link to="/login">{t('forgot.back')}</Link>
          </p>
        </form>
      )}
    </AuthLayout>
  );
}
