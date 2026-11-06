import { Link } from 'react-router-dom';
import { useI18n } from '../i18n/index.jsx';

export default function NotFound() {
  const { t } = useI18n();
  return (
    <div className="center-page">
      <h1>{t('notFound.title')}</h1>
      <p className="muted">{t('notFound.body')}</p>
      <Link to="/" className="pill-btn pill-theme">
        {t('notFound.home')}
      </Link>
    </div>
  );
}
