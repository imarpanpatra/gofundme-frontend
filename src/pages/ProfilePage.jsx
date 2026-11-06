import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import Spinner from '../components/Spinner.jsx';
import { SupportAction } from '../components/RecentSupporters.jsx';
import { LockIcon } from '../components/icons.jsx';
import { api } from '../lib/api.js';
import useSeo from '../seo/useSeo.js';
import { brandName, formatMoney, initials, themeVars, timeAgo } from '../lib/format.js';
import { useSite } from '../lib/useSite.js';
import { useAuth } from '../context/AuthContext.jsx';
import { LOCALES, useI18n } from '../i18n/index.jsx';

const monthYear = (d, lang) => new Date(d).toLocaleDateString(LOCALES[lang] || LOCALES.en, { month: 'long', year: 'numeric' });

export default function ProfilePage({ username }) {
  const { t, lang } = useI18n();
  const site = useSite();
  const { user, isCreator } = useAuth();
  const [state, setState] = useState({ status: 'loading' });

  useEffect(() => {
    let alive = true;
    setState({ status: 'loading' });
    api(`/profiles/${encodeURIComponent(username)}`)
      .then((d) => alive && setState({ status: 'ready', ...d }))
      .catch((err) => alive && setState({ status: err.status === 404 ? 'missing' : 'error', message: err.message }));
    return () => {
      alive = false;
    };
  }, [username, user?.id]);

  useSeo('profile', { creator: site.creator, profile: state.profile }, Boolean(state.profile) && site.status === 'ready');

  if (state.redirect) return <Navigate to={state.redirect} replace />;
  if (state.status === 'loading' || site.status === 'loading') return <Spinner fullPage />;

  const creator = site.creator;
  const { profile, stats, activity } = state;

  return (
    <div className="page info-page" style={creator ? themeVars(creator.themeColor) : undefined}>
      <Header creator={creator} isOwner={Boolean(isCreator && creator && user?.slug === creator.slug)} tab="" />
      <main className="hof-main profile-main">
        {state.status === 'missing' && (
          <section className="feature-box center-text">
            <p className="muted">{t('profile.missing')}</p>
          </section>
        )}
        {state.status === 'error' && <p className="form-error">{state.message}</p>}

        {profile && (
          <section className="feature-box profile-hero">
            <div className="profile-top">
              <span className="profile-avatar">{initials(profile.name || profile.username)}</span>
              <div className="profile-id">
                <h1>{profile.name || `@${profile.username}`}</h1>
                {profile.name && <p className="muted">@{profile.username}</p>}
                {profile.bio && <p className="profile-bio">{profile.bio}</p>}
                {profile.supportingSince && <p className="supporter-time">{t('profile.since', { date: monthYear(profile.supportingSince, lang) })}</p>}
              </div>
              {profile.isYou && (
                <Link to="/account#profile" className="pill-btn pill-outline pill-sm profile-edit">
                  {t('profile.edit')}
                </Link>
              )}
            </div>
            {stats && (
              <div className="hof-stats">
                <div>
                  <strong>{formatMoney(stats.total)}</strong>
                  <span>{t('profile.given')}</span>
                </div>
                <div>
                  <strong>{stats.supports}</strong>
                  <span>{t('profile.contributions', { count: stats.supports })}</span>
                </div>
                <div>
                  <strong>{stats.moments}</strong>
                  <span>{t('profile.moments', { count: stats.moments })}</span>
                </div>
              </div>
            )}
          </section>
        )}

        {profile?.private && !profile.isYou && (
          <section className="feature-box center-text profile-private">
            <LockIcon width={22} height={22} />
            <p className="muted">{t('profile.private')}</p>
          </section>
        )}

        {profile?.private && profile.isYou && <p className="profile-note">{t('profile.privateYou')}</p>}

        {activity && (
          <section className="feature-box">
            <h2 className="dash-h2">{t('profile.activity')}</h2>
            {activity.length === 0 ? (
              <p className="muted">{t('profile.none')}</p>
            ) : (
              <ul className="supporters-list">
                {activity.map((s) => (
                  <li key={s.id} className="supporter">
                    <span className="supporter-avatar">{initials(profile.name)}</span>
                    <div className="supporter-main">
                      <p className="supporter-line">
                        <span className="supporter-name">{profile.name}</span> <SupportAction s={s} />
                      </p>
                      <p className="supporter-time">
                        {timeAgo(s.createdAt)}
                        {s.creator && (
                          <>
                            {' · '}
                            <Link to={`/${s.creator.slug}`} className="text-theme">
                              {t('profile.on', { page: brandName(s.creator) })}
                            </Link>
                          </>
                        )}
                      </p>
                      {s.message && (
                        <div className="supporter-message">
                          <p>{s.message}</p>
                        </div>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
}
