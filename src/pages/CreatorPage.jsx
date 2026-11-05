import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import Header from '../components/Header.jsx';
import SupportWidget from '../components/SupportWidget.jsx';
import AboutCard from '../components/AboutCard.jsx';
import RecentSupporters from '../components/RecentSupporters.jsx';
import EditPageModal from '../components/EditPageModal.jsx';
import ThankYouModal from '../components/ThankYouModal.jsx';
import Footer from '../components/Footer.jsx';
import Spinner from '../components/Spinner.jsx';
import NotFound from './NotFound.jsx';
import { api, assetUrl } from '../lib/api.js';
import { themeVars } from '../lib/format.js';
import { refreshSite } from '../lib/useSite.js';
import { prepareImage } from '../lib/image.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

export default function CreatorPage() {
  const { slug } = useParams();
  const { user, setUser } = useAuth();
  const toast = useToast();
  const [state, setState] = useState({ status: 'loading' });
  const [supporters, setSupporters] = useState([]);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [editing, setEditing] = useState(false);
  const [thanks, setThanks] = useState(null);
  const [coverUploading, setCoverUploading] = useState(false);
  const [widgetVisible, setWidgetVisible] = useState(true);
  const widgetRef = useRef(null);
  const coverInput = useRef(null);

  const load = useCallback(async () => {
    try {
      const d = await api(`/pages/${slug}`);
      setState({ status: 'ready', creator: d.creator });
      setSupporters(d.supporters);
      setHasMore(d.hasMore);
      document.title = `${d.creator.name}`;
    } catch (err) {
      setState({ status: err.status === 404 ? 'missing' : 'error', message: err.message });
    }
  }, [slug]);

  useEffect(() => {
    setState({ status: 'loading' });
    load();
  }, [load]);

  useEffect(() => {
    const el = widgetRef.current;
    if (!el || !('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver(([entry]) => setWidgetVisible(entry.isIntersecting), { threshold: 0.1 });
    io.observe(el);
    return () => io.disconnect();
  }, [state.status]);

  if (state.status === 'loading') return <Spinner fullPage />;
  if (state.status === 'missing') return <NotFound />;
  if (state.status === 'error') {
    return (
      <div className="center-page">
        <p>{state.message}</p>
        <button type="button" className="pill-btn pill-outline" onClick={load}>
          Try again
        </button>
      </div>
    );
  }

  const { creator } = state;
  const isOwner = Boolean(user && user.slug === creator.slug);

  const applyCreator = (updated, opts = {}) => {
    setState({ status: 'ready', creator: updated });
    refreshSite(updated);
    if (user) setUser({ ...user, ...updated });
    if (!opts.keepOpen) setEditing(false);
  };

  const loadMore = async () => {
    const last = supporters[supporters.length - 1];
    if (!last) return;
    setLoadingMore(true);
    try {
      const d = await api(`/pages/${slug}/supporters?before=${encodeURIComponent(last.createdAt)}`);
      setSupporters((s) => [...s, ...d.supporters]);
      setHasMore(d.hasMore);
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setLoadingMore(false);
    }
  };

  const uploadCover = async (file) => {
    if (!file) return;
    setCoverUploading(true);
    try {
      const form = new FormData();
      form.append('cover', await prepareImage(file, 2400, 1200));
      const { creator: updated } = await api('/pages/me/cover', { method: 'POST', form });
      applyCreator(updated, { keepOpen: true });
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setCoverUploading(false);
      coverInput.current.value = '';
    }
  };

  const onSupported = (support) => {
    setThanks(support);
    setSupporters((s) => [support, ...s.filter((x) => x.id !== support.id)]);
  };

  return (
    <div className="page" style={themeVars(creator.themeColor)}>
      <Header creator={creator} isOwner={isOwner} onEdit={() => setEditing(true)} />

      <main className="page-main">
        <div className="cover-wrap">
          {creator.cover ? (
            <img src={assetUrl(creator.cover)} alt="cover image" className="cover-image" fetchpriority="high" />
          ) : (
            <div className="cover-image cover-empty" />
          )}
          {isOwner && (
            <>
              <button type="button" className="change-cover" onClick={() => coverInput.current.click()} disabled={coverUploading}>
                {coverUploading ? <Spinner small /> : 'Change cover'}
              </button>
              <input ref={coverInput} type="file" accept="image/png,image/jpeg,image/webp,image/gif" hidden onChange={(e) => uploadCover(e.target.files[0])} />
            </>
          )}
        </div>

        <div className="mobile-profile">
          {creator.avatar && <img src={assetUrl(creator.avatar)} alt={creator.slug} className="mobile-avatar" />}
          <p className="mobile-name">{creator.name}</p>
        </div>

        <div className="content">
          <div className="content-row">
            <div className="col col-widget">
              <SupportWidget
                ref={widgetRef}
                creator={creator}
                defaultName={isOwner ? user.name : ''}
                onSupported={onSupported}
              />
            </div>
            <div className="col col-sidebar">
              <div className="feature-box sidebar-box">
                <AboutCard creator={creator} isOwner={isOwner} onEdit={() => setEditing(true)} />
                <RecentSupporters
                  creatorName={creator.name}
                  supporters={supporters}
                  hasMore={hasMore}
                  loadingMore={loadingMore}
                  onLoadMore={loadMore}
                />
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      <div className={`mobile-support-bar${widgetVisible ? '' : ' show'}`}>
        <button
          type="button"
          className="support-btn"
          onClick={() => widgetRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
        >
          {creator.supportButtonText}
        </button>
      </div>

      {editing && <EditPageModal creator={creator} onClose={() => setEditing(false)} onSaved={applyCreator} />}
      {thanks && <ThankYouModal creator={creator} support={thanks} onClose={() => setThanks(null)} />}
    </div>
  );
}
