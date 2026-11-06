import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CreatorShell from '../components/CreatorShell.jsx';
import Modal from '../components/Modal.jsx';
import Spinner from '../components/Spinner.jsx';
import ThankYouModal from '../components/ThankYouModal.jsx';
import { Checkbox } from '../components/SupportWidget.jsx';
import { CheckIcon, MapIcon, PinIcon } from '../components/icons.jsx';
import { api } from '../lib/api.js';
import { MIN_AMOUNT, payWith } from '../lib/checkout.js';
import { formatMoney, themeVars } from '../lib/format.js';
import useSeo from '../seo/useSeo.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { useI18n } from '../i18n/index.jsx';

const DRAFT_KEY = 'gfm_sponsor_draft';

function peekDraft(slug) {
  try {
    const raw = sessionStorage.getItem(DRAFT_KEY);
    const d = raw ? JSON.parse(raw) : null;
    return d?.slug === slug ? d : null;
  } catch {
    return null;
  }
}

function clearDraft() {
  try {
    sessionStorage.removeItem(DRAFT_KEY);
  } catch {}
}

function saveDraft(draft) {
  try {
    sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  } catch {}
}

const remainingOf = (m) => Math.max(0, Math.ceil(m.cost - m.raised));

function SponsorModal({ creator, moment, draft, onClose, onDone, onRefresh }) {
  const { t } = useI18n();
  const toast = useToast();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const remaining = remainingOf(moment);
  const minPay = Math.min(MIN_AMOUNT, remaining);
  const [amount, setAmount] = useState(String(draft?.amount ?? remaining));
  const [name, setName] = useState(draft?.name ?? user?.name ?? '');
  const [message, setMessage] = useState(draft?.message ?? '');
  const [isPrivate, setIsPrivate] = useState(Boolean(draft?.isPrivate));
  const [busy, setBusy] = useState(false);

  const chips = [...new Set([remaining, Math.ceil(remaining / 2), 500, 1000].filter((n) => n >= minPay && n <= remaining))]
    .sort((a, b) => b - a)
    .slice(0, 3);
  const value = Number(amount);
  const valid = value <= remaining && (value >= MIN_AMOUNT || (remaining < MIN_AMOUNT && value === remaining));

  const goToAuth = (path, reason) => {
    saveDraft({ slug: creator.slug, momentId: moment.id, amount, name, message, isPrivate });
    navigate(path, { state: { from: `/${creator.slug}/itinerary`, reason } });
  };

  const submit = async (e) => {
    e.preventDefault();
    if (value > remaining) {
      toast(t('sponsor.onlyLeft', { amount: formatMoney(remaining, creator.currency) }), 'error');
      return;
    }
    if (!valid) {
      toast(t('support.minAmount', { amount: formatMoney(MIN_AMOUNT) }), 'error');
      return;
    }
    if (!user) {
      goToAuth('/signup', t('sponsor.needAccount', { title: moment.title }));
      return;
    }
    setBusy(true);
    try {
      const order = await api('/payments/order', {
        method: 'POST',
        body: { slug: creator.slug, amount: value, name, message, isPrivate, momentId: moment.id },
      });
      const support = await payWith(order, {
        creator,
        description: moment.title,
        prefillName: name && !name.startsWith('@') ? name : '',
        onFailed: (msg) => toast(msg, 'error'),
      });
      if (support?.pending) {
        toast(t('pay.pending'));
        onClose();
        onRefresh?.();
      } else if (support) onDone(support);
      else setBusy(false);
    } catch (err) {
      setBusy(false);
      if (err.status === 401) {
        logout();
        goToAuth('/login', t('support.sessionExpired'));
        return;
      }
      toast(err.message, 'error');
      if (err.status === 409 || err.status === 400) onRefresh?.();
    }
  };

  return (
    <Modal title={t('sponsor.title')} onClose={onClose} width={480} style={themeVars(creator.themeColor)}>
      <form className="sponsor-form" onSubmit={submit}>
        <div className="sponsor-moment">
          {moment.image && <img src={moment.image} alt="" />}
          <div>
            <p className="sponsor-moment-day">{t('itinerary.day', { day: moment.day })}</p>
            <p className="sponsor-moment-title">{moment.title}</p>
            <p className="muted">{t('itinerary.needed', { amount: formatMoney(remaining, creator.currency) })}</p>
          </div>
        </div>
        <div className="amount-field sponsor-amount">
          <span className="amount-symbol" aria-hidden="true">
            ₹
          </span>
          <input
            className="input-box amount-input"
            type="number"
            inputMode="decimal"
            min={minPay}
            step="any"
            placeholder={t('support.amountPlaceholder')}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            onWheel={(e) => e.currentTarget.blur()}
            aria-label={t('support.amountPlaceholder')}
          />
        </div>
        {chips.length > 0 && (
          <div className="sponsor-chips">
            {chips.map((n) => (
              <button key={n} type="button" className={`chip${value === n ? ' chip-on' : ''}`} onClick={() => setAmount(String(n))}>
                {formatMoney(n, creator.currency)}
              </button>
            ))}
          </div>
        )}
        <input
          className="input-box input-sm"
          placeholder={t('support.namePlaceholder')}
          maxLength={60}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <textarea
          className="input-box input-sm"
          rows={3}
          maxLength={1000}
          placeholder={t('support.messagePlaceholder')}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <Checkbox id="sponsor-private" checked={isPrivate} onChange={setIsPrivate}>
          {t('support.private')}
        </Checkbox>
        <button type="submit" className="support-btn" disabled={busy}>
          {busy ? <span className="dot-flashing" /> : t('sponsor.button', { amount: valid ? formatMoney(value, creator.currency) : '' }).trim()}
        </button>
        {!user && <p className="support-account-note">{t('support.accountNote')}</p>}
      </form>
    </Modal>
  );
}

function MomentCard({ moment, currency, onSponsor }) {
  const { t, tr } = useI18n();
  const sponsorable = moment.cost > 0;
  const pct = sponsorable ? Math.min(100, (moment.raised / moment.cost) * 100) : 0;
  const funded = sponsorable && moment.raised >= moment.cost;
  return (
    <article className={`feature-box moment-card${funded ? ' is-funded' : ''}`}>
      {moment.image && <img className="moment-img" src={moment.image} alt="" loading="lazy" />}
      <div className="moment-body">
        <h3 className="moment-title">{moment.title}</h3>
        {moment.place && (
          <p className="moment-place">
            <PinIcon width={16} height={16} /> {moment.place}
          </p>
        )}
        {moment.description && <p className="moment-desc">{moment.description}</p>}
        {sponsorable && (
          <div className="moment-fund">
            <p className="goal-amounts">
              {tr('itinerary.raisedOf', {
                raised: <strong>{formatMoney(Math.floor(moment.raised), currency)}</strong>,
                cost: formatMoney(moment.cost, currency),
              })}
            </p>
            <div className="goal-bar" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.floor(pct)}>
              <span style={{ width: moment.raised > 0 ? `max(${pct}%, 8px)` : 0 }} />
            </div>
            <div className="moment-foot">
              <span className="muted">{t('itinerary.sponsors', { count: moment.sponsors })}</span>
              {funded ? (
                <span className="moment-funded">
                  <CheckIcon width={16} height={16} /> {t('itinerary.funded')}
                </span>
              ) : (
                <button type="button" className="pill-btn pill-theme pill-sm" onClick={() => onSponsor(moment)}>
                  {t('itinerary.sponsor')}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </article>
  );
}

function Itinerary({ creator }) {
  const { t } = useI18n();
  const [items, setItems] = useState(null);
  const [error, setError] = useState('');
  const [sponsoring, setSponsoring] = useState(null);
  const [thanks, setThanks] = useState(null);
  const [draft, setDraft] = useState(() => peekDraft(creator.slug));
  useSeo('itinerary', { creator, items }, Boolean(items));

  const load = useCallback(() => {
    api(`/pages/${creator.slug}/itinerary`)
      .then((d) => setItems(d.items))
      .catch((err) => setError(err.message));
  }, [creator.slug]);

  useEffect(load, [load]);

  useEffect(() => {
    if (!items || !draft) return;
    const m = items.find((i) => String(i.id) === String(draft.momentId));
    if (m && remainingOf(m) > 0) setSponsoring({ moment: m, draft });
    clearDraft();
    setDraft(null);
  }, [items, draft]);

  const days = useMemo(() => {
    const map = new Map();
    for (const m of items || []) {
      if (!map.has(m.day)) map.set(m.day, []);
      map.get(m.day).push(m);
    }
    return [...map.entries()];
  }, [items]);

  return (
    <>
      <section className="feature-box itinerary-hero">
        <span className="itinerary-hero-icon">
          <MapIcon width={26} height={26} />
        </span>
        <h1 className="posts-title">{t('tabs.itinerary')}</h1>
        <p className="muted">{t('itinerary.intro')}</p>
      </section>

      {error && <p className="form-error">{error}</p>}
      {!items && !error && <Spinner />}
      {items && items.length === 0 && (
        <section className="feature-box center-text">
          <p className="muted">{t('itinerary.empty')}</p>
        </section>
      )}

      {days.length > 0 && (
        <ol className="itinerary">
          {days.map(([day, moments]) => (
            <li key={day} className="itinerary-day">
              <div className="itinerary-marker">
                <span>{t('itinerary.day', { day })}</span>
              </div>
              <div className="itinerary-moments">
                {moments.map((m) => (
                  <MomentCard key={m.id} moment={m} currency={creator.currency} onSponsor={(moment) => setSponsoring({ moment })} />
                ))}
              </div>
            </li>
          ))}
        </ol>
      )}

      {sponsoring && (
        <SponsorModal
          creator={creator}
          moment={sponsoring.moment}
          draft={sponsoring.draft}
          onClose={() => setSponsoring(null)}
          onRefresh={load}
          onDone={(support) => {
            setSponsoring(null);
            setThanks(support);
            load();
          }}
        />
      )}
      {thanks && <ThankYouModal creator={creator} support={thanks} onClose={() => setThanks(null)} />}
    </>
  );
}

export default function ItineraryPage() {
  return (
    <CreatorShell tab="itinerary" seo={false}>
      {({ creator }) => <Itinerary creator={creator} />}
    </CreatorShell>
  );
}
