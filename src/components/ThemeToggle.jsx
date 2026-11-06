import { MoonIcon, SunIcon } from './icons.jsx';
import { useTheme } from '../lib/theme.js';
import { useI18n } from '../i18n/index.jsx';

export default function ThemeToggle({ className = '' }) {
  const { theme, toggle } = useTheme();
  const { t } = useI18n();
  const label = theme === 'dark' ? t('theme.toLight') : t('theme.toDark');
  return (
    <button type="button" className={`icon-btn theme-toggle ${className}`} onClick={toggle} aria-label={label} title={label}>
      {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}
