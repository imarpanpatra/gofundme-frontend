import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Spinner from '../components/Spinner.jsx';
import { afterAuthPath } from './Login.jsx';

export default function Signup() {
  const { user, ready, signup } = useAuth();
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
      setError('Password must be at least 8 characters');
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
        <h1>Create your account</h1>
        <p className="muted">{location.state?.reason || 'Sign up to support creators and join the Hall of Fame.'}</p>
        <input
          className="input-box input-sm"
          placeholder="Your name"
          autoComplete="name"
          maxLength={60}
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          className="input-box input-sm"
          type="email"
          placeholder="Email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          className="input-box input-sm"
          type="password"
          placeholder="Password (min. 8 characters)"
          autoComplete="new-password"
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && <p className="form-error">{error}</p>}
        <button type="submit" className="support-btn" disabled={busy}>
          {busy ? <span className="dot-flashing" /> : 'Create account'}
        </button>
        <p className="auth-fineprint">
          By creating an account you agree to the <Link to="/terms">Terms</Link> and <Link to="/privacy">Privacy Policy</Link>.
        </p>
        <p className="auth-switch">
          Already have an account?{' '}
          <Link to="/login" state={location.state} replace>
            Log in
          </Link>
        </p>
      </form>
    </div>
  );
}
