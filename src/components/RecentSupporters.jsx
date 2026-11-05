import { formatMoney, initials, socialHandleUrl, timeAgo } from '../lib/format.js';
import { HeartIcon } from './icons.jsx';
import Spinner from './Spinner.jsx';

function SupporterName({ name }) {
  const url = socialHandleUrl(name);
  return url ? (
    <a href={url} target="_blank" rel="nofollow noopener noreferrer" className="supporter-name">
      {name}
    </a>
  ) : (
    <span className="supporter-name">{name}</span>
  );
}

export default function RecentSupporters({ creatorName, supporters, hasMore, loadingMore, onLoadMore }) {
  return (
    <section className="supporters-section" aria-label="Recent supporters">
      <p className="supporters-title">Recent supporters</p>

      {supporters.length === 0 ? (
        <div className="supporters-empty">
          <span className="supporters-empty-icon">
            <HeartIcon width={22} height={22} />
          </span>
          <p>Be the first one to support {creatorName}.</p>
        </div>
      ) : (
        <ul className="supporters-list">
          {supporters.map((s) => (
            <li key={s.id} className="supporter">
              <span className="supporter-avatar">{initials(s.name)}</span>
              <div className="supporter-main">
                <p className="supporter-line">
                  <SupporterName name={s.name} /> {s.monthly ? 'is a monthly supporter' : 'supported'}{' '}
                  <strong>
                    {formatMoney(s.amount, s.currency)}
                    {s.monthly && '/month'}
                  </strong>
                </p>
                <p className="supporter-time">{timeAgo(s.createdAt)}</p>
                {s.message && <p className="supporter-message">{s.message}</p>}
              </div>
            </li>
          ))}
        </ul>
      )}

      {hasMore && (
        <button type="button" className="pill-btn pill-outline see-more" onClick={onLoadMore} disabled={loadingMore}>
          {loadingMore ? <Spinner small /> : 'See more'}
        </button>
      )}
    </section>
  );
}
