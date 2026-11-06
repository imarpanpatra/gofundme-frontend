import { Link } from 'react-router-dom';
import VietnamBackdrop, { PhotoCredits } from './VietnamBackdrop.jsx';
import { useSite } from '../lib/useSite.js';
import { brandName } from '../lib/format.js';
import ThemeToggle from './ThemeToggle.jsx';

export default function AuthLayout({ children }) {
  const site = useSite();
  const creator = site.status === 'ready' ? site.creator : null;
  return (
    <div className="auth-page vn-page">
      <VietnamBackdrop />
      <ThemeToggle className="auth-theme" />
      {creator && (
        <Link to={`/${creator.slug}`} className="auth-brand">
          {brandName(creator)}
        </Link>
      )}
      {children}
      <PhotoCredits />
    </div>
  );
}
