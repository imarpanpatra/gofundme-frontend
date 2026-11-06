import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Spinner from '../components/Spinner.jsx';
import { afterAuthPath } from './Login.jsx';
import { useI18n } from '../i18n/index.jsx';

export default function Signup() {
  const { user, ready, signup } = useAuth();
  const { t, tr } = useI18n();
  const navigate = useNavigate();
  const location = useLocation();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (!ready) return <Spinner fullPage />;
  if (user) return <Navigate to={afterAuthPath(location.state, user)} replace />;

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (password.length < 8) {
      setError(t('auth.passwordShort'));
      return;
    }
    setBusy(true);
    try {
      const u = await signup(name, email, password);
      navigate(afterAuthPath(location.state, u), { replace: true });
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={submit}>
        <h1>{t('auth.createTitle')}</h1>
        <p className="muted">{location.state?.reason || t('auth.signupIntro')}</p>
        <input
          className="input-box input-sm"
          placeholder={t('auth.name')}
          autoComplete="name"
          maxLength={60}
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          className="input-box input-sm"
          type="email"
          placeholder={t('auth.email')}
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          className="input-box input-sm"
          type="password"
          placeholder={t('auth.passwordNew')}
          autoComplete="new-password"
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && <p className="form-error">{error}</p>}
        <button type="submit" className="support-btn" disabled={busy}>
          {busy ? <span className="dot-flashing" /> : t('auth.createButton')}
        </button>
        <p className="auth-fineprint">
          {tr('auth.fineprint', { terms: (s) => <Link to="/terms">{s}</Link>, privacy: (s) => <Link to="/privacy">{s}</Link> })}
        </p>
        <p className="auth-switch">
          {t('auth.haveAccount')}{' '}
          <Link to="/login" state={location.state} replace>
            {t('header.login')}
          </Link>
        </p>
      </form>
    </div>
  );
}
