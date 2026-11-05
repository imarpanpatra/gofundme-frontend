const SRC = 'https://checkout.razorpay.com/v1/checkout.js';
let loading;

export function loadRazorpay() {
  if (window.Razorpay) return Promise.resolve(window.Razorpay);
  if (!loading) {
    loading = new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = SRC;
      s.async = true;
      s.onload = () => resolve(window.Razorpay);
      s.onerror = () => {
        loading = null;
        reject(new Error('Could not load Razorpay. Check your connection and try again.'));
      };
      document.body.appendChild(s);
    });
  }
  return loading;
}
