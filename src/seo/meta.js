export const SITE_NAME = 'Go Fund My Trip';
export const DEFAULT_IMAGE = '/og-image.jpg';
export const CANONICAL_ORIGIN = 'https://gofundmytrip.imarpan.in';

export const siteOrigin = (url) => (/(^|\.)imarpan\.in$/.test(url.hostname) ? CANONICAL_ORIGIN : url.origin);

const INFO_TITLES = {
  about: 'About',
  contact: 'Contact',
  terms: 'Terms of Service',
  privacy: 'Privacy Policy',
  'refund-policy': 'Refund Policy',
  'return-policy': 'Return Policy',
  'shipping-policy': 'Shipping Policy',
  disclaimer: 'Disclaimer',
};

const PRIVATE_TITLES = {
  login: 'Log in',
  signup: 'Sign up',
  'forgot-password': 'Forgot password',
  'reset-password': 'Reset password',
  account: 'My account',
  dashboard: 'Dashboard',
};
const PRIVATE = new Set(Object.keys(PRIVATE_TITLES));
const SECTIONS = new Set(['itinerary', 'posts', 'membership', 'shop']);

export function routeOf(pathname) {
  const parts = String(pathname || '/')
    .split('/')
    .filter(Boolean)
    .map((p) => {
      try {
        return decodeURIComponent(p);
      } catch {
        return p;
      }
    });
  if (!parts.length) return { kind: 'home' };
  const [first, second, third] = parts;
  if (PRIVATE.has(first)) return { kind: 'private', name: first };
  if (first === 'hall-of-fame' && parts.length === 1) return { kind: 'hof' };
  if (INFO_TITLES[first] && parts.length === 1) return { kind: 'info', name: first };
  if (first.startsWith('@') && parts.length === 1) return { kind: 'profile', username: first.slice(1) };
  if (parts.length === 1) return { kind: 'creator', slug: first };
  if (parts.length === 2 && SECTIONS.has(second)) return { kind: second, slug: first };
  if (parts.length === 3 && second === 'posts') return { kind: 'post', slug: first, postSlug: third };
  return { kind: 'missing' };
}

export const plainText = (html) =>
  String(html || '')
    .replace(/<(script|style)[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<\/(p|div|h\d|li|br)>|<br\s*\/?>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();

export function clip(text, max = 158) {
  const s = String(text || '').replace(/\s+/g, ' ').trim();
  if (s.length <= max) return s;
  const cut = s.slice(0, max - 1);
  const at = cut.lastIndexOf(' ');
  return `${(at > max * 0.6 ? cut.slice(0, at) : cut).replace(/[\s,.;:!?–-]+$/, '')}…`;
}

const stripEmoji = (s) =>
  String(s || '')
    .replace(/[\p{Extended_Pictographic}\p{Regional_Indicator}\u{FE0F}\u{200D}\u{20E3}]/gu, '')
    .replace(/\s+/g, ' ')
    .trim();

export const brandOf = (creator) => stripEmoji(creator?.siteName) || stripEmoji(creator?.name) || SITE_NAME;

const absolute = (origin, url) => (!url ? '' : /^https?:\/\//i.test(url) ? url : `${origin}${url.startsWith('/') ? '' : '/'}${url}`);

const aboutText = (creator) => plainText(creator?.about);

function creatorSummary(creator) {
  if (creator?.seoDescription) return creator.seoDescription;
  const about = aboutText(creator);
  if (about) return clip(about);
  const dest = creator?.destination;
  return dest
    ? `Follow ${creator.name}'s ${dest} trip: the itinerary, travel stories, photos and tips. Chip in to help make it happen.`
    : `Follow ${creator?.name || 'this'} trip and chip in to help make it happen.`;
}

function personLd(creator, origin) {
  return {
    '@type': 'Person',
    name: creator.name,
    url: `${origin}/${creator.slug}`,
    ...(creator.avatar ? { image: absolute(origin, creator.avatar) } : {}),
    ...(creator.links?.length ? { sameAs: creator.links } : {}),
  };
}

function crumbs(origin, items) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map(([name, path], i) => ({ '@type': 'ListItem', position: i + 1, name, item: `${origin}${path}` })),
  };
}

export function buildSeo(kind, data = {}, origin = '') {
  const { creator } = data;
  const brand = brandOf(creator);
  const dest = creator?.destination || '';
  const base = { siteName: brand, image: absolute(origin, DEFAULT_IMAGE), imageIsDefault: true, type: 'website' };
  const home = creator ? `/${creator.slug}` : '/';
  const website = { '@type': 'WebSite', name: brand, url: `${origin}/` };

  if (kind === 'creator' && creator) {
    const title = dest ? `${dest} Trip: Itinerary, Travel Stories & Tips | ${brand}` : brand === creator.name ? brand : `${brand} by ${creator.name}`;
    const description = creatorSummary(creator);
    return {
      ...base,
      title,
      description,
      path: home,
      jsonLd: [
        website,
        {
          '@type': 'ProfilePage',
          name: title,
          description,
          url: `${origin}${home}`,
          mainEntity: personLd(creator, origin),
        },
      ],
    };
  }

  if (kind === 'itinerary' && creator) {
    const items = (data.items || []).filter((m) => m.active !== false);
    const days = items.reduce((n, m) => Math.max(n, Number(m.day) || 0), 0);
    const places = [...new Set(items.map((m) => (m.place || m.title || '').trim()).filter(Boolean))];
    const label = dest ? `${dest} Itinerary` : 'Trip Itinerary';
    const title = days ? `${days}-Day ${label}: Day-by-Day Trip Plan | ${brand}` : `${label}: Day-by-Day Trip Plan | ${brand}`;
    const lead = `Day-by-day ${dest ? `${dest} ` : ''}itinerary${days ? ` for ${days} day${days > 1 ? 's' : ''}` : ''}`;
    const description = clip(`${lead}${places.length ? `: ${places.slice(0, 6).join(', ')}` : ''}. See the plan, costs and photos, and sponsor a moment of the trip.`);
    const path = `${home}/itinerary`;
    return {
      ...base,
      title,
      description,
      path,
      jsonLd: [
        {
          '@type': 'TouristTrip',
          name: title.replace(` | ${brand}`, ''),
          description,
          url: `${origin}${path}`,
          provider: personLd(creator, origin),
          ...(items.length
            ? {
                itinerary: {
                  '@type': 'ItemList',
                  numberOfItems: items.length,
                  itemListElement: items.map((m, i) => ({
                    '@type': 'ListItem',
                    position: i + 1,
                    item: {
                      '@type': 'TouristAttraction',
                      name: `Day ${m.day}: ${m.title}`,
                      ...(m.description ? { description: clip(m.description, 300) } : {}),
                      ...(m.place ? { address: m.place } : {}),
                      ...(m.image ? { image: absolute(origin, m.image) } : {}),
                    },
                  })),
                },
              }
            : {}),
        },
        crumbs(origin, [[brand, home], [label, path]]),
      ],
    };
  }

  if (kind === 'posts' && creator) {
    const title = dest ? `${dest} Travel Stories & Tips | ${brand}` : `Posts | ${brand}`;
    const description = clip(
      dest
        ? `Travel stories, photos and practical tips from ${creator.name}'s ${dest} trip: places, food, costs and hidden gems.`
        : `Posts and updates from ${creator.name}.`
    );
    const path = `${home}/posts`;
    const posts = data.posts || [];
    return {
      ...base,
      title,
      description,
      path,
      jsonLd: [
        {
          '@type': 'Blog',
          name: title.replace(` | ${brand}`, ''),
          description,
          url: `${origin}${path}`,
          author: personLd(creator, origin),
          ...(posts.length
            ? {
                blogPost: posts.slice(0, 20).map((p) => ({
                  '@type': 'BlogPosting',
                  headline: p.title,
                  url: `${origin}${path}/${p.slug}`,
                  ...(p.publishedAt ? { datePublished: p.publishedAt } : {}),
                })),
              }
            : {}),
        },
        crumbs(origin, [[brand, home], ['Posts', path]]),
      ],
    };
  }

  if (kind === 'post' && creator && data.post) {
    const { post } = data;
    const path = `${home}/posts/${post.slug}`;
    const description = clip(post.excerpt || plainText(post.html) || `A post by ${creator.name}.`);
    const image = post.cover ? absolute(origin, post.cover) : base.image;
    return {
      ...base,
      title: `${post.title} | ${brand}`,
      description,
      path,
      type: 'article',
      image,
      imageIsDefault: !post.cover,
      publishedTime: post.publishedAt || '',
      jsonLd: [
        {
          '@type': 'BlogPosting',
          headline: post.title,
          description,
          url: `${origin}${path}`,
          mainEntityOfPage: `${origin}${path}`,
          image,
          ...(post.publishedAt ? { datePublished: post.publishedAt } : {}),
          author: personLd(creator, origin),
          publisher: { '@type': 'Organization', name: brand },
        },
        crumbs(origin, [[brand, home], ['Posts', `${home}/posts`], [post.title, path]]),
      ],
    };
  }

  if ((kind === 'membership' || kind === 'shop') && creator) {
    const name = kind === 'membership' ? 'Membership' : 'Shop';
    return {
      ...base,
      title: `${name} | ${brand}`,
      description: clip(
        kind === 'membership'
          ? `Become a member and support ${creator.name}${dest ? `'s ${dest} trip` : ''} every month.`
          : `Shop from ${creator.name}${dest ? ` and help fund the ${dest} trip` : ''}.`
      ),
      path: `${home}/${kind}`,
    };
  }

  if (kind === 'hof') {
    return {
      ...base,
      title: `Hall of Fame: Top Supporters | ${brand}`,
      description: clip(`The people who made ${creator ? `${creator.name}'s ` : 'this '}${dest ? `${dest} ` : ''}trip possible, ranked by support.`),
      path: '/hall-of-fame',
    };
  }

  if (kind === 'info') {
    const name = INFO_TITLES[data.name] || 'About';
    return {
      ...base,
      title: `${name} | ${brand}`,
      description: data.name === 'about' && creator ? creatorSummary(creator) : `${name} for ${brand}.`,
      path: `/${data.name}`,
    };
  }

  if (kind === 'profile' && data.profile) {
    const p = data.profile;
    return {
      ...base,
      title: `${p.name ? `${p.name} (@${p.username})` : `@${p.username}`} | ${brand}`,
      description: clip(p.bio || `${p.name || `@${p.username}`} supports trips on ${brand}.`),
      path: `/@${p.username}`,
      noindex: true,
    };
  }

  if (kind === 'private') {
    const name = PRIVATE_TITLES[data.name];
    return { ...base, title: name ? `${name} | ${brand}` : brand, description: creatorSummary(creator), path: `/${data.name || ''}`, noindex: true };
  }

  return { ...base, title: `Page not found | ${brand}`, description: '', path: data.path || '/', noindex: true };
}

const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

export const ldJson = (seo) =>
  seo.jsonLd?.length ? JSON.stringify({ '@context': 'https://schema.org', '@graph': seo.jsonLd }).replace(/</g, '\\u003c') : '';

export function headTags(seo, origin) {
  const url = `${origin}${seo.path}`;
  const tags = [
    `<title>${esc(seo.title)}</title>`,
    seo.description ? `<meta name="description" content="${esc(seo.description)}" />` : '',
    seo.noindex ? '<meta name="robots" content="noindex, follow" />' : '<meta name="robots" content="index, follow, max-image-preview:large" />',
    `<link rel="canonical" href="${esc(url)}" />`,
    `<meta property="og:type" content="${seo.type}" />`,
    `<meta property="og:site_name" content="${esc(seo.siteName)}" />`,
    `<meta property="og:title" content="${esc(seo.title)}" />`,
    seo.description ? `<meta property="og:description" content="${esc(seo.description)}" />` : '',
    `<meta property="og:url" content="${esc(url)}" />`,
    `<meta property="og:image" content="${esc(seo.image)}" />`,
    seo.imageIsDefault ? '<meta property="og:image:width" content="1200" />\n<meta property="og:image:height" content="630" />' : '',
    '<meta property="og:locale" content="en_IN" />',
    seo.publishedTime ? `<meta property="article:published_time" content="${esc(seo.publishedTime)}" />` : '',
    '<meta name="twitter:card" content="summary_large_image" />',
    `<meta name="twitter:title" content="${esc(seo.title)}" />`,
    seo.description ? `<meta name="twitter:description" content="${esc(seo.description)}" />` : '',
    `<meta name="twitter:image" content="${esc(seo.image)}" />`,
    ldJson(seo) ? `<script type="application/ld+json" id="seo-ld">${ldJson(seo)}</script>` : '',
  ];
  return tags.filter(Boolean).join('\n    ');
}
