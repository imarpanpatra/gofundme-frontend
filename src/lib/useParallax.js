import { useEffect, useRef } from 'react';

export default function useParallax(key, drift = 1.4) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return undefined;
    let frame = 0;
    const update = () => {
      frame = 0;
      const height = el.offsetHeight || 1;
      const y = Math.min(Math.max(window.scrollY, 0), height * 1.5);
      el.style.transform = y ? `translate3d(0, ${(y * (1 + drift)).toFixed(1)}px, 0)` : '';
      const opacity = Math.max(1 - y / height, 0);
      el.style.opacity = y ? opacity.toFixed(3) : '';
      el.style.visibility = opacity ? '' : 'hidden';
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      el.style.transform = '';
      el.style.opacity = '';
      el.style.visibility = '';
    };
  }, [key, drift]);

  return ref;
}
