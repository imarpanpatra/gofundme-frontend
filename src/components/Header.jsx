import { assetUrl } from '../lib/api.js';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Dropdown, { DropdownItem } from './Dropdown.jsx';
import { GlobeIcon, MenuIcon, MoreIcon, PlusIcon, ShareIcon, TrophyIcon } from './icons.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useShare } from '../lib/useShare.js';
import { initials } from '../lib/format.js';
import { LanguageSwitcher, useI18n } from '../i18n/index.jsx';

function AccountMenu({ user, isCreator, logout, children }) {
  const { t } = useI18n();
  return (
    <Dropdown
      trigger={({ toggle, open }) => (
        <button type="button" className="menu-pill" onClick={toggle} aria-haspopup="menu" aria-expanded={open} aria-label={t('header.accountMenu')}>
          <MenuIcon />
          {user.avatar ? (
            <img src={assetUrl(user.avatar)} alt="" className="menu-avatar" />
          ) : (
            <span className="menu-avatar menu-avatar-fallback">{initials(user.name)}</span>
          )}
        </button>
      )}
    >
      <li role="none" className="dropdown-account">
        <strong>{user.name}</strong>
        <span>{user.email}</span>
      </li>
      {children}
      {isCreator && <DropdownItem as={Link} href="/dashboard">{t('header.dashboard')}</DropdownItem>}
      <DropdownItem as={Link} href="/account">{t('header.myAccount')}</DropdownItem>
      <DropdownItem onClick={logout}>{t('header.logout')}</DropdownItem>
    </Dropdown>
  );
}

export function tabsFor(creator, t) {
  const tabs = creator.tabs || {};
  return [
    ['home', t('tabs.home'), `/${creator.slug}`],
    tabs.posts > 0 && ['posts', t('tabs.posts'), `/${creator.slug}/posts`],
    tabs.membership && ['membership', t('tabs.membership'), `/${creator.slug}/membership`],
    tabs.shop > 0 && ['shop', t('tabs.shop'), `/${creator.slug}/shop`],
    ['hall-of-fame', t('tabs.hallOfFame'), '/hall-of-fame'],
  ].filter(Boolean);
}

export default function Header({ creator, isOwner, onEdit, tab = 'home' }) {
  const { user, logout, isCreator } = useAuth();
  const { t, lang, setLang } = useI18n();
  const navigate = useNavigate();
  const location = useLocation();
  const share = useShare();
  const pageUrl = creator ? `${window.location.origin}/${creator.slug}` : window.location.href;
  const doShare = () => share(pageUrl, creator?.name);
  const authState = { from: location.pathname };
  const hallOfFame = (
    <DropdownItem as={Link} href="/hall-of-fame" icon={<TrophyIcon width={18} height={18} />}>
      {t('tabs.hallOfFame')}
    </DropdownItem>
  );
  const switchLang = (
    <DropdownItem icon={<GlobeIcon width={18} height={18} />} onClick={() => setLang(lang === 'hi' ? 'en' : 'hi')}>
      <span lang={lang === 'hi' ? 'en' : 'hi'}>{t('header.switchLang')}</span>
    </DropdownItem>
  );

  return (
    <header className="site-header">
      <div className="header-inner">
        <div className="header-left">
          {creator && (
            <Link to={`/${creator.slug}`} className="header-creator">
              {creator.siteName ? (
                <span className="header-name header-brand">{creator.siteName}</span>
              ) : (
                <>
                  {creator.avatar ? (
                    <img src={assetUrl(creator.avatar)} alt={creator.slug} className="header-avatar" />
                  ) : (
                    <span className="header-avatar header-avatar-fallback">{creator.name[0]}</span>
                  )}
                  <span className="header-name">{creator.name}</span>
                </>
              )}
            </Link>
          )}
        </div>

        {creator && (
          <nav className="header-tabs" aria-label={t('header.sections')}>
            {tabsFor(creator, t).map(([key, label, to]) => (
              <Link key={key} to={to} className={`header-tab${tab === key ? ' active' : ''}`}>
                {label}
              </Link>
            ))}
          </nav>
        )}

        <div className="header-right">
          <LanguageSwitcher className="header-lang" />
          {isOwner ? (
            <>
              <button type="button" className="circle-btn" onClick={doShare} aria-label={t('header.shareYourPage')}>
                <ShareIcon />
              </button>
              {onEdit && (
                <button type="button" className="pill-btn pill-outline hide-sm" onClick={onEdit}>
                  {t('header.editPage')}
                </button>
              )}
              <Dropdown
                className="hide-sm"
                trigger={({ toggle, open }) => (
                  <button type="button" className="pill-btn pill-theme" onClick={toggle} aria-haspopup="menu" aria-expanded={open}>
                    <PlusIcon width={18} height={18} strokeWidth={2.2} /> {t('header.create')}
                  </button>
                )}
              >
                <DropdownItem as={Link} href="/dashboard/posts/new">{t('header.writePost')}</DropdownItem>
                <DropdownItem as={Link} href="/dashboard/shop">{t('header.addShopItem')}</DropdownItem>
                <DropdownItem as={Link} href="/dashboard/memberships">{t('header.membershipTiers')}</DropdownItem>
              </Dropdown>
              <AccountMenu
                user={user}
                isCreator={isCreator}
                logout={() => {
                  logout();
                  navigate(`/${creator.slug}`);
                }}
              >
                <DropdownItem as={Link} href={`/${creator.slug}`}>{t('header.viewPage')}</DropdownItem>
                {hallOfFame}
                {switchLang}
                {onEdit && <DropdownItem onClick={onEdit}>{t('header.editPage')}</DropdownItem>}
              </AccountMenu>
            </>
          ) : (
            <>
              <Dropdown
                trigger={({ toggle, open }) => (
                  <button type="button" className="icon-btn" onClick={toggle} aria-label={t('header.moreOptions')} aria-haspopup="menu" aria-expanded={open}>
                    <MoreIcon />
                  </button>
                )}
              >
                <DropdownItem icon={<ShareIcon width={18} height={18} />} onClick={doShare}>
                  {t('header.share')}
                </DropdownItem>
                {hallOfFame}
                {switchLang}
              </Dropdown>
              {user ? (
                <AccountMenu user={user} isCreator={isCreator} logout={logout} />
              ) : (
                <>
                  <Link to="/login" state={authState} className="text-link">
                    {t('header.login')}
                  </Link>
                  <Link to="/signup" state={authState} className="pill-btn pill-theme pill-sm">
                    {t('header.signup')}
                  </Link>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  );
}
