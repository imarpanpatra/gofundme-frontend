import { assetUrl } from '../lib/api.js';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Dropdown, { DropdownItem } from './Dropdown.jsx';
import { MenuIcon, MoreIcon, PlusIcon, ShareIcon, TrophyIcon } from './icons.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useShare } from '../lib/useShare.js';
import { initials } from '../lib/format.js';

function AccountMenu({ user, isCreator, logout, children }) {
  return (
    <Dropdown
      trigger={({ toggle, open }) => (
        <button type="button" className="menu-pill" onClick={toggle} aria-haspopup="menu" aria-expanded={open} aria-label="Account menu">
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
      {isCreator && <DropdownItem as={Link} href="/dashboard">Dashboard</DropdownItem>}
      <DropdownItem as={Link} href="/account">My account</DropdownItem>
      <DropdownItem onClick={logout}>Log out</DropdownItem>
    </Dropdown>
  );
}

export function tabsFor(creator) {
  const t = creator.tabs || {};
  return [
    ['home', 'Home', `/${creator.slug}`],
    t.posts > 0 && ['posts', 'Posts', `/${creator.slug}/posts`],
    t.membership && ['membership', 'Membership', `/${creator.slug}/membership`],
    t.shop > 0 && ['shop', 'Shop', `/${creator.slug}/shop`],
    ['hall-of-fame', 'Hall of Fame', '/hall-of-fame'],
  ].filter(Boolean);
}

export default function Header({ creator, isOwner, onEdit, tab = 'home' }) {
  const { user, logout, isCreator } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const share = useShare();
  const pageUrl = creator ? `${window.location.origin}/${creator.slug}` : window.location.href;
  const doShare = () => share(pageUrl, creator?.name);
  const authState = { from: location.pathname };
  const hallOfFame = (
    <DropdownItem as={Link} href="/hall-of-fame" icon={<TrophyIcon width={18} height={18} />}>
      Hall of Fame
    </DropdownItem>
  );

  return (
    <header className="site-header">
      <div className="header-inner">
        <div className="header-left">
          {creator && (
            <Link to={`/${creator.slug}`} className="header-creator">
              {creator.avatar ? (
                <img src={assetUrl(creator.avatar)} alt={creator.slug} className="header-avatar" />
              ) : (
                <span className="header-avatar header-avatar-fallback">{creator.name[0]}</span>
              )}
              <span className="header-name">{creator.name}</span>
            </Link>
          )}
        </div>

        {creator && (
          <nav className="header-tabs" aria-label="Page sections">
            {tabsFor(creator).map(([key, label, to]) => (
              <Link key={key} to={to} className={`header-tab${tab === key ? ' active' : ''}`}>
                {label}
              </Link>
            ))}
          </nav>
        )}

        <div className="header-right">
          {isOwner ? (
            <>
              <button type="button" className="circle-btn" onClick={doShare} aria-label="Share your page">
                <ShareIcon />
              </button>
              {onEdit && (
                <button type="button" className="pill-btn pill-outline hide-sm" onClick={onEdit}>
                  Edit page
                </button>
              )}
              <Dropdown
                className="hide-sm"
                trigger={({ toggle, open }) => (
                  <button type="button" className="pill-btn pill-theme" onClick={toggle} aria-haspopup="menu" aria-expanded={open}>
                    <PlusIcon width={18} height={18} strokeWidth={2.2} /> Create
                  </button>
                )}
              >
                <DropdownItem as={Link} href="/dashboard/posts/new">Write a post</DropdownItem>
                <DropdownItem as={Link} href="/dashboard/shop">Add a shop item</DropdownItem>
                <DropdownItem as={Link} href="/dashboard/memberships">Membership tiers</DropdownItem>
              </Dropdown>
              <AccountMenu
                user={user}
                isCreator={isCreator}
                logout={() => {
                  logout();
                  navigate(`/${creator.slug}`);
                }}
              >
                <DropdownItem as={Link} href={`/${creator.slug}`}>View page</DropdownItem>
                {hallOfFame}
                {onEdit && <DropdownItem onClick={onEdit}>Edit page</DropdownItem>}
              </AccountMenu>
            </>
          ) : (
            <>
              <Dropdown
                trigger={({ toggle, open }) => (
                  <button type="button" className="icon-btn" onClick={toggle} aria-label="More options" aria-haspopup="menu" aria-expanded={open}>
                    <MoreIcon />
                  </button>
                )}
              >
                <DropdownItem icon={<ShareIcon width={18} height={18} />} onClick={doShare}>
                  Share
                </DropdownItem>
                {hallOfFame}
              </Dropdown>
              {user ? (
                <AccountMenu user={user} isCreator={isCreator} logout={logout} />
              ) : (
                <>
                  <Link to="/login" state={authState} className="text-link">
                    Login
                  </Link>
                  <Link to="/signup" state={authState} className="pill-btn pill-theme pill-sm">
                    Sign up
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
