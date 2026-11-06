import { Link } from 'react-router-dom';
import { HeartIcon, UsersIcon } from './icons.jsx';
import { shortDate } from '../lib/format.js';
import { useI18n } from '../i18n/index.jsx';

export const VISIBILITY = {
  public: { label: 'Public', description: 'Visible to everyone.' },
  followers: { label: 'Followers only', description: 'Visible to anyone with a free account.' },
  supporters: { label: 'Supporters only', description: 'Visible to your supporters and members only.' },
};

export function LockBadge({ visibility, size = 26 }) {
  const { t } = useI18n();
  return (
    <span className="lock-badge">
      {visibility === 'supporters' ? <HeartIcon width={size} height={size} fill="currentColor" /> : <UsersIcon width={size} height={size} />}
      <strong>{t(`visibility.${visibility}`)}</strong>
    </span>
  );
}

export default function PostCard({ slug, post }) {
  const { t } = useI18n();
  return (
    <Link to={`/${slug}/posts/${post.slug}`} className="post-card">
      <div className={`post-thumb${post.locked ? ' is-locked' : ''}`}>
        {post.locked ? (
          <LockBadge visibility={post.visibility} />
        ) : post.cover ? (
          <img src={post.cover} alt="" loading="lazy" />
        ) : (
          <p>{post.excerpt || post.title}</p>
        )}
      </div>
      <p className="post-card-title">{post.title}</p>
      <p className="post-card-meta">
        {shortDate(post.publishedAt)}
        {post.views > 0 && ` · ${t('posts.views', { count: post.views })}`}
      </p>
    </Link>
  );
}
