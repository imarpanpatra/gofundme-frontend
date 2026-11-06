import { assetUrl } from '../lib/api.js';
import { Link } from 'react-router-dom';
import InfoLayout from '../components/InfoLayout.jsx';
import { hostOf } from '../lib/format.js';
import { useI18n } from '../i18n/index.jsx';

const bold = (s) => <strong>{s}</strong>;

export default function About() {
  const { t, tr } = useI18n();
  return (
    <InfoLayout title={t('footer.about')}>
      {(creator) => (
        <div className="info-body">
          <div className="about-hero">
            {creator.avatar && <img src={assetUrl(creator.avatar)} alt={creator.name} className="about-hero-avatar" />}
            <div>
              <h2 className="about-hero-name">{creator.name}</h2>
              {creator.goal?.title && <p className="muted">{creator.goal.title}</p>}
            </div>
          </div>

          <h2>{t('aboutPage.pageTitle')}</h2>
          <div className="about-body" dangerouslySetInnerHTML={{ __html: creator.about }} />

          <h2>{t('aboutPage.doTitle')}</h2>
          <ul>
            <li>{tr('aboutPage.doSupport', { b: bold, link: (s) => <Link to={`/${creator.slug}`}>{s}</Link> })}</li>
            <li>{tr('aboutPage.doMember', { b: bold, link: (s) => <Link to={`/${creator.slug}/membership`}>{s}</Link> })}</li>
            <li>{tr('aboutPage.doShop', { b: bold, link: (s) => <Link to={`/${creator.slug}/shop`}>{s}</Link> })}</li>
          </ul>

          <h2>{t('aboutPage.knowTitle')}</h2>
          <ul>
            <li>{t('aboutPage.know1')}</li>
            <li>{t('aboutPage.know2')}</li>
            <li>{t('aboutPage.know3')}</li>
            <li>
              {tr('aboutPage.know4', {
                terms: (s) => <Link to="/terms">{s}</Link>,
                refund: (s) => <Link to="/refund-policy">{s}</Link>,
                shipping: (s) => <Link to="/return-policy">{s}</Link>,
                privacy: (s) => <Link to="/privacy">{s}</Link>,
              })}
            </li>
          </ul>

          {creator.links.length > 0 && (
            <>
              <h2>{t('aboutPage.onlineTitle')}</h2>
              <ul>
                {creator.links.map((url) => (
                  <li key={url}>
                    <a href={url} target="_blank" rel="noopener noreferrer">
                      {hostOf(url)}
                    </a>
                  </li>
                ))}
              </ul>
            </>
          )}

          <h2>{t('aboutPage.touchTitle')}</h2>
          <p>{tr('aboutPage.touch', { link: (s) => <Link to="/contact">{s}</Link> })}</p>
        </div>
      )}
    </InfoLayout>
  );
}
