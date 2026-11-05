import { assetUrl } from '../lib/api.js';
import Modal from './Modal.jsx';
import { formatMoney, themeVars } from '../lib/format.js';
import { HeartIcon } from './icons.jsx';

export default function ThankYouModal({ creator, support, onClose }) {
  return (
    <Modal title="Payment successful" onClose={onClose} width={440} style={themeVars(creator.themeColor)}>
      <div className="thanks">
        <div className="thanks-avatar-wrap">
          {creator.avatar && <img src={assetUrl(creator.avatar)} alt="" className="thanks-avatar" />}
          <span className="thanks-heart">
            <HeartIcon width={16} height={16} fill="currentColor" />
          </span>
        </div>
        <h3>Thank you for supporting {creator.name}!</h3>
        <p className="thanks-amount">
          {formatMoney(support.amount, support.currency)}
          {support.monthly && <span>/month</span>}
        </p>
        <p className="muted">
          {support.monthly
            ? 'Your monthly support is active. Razorpay will email you a receipt for every charge.'
            : 'Razorpay will email you a receipt for this payment.'}
        </p>
        <button type="button" className="support-btn" onClick={onClose}>
          Done
        </button>
      </div>
    </Modal>
  );
}
