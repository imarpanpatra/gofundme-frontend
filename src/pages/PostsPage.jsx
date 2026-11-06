import { useEffect, useState } from 'react';
import CreatorShell from '../components/CreatorShell.jsx';
import PostCard from '../components/PostCard.jsx';
import Spinner from '../components/Spinner.jsx';
import { api } from '../lib/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useI18n } from '../i18n/index.jsx';

function PostsList({ creator }) {
  const { user } = useAuth();
  const { t } = useI18n();
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const [posts, setPosts] = useState([]);
  const [meta, setMeta] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [retry, setRetry] = useState(0);

  const pick = (name) => {
    setPosts([]);
    setMeta((m) => m && { ...m, pages: 1 });
    setPage(1);
    setCategory(name);
  };

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError('');
    const q = new URLSearchParams({ page: String(page), ...(category ? { category } : {}) });
    api(`/posts/${creator.slug}?${q}`)
      .then((d) => {
        if (!alive) return;
        setPosts((prev) => (page === 1 ? d.posts : [...prev, ...d.posts.filter((p) => !prev.some((x) => x.slug === p.slug))]));
        setMeta(d);
      })
      .catch((err) => alive && setError(err.message))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [creator.slug, category, page, retry]);

  return (
    <section className="feature-box posts-box">
      <h1 className="posts-title">{t('tabs.posts')}</h1>
      {meta?.categories.length > 0 && (
        <div className="chip-row">
          {category && (
            <button type="button" className="cat-chip" onClick={() => pick('')}>
              {t('posts.all')}
            </button>
          )}
          {meta.categories.map((c) => (
            <button
              key={c.name}
              type="button"
              className={`cat-chip${category === c.name ? ' active' : ''}`}
              onClick={() => pick(category === c.name ? '' : c.name)}
            >
              {c.name} <span>{c.count}</span>
            </button>
          ))}
        </div>
      )}
      {error && <p className="form-error">{error}</p>}
      {meta && posts.length === 0 && !loading && <p className="muted center-text">{t('posts.none')}</p>}
      <div className="post-grid">
        {posts.map((p) => (
          <PostCard key={p.slug} slug={creator.slug} post={p} />
        ))}
      </div>
      {loading && (
        <div className="hof-loading">
          <Spinner />
        </div>
      )}
      {meta && !loading && (error ? page > 1 : page < meta.pages) && (
        <button type="button" className="pill-btn pill-outline see-more" onClick={() => (error ? setRetry((n) => n + 1) : setPage((p) => p + 1))}>
          {t('posts.loadMore')}
        </button>
      )}
    </section>
  );
}

export default function PostsPage() {
  return (
    <CreatorShell tab="posts" wide>
      {({ creator, user }) => <PostsList key={user?.id || 'guest'} creator={creator} />}
    </CreatorShell>
  );
}
