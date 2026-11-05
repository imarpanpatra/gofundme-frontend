import { useEffect, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import CreatorPage from './pages/CreatorPage.jsx';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import HallOfFame from './pages/HallOfFame.jsx';
import StudioLayout from './components/studio/StudioLayout.jsx';
import StudioHome from './pages/studio/StudioHome.jsx';
import StudioSupporters from './pages/studio/StudioSupporters.jsx';
import StudioMemberships from './pages/studio/StudioMemberships.jsx';
import StudioShop from './pages/studio/StudioShop.jsx';
import StudioPosts from './pages/studio/StudioPosts.jsx';
import StudioMessages from './pages/studio/StudioMessages.jsx';
import StudioSettings from './pages/studio/StudioSettings.jsx';
import PostEditor from './pages/studio/PostEditor.jsx';
import PostsPage from './pages/PostsPage.jsx';
import PostPage from './pages/PostPage.jsx';
import MembershipPage from './pages/MembershipPage.jsx';
import ShopPage from './pages/ShopPage.jsx';
import AccountPage from './pages/AccountPage.jsx';
import NotFound from './pages/NotFound.jsx';
import Policy from './pages/Policy.jsx';
import About from './pages/About.jsx';
import Contact from './pages/Contact.jsx';
import Spinner from './components/Spinner.jsx';
import { api } from './lib/api.js';

function Home() {
  const [slug, setSlug] = useState(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    api('/pages/default')
      .then((d) => setSlug(d.slug))
      .catch(() => setFailed(true));
  }, []);

  if (failed) return <NotFound />;
  if (!slug) return <Spinner fullPage />;
  return <Navigate to={`/${slug}`} replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/account" element={<AccountPage />} />
      <Route path="/dashboard/posts/new" element={<PostEditor />} />
      <Route path="/dashboard/posts/:id/edit" element={<PostEditor />} />
      <Route path="/dashboard" element={<StudioLayout />}>
        <Route index element={<StudioHome />} />
        <Route path="supporters" element={<StudioSupporters />} />
        <Route path="memberships" element={<StudioMemberships />} />
        <Route path="shop" element={<StudioShop />} />
        <Route path="posts" element={<StudioPosts />} />
        <Route path="messages" element={<StudioMessages />} />
        <Route path="settings" element={<StudioSettings />} />
      </Route>
      <Route path="/hall-of-fame" element={<HallOfFame />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/terms" element={<Policy kind="terms" />} />
      <Route path="/privacy" element={<Policy kind="privacy" />} />
      <Route path="/refund-policy" element={<Policy kind="refund" />} />
      <Route path="/return-policy" element={<Policy kind="return" />} />
      <Route path="/shipping-policy" element={<Policy kind="return" />} />
      <Route path="/disclaimer" element={<Policy kind="disclaimer" />} />
      <Route path="/:slug" element={<CreatorPage />} />
      <Route path="/:slug/posts" element={<PostsPage />} />
      <Route path="/:slug/posts/:postSlug" element={<PostPage />} />
      <Route path="/:slug/membership" element={<MembershipPage />} />
      <Route path="/:slug/shop" element={<ShopPage />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
