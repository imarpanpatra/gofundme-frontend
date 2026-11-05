import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import CreatorShell from '../components/CreatorShell.jsx';
import Spinner from '../components/Spinner.jsx';
import { LockBadge } from '../components/PostCard.jsx';
import { ChatIcon, EyeIcon, HeartIcon, ShareIcon, TrashIcon } from '../components/icons.jsx';
import { api } from '../lib/api.js';
import { initials, shortDate, timeAgo } from '../lib/format.js';
import { useShare } from '../lib/useShare.js';
import { useToast } from '../context/ToastContext.jsx';

function LockedPanel({ post, creator, user, from }) {
  const authState = { from, reason: `Log in to read "${post.title}".` };
  if (post.visibility === 'followers') {
    return (
      <div className="locked-panel">
        <LockBadge visibility="followers" size={30} />
        <Link to="/signup" state={{ ...authState, reason: `Create a free account to read "${post.title}".` }} className="locked-btn">
          Join for free
        </Link>
        <p>
          Already a follower?{' '}
          <Link to="/login" state={authState}>
            Log in
          </Link>
        </p>
      </div>
    );
  }
  return (
    <div className="locked-panel">
      <LockBadge visibility="supporters" size={30} />
      <p className="locked-sub">Support {creator.name} to unlock this post.</p>
      <div className="locked-actions">
        <Link to={`/${creator.slug}`} className="locked-btn">
          {creator.supportButtonText} {creator.name}
        </Link>
        {creator.tabs?.membership && (
          <Link to={`/${creator.slug}/membership`} className="locked-btn locked-btn-ghost">
            Become a member
          </Link>
        )}
      </div>
      {!user && (
        <p>
          Already a supporter?{' '}
          <Link to="/login" state={authState}>
            Log in
          </Link>
        </p>
      )}
    </div>
  );
}

function Comments({ creator, post, user, from }) {
  const toast = useToast();
  const [comments, setComments] = useState(null);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const base = `/posts/${creator.slug}/${post.slug}/comments`;

  useEffect(() => {
    api(base)
      .then((d) => setComments(d.comments))
      .catch(() => setComments([]));
  }, [base, user?.id, user?.slug]);

  const submit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setBusy(true);
    try {
      const { comment } = await api(base, { method: 'POST', body: { text } });
      setComments((c) => [...(c || []), comment]);
      setText('');
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id) => {
    try {
      await api(`${base}/${id}`, { method: 'DELETE' });
      setComments((c) => c.filter((x) => x.id !== id));
    } catch (err) {
      toast(err.message, 'error');
    }
  };

  return (
    <section className="comments" id="comments">
      <h2>Comments {comments?.length > 0 && <span className="hof-count">{comments.length}</span>}</h2>
      {user ? (
        <form className="comment-form" onSubmit={submit}>
          <span className="supporter-avatar">{initials(user.name)}</span>
          <textarea
            className="input-box input-sm"
            placeholder="Write a comment…"
            rows={2}
            maxLength={1000}
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <button type="submit" className="pill-btn pill-theme" disabled={busy || !text.trim()}>
            {busy ? <Spinner small /> : 'Post'}
          </button>
        </form>
      ) : (
        <p className="muted">
          <Link to="/login" state={{ from }} className="text-theme">
            Log in
          </Link>{' '}
          to join the conversation.
        </p>
      )}
      {comments === null ? (
        <Spinner />
      ) : comments.length === 0 ? (
        <p className="muted">No comments yet.</p>
      ) : (
        <ul className="comment-list">
          {comments.map((c) => (
            <li key={c.id} className="comment">
              <span className="supporter-avatar">{initials(c.name)}</span>
              <div className="comment-main">
                <p>
                  <strong>{c.name}</strong>
                  {c.isCreator && <span className="badge">Creator</span>}
                  <span className="supporter-time"> · {timeAgo(c.createdAt)}</span>
                </p>
                <p className="comment-text">{c.text}</p>
              </div>
              {c.canDelete && (
                <button type="button" className="icon-btn" onClick={() => remove(c.id)} aria-label="Delete comment">
                  <TrashIcon width={16} height={16} />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function PostView({ creator, user, isOwner }) {
  const { postSlug } = useParams();
  const location = useLocation();
  const toast = useToast();
  const share = useShare();
  const [post, setPost] = useState(null);
  const [error, setError] = useState('');
  const commentsRef = useRef(null);

  useEffect(() => {
    setPost(null);
    api(`/posts/${creator.slug}/${postSlug}`)
      .then((d) => {
        setPost(d.post);
        document.title = `${d.post.title} · ${creator.name}`;
      })
      .catch((err) => setError(err.status === 404 ? 'This post does not exist or is no longer available.' : err.message));
  }, [creator.slug, creator.name, postSlug, user?.id, user?.slug]);

  if (error) {
    return (
      <div className="post-wrap">
        <p className="muted">{error}</p>
        <Link to={`/${creator.slug}/posts`} className="text-theme">
          ← All posts
        </Link>
      </div>
    );
  }
  if (!post) return <Spinner fullPage />;

  const like = async () => {
    if (!user) {
      toast('Log in to like posts');
      return;
    }
    try {
      const d = await api(`/posts/${creator.slug}/${post.slug}/like`, { method: 'POST', body: {} });
      setPost((p) => ({ ...p, liked: d.liked, likeCount: d.likeCount }));
    } catch (err) {
      toast(err.message, 'error');
    }
  };

  return (
    <article className="post-wrap">
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <Link to={`/${creator.slug}`}>{creator.name}</Link>
        <span>›</span>
        <Link to={`/${creator.slug}/posts`}>Posts</Link>
        <span>›</span>
        <span className="muted">{post.title}</span>
      </nav>
      <h1 className="post-title">{post.title}</h1>
      <p className="post-meta">
        {shortDate(post.publishedAt)}
        <span className="dot">•</span>
        <EyeIcon width={16} height={16} /> {post.views}
        {isOwner && (
          <Link to="/dashboard/posts" className="text-theme post-edit-link">
            Manage posts
          </Link>
        )}
      </p>
      <div className="post-actions">
        <button type="button" className={`round-btn${post.liked ? ' is-liked' : ''}`} onClick={like} disabled={post.locked} aria-label="Like">
          <HeartIcon width={20} height={20} fill={post.liked ? 'currentColor' : 'none'} />
          {post.likeCount > 0 && <span>{post.likeCount}</span>}
        </button>
        <button
          type="button"
          className="round-btn"
          onClick={() => commentsRef.current?.scrollIntoView({ behavior: 'smooth' })}
          disabled={post.locked}
          aria-label="Comments"
        >
          <ChatIcon width={20} height={20} />
          {post.commentCount > 0 && <span>{post.commentCount}</span>}
        </button>
        <button type="button" className="pill-btn pill-outline share-btn" onClick={() => share(window.location.href, post.title)}>
          <ShareIcon width={18} height={18} /> Share
        </button>
      </div>
      {post.locked ? (
        <LockedPanel post={post} creator={creator} user={user} from={location.pathname} />
      ) : (
        <>
          <div className="post-body" dangerouslySetInnerHTML={{ __html: post.html }} />
          <div ref={commentsRef}>
            <Comments creator={creator} post={post} user={user} from={location.pathname} />
          </div>
        </>
      )}
    </article>
  );
}

export default function PostPage() {
  return (
    <CreatorShell tab="posts" title="Post">
      {({ creator, user, isOwner }) => <PostView creator={creator} user={user} isOwner={isOwner} />}
    </CreatorShell>
  );
}
