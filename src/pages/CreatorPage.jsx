import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, Navigate, useLocation, useParams } from 'react-router-dom';
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
import { mentionOf, themeVars } from '../lib/format.js';
import { refreshSite } from '../lib/useSite.js';
import { primeCreator } from '../lib/useCreator.js';
import PostCard from '../components/PostCard.jsx';
import GoalCard from '../components/GoalCard.jsx';
import VietnamBackdrop, { PhotoCredits } from '../components/VietnamBackdrop.jsx';
import { prepareImage } from '../lib/image.js';
import useParallax from '../lib/useParallax.js';
import useSeo from '../seo/useSeo.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { useI18n } from '../i18n/index.jsx';

export default function CreatorPage() {
  const { slug } = useParams();
  const location = useLocation();
  const { user, setUser } = useAuth();
  const toast = useToast();
  const { t } = useI18n();
  const [state, setState] = useState({ status: 'loading' });
  const [supporters, setSupporters] = useState([]);
  const [latestPosts, setLatestPosts] = useState([]);
  const [hasMore, setHasMore] = useState(false);
  const [funding, setFunding] = useState({ raised: 0, supporters: 0 });
  const [loadingMore, setLoadingMore] = useState(false);
  const [editing, setEditing] = useState(false);
  const [thanks, setThanks] = useState(null);
  const [coverUploading, setCoverUploading] = useState(false);
  const [widgetVisible, setWidgetVisible] = useState(true);
  const widgetRef = useRef(null);
  const coverInput = useRef(null);
  useSeo('creator', { creator: state.creator }, state.status === 'ready');
  const coverRef = useParallax(`${state.status}:${state.creator?.cover || ''}`);

  const slugRef = useRef(slug);
  slugRef.current = slug;

  const load = useCallback(async () => {
    try {
      const d = await api(`/pages/${slug}`);
      if (slugRef.current !== slug) return;
      setState({ status: 'ready', creator: d.creator });
      primeCreator(d.creator);
      setLatestPosts(d.latestPosts || []);
      setSupporters(d.supporters);
      setHasMore(d.hasMore);
      setFunding({ raised: d.raised || 0, supporters: d.supporterCount || 0 });
    } catch (err) {
      if (slugRef.current !== slug) return;
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
          {t('common.tryAgain')}
        </button>
      </div>
    );
  }

  const { creator } = state;
  if (creator.slug !== slug) {
    return <Navigate to={location.pathname.replace(/^\/[^/]+/, `/${creator.slug}`) + location.search + location.hash} replace />;
  }
  const isOwner = Boolean(user && user.slug === creator.slug);

  const applyCreator = (updated, opts = {}) => {
    setState({ status: 'ready', creator: updated });
    refreshSite(updated);
    primeCreator(updated);
    if (user) setUser((u) => (u ? { ...u, ...updated } : u));
    if (!opts.keepOpen) setEditing(false);
  };

  const loadMore = async () => {
    const last = supporters[supporters.length - 1];
    if (!last) return;
    setLoadingMore(true);
    try {
      const d = await api(`/pages/${slug}/supporters?before=${encodeURIComponent(last.createdAt)}&beforeId=${encodeURIComponent(last.id)}`);
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
      if (coverInput.current) coverInput.current.value = '';
    }
  };

  const onSupported = (support) => {
    setThanks(support);
    setSupporters((s) => [support, ...s.filter((x) => x.id !== support.id)]);
    setFunding((f) => ({ raised: f.raised + (Number(support.amount) || 0), supporters: f.supporters + 1 }));
  };

  return (
    <div className="page vn-page home-page" style={themeVars(creator.themeColor)}>
      <VietnamBackdrop />
      <Header creator={creator} isOwner={isOwner} onEdit={() => setEditing(true)} />

      <main className="page-main">
        <div className="cover-wrap">
          {creator.cover ? (
            <img src={assetUrl(creator.cover)} alt={t('home.coverAlt')} className="cover-image" fetchpriority="high" ref={coverRef} />
          ) : (
            <div className="cover-image cover-empty" ref={coverRef} />
          )}
          {isOwner && (
            <>
              <button type="button" className="change-cover" onClick={() => coverInput.current.click()} disabled={coverUploading}>
                {coverUploading ? <Spinner small /> : t('home.changeCover')}
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
              {creator.goal?.amount > 0 && (
                <GoalCard goal={creator.goal} raised={funding.raised} supporters={funding.supporters} currency={creator.currency} />
              )}
              <SupportWidget
                ref={widgetRef}
                creator={creator}
                onSupported={onSupported}
              />
            </div>
            <div className="col col-sidebar">
              <div className="feature-box sidebar-box">
                <AboutCard creator={creator} isOwner={isOwner} onEdit={() => setEditing(true)} />
                <RecentSupporters
                  creatorName={mentionOf(creator)}
                  supporters={supporters}
                  hasMore={hasMore}
                  loadingMore={loadingMore}
                  onLoadMore={loadMore}
                />
              </div>
              {latestPosts.length > 0 && (
                <section className="feature-box home-posts" aria-label={t('tabs.posts')}>
                  <h2 className="home-posts-title">{t('tabs.posts')}</h2>
                  <PostCard slug={creator.slug} post={{ ...latestPosts[0], locked: latestPosts[0].visibility !== 'public' }} />
                  <Link to={`/${creator.slug}/posts`} className="pill-btn pill-outline see-more">
                    {t('home.viewAllPosts')}
                  </Link>
                </section>
              )}
            </div>
          </div>
        </div>
        <div className="home-credits">
          <PhotoCredits />
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
