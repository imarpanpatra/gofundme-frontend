import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import CreatorShell from '../components/CreatorShell.jsx';
import Spinner from '../components/Spinner.jsx';
import { CheckIcon, StarIcon } from '../components/icons.jsx';
import { api } from '../lib/api.js';
import { payWith } from '../lib/checkout.js';
import { formatMoney } from '../lib/format.js';
import { useToast } from '../context/ToastContext.jsx';

function Tiers({ creator, user, reload }) {
  const toast = useToast();
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
        state: { from: `/${creator.slug}/membership`, reason: `Create a free account to join ${creator.name}'s ${tier.name} membership.` },
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
      if (support) {
        toast(`Welcome to ${tier.name}! 🎉`);
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
        <h1 className="posts-title">Membership</h1>
        <p className="muted">{creator.name} hasn't opened memberships yet.</p>
      </section>
    );
  }

  const mine = data.membership;
  return (
    <>
      <section className="feature-box membership-hero">
        <h1 className="posts-title">Membership</h1>
        <p className="muted">
          Join {creator.name}'s inner circle with a monthly membership. Cancel anytime.
          {data.memberCount > 0 && ` ${data.memberCount} ${data.memberCount === 1 ? 'member' : 'members'} so far.`}
        </p>
        {mine && (
          <p className="member-note">
            <StarIcon width={18} height={18} /> You're a <strong>{mine.tierName}</strong> member
            {mine.cancelRequested ? ' (ends at the end of this billing period)' : ''}.{' '}
            <Link to="/account" className="text-theme">
              Manage
            </Link>
          </p>
        )}
      </section>
      <div className="tier-grid">
        {data.tiers.map((t) => {
          const isMine = mine && String(mine.tierId) === String(t.id);
          return (
            <section key={t.id} className={`feature-box tier-card${isMine ? ' is-mine' : ''}`}>
              <p className="tier-name">{t.name}</p>
              <p className="tier-price">
                {formatMoney(t.price)}
                <span>/month</span>
              </p>
              {t.description && <p className="tier-desc">{t.description}</p>}
              {t.perks.length > 0 && (
                <ul className="tier-perks">
                  {t.perks.map((p) => (
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
                onClick={() => join(t)}
              >
                {busy === t.id ? <span className="dot-flashing" /> : isMine ? 'Your tier' : mine ? 'Already a member' : 'Join'}
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
    <CreatorShell tab="membership" title="Membership" wide>
      {({ creator, user, reload }) => <Tiers creator={creator} user={user} reload={reload} />}
    </CreatorShell>
  );
}
