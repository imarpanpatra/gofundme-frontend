import { assetUrl } from '../lib/api.js';
import Modal from './Modal.jsx';
import { formatMoney, mentionOf, themeVars } from '../lib/format.js';
import { HeartIcon } from './icons.jsx';
import { useI18n } from '../i18n/index.jsx';

export default function ThankYouModal({ creator, support, onClose }) {
  const { t } = useI18n();
  return (
    <Modal title={t('thanks.title')} onClose={onClose} width={440} style={themeVars(creator.themeColor)}>
      <div className="thanks">
        <div className="thanks-avatar-wrap">
          {creator.avatar && <img src={assetUrl(creator.avatar)} alt="" className="thanks-avatar" />}
          <span className="thanks-heart">
            <HeartIcon width={16} height={16} fill="currentColor" />
          </span>
        </div>
        <h3>{t('thanks.heading', { name: mentionOf(creator) })}</h3>
        <p className="thanks-amount">
          {formatMoney(support.amount, support.currency)}
          {support.monthly && <span>{t('common.perMonth')}</span>}
        </p>
        <p className="muted">{support.monthly ? t('thanks.monthlyReceipt') : t('thanks.receipt')}</p>
        <button type="button" className="support-btn" onClick={onClose}>
          {t('common.done')}
        </button>
      </div>
    </Modal>
  );
}
