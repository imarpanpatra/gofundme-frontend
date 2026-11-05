import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import CreatorShell from '../components/CreatorShell.jsx';
import Modal from '../components/Modal.jsx';
import Spinner from '../components/Spinner.jsx';
import { KIND_META } from '../components/studio/productKinds.jsx';
import { api } from '../lib/api.js';
import { payWith } from '../lib/checkout.js';
import { formatMoney, themeVars } from '../lib/format.js';
import { useToast } from '../context/ToastContext.jsx';

function ProductThumb({ product }) {
  const meta = KIND_META[product.kind] || KIND_META.custom;
  return product.image ? (
    <img src={product.image} alt="" className="product-img" loading="lazy" />
  ) : (
    <div className="product-img product-placeholder" style={{ background: meta.bg }}>
      {meta.icon}
    </div>
  );
}

function PurchaseDone({ purchase, onClose, creator }) {
  return (
    <Modal title="Purchase complete" onClose={onClose} width={460} style={themeVars(creator.themeColor)}>
      <div className="thanks">
        <h3>Thank you for your purchase!</h3>
        <p className="thanks-amount">{purchase.title}</p>
        {purchase.deliveryNote && <p className="delivery-note">{purchase.deliveryNote}</p>}
        {purchase.deliveryUrl && (
          <a href={purchase.deliveryUrl} target="_blank" rel="noopener noreferrer" className="support-btn">
            Open your purchase
          </a>
        )}
        <p className="muted">
          You can always find it again in <Link to="/account">My account</Link>. Razorpay will email you a receipt.
        </p>
      </div>
    </Modal>
  );
}

function ProductModal({ product, creator, user, onClose, onBought }) {
  const toast = useToast();
  const navigate = useNavigate();
  const [answer, setAnswer] = useState('');
  const [busy, setBusy] = useState(false);

  const buy = async () => {
    if (!user) {
      navigate('/signup', { state: { from: `/${creator.slug}/shop`, reason: `Create a free account to buy "${product.title}".` } });
      return;
    }
    if (product.question && !answer.trim()) {
      toast(`Please answer: ${product.question}`, 'error');
      return;
    }
    setBusy(true);
    try {
      const order = await api(`/shop/${creator.slug}/products/${product.id}/order`, { method: 'POST', body: { answer } });
      const support = await payWith(order, { creator, description: product.title, onFailed: (msg) => toast(msg, 'error') });
      if (support) {
        const overview = await api('/account/overview').catch(() => null);
        const purchase = overview?.purchases.find((p) => String(p.id) === String(support.id)) || { title: product.title };
        onBought(purchase);
      }
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal title={product.title} onClose={onClose} width={520} style={themeVars(creator.themeColor)}>
      <div className="product-detail">
        <ProductThumb product={product} />
        <p className="product-price">{formatMoney(product.price)}</p>
        {product.description && <p className="product-desc">{product.description}</p>}
        {product.stockLeft !== null && !product.soldOut && <p className="muted">{product.stockLeft} left</p>}
        {product.question && (
          <div className="field">
            <label htmlFor="buyer-answer">{product.question}</label>
            <textarea id="buyer-answer" className="input-box input-sm" rows={2} maxLength={1000} value={answer} onChange={(e) => setAnswer(e.target.value)} />
          </div>
        )}
        <button type="button" className="support-btn" onClick={buy} disabled={busy || product.soldOut}>
          {busy ? <span className="dot-flashing" /> : product.soldOut ? 'Sold out' : `Buy ${formatMoney(product.price)}`}
        </button>
        {!user && <p className="support-account-note">You'll need a free account to buy.</p>}
      </div>
    </Modal>
  );
}

function Shop({ creator, user, reload }) {
  const [products, setProducts] = useState(null);
  const [error, setError] = useState('');
  const [open, setOpen] = useState(null);
  const [done, setDone] = useState(null);

  const load = () =>
    api(`/shop/${creator.slug}`)
      .then((d) => setProducts(d.products))
      .catch((err) => setError(err.message));

  useEffect(() => {
    load();
  }, [creator.slug]);

  if (error) return <p className="form-error">{error}</p>;
  if (!products) return <Spinner fullPage />;

  return (
    <>
      <section className="feature-box posts-box">
        <h1 className="posts-title">Shop</h1>
        {products.length === 0 ? (
          <p className="muted center-text">Nothing for sale yet.</p>
        ) : (
          <div className="product-grid">
            {products.map((p) => (
              <button key={p.id} type="button" className="product-card" onClick={() => setOpen(p)}>
                <ProductThumb product={p} />
                <p className="product-title">{p.title}</p>
                <p className="product-meta">
                  <strong>{formatMoney(p.price)}</strong>
                  {p.soldOut ? <span className="badge badge-muted">Sold out</span> : p.stockLeft !== null && <span className="muted"> · {p.stockLeft} left</span>}
                </p>
              </button>
            ))}
          </div>
        )}
      </section>
      {open && (
        <ProductModal
          product={open}
          creator={creator}
          user={user}
          onClose={() => setOpen(null)}
          onBought={(purchase) => {
            setOpen(null);
            setDone(purchase);
            load();
            reload();
          }}
        />
      )}
      {done && <PurchaseDone purchase={done} creator={creator} onClose={() => setDone(null)} />}
    </>
  );
}

export default function ShopPage() {
  return (
    <CreatorShell tab="shop" title="Shop" wide>
      {({ creator, user, reload }) => <Shop creator={creator} user={user} reload={reload} />}
    </CreatorShell>
  );
}
