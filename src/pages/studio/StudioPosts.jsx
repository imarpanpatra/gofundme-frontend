import { useCallback, useEffect, useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import Spinner from '../../components/Spinner.jsx';
import { ChatIcon, EyeIcon, HeartIcon, PenIcon } from '../../components/icons.jsx';
import { VISIBILITY } from '../../components/PostCard.jsx';
import { api } from '../../lib/api.js';
import { shortDate } from '../../lib/format.js';
import { useToast } from '../../context/ToastContext.jsx';

export default function StudioPosts() {
  const { creator } = useOutletContext();
  const toast = useToast();
  const [posts, setPosts] = useState(null);
  const [error, setError] = useState('');

  const load = useCallback(() => {
    api('/studio/posts')
      .then((d) => setPosts(d.posts))
      .catch((err) => setError(err.message));
  }, []);

  useEffect(() => {
    document.title = 'Posts';
    load();
  }, [load]);

  const remove = async (p) => {
    if (!window.confirm(`Delete "${p.title}"? This can't be undone.`)) return;
    try {
      await api(`/studio/posts/${p.id}`, { method: 'DELETE' });
      toast('Post deleted');
      load();
    } catch (err) {
      toast(err.message, 'error');
    }
  };

  return (
    <div className="studio-stack">
      <div className="studio-list-head">
        <h1 className="studio-title">Posts</h1>
        <Link to="/dashboard/posts/new" className="pill-btn pill-theme">
          Write a post
        </Link>
      </div>
      <section className="studio-card">
        {error && <p className="form-error">{error}</p>}
        {!posts && !error && <Spinner />}
        {posts && posts.length === 0 && (
          <div className="studio-empty">
            <span className="studio-empty-icon">
              <PenIcon width={26} height={26} />
            </span>
            <h3>Share your journey</h3>
            <p className="muted">Write updates, stories and tips. Keep some for followers or supporters only.</p>
            <Link to="/dashboard/posts/new" className="pill-btn pill-theme">
              Write your first post
            </Link>
          </div>
        )}
        {posts && posts.length > 0 && (
          <ul className="dash-list">
            {posts.map((p) => (
              <li key={p.id} className="dash-row studio-post-row">
                <div className="dash-row-main">
                  <p>
                    <Link to={`/dashboard/posts/${p.id}/edit`} className="studio-post-title">
                      {p.title}
                    </Link>
                    <span className={`badge${p.status === 'draft' ? ' badge-muted' : ''}`}>{p.status === 'draft' ? 'Draft' : 'Published'}</span>
                    <span className="badge badge-muted">{VISIBILITY[p.visibility].label}</span>
                  </p>
                  <p className="supporter-time">
                    {p.status === 'published' ? `Published ${shortDate(p.publishedAt)}` : `Edited ${shortDate(p.updatedAt)}`}
                    {p.categories.length > 0 && ` · ${p.categories.join(', ')}`}
                  </p>
                  <p className="post-stats">
                    <span>
                      <EyeIcon width={15} height={15} /> {p.views}
                    </span>
                    <span>
                      <HeartIcon width={15} height={15} /> {p.likeCount}
                    </span>
                    <span>
                      <ChatIcon width={15} height={15} /> {p.commentCount}
                    </span>
                  </p>
                </div>
                <div className="row-actions">
                  {p.status === 'published' && (
                    <a href={`/${creator.slug}/posts/${p.slug}`} target="_blank" rel="noopener noreferrer" className="pill-btn pill-outline pill-sm">
                      View
                    </a>
                  )}
                  <Link to={`/dashboard/posts/${p.id}/edit`} className="pill-btn pill-outline pill-sm">
                    Edit
                  </Link>
                  <button type="button" className="pill-btn pill-outline pill-sm" onClick={() => remove(p)}>
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
