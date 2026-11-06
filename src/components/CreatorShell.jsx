import { Navigate, useLocation, useParams } from 'react-router-dom';
import Header from './Header.jsx';
import Footer from './Footer.jsx';
import Spinner from './Spinner.jsx';
import NotFound from '../pages/NotFound.jsx';
import { useCreator } from '../lib/useCreator.js';
import { useAuth } from '../context/AuthContext.jsx';
import { themeVars } from '../lib/format.js';
import useSeo from '../seo/useSeo.js';

export default function CreatorShell({ tab, seo = true, wide, children }) {
  const { slug } = useParams();
  const location = useLocation();
  const { status, creator, message, reload } = useCreator(slug);
  const { user } = useAuth();

  useSeo(tab, { creator }, seo && status === 'ready' && creator?.slug === slug);

  if (status === 'loading') return <Spinner fullPage />;
  if (status === 'missing') return <NotFound />;
  if (status === 'error') {
    return (
      <div className="center-page">
        <p>{message}</p>
      </div>
    );
  }

  if (creator.slug !== slug) {
    return <Navigate to={location.pathname.replace(/^\/[^/]+/, `/${creator.slug}`) + location.search + location.hash} replace />;
  }

  const isOwner = Boolean(user?.slug && user.slug === creator.slug);
  return (
    <div className="page info-page" style={themeVars(creator.themeColor)}>
      <Header creator={creator} isOwner={isOwner} tab={tab} />
      <main key={creator.slug} className={`shell-main${wide ? ' shell-wide' : ''}`}>{children({ creator, isOwner, user, reload })}</main>
      <Footer />
    </div>
  );
}
