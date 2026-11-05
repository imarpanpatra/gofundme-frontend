import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Header from './Header.jsx';
import Footer from './Footer.jsx';
import Spinner from './Spinner.jsx';
import NotFound from '../pages/NotFound.jsx';
import { useCreator } from '../lib/useCreator.js';
import { useAuth } from '../context/AuthContext.jsx';
import { themeVars } from '../lib/format.js';

export default function CreatorShell({ tab, title, wide, children }) {
  const { slug } = useParams();
  const { status, creator, message, reload } = useCreator(slug);
  const { user } = useAuth();

  useEffect(() => {
    if (status === 'ready') document.title = title ? `${title} · ${creator.name}` : creator.name;
  }, [status, creator, title]);

  if (status === 'loading') return <Spinner fullPage />;
  if (status === 'missing') return <NotFound />;
  if (status === 'error') {
    return (
      <div className="center-page">
        <p>{message}</p>
      </div>
    );
  }

  const isOwner = Boolean(user?.slug && user.slug === creator.slug);
  return (
    <div className="page info-page" style={themeVars(creator.themeColor)}>
      <Header creator={creator} isOwner={isOwner} tab={tab} />
      <main className={`shell-main${wide ? ' shell-wide' : ''}`}>{children({ creator, isOwner, user, reload })}</main>
      <Footer />
    </div>
  );
}
