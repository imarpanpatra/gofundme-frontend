import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import Spinner from '../components/Spinner.jsx';
import { TrophyIcon } from '../components/icons.jsx';
import { api } from '../lib/api.js';
import { formatMoney, formatNumber, initials, socialHandleUrl, themeVars } from '../lib/format.js';
import { useSite } from '../lib/useSite.js';
import { useAuth } from '../context/AuthContext.jsx';

const MEDALS = { 1: 'gold', 2: 'silver', 3: 'bronze' };

const monthYear = (d) => new Date(d).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });

function Name({ person }) {
  const url = socialHandleUrl(person.name);
  return (
    <>
      {url ? (
        <a href={url} target="_blank" rel="nofollow noopener noreferrer" className="hof-name">
          {person.name}
        </a>
      ) : (
        <span className="hof-name">{person.name}</span>
      )}
      {person.isYou && <span className="badge badge-you">You</span>}
    </>
  );
}

function Podium({ top }) {
  const order = [top[1], top[0], top[2]].filter(Boolean);
  return (
    <div className="podium">
      {order.map((p) => (
        <div key={p.rank} className={`podium-card podium-${MEDALS[p.rank]}${p.isYou ? ' is-you' : ''}`}>
          <span className="podium-rank">#{p.rank}</span>
          <span className="podium-avatar">{initials(p.name)}</span>
          <p className="podium-name">
            <Name person={p} />
          </p>
          <p className="podium-total">{formatMoney(p.total)}</p>
          <p className="podium-meta">
            {p.count} {p.count === 1 ? 'contribution' : 'contributions'}
            {p.monthly && ' · Monthly'}
          </p>
        </div>
      ))}
    </div>
  );
}

function Leaderboard({ slug, user, creatorName }) {
  const [period, setPeriod] = useState('all');
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    setData(null);
    setError('');
    api(`/pages/${slug}/hall-of-fame?period=${period}`)
      .then(setData)
      .catch((err) => setError(err.message));
  }, [slug, period, user?.id, user?.slug]);

  return (
    <>
      <section className="feature-box hof-hero">
        <span className="hof-hero-icon">
          <TrophyIcon width={30} height={30} />
        </span>
        <h1>Hall of Fame</h1>
        <p className="muted">The wonderful people supporting {creatorName}'s journey.</p>
        {data && (
          <div className="hof-stats">
            <div>
              <strong>{formatNumber(data.stats.supporters)}</strong>
              <span>{data.stats.supporters === 1 ? 'supporter' : 'supporters'}</span>
            </div>
            <div>
              <strong>{formatNumber(data.stats.supports)}</strong>
              <span>{data.stats.supports === 1 ? 'contribution' : 'contributions'}</span>
            </div>
            <div>
              <strong>{formatMoney(data.stats.raised)}</strong>
              <span>raised{period === 'month' ? ' this month' : ''}</span>
            </div>
          </div>
        )}
      </section>

      <section className="feature-box">
        <div className="hof-head">
          <h2 className="dash-h2">Leaderboard</h2>
          <div className="dash-tabs" role="tablist">
            {[
              ['all', 'All time'],
              ['month', 'This month'],
            ].map(([key, label]) => (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={period === key}
                className={`dash-tab${period === key ? ' active' : ''}`}
                onClick={() => setPeriod(key)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {error && <p className="form-error">{error}</p>}
        {!data && !error && (
          <div className="hof-loading">
            <Spinner />
          </div>
        )}
        {data && data.leaderboard.length === 0 && (
          <div className="supporters-empty">
            <span className="supporters-empty-icon">
              <TrophyIcon width={22} height={22} />
            </span>
            <p>{period === 'month' ? 'No supporters yet this month.' : 'No supporters yet.'} Be the first to make the board!</p>
          </div>
        )}
        {data && data.leaderboard.length > 0 && (
          <>
            <Podium top={data.leaderboard.slice(0, 3)} />
            {data.leaderboard.length > 3 && (
              <ol className="rank-list" start={4}>
                {data.leaderboard.slice(3).map((p) => (
                  <li key={p.rank} className={`rank-row${p.isYou ? ' is-you' : ''}`}>
                    <span className="rank-num">#{p.rank}</span>
                    <span className="supporter-avatar">{initials(p.name)}</span>
                    <div className="rank-main">
                      <p>
                        <Name person={p} />
                      </p>
                      <p className="supporter-time">
                        {p.count} {p.count === 1 ? 'contribution' : 'contributions'}
                        {p.monthly && ' · Monthly'}
                      </p>
                    </div>
                    <span className="dash-amount">{formatMoney(p.total)}</span>
                  </li>
                ))}
              </ol>
            )}
          </>
        )}
      </section>
    </>
  );
}

function AllSupporters({ slug }) {
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    api(`/pages/${slug}/hall-of-fame/supporters?page=${page}`)
      .then((d) => {
        setRows((prev) => (page === 1 ? d.supporters : [...prev, ...d.supporters]));
        setMeta(d);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [slug, page]);

  return (
    <section className="feature-box">
      <h2 className="dash-h2">
        All supporters {meta && <span className="hof-count">{formatNumber(meta.total)}</span>}
      </h2>
      {error && <p className="form-error">{error}</p>}
      {meta && rows.length === 0 && <p className="muted dash-empty">No supporters yet.</p>}
      {rows.length > 0 && (
        <ul className="hof-wall">
          {rows.map((p, i) => (
            <li key={`${p.name}-${i}`} className={`hof-wall-item${p.isYou ? ' is-you' : ''}`}>
              <span className="supporter-avatar">{initials(p.name)}</span>
              <div className="rank-main">
                <p>
                  <Name person={p} />
                  {p.monthly && <span className="badge">Monthly</span>}
                </p>
                <p className="supporter-time">Supporting since {monthYear(p.since)}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
      {loading && (
        <div className="hof-loading">
          <Spinner />
        </div>
      )}
      {meta && page < meta.pages && !loading && (
        <button type="button" className="pill-btn pill-outline see-more" onClick={() => setPage((p) => p + 1)}>
          Show more supporters
        </button>
      )}
    </section>
  );
}

export default function HallOfFame() {
  const site = useSite();
  const { user } = useAuth();

  useEffect(() => {
    if (site.status === 'ready') document.title = `Hall of Fame · ${site.creator.name}`;
  }, [site]);

  if (site.status === 'loading') return <Spinner fullPage />;
  if (site.status === 'error') {
    return (
      <div className="center-page">
        <p>{site.message}</p>
      </div>
    );
  }

  const { creator } = site;
  const isOwner = Boolean(user?.slug && user.slug === creator.slug);

  return (
    <div className="page info-page" style={themeVars(creator.themeColor)}>
      <Header creator={creator} isOwner={isOwner} tab="hall-of-fame" />
      <main className="hof-main">
        <Leaderboard slug={creator.slug} user={user} creatorName={creator.name} />
        <AllSupporters slug={creator.slug} />
        <section className="feature-box hof-cta">
          <div>
            <h2>Want to see your name here?</h2>
            <p className="muted">Every contribution counts towards the leaderboard.</p>
          </div>
          <Link to={`/${creator.slug}`} className="pill-btn pill-theme">
            {creator.supportButtonText} {creator.name}
          </Link>
        </section>
      </main>
      <Footer />
    </div>
  );
}
