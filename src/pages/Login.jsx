import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Spinner from '../components/Spinner.jsx';
import AuthLayout from '../components/AuthLayout.jsx';
import PasswordInput from '../components/PasswordInput.jsx';
import GoogleButton from '../components/GoogleButton.jsx';
import { useI18n } from '../i18n/index.jsx';

export function afterAuthPath(state, user) {
  if (state?.from) return state.from;
  return user?.slug ? `/${user.slug}` : '/';
}

export default function Login() {
  const { user, ready, login, loginWithGoogle } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (!ready) return <Spinner fullPage />;
  if (user) return <Navigate to={afterAuthPath(location.state, user)} replace />;

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const u = await login(email, password);
      navigate(afterAuthPath(location.state, u), { replace: true });
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  const google = async (credential) => {
    setError('');
    setBusy(true);
    try {
      const u = await loginWithGoogle(credential);
      navigate(afterAuthPath(location.state, u), { replace: true });
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  return (
    <AuthLayout>
      <form className="auth-card" onSubmit={submit}>
        <h1>{t('auth.welcomeBack')}</h1>
        <p className="muted">{location.state?.reason || t('auth.loginIntro')}</p>
        <GoogleButton mode="signin" onCredential={google} onError={setError} />
        <div className="auth-or">
          <span>{t('auth.or')}</span>
        </div>
        <input
          className="input-box input-sm"
          type="email"
          placeholder={t('auth.email')}
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <PasswordInput
          className="input-box input-sm"
          placeholder={t('auth.password')}
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <Link to="/forgot-password" state={{ email }} className="auth-forgot">
          {t('auth.forgotLink')}
        </Link>
        {error && <p className="form-error">{error}</p>}
        <button type="submit" className="support-btn" disabled={busy}>
          {busy ? <span className="dot-flashing" /> : t('header.login')}
        </button>
        <p className="auth-switch">
          {t('auth.newHere')}{' '}
          <Link to="/signup" state={location.state} replace>
            {t('auth.createAccountLink')}
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
