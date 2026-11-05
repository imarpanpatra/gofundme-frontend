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

function CancelButton({ subscriptionId, label, onDone }) {
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const cancel = async () => {
    if (!window.confirm('Cancel this subscription? It stays active until the end of the current billing period.')) return;
    setBusy(true);
    try {
      await api(`/account/subscriptions/${subscriptionId}/cancel`, { method: 'POST', body: {} });
      toast('Cancelled. No further charges will be made.');
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
    document.title = 'My account';
  }, []);

  if (!ready || site.status === 'loading') return <Spinner fullPage />;
  if (!user) return <Navigate to="/login" state={{ from: '/account' }} replace />;
  const creator = site.creator;

  return (
    <div className="page info-page" style={creator ? themeVars(creator.themeColor) : undefined}>
      <Header creator={creator} isOwner={Boolean(isCreator && creator && user.slug === creator.slug)} tab="" />
      <main className="hof-main">
        <section className="feature-box dash-hello">
          <div>
            <h1 className="dash-hello-title">My account</h1>
            <p className="muted">
              {user.name} · {user.email}
            </p>
          </div>
          {isCreator && (
            <Link to="/dashboard" className="pill-btn pill-dark">
              Go to dashboard
            </Link>
          )}
        </section>

        {error && <p className="form-error">{error}</p>}
        {!data && !error && <Spinner />}
        {data && (
          <>
            <section className="feature-box">
              <h2 className="dash-h2">Memberships</h2>
              {data.memberships.length === 0 ? (
                <p className="muted">You don't have any active memberships.</p>
              ) : (
                <ul className="dash-list">
                  {data.memberships.map((m) => (
                    <li key={m.id} className="dash-row">
                      <div className="dash-row-main">
                        <p>
                          <strong>{m.tierName}</strong> · <Link to={`/${m.creator?.slug}`}>{m.creator?.name}</Link>
                        </p>
                        <p className="supporter-time">
                          {formatMoney(m.amount)}/month · since {shortDate(m.startedAt)}
                          {m.cancelRequested && ' · ends at the end of this billing period'}
                          {m.status !== 'active' && ` · ${m.status}`}
                        </p>
                      </div>
                      {!m.cancelRequested && <CancelButton subscriptionId={m.subscriptionId} label="Cancel membership" onDone={load} />}
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {data.monthlySupports.length > 0 && (
              <section className="feature-box">
                <h2 className="dash-h2">Monthly support</h2>
                <ul className="dash-list">
                  {data.monthlySupports.map((s) => (
                    <li key={s.subscriptionId} className="dash-row">
                      <div className="dash-row-main">
                        <p>
                          <strong>{formatMoney(s.amount)}/month</strong> to <Link to={`/${s.creator?.slug}`}>{s.creator?.name}</Link>
                        </p>
                        <p className="supporter-time">since {shortDate(s.since)}</p>
                      </div>
                      <CancelButton subscriptionId={s.subscriptionId} label="Cancel" onDone={load} />
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <section className="feature-box">
              <h2 className="dash-h2">Purchases</h2>
              {data.purchases.length === 0 ? (
                <p className="muted">Things you buy from a shop will appear here.</p>
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
                        {p.answer && <p className="supporter-time">Your answer: {p.answer}</p>}
                      </div>
                      {p.deliveryUrl && (
                        <a href={p.deliveryUrl} target="_blank" rel="noopener noreferrer" className="pill-btn pill-theme pill-sm">
                          Open
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="feature-box">
              <h2 className="dash-h2">Support history</h2>
              {data.supports.length === 0 ? (
                <p className="muted">
                  You haven't supported anyone yet. <Link to="/" className="text-theme">Find a page to support</Link>
                </p>
              ) : (
                <ul className="dash-list">
                  {data.supports.map((s) => (
                    <li key={s.id} className="dash-row">
                      <div className="dash-row-main">
                        <p>
                          {formatMoney(s.amount)}
                          {s.monthly && '/month'} to <Link to={`/${s.creator?.slug}`}>{s.creator?.name}</Link>
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
