import { forwardRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, assetUrl } from '../lib/api.js';
import { loadRazorpay } from '../lib/razorpay.js';
import { currencySymbol, formatNumber } from '../lib/format.js';
import { useToast } from '../context/ToastContext.jsx';
import { InfoIcon, VideoIcon } from './icons.jsx';

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

const SupportWidget = forwardRef(function SupportWidget({ creator, defaultName = '', onSupported }, ref) {
  const toast = useToast();
  const [amount, setAmount] = useState('');
  const [name, setName] = useState(defaultName);
  const [message, setMessage] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [monthly, setMonthly] = useState(false);
  const [busy, setBusy] = useState(false);
  const [nameFocused, setNameFocused] = useState(false);

  const symbol = currencySymbol(creator.currency);
  const value = Number(amount);
  const hasAmount = amount !== '' && value > 0;

  const addAmount = (n) => {
    setAmount((a) => String(Math.round(((Number(a) || 0) + n) * 100) / 100));
  };

  const finish = async (payload) => {
    try {
      const { support } = await api('/payments/verify', { method: 'POST', body: payload });
      setAmount('');
      setMessage('');
      setIsPrivate(false);
      setMonthly(false);
      onSupported?.(support);
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setBusy(false);
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!hasAmount || value < 1) {
      toast(`Enter an amount of at least ${symbol}1`, 'error');
      return;
    }
    setBusy(true);
    try {
      const [Razorpay, order] = await Promise.all([
        loadRazorpay(),
        api('/payments/order', {
          method: 'POST',
          body: { slug: creator.slug, amount: value, name, message, isPrivate, monthly },
        }),
      ]);

      const image = creator.avatar ? new URL(assetUrl(creator.avatar), window.location.origin).href : undefined;
      const options = {
        key: order.keyId,
        name: creator.name,
        description: order.mode === 'subscription' ? 'Monthly support' : `Support ${creator.name}`,
        image,
        prefill: name && !name.startsWith('@') ? { name } : {},
        notes: { supporter: name },
        theme: { color: creator.themeColor },
        handler: (resp) => finish(resp),
        modal: { ondismiss: () => setBusy(false) },
      };
      if (order.mode === 'subscription') {
        options.subscription_id = order.subscriptionId;
      } else {
        options.order_id = order.orderId;
        options.amount = order.amount;
        options.currency = order.currency;
      }

      const rzp = new Razorpay(options);
      rzp.on('payment.failed', (resp) => {
        toast(resp?.error?.description || 'Payment failed. Please try again.', 'error');
      });
      rzp.open();
    } catch (err) {
      toast(err.message, 'error');
      setBusy(false);
    }
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
            onChange={(e) => setName(e.target.value)}
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
          <button
            type="button"
            className="video-toggle"
            onClick={() => toast('Video messages are not available yet')}
            aria-label="Add a video message"
          >
            <VideoIcon width={18} height={18} />
            <span className="video-toggle-text">Add a video message</span>
          </button>
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
        <p className="support-legal">
          By supporting, you agree to the <Link to="/terms">Terms</Link>, <Link to="/privacy">Privacy Policy</Link> and{' '}
          <Link to="/refund-policy">Refund Policy</Link>.
        </p>
      </form>
    </section>
  );
});

export default SupportWidget;
