import { useCallback } from 'react';
import { useToast } from '../context/ToastContext.jsx';
import { useI18n } from '../i18n/index.jsx';

export function useShare() {
  const toast = useToast();
  const { t } = useI18n();
  return useCallback(
    async (url, title) => {
      if (navigator.share) {
        try {
          await navigator.share({ title, url });
          return;
        } catch (e) {
          if (e?.name === 'AbortError') return;
        }
      }
      try {
        await navigator.clipboard.writeText(url);
        toast(t('common.linkCopied'));
      } catch {
        toast(url);
      }
    },
    [toast, t]
  );
}
