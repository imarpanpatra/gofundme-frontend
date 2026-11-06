import { api, assetUrl } from './api.js';
import { loadRazorpay } from './razorpay.js';

export const MIN_AMOUNT = 11;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const retryable = (err) => !err?.status || err.status >= 500 || err.status === 429;

async function confirmPayment(order, resp) {
  let lastError;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const { support } = await api('/payments/verify', { method: 'POST', body: resp });
      return support;
    } catch (err) {
      if (!retryable(err)) throw err;
      lastError = err;
      await sleep(1500 * (attempt + 1));
    }
  }
  if (order.supportId) {
    for (let attempt = 0; attempt < 6; attempt += 1) {
      try {
        const d = await api(`/payments/status/${order.supportId}`);
        if (d.status === 'paid' && d.support) return d.support;
      } catch {}
      await sleep(3000);
    }
  }
  return { pending: true, error: lastError?.message || '' };
}

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
          resolve(await confirmPayment(order, resp));
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
