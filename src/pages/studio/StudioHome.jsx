import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import Spinner from '../../components/Spinner.jsx';
import TransactionList from '../../components/studio/TransactionList.jsx';
import { HeartIcon, ShareIcon } from '../../components/icons.jsx';
import { api, assetUrl } from '../../lib/api.js';
import { formatMoney, initials } from '../../lib/format.js';
import { useShare } from '../../lib/useShare.js';

const PERIODS = [
  ['7', 'Last 7 days'],
  ['30', 'Last 30 days'],
  ['90', 'Last 90 days'],
  ['all', 'All time'],
];

export function EmptyFirstSupporter() {
  return (
    <div className="studio-empty">
      <span className="studio-empty-icon">
        <HeartIcon width={26} height={26} />
      </span>
      <h3>Your first supporter is closer than you think!</h3>
      <p className="muted">Share your page on social media to help them find you.</p>
    </div>
  );
}

export default function StudioHome() {
  const { creator } = useOutletContext();
  const share = useShare();
  const [days, setDays] = useState('30');
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const pageUrl = `${window.location.origin}/${creator.slug}`;

  useEffect(() => {
    document.title = 'Dashboard';
  }, []);

  useEffect(() => {
    setData(null);
    api(`/studio/overview?days=${days}`)
      .then(setData)
      .catch((err) => setError(err.message));
  }, [days]);

  return (
    <div className="studio-stack">
      <section className="studio-card">
        <div className="studio-hello">
          <div className="studio-hello-left">
            {creator.avatar ? (
              <img src={assetUrl(creator.avatar)} alt="" className="studio-hello-avatar" />
            ) : (
              <span className="studio-hello-avatar menu-avatar-fallback">{initials(creator.name)}</span>
            )}
            <div>
              <h1>Hi, {creator.name}</h1>
              <a href={pageUrl} target="_blank" rel="noopener noreferrer">
                {pageUrl.replace(/^https?:\/\//, '')}
              </a>
            </div>
          </div>
          <button type="button" className="pill-btn pill-dark studio-share" onClick={() => share(pageUrl, creator.name)}>
            <ShareIcon width={18} height={18} /> Share page
          </button>
        </div>

        <div className="studio-earnings">
          <div className="studio-earnings-head">
            <h2>Earnings</h2>
            <select className="period-select" value={days} onChange={(e) => setDays(e.target.value)} aria-label="Period">
              {PERIODS.map(([v, label]) => (
                <option key={v} value={v}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          {error && <p className="form-error">{error}</p>}
          {!data && !error ? (
            <Spinner />
          ) : (
            data && (
              <>
                <p className="studio-total">{formatMoney(data.total)}</p>
                <div className="studio-legend">
                  <span>
                    <i className="dot-tip" /> {formatMoney(data.breakdown.tip)} Supporters
                  </span>
                  <span>
                    <i className="dot-membership" /> {formatMoney(data.breakdown.membership)} Membership
                  </span>
                  <span>
                    <i className="dot-shop" /> {formatMoney(data.breakdown.shop)} Shop
                  </span>
                </div>
              </>
            )
          )}
        </div>
      </section>

      <section className="studio-card">
        {data && data.recent.length > 0 ? (
          <>
            <h2 className="dash-h2">Recent activity</h2>
            <TransactionList items={data.recent} />
          </>
        ) : (
          data && <EmptyFirstSupporter />
        )}
        {!data && !error && <Spinner />}
      </section>
    </div>
  );
}
