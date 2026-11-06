import { forwardRef, useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../lib/api.js';
import { MIN_AMOUNT, payWith } from '../lib/checkout.js';
import VideoRecorder from './VideoRecorder.jsx';
import { currencySymbol, formatNumber, mentionOf } from '../lib/format.js';
import { useToast } from '../context/ToastContext.jsx';
import { CloseIcon, InfoIcon, VideoIcon } from './icons.jsx';
import { useI18n } from '../i18n/index.jsx';

export function Checkbox({ id, checked, onChange, children }) {
  return (
    <label className="checkbox" htmlFor={id}>
      <input id={id} type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className="checkmark" aria-hidden="true" />
      <span className="checkbox-label">{children}</span>
    </label>
  );
}

function Tip({ text, wide }) {
  return (
    <span className="tip" tabIndex={0} role="button" aria-label={text}>
      <InfoIcon width={16} height={16} />
      <span className={`tip-box${wide ? ' tip-wide' : ''}`} role="tooltip">
        {text}
      </span>
    </span>
  );
}

const draftKey = (slug) => `gfm_support_draft:${slug}`;

function peekDraft(slug) {
  try {
    const raw = sessionStorage.getItem(draftKey(slug));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function clearDraft(slug) {
  try {
    sessionStorage.removeItem(draftKey(slug));
  } catch {}
}

function saveDraft(slug, draft) {
  try {
    sessionStorage.setItem(draftKey(slug), JSON.stringify(draft));
  } catch {}
}

const SupportWidget = forwardRef(function SupportWidget({ creator, onSupported }, ref) {
  const toast = useToast();
  const { t, tr } = useI18n();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [draft] = useState(() => peekDraft(creator.slug));
  useEffect(() => {
    if (draft) clearDraft(creator.slug);
  }, [draft, creator.slug]);
  const [amount, setAmount] = useState(draft?.amount ?? '');
  const [name, setName] = useState(draft?.name || user?.name || '');
  const [message, setMessage] = useState(draft?.message ?? '');
  const [isPrivate, setIsPrivate] = useState(Boolean(draft?.isPrivate));
  const [monthly, setMonthly] = useState(Boolean(draft?.monthly));
  const [busy, setBusy] = useState(false);
  const [nameFocused, setNameFocused] = useState(false);
  const nameTouched = useRef(Boolean(draft?.name));
  const [videoUrl, setVideoUrl] = useState('');
  const [recording, setRecording] = useState(false);

  useEffect(() => {
    if (user?.name && !nameTouched.current) setName(user.name);
  }, [user?.name]);

  const goToAuth = (path, reason) => {
    saveDraft(creator.slug, { amount, name, message, isPrivate, monthly });
    navigate(path, { state: { from: `/${creator.slug}`, reason } });
  };

  const symbol = currencySymbol(creator.currency);
  const value = Number(amount);
  const hasAmount = amount !== '' && value > 0;

  const addAmount = (n) => {
    setAmount((a) => String(Math.round(((Number(a) || 0) + n) * 100) / 100));
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!hasAmount || value < MIN_AMOUNT) {
      toast(t('support.minAmount', { amount: `${symbol}${MIN_AMOUNT}` }), 'error');
      return;
    }
    if (!user) {
      goToAuth('/signup', t('support.needAccount', { name: mentionOf(creator) }));
      return;
    }
    setBusy(true);
    try {
      const order = await api('/payments/order', {
        method: 'POST',
        body: { slug: creator.slug, amount: value, name, message, isPrivate, monthly, videoUrl },
      });
      const support = await payWith(order, {
        creator,
        description: order.mode === 'subscription' ? 'Monthly support' : `Support ${creator.name}`,
        prefillName: name && !name.startsWith('@') ? name : '',
        onFailed: (msg) => toast(msg, 'error'),
      });
      if (support) {
        setAmount('');
        setMessage('');
        setIsPrivate(false);
        setMonthly(false);
        setVideoUrl('');
        if (support.pending) toast(t('pay.pending'));
        else onSupported?.(support);
      }
    } catch (err) {
      if (err.status === 401) {
        logout();
        goToAuth('/login', t('support.sessionExpired'));
        return;
      }
      toast(err.message, 'error');
    } finally {
      setBusy(false);
    }
  };

  const openRecorder = () => {
    if (!user) {
      goToAuth('/signup', t('support.needAccountVideo', { name: creator.name }));
      return;
    }
    setRecording(true);
  };

  return (
    <section className="feature-box support-box" aria-label={t('support.title', { name: mentionOf(creator) })} ref={ref} id="support">
      <h1 className="support-title">{t('support.title', { name: mentionOf(creator) })}</h1>

      <form onSubmit={submit} noValidate>
        <div className="amount-field">
          <span className="amount-symbol" aria-label={creator.currency}>
            {symbol}
          </span>
          <input
            id="paymentAmount"
            className="input-box amount-input"
            type="number"
            inputMode="decimal"
            min={MIN_AMOUNT}
            step="any"
            placeholder={t('support.amountPlaceholder')}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            onWheel={(e) => e.currentTarget.blur()}
          />
          <div className="amount-chips">
            {creator.suggestedAmounts.map((n) => (
              <button type="button" key={n} className="chip" onClick={() => addAmount(n)}>
                +{formatNumber(n)}
              </button>
            ))}
          </div>
        </div>

        <div className="name-field">
          <input
            className="input-box input-sm"
            type="text"
            placeholder={t('support.namePlaceholder')}
            autoComplete="name"
            maxLength={60}
            value={name}
            onChange={(e) => {
              nameTouched.current = true;
              setName(e.target.value);
            }}
            onFocus={() => setNameFocused(true)}
            onBlur={() => setNameFocused(false)}
          />
          <div className={`name-hint${nameFocused ? ' show' : ''}`}>{t('support.nameHint')}</div>
        </div>

        <div className="message-field">
          <textarea
            placeholder={t('support.messagePlaceholder')}
            maxLength={1000}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          {videoUrl ? (
            <div className="video-attached">
              <video src={videoUrl} muted playsInline preload="metadata" />
              <span>{t('support.videoAttached')}</span>
              <button type="button" className="icon-btn" onClick={() => setVideoUrl('')} aria-label={t('support.removeVideo')}>
                <CloseIcon width={16} height={16} />
              </button>
            </div>
          ) : (
            <button type="button" className="video-toggle" onClick={openRecorder} aria-label={t('support.addVideo')}>
              <VideoIcon width={18} height={18} />
              <span className="video-toggle-text">{t('support.addVideo')}</span>
            </button>
          )}
        </div>

        <div className={`private-row${message.trim() ? ' show' : ''}`} aria-hidden={!message.trim()}>
          <Checkbox id="makeMsgPrivate" checked={isPrivate} onChange={setIsPrivate}>
            {t('support.private')}
          </Checkbox>
          <Tip text={t('support.privateTip')} />
        </div>

        {creator.recurringEnabled && (
          <div className="monthly-row">
            <Checkbox id="doMonthlySupport" checked={monthly} onChange={setMonthly}>
              {t('support.monthly')}
            </Checkbox>
            <Tip wide text={t('support.monthlyTip', { name: creator.name })} />
          </div>
        )}

        <button type="submit" className="support-btn" disabled={busy} aria-busy={busy}>
          {busy ? (
            <span className="dot-flashing" aria-label={t('common.processing')} />
          ) : (
            <>
              {creator.supportButtonText === 'Support' ? t('support.button') : creator.supportButtonText}
              {hasAmount && ` ${symbol}${formatNumber(monthly ? Math.round(value) : value)}`}
              {monthly && <span className="per-month">{t('common.perMonth')}</span>}
            </>
          )}
        </button>
        {!user && (
          <p className="support-account-note">
            {t('support.accountNote')}{' '}
            <Link to="/login" state={{ from: `/${creator.slug}` }} onClick={() => saveDraft(creator.slug, { amount, name, message, isPrivate, monthly })}>
              {t('header.login')}
            </Link>
          </p>
        )}
        <p className="support-legal">
          {tr('support.legal', {
            terms: (s) => <Link to="/terms">{s}</Link>,
            privacy: (s) => <Link to="/privacy">{s}</Link>,
            refund: (s) => <Link to="/refund-policy">{s}</Link>,
          })}
        </p>
      </form>
      {recording && (
        <VideoRecorder
          onClose={() => setRecording(false)}
          onDone={(url) => {
            setVideoUrl(url);
            setRecording(false);
          }}
        />
      )}
    </section>
  );
});

export default SupportWidget;
