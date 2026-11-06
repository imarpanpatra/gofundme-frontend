import { forwardRef, useState } from 'react';
import { EyeIcon, EyeOffIcon } from './icons.jsx';
import { useI18n } from '../i18n/index.jsx';

const PasswordInput = forwardRef(function PasswordInput({ className = '', ...props }, ref) {
  const { t } = useI18n();
  const [shown, setShown] = useState(false);
  return (
    <div className="password-field">
      <input ref={ref} {...props} type={shown ? 'text' : 'password'} className={className} />
      <button
        type="button"
        className="password-toggle"
        onClick={() => setShown((v) => !v)}
        aria-label={shown ? t('auth.hidePassword') : t('auth.showPassword')}
        aria-pressed={shown}
        title={shown ? t('auth.hidePassword') : t('auth.showPassword')}
      >
        {shown ? <EyeOffIcon /> : <EyeIcon />}
      </button>
    </div>
  );
});

export default PasswordInput;
