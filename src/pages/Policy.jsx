import InfoLayout from '../components/InfoLayout.jsx';
import { POLICIES, POLICIES_UPDATED, contextFor } from '../content/policies.jsx';
import { useI18n } from '../i18n/index.jsx';

export default function Policy({ kind }) {
  const { t, lang } = useI18n();
  const policy = POLICIES[kind];
  return (
    <InfoLayout title={t(`policy.${kind}`)} updated={POLICIES_UPDATED}>
      {(creator) => (
        <>
          {lang !== 'en' && <p className="policy-lang-note">{t('policy.englishOnly')}</p>}
          <div className="info-body" lang="en">
            {policy.render(contextFor(creator))}
          </div>
        </>
      )}
    </InfoLayout>
  );
}
