import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import CreatorShell from '../components/CreatorShell.jsx';
import Spinner from '../components/Spinner.jsx';
import { LockBadge } from '../components/PostCard.jsx';
import { ChatIcon, EyeIcon, HeartIcon, ShareIcon, TrashIcon } from '../components/icons.jsx';
import { api } from '../lib/api.js';
import { brandName, mentionOf, initials, shortDate, timeAgo } from '../lib/format.js';
import { useShare } from '../lib/useShare.js';
import { useToast } from '../context/ToastContext.jsx';
import { useI18n } from '../i18n/index.jsx';

function LockedPanel({ post, creator, user, from }) {
  const { t } = useI18n();
  const authState = { from, reason: t('post.loginToRead', { title: post.title }) };
  if (post.visibility === 'followers') {
    return (
      <div className="locked-panel">
        <LockBadge visibility="followers" size={30} />
        <Link to="/signup" state={{ ...authState, reason: t('post.signupToRead', { title: post.title }) }} className="locked-btn">
          {t('post.joinFree')}
        </Link>
        <p>
          {t('post.alreadyFollower')}{' '}
          <Link to="/login" state={authState}>
            {t('header.login')}
          </Link>
        </p>
      </div>
    );
  }
  return (
    <div className="locked-panel">
      <LockBadge visibility="supporters" size={30} />
      <p className="locked-sub">{t('post.supportToUnlock', { name: mentionOf(creator) })}</p>
      <div className="locked-actions">
        <Link to={`/${creator.slug}`} className="locked-btn">
          {creator.supportButtonText === 'Support' ? t('support.title', { name: mentionOf(creator) }) : `${creator.supportButtonText} ${creator.name}`}
        </Link>
        {creator.tabs?.membership && (
          <Link to={`/${creator.slug}/membership`} className="locked-btn locked-btn-ghost">
            {t('post.becomeMember')}
          </Link>
        )}
      </div>
      {!user && (
        <p>
          {t('post.alreadySupporter')}{' '}
          <Link to="/login" state={authState}>
            {t('header.login')}
          </Link>
        </p>
      )}
    </div>
  );
}

function Comments({ creator, post, user, from }) {
  const toast = useToast();
  const { t } = useI18n();
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
      <h2>{t('post.comments')} {comments?.length > 0 && <span className="hof-count">{comments.length}</span>}</h2>
      {user ? (
        <form className="comment-form" onSubmit={submit}>
          <span className="supporter-avatar">{initials(user.name)}</span>
          <textarea
            className="input-box input-sm"
            placeholder={t('post.writeComment')}
            rows={2}
            maxLength={1000}
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <button type="submit" className="pill-btn pill-theme" disabled={busy || !text.trim()}>
            {busy ? <Spinner small /> : t('post.postButton')}
          </button>
        </form>
      ) : (
        <p className="muted">
          <Link to="/login" state={{ from }} className="text-theme">
            {t('header.login')}
          </Link>{' '}
          {t('post.toJoin')}
        </p>
      )}
      {comments === null ? (
        <Spinner />
      ) : comments.length === 0 ? (
        <p className="muted">{t('post.noComments')}</p>
      ) : (
        <ul className="comment-list">
          {comments.map((c) => (
            <li key={c.id} className="comment">
              <span className="supporter-avatar">{initials(c.name)}</span>
              <div className="comment-main">
                <p>
                  <strong>{c.name}</strong>
                  {c.isCreator && <span className="badge">{t('post.creator')}</span>}
                  <span className="supporter-time"> · {timeAgo(c.createdAt)}</span>
                </p>
                <p className="comment-text">{c.text}</p>
              </div>
              {c.canDelete && (
                <button type="button" className="icon-btn" onClick={() => remove(c.id)} aria-label={t('post.deleteComment')}>
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
  const { t } = useI18n();
  const share = useShare();
  const [post, setPost] = useState(null);
  const [error, setError] = useState('');
  const commentsRef = useRef(null);

  useEffect(() => {
    setPost(null);
    api(`/posts/${creator.slug}/${postSlug}`)
      .then((d) => {
        setPost(d.post);
        document.title = `${d.post.title} · ${brandName(creator)}`;
      })
      .catch((err) => setError(err.status === 404 ? t('post.missing') : err.message));
  }, [creator.slug, creator.name, postSlug, user?.id, user?.slug, t]);

  if (error) {
    return (
      <div className="post-wrap">
        <p className="muted">{error}</p>
        <Link to={`/${creator.slug}/posts`} className="text-theme">
          ← {t('post.allPosts')}
        </Link>
      </div>
    );
  }
  if (!post) return <Spinner fullPage />;

  const like = async () => {
    if (!user) {
      toast(t('post.loginToLike'));
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
      <nav className="breadcrumb" aria-label={t('post.breadcrumb')}>
        <Link to={`/${creator.slug}`}>{creator.name}</Link>
        <span>›</span>
        <Link to={`/${creator.slug}/posts`}>{t('tabs.posts')}</Link>
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
            {t('post.manage')}
          </Link>
        )}
      </p>
      <div className="post-actions">
        <button type="button" className={`round-btn${post.liked ? ' is-liked' : ''}`} onClick={like} disabled={post.locked} aria-label={t('post.like')}>
          <HeartIcon width={20} height={20} fill={post.liked ? 'currentColor' : 'none'} />
          {post.likeCount > 0 && <span>{post.likeCount}</span>}
        </button>
        <button
          type="button"
          className="round-btn"
          onClick={() => commentsRef.current?.scrollIntoView({ behavior: 'smooth' })}
          disabled={post.locked}
          aria-label={t('post.comments')}
        >
          <ChatIcon width={20} height={20} />
          {post.commentCount > 0 && <span>{post.commentCount}</span>}
        </button>
        <button type="button" className="pill-btn pill-outline share-btn" onClick={() => share(window.location.href, post.title)}>
          <ShareIcon width={18} height={18} /> {t('header.share')}
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
  const { t } = useI18n();
  return (
    <CreatorShell tab="posts" title={t('post.title')}>
      {({ creator, user, isOwner }) => <PostView creator={creator} user={user} isOwner={isOwner} />}
    </CreatorShell>
  );
}
