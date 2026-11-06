import { api, assetUrl } from './api.js';
import { loadRazorpay } from './razorpay.js';

export const MIN_AMOUNT = 11;

export async function payWith(order, { creator, description, prefillName, onFailed }) {
  const Razorpay = await loadRazorpay();
  return new Promise((resolve, reject) => {
    const image = creator.avatar ? new URL(assetUrl(creator.avatar), window.location.origin).href : undefined;
    const options = {
      key: order.keyId,
      name: creator.name,
      description,
      image,
      prefill: { name: prefillName || order.prefill?.name, email: order.prefill?.email },
      theme: { color: creator.themeColor },
      handler: async (resp) => {
        try {
          const { support } = await api('/payments/verify', { method: 'POST', body: resp });
          resolve(support);
        } catch (err) {
          reject(err);
        }
      },
      modal: { ondismiss: () => resolve(null) },
    };
    if (order.mode === 'subscription') {
      options.subscription_id = order.subscriptionId;
    } else {
      options.order_id = order.orderId;
      options.amount = order.amount;
      options.currency = order.currency;
    }
    const rzp = new Razorpay(options);
    rzp.on('payment.failed', (resp) => onFailed?.(resp?.error?.description || 'Payment failed. Please try again.'));
    rzp.open();
  });
}
