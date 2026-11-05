import { LockIcon } from '../icons.jsx';
import { formatMoney, initials, timeAgo } from '../../lib/format.js';

const TYPE_LABEL = { tip: 'Support', membership: 'Membership', shop: 'Shop' };

export default function TransactionList({ items }) {
  return (
    <ul className="dash-list">
      {items.map((t) => (
        <li key={t.id} className="dash-row">
          <span className="supporter-avatar">{initials(t.name)}</span>
          <div className="dash-row-main">
            <p>
              <strong>{t.name}</strong>
              <span className={`badge badge-${t.type}`}>{TYPE_LABEL[t.type] || 'Support'}</span>
              {t.type === 'membership' && t.tierName && <span className="muted"> · {t.tierName}</span>}
              {t.type === 'shop' && t.productTitle && <span className="muted"> · {t.productTitle}</span>}
              {t.type === 'tip' && t.monthly && <span className="badge">Monthly{t.subscriptionStatus ? ` · ${t.subscriptionStatus}` : ''}</span>}
            </p>
            {t.email && (
              <p className="dash-email">
                <a href={`mailto:${t.email}`}>{t.email}</a>
              </p>
            )}
            {t.videoUrl && <video className="dash-video" src={t.videoUrl} controls playsInline preload="metadata" />}
            {t.message && (
              <p className="dash-message">
                {t.isPrivate && <LockIcon width={13} height={13} />}
                {t.message}
              </p>
            )}
            {t.buyerAnswer && (
              <p className="dash-message">
                <span className="muted">Buyer answer:</span> {t.buyerAnswer}
              </p>
            )}
            <p className="supporter-time">
              {timeAgo(t.createdAt)}
              {t.paymentId && ` · ${t.paymentId}`}
            </p>
          </div>
          <span className="dash-amount">{formatMoney(t.amount, t.currency)}</span>
        </li>
      ))}
    </ul>
  );
}
