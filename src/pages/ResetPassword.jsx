import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout.jsx';
import PasswordInput from '../components/PasswordInput.jsx';
import { api } from '../lib/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useI18n } from '../i18n/index.jsx';
import { afterAuthPath } from './Login.jsx';

export default function ResetPassword() {
  const { t } = useI18n();
  const { applySession } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const token = params.get('token') || '';
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (password.length < 8) return setError(t('auth.passwordShort'));
    if (password !== confirm) return setError(t('reset.mismatch'));
    setBusy(true);
    try {
      const d = await api('/auth/reset', { method: 'POST', body: { token, password } });
      const u = applySession(d);
      navigate(afterAuthPath(null, u), { replace: true });
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  if (!token) {
    return (
      <AuthLayout>
        <div className="auth-card">
          <h1>{t('reset.title')}</h1>
          <p className="form-error">{t('reset.missing')}</p>
          <Link to="/forgot-password" className="support-btn auth-done-btn">
            {t('reset.requestNew')}
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <form className="auth-card" onSubmit={submit}>
        <h1>{t('reset.title')}</h1>
        <p className="muted">{t('reset.intro')}</p>
        <PasswordInput
          className="input-box input-sm"
          placeholder={t('auth.passwordNew')}
          autoComplete="new-password"
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <PasswordInput
          className="input-box input-sm"
          placeholder={t('reset.confirm')}
          autoComplete="new-password"
          minLength={8}
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
        />
        {error && (
          <p className="form-error">
            {error}{' '}
            {/expired|invalid|used|incomplete/i.test(error) && <Link to="/forgot-password">{t('reset.requestNew')}</Link>}
          </p>
        )}
        <button type="submit" className="support-btn" disabled={busy}>
          {busy ? <span className="dot-flashing" /> : t('reset.save')}
        </button>
        <p className="auth-switch">
          <Link to="/login">{t('forgot.back')}</Link>
        </p>
      </form>
    </AuthLayout>
  );
}
