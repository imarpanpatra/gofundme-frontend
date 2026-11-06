const SYMBOLS = { INR: '₹' };

const LOCALES = { en: 'en-US', hi: 'hi-IN', mr: 'mr-IN' };
let lang = 'en';

export function setFormatLang(next) {
  lang = next;
}

export const brandName = (creator) => creator?.siteName || creator?.name || '';

export const mentionOf = (creator) => creator?.mention || creator?.name || '';

export const currencySymbol = (c) => SYMBOLS[c] || `${c} `;

export const formatNumber = (n) =>
  Number(n).toLocaleString('en-IN', { maximumFractionDigits: 2 });

export const formatMoney = (n, currency = 'INR') => `${currencySymbol(currency)}${formatNumber(n)}`;

export const shortDate = (d) =>
  d
    ? new Date(d).toLocaleDateString(LOCALES[lang] || LOCALES.en, { month: 'short', day: '2-digit', year: 'numeric' })
    : '';

export function timeAgo(date) {
  const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  const rtf = new Intl.RelativeTimeFormat(lang === 'en' ? 'en' : LOCALES[lang] || 'en', { numeric: 'auto' });
  if (s < 60) return rtf.format(0, 'second');
  const units = [
    ['year', 31536000],
    ['month', 2592000],
    ['week', 604800],
    ['day', 86400],
    ['hour', 3600],
    ['minute', 60],
  ];
  for (const [name, secs] of units) {
    const v = Math.floor(s / secs);
    if (v >= 1) return rtf.format(-v, name);
  }
  return rtf.format(0, 'second');
}

export function hexToRgba(hex, alpha) {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex || '');
  if (!m) return `rgba(95,127,255,${alpha})`;
  const n = parseInt(m[1], 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${alpha})`;
}

export function darken(hex, amount = 0.15) {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex || '');
  if (!m) return '#3b62ff';
  const n = parseInt(m[1], 16);
  const ch = (v) => Math.max(0, Math.round(v * (1 - amount))).toString(16).padStart(2, '0');
  return `#${ch((n >> 16) & 255)}${ch((n >> 8) & 255)}${ch(n & 255)}`;
}

export function themeVars(color) {
  return {
    '--theme': color,
    '--theme-hover': darken(color),
    '--theme-1': hexToRgba(color, 0.1),
    '--theme-25': hexToRgba(color, 0.25),
  };
}

export function initials(name) {
  const clean = String(name || '').replace(/^@/, '').trim();
  return (clean[0] || 'S').toUpperCase();
}

export function socialHandleUrl(name) {
  const m = /^@([A-Za-z0-9_]{1,30})$/.exec(String(name || '').trim());
  return m ? `https://x.com/${m[1]}` : null;
}

export function hostOf(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}
