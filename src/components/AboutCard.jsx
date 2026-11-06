import { GlobeIcon } from './icons.jsx';
import { hostOf } from '../lib/format.js';
import YouTubeEmbed from './YouTubeEmbed.jsx';
import { useI18n } from '../i18n/index.jsx';

export default function AboutCard({ creator, isOwner, onEdit }) {
  const { t } = useI18n();
  return (
    <section className="about-section" aria-label={t('about.heading')}>
      <div className="about-head">
        <h2>{t('about.heading')}</h2>
        {isOwner && (
          <button type="button" className="underline-btn" onClick={onEdit}>
            {t('common.edit')}
          </button>
        )}
      </div>
      {creator.featuredVideoId && (
        <YouTubeEmbed id={creator.featuredVideoId} title={t('about.featuredVideo', { name: creator.name })} />
      )}
      {creator.about ? (
        <div className="about-body" dangerouslySetInnerHTML={{ __html: creator.about }} />
      ) : (
        isOwner && <p className="muted">{t('about.emptyOwner')}</p>
      )}
      {creator.links.length > 0 && (
        <div className="about-links">
          {creator.links.map((url) => (
            <a key={url} href={url} target="_blank" rel="nofollow noopener noreferrer" aria-label={hostOf(url)} title={hostOf(url)}>
              <GlobeIcon />
            </a>
          ))}
        </div>
      )}
    </section>
  );
}
