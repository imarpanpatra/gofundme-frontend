import { assetUrl } from '../lib/api.js';
import { Link, useNavigate } from 'react-router-dom';
import Dropdown, { DropdownItem } from './Dropdown.jsx';
import { MenuIcon, MoreIcon, PlusIcon, ShareIcon } from './icons.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useShare } from '../lib/useShare.js';

export default function Header({ creator, isOwner, onEdit, tab = 'home' }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const share = useShare();
  const pageUrl = creator ? `${window.location.origin}/${creator.slug}` : window.location.href;
  const doShare = () => share(pageUrl, creator?.name);

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

        {isOwner && (
          <nav className="header-tabs" aria-label="Page sections">
            <Link to={`/${creator.slug}`} className={`header-tab${tab === 'home' ? ' active' : ''}`}>
              Home
            </Link>
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
              <Link to="/dashboard" className="pill-btn pill-theme hide-sm">
                <PlusIcon width={18} height={18} strokeWidth={2.2} /> Create
              </Link>
              <Dropdown
                trigger={({ toggle, open }) => (
                  <button type="button" className="menu-pill" onClick={toggle} aria-haspopup="menu" aria-expanded={open}>
                    <MenuIcon />
                    {user?.avatar ? (
                      <img src={assetUrl(user.avatar)} alt="" className="menu-avatar" />
                    ) : (
                      <span className="menu-avatar menu-avatar-fallback">{user?.name?.[0]}</span>
                    )}
                  </button>
                )}
              >
                <DropdownItem as={Link} href={`/${creator.slug}`}>View page</DropdownItem>
                <DropdownItem as={Link} href="/dashboard">Dashboard</DropdownItem>
                {onEdit && <DropdownItem onClick={onEdit}>Edit page</DropdownItem>}
                <DropdownItem
                  onClick={() => {
                    logout();
                    navigate(`/${creator.slug}`);
                  }}
                >
                  Log out
                </DropdownItem>
              </Dropdown>
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
                {user && <DropdownItem as={Link} href="/dashboard">Dashboard</DropdownItem>}
              </Dropdown>
              {user ? (
                <button type="button" className="text-link" onClick={logout}>
                  Log out
                </button>
              ) : (
                <Link to="/login" state={{ from: creator ? `/${creator.slug}` : '/' }} className="text-link">
                  Login
                </Link>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  );
}
