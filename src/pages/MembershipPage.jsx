import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import CreatorShell from '../components/CreatorShell.jsx';
import Spinner from '../components/Spinner.jsx';
import { CheckIcon, StarIcon } from '../components/icons.jsx';
import { api } from '../lib/api.js';
import { payWith } from '../lib/checkout.js';
import { confetti } from '../lib/confetti.js';
import { formatMoney } from '../lib/format.js';
import { useToast } from '../context/ToastContext.jsx';
import { useI18n } from '../i18n/index.jsx';

function Tiers({ creator, user, reload }) {
  const toast = useToast();
  const { t, tr } = useI18n();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(null);

  const load = useCallback(() => {
    api(`/memberships/${creator.slug}`)
      .then(setData)
      .catch((err) => setError(err.message));
  }, [creator.slug]);

  useEffect(load, [load, user?.id, user?.slug]);

  const join = async (tier) => {
    if (!user) {
      navigate('/signup', {
        state: { from: `/${creator.slug}/membership`, reason: t('membership.needAccount', { name: creator.name, tier: tier.name }) },
      });
      return;
    }
    setBusy(tier.id);
    try {
      const order = await api(`/memberships/${creator.slug}/tiers/${tier.id}/join`, { method: 'POST', body: {} });
      const support = await payWith(order, {
        creator,
        description: `${tier.name} membership`,
        onFailed: (msg) => toast(msg, 'error'),
      });
      if (support?.pending) {
        toast(t('pay.pending'));
        load();
      } else if (support) {
        confetti();
        toast(t('membership.welcome', { tier: tier.name }));
        load();
        reload();
      }
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setBusy(null);
    }
  };

  if (error) return <p className="form-error">{error}</p>;
  if (!data) return <Spinner fullPage />;
  if (!data.enabled || data.tiers.length === 0) {
    return (
      <section className="feature-box center-text">
        <h1 className="posts-title">{t('tabs.membership')}</h1>
        <p className="muted">{t('membership.closed', { name: creator.name })}</p>
      </section>
    );
  }

  const mine = data.membership;
  return (
    <>
      <section className="feature-box membership-hero">
        <h1 className="posts-title">{t('tabs.membership')}</h1>
        <p className="muted">
          {t('membership.intro', { name: creator.name })}
          {data.memberCount > 0 && ` ${t('membership.memberCount', { count: data.memberCount })}`}
        </p>
        {mine && (
          <p className="member-note">
            <StarIcon width={18} height={18} /> {tr('membership.youAre', { tier: <strong>{mine.tierName}</strong> })}
            {mine.cancelRequested ? ` (${t('account.endsAtPeriodEnd')})` : ''}{' '}
            <Link to="/account" className="text-theme">
              {t('membership.manage')}
            </Link>
          </p>
        )}
      </section>
      <div className="tier-grid">
        {data.tiers.map((tier) => {
          const isMine = mine && String(mine.tierId) === String(tier.id);
          return (
            <section key={tier.id} className={`feature-box tier-card${isMine ? ' is-mine' : ''}`}>
              <p className="tier-name">{tier.name}</p>
              <p className="tier-price">
                {formatMoney(tier.price)}
                <span>{t('common.perMonth')}</span>
              </p>
              {tier.description && <p className="tier-desc">{tier.description}</p>}
              {tier.perks.length > 0 && (
                <ul className="tier-perks">
                  {tier.perks.map((p) => (
                    <li key={p}>
                      <CheckIcon width={16} height={16} /> {p}
                    </li>
                  ))}
                </ul>
              )}
              <button
                type="button"
                className="support-btn tier-btn"
                disabled={Boolean(mine) || busy !== null}
                onClick={() => join(tier)}
              >
                {busy === tier.id ? <span className="dot-flashing" /> : isMine ? t('membership.yourTier') : mine ? t('membership.alreadyMember') : t('membership.join')}
              </button>
            </section>
          );
        })}
      </div>
    </>
  );
}

export default function MembershipPage() {
  return (
    <CreatorShell tab="membership" wide>
      {({ creator, user, reload }) => <Tiers creator={creator} user={user} reload={reload} />}
    </CreatorShell>
  );
}
