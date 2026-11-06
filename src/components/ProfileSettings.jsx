import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Spinner from './Spinner.jsx';
import { Checkbox } from './SupportWidget.jsx';
import { api } from '../lib/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { useI18n } from '../i18n/index.jsx';

export default function ProfileSettings() {
  const { t } = useI18n();
  const toast = useToast();
  const { user, setUser } = useAuth();
  const [form, setForm] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api('/account/profile')
      .then((d) => setForm({ username: d.username, name: d.name, bio: d.bio, profilePublic: d.profilePublic }))
      .catch((err) => setError(err.message));
  }, []);

  useEffect(() => {
    if (form && window.location.hash === '#profile') document.getElementById('profile')?.scrollIntoView({ block: 'start' });
  }, [Boolean(form)]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const save = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const d = await api('/account/profile', { method: 'PUT', body: form });
      setUser((u) => ({ ...u, ...d.user }));
      setForm((f) => ({ ...f, username: d.user.username }));
      toast(t('account.profileSaved'));
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const url = form ? `${window.location.host}/@${form.username}` : '';

  return (
    <section className="feature-box profile-settings" id="profile">
      <div className="dash-head-row">
        <h2 className="dash-h2">{t('account.profileTitle')}</h2>
        {user?.username && (
          <Link to={`/@${user.username}`} className="pill-btn pill-outline pill-sm">
            {t('account.viewProfile')}
          </Link>
        )}
      </div>
      {!form && !error && <Spinner />}
      {form && (
        <form className="form-grid" onSubmit={save}>
          <div className="contact-row">
            <div className="field">
              <label htmlFor="pf-username">{t('account.username')}</label>
              <div className="at-input">
                <span aria-hidden="true">@</span>
                <input
                  id="pf-username"
                  className="input-box input-sm"
                  maxLength={30}
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  value={form.username}
                  onChange={(e) => setForm((f) => ({ ...f, username: e.target.value.replace(/^@/, '').toLowerCase() }))}
                />
              </div>
              <span className="field-hint">{t('account.profileUrl', { url })}</span>
            </div>
            <div className="field">
              <label htmlFor="pf-name">{t('account.displayName')}</label>
              <input id="pf-name" className="input-box input-sm" maxLength={60} value={form.name} onChange={set('name')} />
            </div>
          </div>
          <div className="field">
            <label htmlFor="pf-bio">{t('account.bio')}</label>
            <input id="pf-bio" className="input-box input-sm" maxLength={160} placeholder={t('account.bioPlaceholder')} value={form.bio} onChange={set('bio')} />
          </div>
          <div>
            <Checkbox id="pf-public" checked={form.profilePublic} onChange={(v) => setForm((f) => ({ ...f, profilePublic: v }))}>
              {t('account.public')}
            </Checkbox>
            <p className="field-hint">{t('account.publicHint')}</p>
          </div>
          {error && <p className="form-error">{error}</p>}
          <div>
            <button type="submit" className="pill-btn pill-theme" disabled={busy}>
              {busy ? <Spinner small /> : t('account.saveProfile')}
            </button>
          </div>
        </form>
      )}
      {!form && error && <p className="form-error">{error}</p>}
    </section>
  );
}
