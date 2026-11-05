import { useEffect, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import CreatorPage from './pages/CreatorPage.jsx';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
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
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/terms" element={<Policy kind="terms" />} />
      <Route path="/privacy" element={<Policy kind="privacy" />} />
      <Route path="/refund-policy" element={<Policy kind="refund" />} />
      <Route path="/return-policy" element={<Policy kind="return" />} />
      <Route path="/disclaimer" element={<Policy kind="disclaimer" />} />
      <Route path="/:slug" element={<CreatorPage />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
