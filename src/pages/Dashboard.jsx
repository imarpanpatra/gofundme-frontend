import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import Header from '../components/Header.jsx';
import Spinner from '../components/Spinner.jsx';
import { LockIcon } from '../components/icons.jsx';
import { api, assetUrl } from '../lib/api.js';
import { formatMoney, initials, themeVars, timeAgo } from '../lib/format.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useShare } from '../lib/useShare.js';

function MessagesCard() {
  const [page, setPage] = useState(1);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api(`/contact?page=${page}`)
      .then(setData)
      .catch((err) => setError(err.message));
  }, [page]);

  const markRead = async (id) => {
    try {
      await api(`/contact/${id}/read`, { method: 'PATCH', body: { read: true } });
      setData((d) => ({
        ...d,
        unread: Math.max(0, d.unread - 1),
        messages: d.messages.map((m) => (m.id === id ? { ...m, read: true } : m)),
      }));
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="feature-box">
      <h2 className="dash-h2">
        Contact messages {data?.unread > 0 && <span className="badge">{data.unread} new</span>}
      </h2>
      {error && <p className="form-error">{error}</p>}
      {!data && !error && <Spinner />}
      {data && data.messages.length === 0 && <p className="muted dash-empty">No messages yet.</p>}
      {data && data.messages.length > 0 && (
        <ul className="dash-list">
          {data.messages.map((m) => (
            <li key={m.id} className={`dash-row${m.read ? '' : ' dash-unread'}`}>
              <span className="supporter-avatar">{initials(m.name)}</span>
              <div className="dash-row-main">
                <p>
                  <strong>{m.name}</strong> <a href={`mailto:${m.email}?subject=${encodeURIComponent(`Re: ${m.subject || 'Your message'}`)}`} className="muted">{m.email}</a>
                </p>
                {m.subject && <p className="dash-subject">{m.subject}</p>}
                <p className="dash-message">{m.message}</p>
                <p className="supporter-time">{timeAgo(m.createdAt)}</p>
              </div>
              {!m.read && (
                <button type="button" className="pill-btn pill-outline pill-sm" onClick={() => markRead(m.id)}>
                  Mark read
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
      {data && data.pages > 1 && (
        <div className="pager">
          <button type="button" className="pill-btn pill-outline" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            Previous
          </button>
          <span className="muted">
            Page {data.page} of {data.pages}
          </span>
          <button type="button" className="pill-btn pill-outline" disabled={page >= data.pages} onClick={() => setPage((p) => p + 1)}>
            Next
          </button>
        </div>
      )}
    </div>
  );
}

const TABS = [
  ['paid', 'Successful'],
  ['created', 'Pending'],
  ['failed', 'Failed'],
];

export default function Dashboard() {
  const { user, ready } = useAuth();
  const share = useShare();
  const [status, setStatus] = useState('paid');
  const [page, setPage] = useState(1);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return;
    setData(null);
    setError('');
    api(`/dashboard?status=${status}&page=${page}`)
      .then(setData)
      .catch((err) => setError(err.message));
  }, [user, status, page]);

  if (!ready) return <Spinner fullPage />;
  if (!user) return <Navigate to="/login" state={{ from: '/dashboard' }} replace />;

  const pageUrl = `${window.location.origin}/${user.slug}`;

  return (
    <div className="page" style={themeVars(user.themeColor)}>
      <Header creator={user} isOwner tab="dashboard" />
      <main className="dash">
        <div className="dash-hello feature-box">
          <div className="dash-hello-left">
            {user.avatar && <img src={assetUrl(user.avatar)} alt="" className="dash-avatar" />}
            <div>
              <h1>Hi, {user.name}</h1>
              <a href={pageUrl} className="muted">
                {pageUrl.replace(/^https?:\/\//, '')}
              </a>
            </div>
          </div>
          <button type="button" className="pill-btn pill-dark" onClick={() => share(pageUrl, user.name)}>
            Share page
          </button>
        </div>

        <div className="feature-box">
          <h2 className="dash-h2">Earnings</h2>
          {data ? (
            <div className="stats">
              <div className="stat">
                <span className="stat-value">{formatMoney(data.stats.last30.total)}</span>
                <span className="stat-label">Last 30 days</span>
              </div>
              <div className="stat">
                <span className="stat-value">{formatMoney(data.stats.last7.total)}</span>
                <span className="stat-label">Last 7 days</span>
              </div>
              <div className="stat">
                <span className="stat-value">{formatMoney(data.stats.allTime.total)}</span>
                <span className="stat-label">All time · {data.stats.allTime.count} payments</span>
              </div>
              <div className="stat">
                <span className="stat-value">{data.stats.activeMonthly}</span>
                <span className="stat-label">Active monthly supporters</span>
              </div>
            </div>
          ) : (
            !error && <Spinner />
          )}
        </div>

        <div className="feature-box">
          <div className="dash-tabs" role="tablist">
            {TABS.map(([key, label]) => (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={status === key}
                className={`dash-tab${status === key ? ' active' : ''}`}
                onClick={() => {
                  setStatus(key);
                  setPage(1);
                }}
              >
                {label}
              </button>
            ))}
          </div>

          {error && <p className="form-error">{error}</p>}
          {!data && !error && <Spinner />}
          {data && data.supports.length === 0 && <p className="muted dash-empty">Nothing here yet.</p>}
          {data && data.supports.length > 0 && (
            <ul className="dash-list">
              {data.supports.map((s) => (
                <li key={s.id} className="dash-row">
                  <span className="supporter-avatar">{initials(s.name)}</span>
                  <div className="dash-row-main">
                    <p>
                      <strong>{s.name}</strong>
                      {s.monthly && <span className="badge">Monthly{s.subscriptionStatus ? ` · ${s.subscriptionStatus}` : ''}</span>}
                    </p>
                    {s.message && (
                      <p className="dash-message">
                        {s.isPrivate && <LockIcon width={13} height={13} />} {s.message}
                      </p>
                    )}
                    <p className="supporter-time">
                      {timeAgo(s.createdAt)}
                      {s.paymentId && ` · ${s.paymentId}`}
                    </p>
                  </div>
                  <span className="dash-amount">{formatMoney(s.amount, s.currency)}</span>
                </li>
              ))}
            </ul>
          )}

          {data && data.pages > 1 && (
            <div className="pager">
              <button type="button" className="pill-btn pill-outline" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                Previous
              </button>
              <span className="muted">
                Page {data.page} of {data.pages}
              </span>
              <button type="button" className="pill-btn pill-outline" disabled={page >= data.pages} onClick={() => setPage((p) => p + 1)}>
                Next
              </button>
            </div>
          )}
        </div>

        <MessagesCard />
      </main>
    </div>
  );
}
