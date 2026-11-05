import { useEffect, useState } from 'react';
import CreatorShell from '../components/CreatorShell.jsx';
import PostCard from '../components/PostCard.jsx';
import Spinner from '../components/Spinner.jsx';
import { api } from '../lib/api.js';
import { useAuth } from '../context/AuthContext.jsx';

function PostsList({ creator }) {
  const { user } = useAuth();
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const [posts, setPosts] = useState([]);
  const [meta, setMeta] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const pick = (name) => {
    setPosts([]);
    setMeta((m) => m && { ...m, pages: 1 });
    setPage(1);
    setCategory(name);
  };

  useEffect(() => {
    setLoading(true);
    const q = new URLSearchParams({ page: String(page), ...(category ? { category } : {}) });
    api(`/posts/${creator.slug}?${q}`)
      .then((d) => {
        setPosts((prev) => (page === 1 ? d.posts : [...prev, ...d.posts]));
        setMeta(d);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [creator.slug, category, page, user?.id, user?.slug]);

  return (
    <section className="feature-box posts-box">
      <h1 className="posts-title">Posts</h1>
      {meta?.categories.length > 0 && (
        <div className="chip-row">
          {category && (
            <button type="button" className="cat-chip" onClick={() => pick('')}>
              All
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
      {meta && posts.length === 0 && !loading && <p className="muted center-text">No posts yet.</p>}
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
      {meta && page < meta.pages && !loading && (
        <button type="button" className="pill-btn pill-outline see-more" onClick={() => setPage((p) => p + 1)}>
          Load more posts
        </button>
      )}
    </section>
  );
}

export default function PostsPage() {
  return (
    <CreatorShell tab="posts" title="Posts" wide>
      {({ creator }) => <PostsList creator={creator} />}
    </CreatorShell>
  );
}
