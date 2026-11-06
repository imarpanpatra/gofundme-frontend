import { useEffect, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Spinner from '../components/Spinner.jsx';
import AuthLayout from '../components/AuthLayout.jsx';
import PasswordInput from '../components/PasswordInput.jsx';
import GoogleButton from '../components/GoogleButton.jsx';
import { MailIcon } from '../components/icons.jsx';
import { afterAuthPath } from './Login.jsx';
import { api } from '../lib/api.js';
import { useI18n } from '../i18n/index.jsx';

const RESEND_AFTER = 30;

function CodeStep({ pending, onBack, onVerified }) {
  const { t } = useI18n();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [wait, setWait] = useState(RESEND_AFTER);

  useEffect(() => {
    if (wait <= 0) return undefined;
    const id = setTimeout(() => setWait((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [wait]);

  const verify = async (e) => {
    e.preventDefault();
    if (busy) return;
    setError('');
    setNote('');
    setBusy(true);
    try {
      const d = await api('/auth/signup/verify', { method: 'POST', body: { signupId: pending.signupId, code } });
      onVerified(d);
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  const resend = async () => {
    setError('');
    setNote('');
    setWait(RESEND_AFTER);
    try {
      await api('/auth/signup/resend', { method: 'POST', body: { signupId: pending.signupId } });
      setCode('');
      setNote(t('auth.codeResent'));
    } catch (err) {
      setError(err.message);
      if (err.status === 400) onBack(err.message);
    }
  };

  return (
    <form className="auth-card auth-done" onSubmit={verify}>
      <span className="auth-done-icon">
        <MailIcon width={26} height={26} />
      </span>
      <h1>{t('auth.codeTitle')}</h1>
      <p className="muted">{t('auth.codeIntro', { email: pending.email })}</p>
      <input
        className="input-box input-sm code-input"
        inputMode="numeric"
        autoComplete="one-time-code"
        placeholder={t('auth.codePlaceholder')}
        aria-label={t('auth.codePlaceholder')}
        maxLength={6}
        value={code}
        onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
        autoFocus
        required
      />
      {error && <p className="form-error">{error}</p>}
      {note && <p className="auth-small muted">{note}</p>}
      <button type="submit" className="support-btn auth-done-btn" disabled={busy || code.length !== 6}>
        {busy ? <span className="dot-flashing" /> : t('auth.verifyButton')}
      </button>
      <p className="auth-small muted">{t('auth.codeSpam')}</p>
      <p className="auth-switch">
        <button type="button" className="text-link" onClick={resend} disabled={wait > 0}>
          {wait > 0 ? t('auth.resendIn', { seconds: wait }) : t('auth.resendCode')}
        </button>
        {' · '}
        <button type="button" className="text-link" onClick={() => onBack('')}>
          {t('auth.changeEmail')}
        </button>
      </p>
    </form>
  );
}

export default function Signup() {
  const { user, ready, applySession, loginWithGoogle } = useAuth();
  const { t, tr } = useI18n();
  const navigate = useNavigate();
  const location = useLocation();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [pending, setPending] = useState(null);

  if (!ready) return <Spinner fullPage />;
  if (user) return <Navigate to={afterAuthPath(location.state, user)} replace />;

  const submit = async (e) => {
    e.preventDefault();
    if (busy) return;
    setError('');
    if (password.length < 8) {
      setError(t('auth.passwordShort'));
      return;
    }
    setBusy(true);
    try {
      const d = await api('/auth/signup', { method: 'POST', body: { name, email, password } });
      setPending({ signupId: d.signupId, email: d.email });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const finish = (d) => {
    const u = applySession(d);
    navigate(afterAuthPath(location.state, u), { replace: true });
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

  if (pending) {
    return (
      <AuthLayout>
        <CodeStep
          pending={pending}
          onVerified={finish}
          onBack={(message) => {
            setPending(null);
            setError(message);
          }}
        />
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <form className="auth-card" onSubmit={submit}>
        <h1>{t('auth.createTitle')}</h1>
        <p className="muted">{location.state?.reason || t('auth.signupIntro')}</p>
        <GoogleButton mode="signup" onCredential={google} onError={setError} />
        <div className="auth-or">
          <span>{t('auth.or')}</span>
        </div>
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
        <PasswordInput
          className="input-box input-sm"
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
    </AuthLayout>
  );
}
