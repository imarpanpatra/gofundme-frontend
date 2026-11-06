import { Link } from 'react-router-dom';
import { LockIcon } from './icons.jsx';
import { LanguageSwitcher, useI18n } from '../i18n/index.jsx';

export const FOOTER_LINKS = [
  ['/hall-of-fame', 'footer.hallOfFame'],
  ['/about', 'footer.about'],
  ['/contact', 'footer.contact'],
  ['/terms', 'footer.terms'],
  ['/privacy', 'footer.privacy'],
  ['/refund-policy', 'footer.refund'],
  ['/return-policy', 'footer.shipping'],
  ['/disclaimer', 'footer.disclaimer'],
];

export default function Footer() {
  const { t } = useI18n();
  return (
    <footer className="site-footer">
      <nav className="footer-links" aria-label={t('footer.policies')}>
        {FOOTER_LINKS.map(([to, key]) => (
          <Link key={to} to={to}>
            {t(key)}
          </Link>
        ))}
      </nav>
      <p className="footer-secure">
        <LockIcon width={14} height={14} />
        <span>{t('footer.secure')}</span>
      </p>
      <LanguageSwitcher className="footer-lang" />
    </footer>
  );
}
