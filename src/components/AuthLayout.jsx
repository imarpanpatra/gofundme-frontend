import { Link, useLocation } from 'react-router-dom';
import useSeo from '../seo/useSeo.js';
import { routeOf } from '../seo/meta.js';
import VietnamBackdrop, { PhotoCredits } from './VietnamBackdrop.jsx';
import { useSite } from '../lib/useSite.js';
import { brandName } from '../lib/format.js';
import ThemeToggle from './ThemeToggle.jsx';

export default function AuthLayout({ children }) {
  const site = useSite();
  const creator = site.status === 'ready' ? site.creator : null;
  const { pathname } = useLocation();
  useSeo('private', { creator, name: routeOf(pathname).name }, site.status !== 'loading');
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
