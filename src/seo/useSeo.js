import { useEffect } from 'react';
import { buildSeo, headTags, siteOrigin } from './meta.js';

const MANAGED = [
  'title',
  'meta[name="description"]',
  'meta[name="robots"]',
  'link[rel="canonical"]',
  'meta[property^="og:"]',
  'meta[property^="article:"]',
  'meta[name^="twitter:"]',
  'script#seo-ld',
].join(',');

export function applySeo(seo) {
  if (!seo) return;
  const head = document.head;
  head.querySelectorAll(MANAGED).forEach((el) => el.remove());
  const tpl = document.createElement('template');
  tpl.innerHTML = headTags(seo, siteOrigin(window.location));
  head.append(tpl.content);
}

export default function useSeo(kind, data, ready = true) {
  const key = ready ? JSON.stringify([kind, data]) : '';
  useEffect(() => {
    if (!key) return;
    const [k, d] = JSON.parse(key);
    applySeo(buildSeo(k, d, siteOrigin(window.location)));
  }, [key]);
}

export function useNoindex() {
  useEffect(() => {
    let tag = document.head.querySelector('meta[name="robots"]');
    if (!tag) {
      tag = document.createElement('meta');
      tag.name = 'robots';
      document.head.append(tag);
    }
    tag.content = 'noindex, follow';
  }, []);
}
