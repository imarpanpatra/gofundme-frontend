import { useCallback, useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import Spinner from '../components/Spinner.jsx';
import { api } from '../lib/api.js';
import { formatMoney, shortDate, themeVars } from '../lib/format.js';
import { useSite } from '../lib/useSite.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { useI18n } from '../i18n/index.jsx';

function CancelButton({ subscriptionId, label, onDone }) {
  const toast = useToast();
  const { t } = useI18n();
  const [busy, setBusy] = useState(false);
  const cancel = async () => {
    if (!window.confirm(t('account.confirmCancel'))) return;
    setBusy(true);
    try {
      await api(`/account/subscriptions/${subscriptionId}/cancel`, { method: 'POST', body: {} });
      toast(t('account.cancelled'));
      onDone();
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setBusy(false);
    }
  };
  return (
    <button type="button" className="pill-btn pill-outline pill-sm" onClick={cancel} disabled={busy}>
      {busy ? <Spinner small /> : label}
    </button>
  );
}

export default function AccountPage() {
  const { user, ready, isCreator } = useAuth();
  const site = useSite();
  const { t, tr } = useI18n();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  const load = useCallback(() => {
    api('/account/overview')
      .then(setData)
      .catch((err) => setError(err.message));
  }, []);

  useEffect(() => {
    if (user) load();
  }, [user, load]);

  useEffect(() => {
    document.title = t('header.myAccount');
  }, [t]);

  if (!ready || site.status === 'loading') return <Spinner fullPage />;
  if (!user) return <Navigate to="/login" state={{ from: '/account' }} replace />;
  const creator = site.creator;

  return (
    <div className="page info-page" style={creator ? themeVars(creator.themeColor) : undefined}>
      <Header creator={creator} isOwner={Boolean(isCreator && creator && user.slug === creator.slug)} tab="" />
      <main className="hof-main">
        <section className="feature-box dash-hello">
          <div>
            <h1 className="dash-hello-title">{t('header.myAccount')}</h1>
            <p className="muted">
              {user.name} · {user.email}
            </p>
          </div>
          {isCreator && (
            <Link to="/dashboard" className="pill-btn pill-dark">
              {t('account.goToDashboard')}
            </Link>
          )}
        </section>

        {error && <p className="form-error">{error}</p>}
        {!data && !error && <Spinner />}
        {data && (
          <>
            <section className="feature-box">
              <h2 className="dash-h2">{t('account.memberships')}</h2>
              {data.memberships.length === 0 ? (
                <p className="muted">{t('account.noMemberships')}</p>
              ) : (
                <ul className="dash-list">
                  {data.memberships.map((m) => (
                    <li key={m.id} className="dash-row">
                      <div className="dash-row-main">
                        <p>
                          <strong>{m.tierName}</strong> · <Link to={`/${m.creator?.slug}`}>{m.creator?.name}</Link>
                        </p>
                        <p className="supporter-time">
                          {formatMoney(m.amount)}{t('common.perMonth')} · {t('account.since', { date: shortDate(m.startedAt) })}
                          {m.cancelRequested && ` · ${t('account.endsAtPeriodEnd')}`}
                          {m.status !== 'active' && ` · ${m.status}`}
                        </p>
                      </div>
                      {!m.cancelRequested && <CancelButton subscriptionId={m.subscriptionId} label={t('account.cancelMembership')} onDone={load} />}
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {data.monthlySupports.length > 0 && (
              <section className="feature-box">
                <h2 className="dash-h2">{t('account.monthlySupport')}</h2>
                <ul className="dash-list">
                  {data.monthlySupports.map((s) => (
                    <li key={s.subscriptionId} className="dash-row">
                      <div className="dash-row-main">
                        <p>
                          {tr('account.amountTo', { amount: <strong>{formatMoney(s.amount)}{t('common.perMonth')}</strong>, name: <Link to={`/${s.creator?.slug}`}>{s.creator?.name}</Link> })}
                        </p>
                        <p className="supporter-time">{t('account.since', { date: shortDate(s.since) })}</p>
                      </div>
                      <CancelButton subscriptionId={s.subscriptionId} label={t('common.cancel')} onDone={load} />
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <section className="feature-box">
              <h2 className="dash-h2">{t('account.purchases')}</h2>
              {data.purchases.length === 0 ? (
                <p className="muted">{t('account.noPurchases')}</p>
              ) : (
                <ul className="dash-list">
                  {data.purchases.map((p) => (
                    <li key={p.id} className="dash-row purchase-row">
                      <div className="dash-row-main">
                        <p>
                          <strong>{p.title}</strong> · <Link to={`/${p.creator?.slug}/shop`}>{p.creator?.name}</Link>
                        </p>
                        <p className="supporter-time">
                          {formatMoney(p.amount)} · {shortDate(p.paidAt)}
                        </p>
                        {p.deliveryNote && <p className="delivery-note">{p.deliveryNote}</p>}
                        {p.answer && <p className="supporter-time">{t('account.yourAnswer', { answer: p.answer })}</p>}
                      </div>
                      {p.deliveryUrl && (
                        <a href={p.deliveryUrl} target="_blank" rel="noopener noreferrer" className="pill-btn pill-theme pill-sm">
                          {t('account.open')}
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="feature-box">
              <h2 className="dash-h2">{t('account.history')}</h2>
              {data.supports.length === 0 ? (
                <p className="muted">
                  {t('account.noHistory')} <Link to="/" className="text-theme">{t('account.findPage')}</Link>
                </p>
              ) : (
                <ul className="dash-list">
                  {data.supports.map((s) => (
                    <li key={s.id} className="dash-row">
                      <div className="dash-row-main">
                        <p>
                          {tr('account.amountTo', { amount: `${formatMoney(s.amount)}${s.monthly ? t('common.perMonth') : ''}`, name: <Link to={`/${s.creator?.slug}`}>{s.creator?.name}</Link> })}
                        </p>
                        <p className="supporter-time">
                          {shortDate(s.paidAt)}
                          {s.paymentId && ` · ${s.paymentId}`}
                        </p>
                        {s.message && <p className="dash-message">"{s.message}"</p>}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}
