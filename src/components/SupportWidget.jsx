import { forwardRef, useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../lib/api.js';
import { payWith } from '../lib/checkout.js';
import VideoRecorder from './VideoRecorder.jsx';
import { currencySymbol, formatNumber } from '../lib/format.js';
import { useToast } from '../context/ToastContext.jsx';
import { CloseIcon, InfoIcon, VideoIcon } from './icons.jsx';

function Checkbox({ id, checked, onChange, children }) {
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

function takeDraft(slug) {
  try {
    const raw = sessionStorage.getItem(draftKey(slug));
    sessionStorage.removeItem(draftKey(slug));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveDraft(slug, draft) {
  try {
    sessionStorage.setItem(draftKey(slug), JSON.stringify(draft));
  } catch {}
}

const SupportWidget = forwardRef(function SupportWidget({ creator, onSupported }, ref) {
  const toast = useToast();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [draft] = useState(() => takeDraft(creator.slug));
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
    if (!hasAmount || value < 1) {
      toast(`Enter an amount of at least ${symbol}1`, 'error');
      return;
    }
    if (!user) {
      goToAuth('/signup', `Create a free account to support ${creator.name}. Your amount and message are saved.`);
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
        onSupported?.(support);
      }
    } catch (err) {
      if (err.status === 401) {
        logout();
        goToAuth('/login', 'Your session expired. Log in again to finish your support. Your amount and message are saved.');
        return;
      }
      toast(err.message, 'error');
    } finally {
      setBusy(false);
    }
  };

  const openRecorder = () => {
    if (!user) {
      goToAuth('/signup', `Create a free account to send ${creator.name} a video message. Your amount and message are saved.`);
      return;
    }
    setRecording(true);
  };

  return (
    <section className="feature-box support-box" aria-label={`Support ${creator.name}`} ref={ref} id="support">
      <h1 className="support-title">Support {creator.name}</h1>

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
            min="1"
            step="any"
            placeholder="Enter amount"
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
            placeholder="Name or @yoursocial"
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
          <div className={`name-hint${nameFocused ? ' show' : ''}`}>Using @username will link to your social profile</div>
        </div>

        <div className="message-field">
          <textarea
            placeholder="Say something nice..."
            maxLength={1000}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          {videoUrl ? (
            <div className="video-attached">
              <video src={videoUrl} muted playsInline preload="metadata" />
              <span>Video message attached</span>
              <button type="button" className="icon-btn" onClick={() => setVideoUrl('')} aria-label="Remove video message">
                <CloseIcon width={16} height={16} />
              </button>
            </div>
          ) : (
            <button type="button" className="video-toggle" onClick={openRecorder} aria-label="Add a video message">
              <VideoIcon width={18} height={18} />
              <span className="video-toggle-text">Add a video message</span>
            </button>
          )}
        </div>

        <div className={`private-row${message.trim() ? ' show' : ''}`} aria-hidden={!message.trim()}>
          <Checkbox id="makeMsgPrivate" checked={isPrivate} onChange={setIsPrivate}>
            Make this message private
          </Checkbox>
          <Tip text="The message will be visible to you and the creator only" />
        </div>

        {creator.recurringEnabled && (
          <div className="monthly-row">
            <Checkbox id="doMonthlySupport" checked={monthly} onChange={setMonthly}>
              Make this monthly
            </Checkbox>
            <Tip wide text={`Support monthly and be a part of ${creator.name}'s creative journey. Cancel anytime.`} />
          </div>
        )}

        <button type="submit" className="support-btn" disabled={busy} aria-busy={busy}>
          {busy ? (
            <span className="dot-flashing" aria-label="Processing" />
          ) : (
            <>
              {creator.supportButtonText}
              {hasAmount && ` ${symbol}${formatNumber(monthly ? Math.round(value) : value)}`}
              {monthly && <span className="per-month">/month</span>}
            </>
          )}
        </button>
        {!user && (
          <p className="support-account-note">
            You'll need a free account to support.{' '}
            <Link to="/login" state={{ from: `/${creator.slug}` }} onClick={() => saveDraft(creator.slug, { amount, name, message, isPrivate, monthly })}>
              Log in
            </Link>
          </p>
        )}
        <p className="support-legal">
          By supporting, you agree to the <Link to="/terms">Terms</Link>, <Link to="/privacy">Privacy Policy</Link> and{' '}
          <Link to="/refund-policy">Refund Policy</Link>.
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
