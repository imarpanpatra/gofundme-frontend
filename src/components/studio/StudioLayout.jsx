import { useEffect, useState } from 'react';
import { Link, NavLink, Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import Dropdown, { DropdownItem } from '../Dropdown.jsx';
import Spinner from '../Spinner.jsx';
import ThemeToggle from '../ThemeToggle.jsx';
import {
  BagIcon,
  ChevronDownIcon,
  ExternalIcon,
  GearIcon,
  HeartIcon,
  HomeIcon,
  LockIcon,
  MailIcon,
  MenuIcon,
  PageIcon,
  PenIcon,
} from '../icons.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { assetUrl } from '../../lib/api.js';
import { initials, themeVars } from '../../lib/format.js';

function SideLink({ to, icon, children, end }) {
  return (
    <NavLink to={to} end={end} className={({ isActive }) => `side-link${isActive ? ' active' : ''}`}>
      <span className="side-icon">{icon}</span>
      <span>{children}</span>
    </NavLink>
  );
}

export default function StudioLayout() {
  const { user, ready, isCreator, logout, setUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [drawer, setDrawer] = useState(false);
  const [publishOpen, setPublishOpen] = useState(location.pathname.startsWith('/dashboard/posts'));

  useEffect(() => setDrawer(false), [location.pathname]);

  if (!ready) return <Spinner fullPage />;
  if (!user) return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  if (!isCreator) return <Navigate to="/account" replace />;

  return (
    <div className="studio" style={themeVars(user.themeColor)}>
      <aside className={`studio-side${drawer ? ' open' : ''}`}>
        <Link to="/dashboard" className="studio-brand" aria-label="Dashboard home">
          {user.avatar ? <img src={assetUrl(user.avatar)} alt="" /> : <span>{initials(user.name)}</span>}
        </Link>
        <nav className="side-nav" aria-label="Dashboard">
          <SideLink to="/dashboard" end icon={<HomeIcon />}>
            Home
          </SideLink>
          <a href={`/${user.slug}`} target="_blank" rel="noopener noreferrer" className="side-link">
            <span className="side-icon">
              <PageIcon />
            </span>
            <span>View page</span>
            <ExternalIcon width={18} height={18} className="side-trailing" />
          </a>

          <p className="side-heading">Monetize</p>
          <SideLink to="/dashboard/supporters" icon={<HeartIcon />}>
            Supporters
          </SideLink>
          <SideLink to="/dashboard/memberships" icon={<LockIcon />}>
            Memberships
          </SideLink>
          <SideLink to="/dashboard/shop" icon={<BagIcon />}>
            Shop
          </SideLink>
          <button type="button" className={`side-link${publishOpen ? ' expanded' : ''}`} onClick={() => setPublishOpen((o) => !o)} aria-expanded={publishOpen}>
            <span className="side-icon">
              <PenIcon />
            </span>
            <span>Publish</span>
            <ChevronDownIcon width={18} height={18} className="side-trailing side-chevron" />
          </button>
          {publishOpen && (
            <div className="side-sub">
              <SideLink to="/dashboard/posts" end>
                Posts
              </SideLink>
              <SideLink to="/dashboard/posts/new">Write a post</SideLink>
            </div>
          )}

          <p className="side-heading">Settings</p>
          <SideLink to="/dashboard/settings" icon={<GearIcon />}>
            Page settings
          </SideLink>
          <SideLink to="/dashboard/messages" icon={<MailIcon />}>
            Messages
          </SideLink>
        </nav>
      </aside>
      {drawer && <div className="studio-scrim" onClick={() => setDrawer(false)} />}

      <div className="studio-body">
        <header className="studio-top">
          <button type="button" className="icon-btn studio-burger" onClick={() => setDrawer(true)} aria-label="Open menu">
            <MenuIcon />
          </button>
          <ThemeToggle className="studio-theme" />
          <Dropdown
            trigger={({ toggle, open }) => (
              <button type="button" className="menu-pill studio-menu" onClick={toggle} aria-haspopup="menu" aria-expanded={open}>
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
            <DropdownItem as={Link} href={`/${user.slug}`}>View page</DropdownItem>
            <DropdownItem as={Link} href="/account">My account</DropdownItem>
            <DropdownItem
              onClick={() => {
                logout();
                navigate(`/${user.slug}`);
              }}
            >
              Log out
            </DropdownItem>
          </Dropdown>
        </header>
        <main className="studio-main">
          <Outlet context={{ creator: user, setCreator: (c) => setUser({ ...user, ...c }) }} />
        </main>
      </div>
    </div>
  );
}
