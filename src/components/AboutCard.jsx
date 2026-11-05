import { GlobeIcon } from './icons.jsx';
import { hostOf } from '../lib/format.js';

export default function AboutCard({ creator, isOwner, onEdit }) {
  return (
    <section className="about-section" aria-label={`About ${creator.name}`}>
      <div className="about-head">
        <h2>About {creator.name}</h2>
        {isOwner && (
          <button type="button" className="underline-btn" onClick={onEdit}>
            Edit
          </button>
        )}
      </div>
      {creator.about ? (
        <div className="about-body" dangerouslySetInnerHTML={{ __html: creator.about }} />
      ) : (
        isOwner && <p className="muted">Tell your supporters what you're raising money for.</p>
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
