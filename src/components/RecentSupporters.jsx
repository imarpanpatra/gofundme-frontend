import { formatMoney, initials, socialHandleUrl, timeAgo } from '../lib/format.js';
import { Link } from 'react-router-dom';
import { HeartIcon, TrophyIcon } from './icons.jsx';
import Spinner from './Spinner.jsx';
import { useI18n } from '../i18n/index.jsx';

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

const strong = (text) => <strong>{text}</strong>;

export function SupportAction({ s }) {
  const { t, tr } = useI18n();
  if (s.type === 'membership') {
    return s.tierName ? tr('supporters.memberTier', { tier: strong(s.tierName) }) : t('supporters.member');
  }
  if (s.type === 'shop') {
    return tr('supporters.bought', { item: strong(s.productTitle || t('supporters.anItem')) });
  }
  const amount = formatMoney(s.amount, s.currency);
  return s.monthly
    ? tr('supporters.monthly', { amount: strong(`${amount}${t('common.perMonth')}`) })
    : tr('supporters.supported', { amount: strong(amount) });
}

export default function RecentSupporters({ creatorName, supporters, hasMore, loadingMore, onLoadMore }) {
  const { t } = useI18n();
  return (
    <section className="supporters-section" aria-label={t('supporters.title')}>
      <p className="supporters-title">{t('supporters.title')}</p>

      {supporters.length === 0 ? (
        <div className="supporters-empty">
          <span className="supporters-empty-icon">
            <HeartIcon width={22} height={22} />
          </span>
          <p>{t('supporters.empty', { name: creatorName })}</p>
        </div>
      ) : (
        <ul className="supporters-list">
          {supporters.map((s) => (
            <li key={s.id} className="supporter">
              <span className="supporter-avatar">{initials(s.name)}</span>
              <div className="supporter-main">
                <p className="supporter-line">
                  <SupporterName name={s.name} /> <SupportAction s={s} />
                </p>
                <p className="supporter-time">{timeAgo(s.createdAt)}</p>
                {(s.message || s.videoUrl) && (
                  <div className="supporter-message">
                    {s.videoUrl && <video className="supporter-video" src={s.videoUrl} controls playsInline preload="metadata" />}
                    {s.message && <p>{s.message}</p>}
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {hasMore && (
        <button type="button" className="pill-btn pill-outline see-more" onClick={onLoadMore} disabled={loadingMore}>
          {loadingMore ? <Spinner small /> : t('common.seeMore')}
        </button>
      )}
      <Link to="/hall-of-fame" className="hof-link">
        <TrophyIcon width={18} height={18} /> {t('supporters.viewHallOfFame')}
      </Link>
    </section>
  );
}
