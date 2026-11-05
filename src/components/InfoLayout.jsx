import { useEffect } from 'react';
import Header from './Header.jsx';
import Footer from './Footer.jsx';
import Spinner from './Spinner.jsx';
import { useSite } from '../lib/useSite.js';
import { useAuth } from '../context/AuthContext.jsx';
import { themeVars } from '../lib/format.js';

export default function InfoLayout({ title, updated, children }) {
  const site = useSite();
  const { user } = useAuth();

  useEffect(() => {
    if (site.status === 'ready') document.title = `${title} · ${site.creator.name}`;
  }, [site, title]);

  if (site.status === 'loading') return <Spinner fullPage />;
  if (site.status === 'error') {
    return (
      <div className="center-page">
        <p>{site.message}</p>
      </div>
    );
  }

  const { creator } = site;
  const isOwner = Boolean(user && user.slug === creator.slug);

  return (
    <div className="page info-page" style={themeVars(creator.themeColor)}>
      <Header creator={creator} isOwner={isOwner} tab="" />
      <main className="info-main">
        <article className="feature-box info-card">
          <h1 className="info-title">{title}</h1>
          {updated && <p className="info-updated">Last updated: {updated}</p>}
          {typeof children === 'function' ? children(creator) : children}
        </article>
      </main>
      <Footer />
    </div>
  );
}
