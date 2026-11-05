import { Link } from 'react-router-dom';
import { LockIcon } from './icons.jsx';

export const FOOTER_LINKS = [
  ['/hall-of-fame', 'Hall of Fame'],
  ['/about', 'About'],
  ['/contact', 'Contact Us'],
  ['/terms', 'Terms & Conditions'],
  ['/privacy', 'Privacy Policy'],
  ['/refund-policy', 'Refund Policy'],
  ['/return-policy', 'Shipping & Delivery'],
  ['/disclaimer', 'Disclaimer'],
];

export default function Footer() {
  return (
    <footer className="site-footer">
      <nav className="footer-links" aria-label="Policies">
        {FOOTER_LINKS.map(([to, label]) => (
          <Link key={to} to={to}>
            {label}
          </Link>
        ))}
      </nav>
      <p className="footer-secure">
        <LockIcon width={14} height={14} />
        <span>Payments are secured by Razorpay</span>
      </p>
    </footer>
  );
}
