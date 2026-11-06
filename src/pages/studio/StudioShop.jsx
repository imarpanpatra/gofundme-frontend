import { useCallback, useEffect, useRef, useState } from 'react';
import Modal from '../../components/Modal.jsx';
import Spinner from '../../components/Spinner.jsx';
import { BagIcon, ImageIcon } from '../../components/icons.jsx';
import { KIND_META, TEMPLATE_ORDER } from '../../components/studio/productKinds.jsx';
import { TransactionsPanel } from './StudioSupporters.jsx';
import { api } from '../../lib/api.js';
import { MIN_AMOUNT } from '../../lib/checkout.js';
import { prepareImage } from '../../lib/image.js';
import { formatMoney } from '../../lib/format.js';
import { useToast } from '../../context/ToastContext.jsx';

function ProductModal({ product, kind, onClose, onSaved }) {
  const toast = useToast();
  const imageInput = useRef(null);
  const fileInput = useRef(null);
  const defaults = KIND_META[kind]?.defaults || {};
  const [form, setForm] = useState({
    kind: product?.kind || kind || 'custom',
    title: product?.title ?? defaults.title ?? '',
    price: product ? String(product.price) : '',
    description: product?.description ?? '',
    image: product?.image ?? '',
    stock: product?.stock === null || product?.stock === undefined ? defaults.stock ?? '' : String(product.stock),
    question: product?.question ?? defaults.question ?? '',
    deliveryNote: product?.deliveryNote ?? defaults.deliveryNote ?? '',
    deliveryUrl: product?.deliveryUrl ?? '',
  });
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState('');
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const upload = async (file, field) => {
    if (!file) return;
    setUploading(field);
    try {
      const body = new FormData();
      body.append('file', field === 'image' ? await prepareImage(file, 1600, 1600) : file);
      const { url } = await api('/studio/uploads', { method: 'POST', form: body });
      setForm((f) => ({ ...f, [field === 'image' ? 'image' : 'deliveryUrl']: url }));
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setUploading('');
    }
  };

  const save = async () => {
    setBusy(true);
    try {
      const body = { ...form, price: Number(form.price), stock: form.stock === '' ? null : Number(form.stock) };
      if (product) await api(`/studio/products/${product.id}`, { method: 'PUT', body });
      else await api('/studio/products', { method: 'POST', body });
      toast(product ? 'Item updated' : 'Item published to your shop');
      onSaved();
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal title={product ? 'Edit item' : KIND_META[form.kind]?.label || 'New item'} onClose={onClose} width={600}>
      <div className="form-grid">
        <div className="product-image-edit">
          <button type="button" className="image-drop" onClick={() => imageInput.current.click()} disabled={uploading === 'image'}>
            {form.image ? <img src={form.image} alt="" /> : uploading === 'image' ? <Spinner /> : (
              <>
                <ImageIcon width={26} height={26} />
                <span>Add a cover image</span>
              </>
            )}
          </button>
          <input ref={imageInput} type="file" accept="image/*" hidden onChange={(e) => (upload(e.target.files[0], 'image'), (e.target.value = ''))} />
          {form.image && (
            <button type="button" className="text-link" onClick={() => setForm((f) => ({ ...f, image: '' }))}>
              Remove image
            </button>
          )}
        </div>
        <div className="contact-row">
          <div className="field">
            <label htmlFor="p-title">Title</label>
            <input id="p-title" className="input-box input-sm" maxLength={120} value={form.title} onChange={set('title')} />
          </div>
          <div className="field">
            <label htmlFor="p-price">Price (₹)</label>
            <input id="p-price" className="input-box input-sm" type="number" min={MIN_AMOUNT} value={form.price} onChange={set('price')} />
          </div>
        </div>
        <div className="field">
          <label htmlFor="p-desc">Description</label>
          <textarea id="p-desc" className="input-box input-sm" rows={3} maxLength={3000} value={form.description} onChange={set('description')} />
        </div>
        <div className="contact-row">
          <div className="field">
            <label htmlFor="p-stock">Quantity available</label>
            <input id="p-stock" className="input-box input-sm" type="number" min="0" placeholder="Unlimited" value={form.stock} onChange={set('stock')} />
          </div>
          <div className="field">
            <label htmlFor="p-q">Ask the buyer (optional)</label>
            <input id="p-q" className="input-box input-sm" maxLength={200} placeholder="e.g. Your Instagram username" value={form.question} onChange={set('question')} />
          </div>
        </div>
        <div className="field-group">
          <h3>After purchase</h3>
          <p className="muted">Only the buyer sees this, on the confirmation screen and in their account.</p>
          <div className="field">
            <label htmlFor="p-note">Message to the buyer</label>
            <textarea id="p-note" className="input-box input-sm" rows={2} maxLength={2000} value={form.deliveryNote} onChange={set('deliveryNote')} />
          </div>
          <div className="field">
            <label htmlFor="p-url">Download or access link (optional)</label>
            <div className="input-with-btn">
              <input id="p-url" className="input-box input-sm" placeholder="https://…" value={form.deliveryUrl} onChange={set('deliveryUrl')} />
              <button type="button" className="pill-btn pill-outline pill-sm" onClick={() => fileInput.current.click()} disabled={uploading === 'file'}>
                {uploading === 'file' ? <Spinner small /> : 'Upload file'}
              </button>
            </div>
            <span className="field-hint">Upload a PDF, ZIP, image or video up to 4MB, or paste a link (Google Drive, Dropbox…).</span>
            <input ref={fileInput} type="file" accept=".pdf,.zip,image/*,video/mp4,video/webm" hidden onChange={(e) => (upload(e.target.files[0], 'file'), (e.target.value = ''))} />
          </div>
        </div>
      </div>
      <div className="form-actions">
        <button type="button" className="pill-btn pill-outline" onClick={onClose}>
          Cancel
        </button>
        <button type="button" className="pill-btn pill-theme" onClick={save} disabled={busy || Boolean(uploading)}>
          {busy ? <Spinner small /> : product ? 'Save item' : 'Publish item'}
        </button>
      </div>
    </Modal>
  );
}

export default function StudioShop() {
  const toast = useToast();
  const [products, setProducts] = useState(null);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(null);
  const [ordersKey, setOrdersKey] = useState(0);

  const load = useCallback(() => {
    api('/studio/products')
      .then((d) => setProducts(d.products))
      .catch((err) => setError(err.message));
  }, []);

  useEffect(() => {
    document.title = 'Shop';
    load();
  }, [load]);

  const toggle = async (p) => {
    try {
      if (p.active) {
        const r = await api(`/studio/products/${p.id}`, { method: 'DELETE' });
        toast(r.archived ? 'Item hidden from your shop' : 'Item deleted');
      } else {
        await api(`/studio/products/${p.id}`, { method: 'PUT', body: { active: true } });
        toast('Item is back in your shop');
      }
      load();
    } catch (err) {
      toast(err.message, 'error');
    }
  };

  return (
    <div className="studio-stack">
      <h1 className="studio-title">Shop</h1>
      <section className="studio-card">
        <h2 className="center-text listing-title">Add a new listing</h2>
        <p className="muted center-text">Pick a template or start from scratch</p>
        <div className="template-grid">
          {TEMPLATE_ORDER.map((kind) => (
            <button
              key={kind}
              type="button"
              className={`template-tile${kind === 'custom' ? ' is-scratch' : ''}`}
              style={{ background: KIND_META[kind].bg }}
              onClick={() => setEditing({ kind })}
            >
              {kind === 'custom' ? '+ Start from scratch' : (
                <>
                  {KIND_META[kind].icon}
                  <span>{KIND_META[kind].label}</span>
                </>
              )}
            </button>
          ))}
        </div>
      </section>

      <section className="studio-card">
        {error && <p className="form-error">{error}</p>}
        {!products && !error && <Spinner />}
        {products && products.length === 0 && (
          <div className="studio-empty">
            <span className="studio-empty-icon">
              <BagIcon width={26} height={26} />
            </span>
            <h3>You haven't added anything yet.</h3>
            <p className="muted">Sell anything your audience would love: a guide, a preset, a shoutout, or something uniquely yours.</p>
          </div>
        )}
        {products && products.length > 0 && (
          <>
            <h2 className="dash-h2">Your listings</h2>
            <div className="studio-products">
              {products.map((p) => (
                <div key={p.id} className={`studio-product${p.active ? '' : ' is-archived'}`}>
                  {p.image ? (
                    <img src={p.image} alt="" />
                  ) : (
                    <div className="studio-product-ph" style={{ background: KIND_META[p.kind]?.bg }}>
                      {KIND_META[p.kind]?.icon}
                    </div>
                  )}
                  <div className="studio-product-body">
                    <p className="product-title">{p.title}</p>
                    <p className="supporter-time">
                      {formatMoney(p.price)} · {p.sold} sold
                      {p.stock !== null && ` · ${p.stock} left`}
                      {!p.active && ' · hidden'}
                    </p>
                    <div className="row-actions">
                      <button type="button" className="pill-btn pill-outline pill-sm" onClick={() => setEditing({ product: p })}>
                        Edit
                      </button>
                      <button type="button" className="pill-btn pill-outline pill-sm" onClick={() => toggle(p)}>
                        {p.active ? (p.sold > 0 ? 'Hide' : 'Delete') : 'Show'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </section>

      <TransactionsPanel key={ordersKey} type="shop" title="Orders" />

      {editing && (
        <ProductModal
          product={editing.product}
          kind={editing.kind}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            load();
            setOrdersKey((k) => k + 1);
          }}
        />
      )}
    </div>
  );
}
