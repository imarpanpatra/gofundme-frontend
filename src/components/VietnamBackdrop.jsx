import { useEffect, useState } from 'react';
import { useI18n } from '../i18n/index.jsx';

const BACKDROPS = [
  {
    src: '/hof/trang-an.jpg',
    place: 'Tràng An',
    url: 'https://commons.wikimedia.org/wiki/File:Trang_An_Landscape_Complex,_Ninh_Binh_Province,_Vietnam,_20240202_1456_5313.jpg',
  },
  {
    src: '/hof/sa-pa.jpg',
    place: 'Sa Pa',
    url: 'https://commons.wikimedia.org/wiki/File:Road_and_paddy_fields_in_Sa_Pa,_Vietnam,_20240126_1202_3586.jpg',
  },
  {
    src: '/hof/temple-of-literature.jpg',
    place: 'Temple of Literature, Hanoi',
    url: 'https://commons.wikimedia.org/wiki/File:Main_gate_of_the_Temple_of_Literature,_Hanoi,_Vietnam,_20240123_0929_3068.jpg',
  },
  {
    src: '/hof/ha-long-bay.jpg',
    place: 'Hạ Long Bay',
    url: 'https://commons.wikimedia.org/wiki/File:View_of_sea_from_Titov_Island,_Ha_Long_Bay,_Vietnam,_20240128_1337_3732.jpg',
  },
];

export default function VietnamBackdrop() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    const id = setInterval(() => setActive((n) => (n + 1) % BACKDROPS.length), 8000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="vn-bg" aria-hidden="true">
      {BACKDROPS.map((b, n) => (
        <div key={b.src} className={`vn-bg-slide${n === active ? ' active' : ''}`} style={{ backgroundImage: `url(${b.src})` }} />
      ))}
    </div>
  );
}

export function PhotoCredits() {
  const { tr } = useI18n();
  const photos = BACKDROPS.map((b, n) => (
    <span key={b.src}>
      {n > 0 && ', '}
      <a href={b.url} target="_blank" rel="noopener noreferrer">
        {b.place}
      </a>
    </span>
  ));
  return (
    <p className="vn-credits">
      {tr('photos.credits', {
        photos,
        license: (s) => (
          <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener noreferrer">
            {s}
          </a>
        ),
      })}
    </p>
  );
}
