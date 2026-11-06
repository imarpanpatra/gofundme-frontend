import { createContext, Fragment, isValidElement, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import en from './en.js';
import hi from './hi.js';
import mr from './mr.js';
import { setFormatLang } from '../lib/format.js';
import Dropdown, { DropdownItem } from '../components/Dropdown.jsx';
import { CheckIcon, GlobeIcon } from '../components/icons.jsx';

const MESSAGES = { en, hi, mr };
const STORAGE_KEY = 'gfm_lang';

export const LANGUAGES = [
  ['en', 'English'],
  ['hi', 'हिन्दी'],
  ['mr', 'मराठी'],
];

export const LOCALES = { en: 'en-IN', hi: 'hi-IN', mr: 'mr-IN' };

function initialLang() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (MESSAGES[saved]) return saved;
  } catch {}
  const nav = navigator.language?.toLowerCase().slice(0, 2);
  return MESSAGES[nav] ? nav : 'en';
}

function lookup(lang, key, vars) {
  const table = MESSAGES[lang];
  if (vars && typeof vars.count === 'number') {
    const form = vars.count === 1 ? 'one' : 'other';
    const hit = table[`${key}_${form}`] ?? en[`${key}_${form}`];
    if (hit !== undefined) return hit;
  }
  return table[key] ?? en[key] ?? key;
}

function fill(str, vars) {
  return vars ? str.replace(/\{(\w+)\}/g, (m, k) => (vars[k] != null ? String(vars[k]) : m)) : str;
}

function rich(str, vars = {}) {
  const parts = [];
  const re = /<(\w+)>(.*?)<\/\1>|\{(\w+)\}/g;
  let last = 0;
  let m;
  while ((m = re.exec(str))) {
    if (m.index > last) parts.push(str.slice(last, m.index));
    if (m[1]) {
      const render = vars[m[1]];
      parts.push(typeof render === 'function' ? render(m[2]) : m[2]);
    } else {
      const v = vars[m[3]];
      parts.push(v ?? m[0]);
    }
    last = re.lastIndex;
  }
  if (last < str.length) parts.push(str.slice(last));
  return parts.map((p, i) => (isValidElement(p) ? <Fragment key={i}>{p}</Fragment> : p));
}

const I18nContext = createContext(null);

export function I18nProvider({ children }) {
  const [lang, setLangState] = useState(initialLang);
  setFormatLang(lang);

  useEffect(() => {
    document.documentElement.lang = lang;
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {}
  }, [lang]);

  const t = useCallback((key, vars) => fill(lookup(lang, key, vars), vars), [lang]);
  const tr = useCallback((key, vars) => rich(lookup(lang, key, vars), vars), [lang]);
  const value = useMemo(() => ({ lang, setLang: setLangState, t, tr }), [lang, t, tr]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  return useContext(I18nContext);
}

export function LanguageSwitcher({ className = '' }) {
  const { lang, setLang, t } = useI18n();
  return (
    <div className={`lang-switch ${className}`} role="group" aria-label={t('common.language')}>
      {LANGUAGES.map(([code, label]) => (
        <button
          key={code}
          type="button"
          lang={code}
          className={lang === code ? 'active' : ''}
          aria-pressed={lang === code}
          onClick={() => setLang(code)}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

export function LanguageMenu({ className = '' }) {
  const { lang, setLang, t } = useI18n();
  return (
    <Dropdown
      className={className}
      trigger={({ toggle, open }) => (
        <button type="button" className="icon-btn lang-menu-btn" onClick={toggle} aria-haspopup="menu" aria-expanded={open} aria-label={t('common.language')} title={t('common.language')}>
          <GlobeIcon />
        </button>
      )}
    >
      {LANGUAGES.map(([code, label]) => (
        <DropdownItem key={code} icon={code === lang ? <CheckIcon width={18} height={18} /> : <span className="lang-menu-blank" />} onClick={() => setLang(code)}>
          <span lang={code}>{label}</span>
        </DropdownItem>
      ))}
    </Dropdown>
  );
}
