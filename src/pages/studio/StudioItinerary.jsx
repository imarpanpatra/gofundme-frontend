import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Modal from '../../components/Modal.jsx';
import Spinner from '../../components/Spinner.jsx';
import { ImageIcon, MapIcon, PinIcon, PlusIcon } from '../../components/icons.jsx';
import { api } from '../../lib/api.js';
import { MIN_AMOUNT } from '../../lib/checkout.js';
import { prepareImage } from '../../lib/image.js';
import { formatMoney } from '../../lib/format.js';
import { useToast } from '../../context/ToastContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

function MomentModal({ moment, nextDay, onClose, onSaved }) {
  const toast = useToast();
  const imageInput = useRef(null);
  const [form, setForm] = useState({
    day: String(moment?.day ?? nextDay),
    title: moment?.title ?? '',
    place: moment?.place ?? '',
    description: moment?.description ?? '',
    cost: moment ? String(moment.cost || '') : '',
    image: moment?.image ?? '',
  });
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const upload = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const body = new FormData();
      body.append('file', await prepareImage(file, 1600, 1600));
      const { url } = await api('/studio/uploads', { method: 'POST', form: body });
      setForm((f) => ({ ...f, image: url }));
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setUploading(false);
      if (imageInput.current) imageInput.current.value = '';
    }
  };

  const save = async () => {
    setBusy(true);
    try {
      const body = { ...form, day: Number(form.day), cost: form.cost === '' ? 0 : Number(form.cost) };
      if (moment) await api(`/studio/itinerary/${moment.id}`, { method: 'PUT', body });
      else await api('/studio/itinerary', { method: 'POST', body });
      toast(moment ? 'Moment updated' : 'Moment added to your itinerary');
      onSaved();
    } catch (err) {
      toast(err.message, 'error');
      setBusy(false);
    }
  };

  return (
    <Modal title={moment ? 'Edit moment' : 'Add a moment'} onClose={onClose} width={600}>
      <div className="form-grid">
        <div className="product-image-edit">
          <button type="button" className="image-drop" onClick={() => imageInput.current.click()} disabled={uploading}>
            {form.image ? <img src={form.image} alt="" /> : uploading ? <Spinner /> : (
              <>
                <ImageIcon width={26} height={26} />
                <span>Add a photo (optional)</span>
              </>
            )}
          </button>
          <input ref={imageInput} type="file" accept="image/*" hidden onChange={(e) => upload(e.target.files[0])} />
          {form.image && (
            <button type="button" className="text-link" onClick={() => setForm((f) => ({ ...f, image: '' }))}>
              Remove photo
            </button>
          )}
        </div>
        <div className="contact-row">
          <div className="field">
            <label htmlFor="m-day">Day</label>
            <input id="m-day" className="input-box input-sm" type="number" min="1" max="365" value={form.day} onChange={set('day')} />
          </div>
          <div className="field">
            <label htmlFor="m-cost">Cost to sponsor (₹)</label>
            <input id="m-cost" className="input-box input-sm" type="number" min="0" placeholder="0 = not sponsorable" value={form.cost} onChange={set('cost')} />
          </div>
        </div>
        <div className="field">
          <label htmlFor="m-title">What's happening</label>
          <input id="m-title" className="input-box input-sm" maxLength={100} placeholder="e.g. Overnight cruise on Hạ Long Bay" value={form.title} onChange={set('title')} />
        </div>
        <div className="field">
          <label htmlFor="m-place">Place</label>
          <input id="m-place" className="input-box input-sm" maxLength={100} placeholder="e.g. Hạ Long Bay" value={form.place} onChange={set('place')} />
        </div>
        <div className="field">
          <label htmlFor="m-desc">Details</label>
          <textarea id="m-desc" className="input-box input-sm" rows={3} maxLength={1000} placeholder="What this covers, why it matters to you" value={form.description} onChange={set('description')} />
          <span className="field-hint">
            Set a cost of at least {formatMoney(MIN_AMOUNT)} to let visitors sponsor this moment. Sponsorships count toward your fundraising goal.
          </span>
        </div>
      </div>
      <div className="form-actions">
        <button type="button" className="pill-btn pill-outline" onClick={onClose}>
          Cancel
        </button>
        <button type="button" className="pill-btn pill-theme" onClick={save} disabled={busy || uploading}>
          {busy ? <Spinner small /> : moment ? 'Save moment' : 'Add moment'}
        </button>
      </div>
    </Modal>
  );
}

export default function StudioItinerary() {
  const toast = useToast();
  const { user } = useAuth();
  const [items, setItems] = useState(null);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(null);

  const load = useCallback(() => {
    api('/studio/itinerary')
      .then((d) => setItems(d.items))
      .catch((err) => setError(err.message));
  }, []);

  useEffect(() => {
    document.title = 'Itinerary';
    load();
  }, [load]);

  const totals = useMemo(() => {
    const live = (items || []).filter((m) => m.active && m.cost > 0);
    return { cost: live.reduce((s, m) => s + m.cost, 0), raised: live.reduce((s, m) => s + Math.min(m.raised, m.cost), 0) };
  }, [items]);

  const nextDay = items?.length ? Math.max(...items.map((m) => m.day)) : 1;

  const toggle = async (m) => {
    try {
      if (m.active) {
        const r = await api(`/studio/itinerary/${m.id}`, { method: 'DELETE' });
        toast(r.archived ? 'Moment hidden. It has sponsors, so it is kept for your records.' : 'Moment deleted');
      } else {
        await api(`/studio/itinerary/${m.id}`, { method: 'PUT', body: { active: true } });
        toast('Moment is back on your itinerary');
      }
      load();
    } catch (err) {
      toast(err.message, 'error');
    }
  };

  return (
    <div className="studio-stack">
      <div className="studio-title-row">
        <h1 className="studio-title">Itinerary</h1>
        <div className="row-actions">
          <a href={`/${user.slug}/itinerary`} target="_blank" rel="noopener noreferrer" className="pill-btn pill-outline">
            View page
          </a>
          <button type="button" className="pill-btn pill-theme" onClick={() => setEditing({})}>
            <PlusIcon width={18} height={18} strokeWidth={2.2} /> Add moment
          </button>
        </div>
      </div>

      {items && items.length > 0 && totals.cost > 0 && (
        <section className="studio-card itinerary-summary">
          <p>
            <strong>{formatMoney(totals.raised)}</strong> sponsored of {formatMoney(totals.cost)} across sponsorable moments
          </p>
          <div className="goal-bar">
            <span style={{ width: totals.raised > 0 ? `max(${Math.min(100, (totals.raised / totals.cost) * 100)}%, 8px)` : 0 }} />
          </div>
        </section>
      )}

      <section className="studio-card">
        {error && <p className="form-error">{error}</p>}
        {!items && !error && <Spinner />}
        {items && items.length === 0 && (
          <div className="studio-empty">
            <span className="studio-empty-icon">
              <MapIcon width={26} height={26} />
            </span>
            <h3>Plan your trip, day by day</h3>
            <p className="muted">Add the moments of your trip. Give a moment a cost and visitors can sponsor it, like a cruise, a cooking class or a train ride.</p>
            <button type="button" className="pill-btn pill-theme" onClick={() => setEditing({})}>
              Add your first moment
            </button>
          </div>
        )}
        {items && items.length > 0 && (
          <ul className="studio-moments">
            {items.map((m) => (
              <li key={m.id} className={`studio-moment${m.active ? '' : ' is-archived'}`}>
                <span className="studio-moment-day">Day {m.day}</span>
                {m.image ? <img src={m.image} alt="" /> : <span className="studio-moment-ph"><PinIcon /></span>}
                <div className="studio-moment-body">
                  <p className="product-title">{m.title}</p>
                  <p className="supporter-time">
                    {m.place && `${m.place} · `}
                    {m.cost > 0 ? `${formatMoney(m.raised)} of ${formatMoney(m.cost)} · ${m.sponsors} sponsor${m.sponsors === 1 ? '' : 's'}` : 'Not sponsorable'}
                    {!m.active && ' · hidden'}
                  </p>
                </div>
                <div className="row-actions">
                  <button type="button" className="pill-btn pill-outline pill-sm" onClick={() => setEditing({ moment: m })}>
                    Edit
                  </button>
                  <button type="button" className="pill-btn pill-outline pill-sm" onClick={() => toggle(m)}>
                    {m.active ? (m.sponsors > 0 ? 'Hide' : 'Delete') : 'Show'}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {editing && (
        <MomentModal
          moment={editing.moment}
          nextDay={nextDay}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            load();
          }}
        />
      )}
    </div>
  );
}
