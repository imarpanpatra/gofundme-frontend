import { buildSeo, headTags, routeOf, siteOrigin } from '../../src/seo/meta.js';

const API = (globalThis.Netlify?.env?.get('SEO_API_URL') || 'https://gofundme-backend.vercel.app').replace(/\/$/, '');

async function getJson(path) {
  const res = await fetch(`${API}/api${path}`, {
    headers: { accept: 'application/json', 'x-gfm-prerender': '1' },
    signal: AbortSignal.timeout(3000),
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`API ${res.status}`);
  return res.json();
}

const enc = (s) => encodeURIComponent(s);

const redirect = (location, status = 301) =>
  new Response(null, { status, headers: { location, 'cache-control': status === 301 ? 'public, max-age=3600' : 'no-cache' } });

async function resolve(route, url, origin) {
  const k = route.kind;
  if (k === 'private') return { seo: buildSeo('private', { name: route.name }, origin) };
  if (k === 'missing') return { seo: buildSeo('missing', { path: url.pathname }, origin), status: 404 };

  if (k === 'home' || k === 'hof' || k === 'info') {
    const d = await getJson('/pages/default');
    if (k === 'home') return d?.slug ? { redirect: `/${d.slug}`, status: 302 } : null;
    return { seo: buildSeo(k, { creator: d?.creator, name: route.name }, origin) };
  }

  if (k === 'profile') {
    const d = await getJson(`/profiles/${enc(route.username)}`);
    if (!d) return { seo: buildSeo('missing', { path: url.pathname }, origin), status: 404 };
    if (d.redirect) return { redirect: d.redirect };
    const site = await getJson('/pages/default');
    return { seo: buildSeo('profile', { creator: site?.creator, profile: d.profile }, origin) };
  }

  const [page, extra] = await Promise.all([
    getJson(`/pages/${enc(route.slug)}`),
    k === 'itinerary' ? getJson(`/pages/${enc(route.slug)}/itinerary`) : k === 'post' ? getJson(`/posts/${enc(route.slug)}/${enc(route.postSlug)}`) : null,
  ]);
  const creator = page?.creator;
  if (!creator || (k === 'post' && !extra?.post)) return { seo: buildSeo('missing', { path: url.pathname }, origin), status: 404 };
  if (creator.slug !== route.slug) return { redirect: url.pathname.replace(/^\/[^/]+/, `/${creator.slug}`) };
  if (k === 'itinerary') return { seo: buildSeo(k, { creator, items: extra?.items || [] }, origin) };
  if (k === 'post') return { seo: buildSeo(k, { creator, post: extra.post }, origin) };
  return { seo: buildSeo(k, { creator }, origin) };
}

export default async function seo(request, context) {
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (/\.[a-z0-9]{2,12}$/i.test(url.pathname)) return;

  const origin = siteOrigin(url);
  let result;
  try {
    result = await resolve(routeOf(url.pathname), url, origin);
  } catch {
    return;
  }
  if (!result) return;
  if (result.redirect) return redirect(`${result.redirect}${url.search}`, result.status);

  const fresh = new Request(request);
  fresh.headers.delete('if-none-match');
  fresh.headers.delete('if-modified-since');
  const res = await context.next(fresh);
  if (!(res.headers.get('content-type') || '').includes('text/html')) return res;
  const html = await res.text();
  const body = html.replace(/<!--seo-->[\s\S]*?<!--\/seo-->/, () => headTags(result.seo, origin));
  const headers = new Headers(res.headers);
  headers.delete('content-length');
  headers.delete('etag');
  headers.delete('last-modified');
  headers.set('cache-control', 'public, max-age=0, must-revalidate');
  headers.set('netlify-cdn-cache-control', 'public, durable, s-maxage=300, stale-while-revalidate=604800');
  if (result.seo.noindex) headers.set('x-robots-tag', 'noindex');
  return new Response(body, { status: result.status || res.status, headers });
}

export const config = {
  path: '/*',
  excludedPath: ['/assets/*', '/hof/*', '/*.ico', '/*.png', '/*.jpg', '/*.svg', '/*.xml', '/*.txt', '/*.webmanifest', '/*.json', '/*.js', '/*.css'],
  cache: 'manual',
};
