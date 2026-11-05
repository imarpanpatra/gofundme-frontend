import { useCallback } from 'react';
import { useToast } from '../context/ToastContext.jsx';

export function useShare() {
  const toast = useToast();
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
        toast('Link copied to clipboard');
      } catch {
        toast(url);
      }
    },
    [toast]
  );
}
