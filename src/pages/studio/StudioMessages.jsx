import { useEffect, useState } from 'react';
import Spinner from '../../components/Spinner.jsx';
import { api } from '../../lib/api.js';
import { useToast } from '../../context/ToastContext.jsx';
import { initials, timeAgo } from '../../lib/format.js';

export default function StudioMessages() {
  const [page, setPage] = useState(1);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const toast = useToast();

  useEffect(() => {
    document.title = 'Messages';
  }, []);

  useEffect(() => {
    let alive = true;
    setError('');
    api(`/contact?page=${page}`)
      .then((d) => alive && setData(d))
      .catch((err) => alive && setError(err.message));
    return () => {
      alive = false;
    };
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
      toast(err.message, 'error');
    }
  };

  return (
    <div className="studio-stack">
      <h1 className="studio-title">
        Messages {data?.unread > 0 && <span className="badge">{data.unread} new</span>}
      </h1>
      <section className="studio-card">
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
      </section>
    </div>
  );
}
