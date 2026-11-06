import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import Spinner from '../components/Spinner.jsx';
import { TrophyIcon } from '../components/icons.jsx';
import { api } from '../lib/api.js';
import useSeo from '../seo/useSeo.js';
import { mentionOf, formatMoney, formatNumber, initials, socialHandleUrl, themeVars } from '../lib/format.js';
import { useSite } from '../lib/useSite.js';
import { useAuth } from '../context/AuthContext.jsx';
import { LOCALES, useI18n } from '../i18n/index.jsx';
import VietnamBackdrop, { PhotoCredits } from '../components/VietnamBackdrop.jsx';

const MEDALS = { 1: 'gold', 2: 'silver', 3: 'bronze' };

const monthYear = (d, lang) => new Date(d).toLocaleDateString(LOCALES[lang] || LOCALES.en, { month: 'short', year: 'numeric' });

function Name({ person }) {
  const { t } = useI18n();
  const url = socialHandleUrl(person.name);
  return (
    <>
      {person.username ? (
        <Link to={`/@${person.username}`} className="hof-name">
          {person.name}
        </Link>
      ) : url ? (
        <a href={url} target="_blank" rel="nofollow noopener noreferrer" className="hof-name">
          {person.name}
        </a>
      ) : (
        <span className="hof-name">{person.name}</span>
      )}
      {person.isYou && <span className="badge badge-you">{t('hof.you')}</span>}
    </>
  );
}

function Podium({ top }) {
  const { t } = useI18n();
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
            {t('hof.contributions', { count: p.count })}
            {p.monthly && ` · ${t('hof.monthly')}`}
          </p>
        </div>
      ))}
    </div>
  );
}

function Leaderboard({ slug, user, creatorName }) {
  const { t } = useI18n();
  const [period, setPeriod] = useState('all');
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;
    setData(null);
    setError('');
    api(`/pages/${slug}/hall-of-fame?period=${period}`)
      .then((d) => alive && setData(d))
      .catch((err) => alive && setError(err.message));
    return () => {
      alive = false;
    };
  }, [slug, period, user?.id, user?.slug]);

  return (
    <>
      <section className="feature-box hof-hero">
        <span className="hof-hero-icon">
          <TrophyIcon width={30} height={30} />
        </span>
        <h1>{t('tabs.hallOfFame')}</h1>
        <p className="muted">{t('hof.subtitle', { name: creatorName })}</p>
        {data && (
          <div className="hof-stats">
            <div>
              <strong>{formatNumber(data.stats.supporters)}</strong>
              <span>{t('hof.statSupporters', { count: data.stats.supporters })}</span>
            </div>
            <div>
              <strong>{formatNumber(data.stats.supports)}</strong>
              <span>{t('hof.statContributions', { count: data.stats.supports })}</span>
            </div>
            <div>
              <strong>{formatMoney(data.stats.raised)}</strong>
              <span>{period === 'month' ? t('hof.raisedMonth') : t('hof.raised')}</span>
            </div>
          </div>
        )}
      </section>

      <section className="feature-box">
        <div className="hof-head">
          <h2 className="dash-h2">{t('hof.leaderboard')}</h2>
          <div className="dash-tabs" role="tablist">
            {[
              ['all', t('hof.allTime')],
              ['month', t('hof.thisMonth')],
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
            <p>{period === 'month' ? t('hof.emptyMonth') : t('hof.empty')}</p>
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
                        {t('hof.contributions', { count: p.count })}
                        {p.monthly && ` · ${t('hof.monthly')}`}
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
  const { t, lang } = useI18n();
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError('');
    api(`/pages/${slug}/hall-of-fame/supporters?page=${page}`)
      .then((d) => {
        if (!alive) return;
        setRows((prev) => (page === 1 ? d.supporters : [...prev, ...d.supporters]));
        setMeta(d);
      })
      .catch((err) => alive && setError(err.message))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [slug, page, retry]);

  return (
    <section className="feature-box">
      <h2 className="dash-h2">
        {t('hof.allSupporters')} {meta && <span className="hof-count">{formatNumber(meta.total)}</span>}
      </h2>
      {error && <p className="form-error">{error}</p>}
      {meta && rows.length === 0 && <p className="muted dash-empty">{t('hof.noneYet')}</p>}
      {rows.length > 0 && (
        <ul className="hof-wall">
          {rows.map((p, i) => (
            <li key={`${p.name}-${i}`} className={`hof-wall-item${p.isYou ? ' is-you' : ''}`}>
              <span className="supporter-avatar">{initials(p.name)}</span>
              <div className="rank-main">
                <p>
                  <Name person={p} />
                  {p.monthly && <span className="badge">{t('hof.monthly')}</span>}
                </p>
                <p className="supporter-time">{t('hof.since', { date: monthYear(p.since, lang) })}</p>
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
      {meta && !loading && (error ? page > 1 : page < meta.pages) && (
        <button type="button" className="pill-btn pill-outline see-more" onClick={() => (error ? setRetry((n) => n + 1) : setPage((p) => p + 1))}>
          {t('hof.showMore')}
        </button>
      )}
    </section>
  );
}

export default function HallOfFame() {
  const site = useSite();
  const { user } = useAuth();
  const { t } = useI18n();

  useSeo('hof', { creator: site.creator }, site.status === 'ready');

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
    <div className="page info-page vn-page" style={themeVars(creator.themeColor)}>
      <VietnamBackdrop />
      <Header creator={creator} isOwner={isOwner} tab="hall-of-fame" />
      <main className="hof-main">
        <Leaderboard slug={creator.slug} user={user} creatorName={creator.name} />
        <AllSupporters slug={creator.slug} />
        <section className="feature-box hof-cta">
          <div>
            <h2>{t('hof.ctaTitle')}</h2>
            <p className="muted">{t('hof.ctaBody')}</p>
          </div>
          <Link to={`/${creator.slug}`} className="pill-btn pill-theme">
            {creator.supportButtonText === 'Support' ? t('support.title', { name: mentionOf(creator) }) : `${creator.supportButtonText} ${creator.name}`}
          </Link>
        </section>
        <PhotoCredits />
      </main>
      <Footer />
    </div>
  );
}
