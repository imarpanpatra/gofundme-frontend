import { useCallback, useEffect, useState } from 'react';
import Modal from '../../components/Modal.jsx';
import Spinner from '../../components/Spinner.jsx';
import { ArrowRightIcon, CheckIcon, LockIcon, StarIcon } from '../../components/icons.jsx';
import { api } from '../../lib/api.js';
import { MIN_AMOUNT } from '../../lib/checkout.js';
import { formatMoney, shortDate, initials } from '../../lib/format.js';
import { useToast } from '../../context/ToastContext.jsx';

function TierModal({ tier, onClose, onSaved }) {
  const toast = useToast();
  const [form, setForm] = useState({
    name: tier?.name || '',
    price: tier ? String(tier.price) : '',
    description: tier?.description || '',
    perks: tier?.perks.join('\n') || '',
  });
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const save = async () => {
    setBusy(true);
    try {
      const body = { ...form, price: Number(form.price) };
      if (tier) await api(`/studio/memberships/tiers/${tier.id}`, { method: 'PUT', body });
      else await api('/studio/memberships/tiers', { method: 'POST', body });
      toast(tier ? 'Tier updated' : 'Tier created');
      onSaved();
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal title={tier ? 'Edit tier' : 'New membership tier'} onClose={onClose} width={520}>
      <div className="form-grid">
        <div className="contact-row">
          <div className="field">
            <label htmlFor="tier-name">Tier name</label>
            <input id="tier-name" className="input-box input-sm" placeholder="e.g. Travel Buddy" maxLength={60} value={form.name} onChange={set('name')} />
          </div>
          <div className="field">
            <label htmlFor="tier-price">Price per month (₹)</label>
            <input id="tier-price" className="input-box input-sm" type="number" min={MIN_AMOUNT} placeholder="499" value={form.price} onChange={set('price')} />
          </div>
        </div>
        <div className="field">
          <label htmlFor="tier-desc">Description</label>
          <textarea id="tier-desc" className="input-box input-sm" rows={3} maxLength={1000} value={form.description} onChange={set('description')} />
        </div>
        <div className="field">
          <label htmlFor="tier-perks">Perks (one per line)</label>
          <textarea
            id="tier-perks"
            className="input-box input-sm"
            rows={4}
            placeholder={'Supporters-only posts\nBehind-the-scenes videos\nShoutout in my next video'}
            value={form.perks}
            onChange={set('perks')}
          />
        </div>
        {tier?.members > 0 && <p className="field-hint">This tier has active members, so its price can't be changed.</p>}
      </div>
      <div className="form-actions">
        <button type="button" className="pill-btn pill-outline" onClick={onClose}>
          Cancel
        </button>
        <button type="button" className="pill-btn pill-theme" onClick={save} disabled={busy}>
          {busy ? <Spinner small /> : tier ? 'Save tier' : 'Create tier'}
        </button>
      </div>
    </Modal>
  );
}

function EnableHero({ onEnable, busy }) {
  return (
    <section className="studio-card membership-intro">
      <h2>Enable membership</h2>
      <p className="eyebrow">Highly recommended</p>
      <button type="button" className="pill-btn pill-theme pill-lg" onClick={onEnable} disabled={busy}>
        {busy ? <Spinner small /> : (
          <>
            Enable membership <ArrowRightIcon width={18} height={18} />
          </>
        )}
      </button>
      <div className="intro-row">
        <div className="intro-art">
          <div className="intro-stat">
            <strong>86</strong>
            <span>members</span>
          </div>
          <div className="intro-stat intro-stat-2">
            <strong>₹30k</strong>
            <span>monthly income</span>
          </div>
        </div>
        <div>
          <h3>Earn recurring income</h3>
          <p className="muted">
            Memberships are a great way to build recurring revenue, create engagement, and build deep and meaningful relationships with your
            fans. Start earning monthly payments doing what you love!
          </p>
        </div>
      </div>
      <div className="intro-row">
        <div>
          <h3>Share exclusives</h3>
          <p className="muted">
            Share exclusive posts, messages or other perks with your members. Posts marked "Supporters only" unlock automatically for members.
          </p>
        </div>
        <div className="intro-art intro-art-dark">
          <LockIcon width={28} height={28} />
          <span>Members-only post</span>
        </div>
      </div>
    </section>
  );
}

export default function StudioMemberships() {
  const toast = useToast();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    api('/studio/memberships')
      .then(setData)
      .catch((err) => setError(err.message));
  }, []);

  useEffect(() => {
    document.title = 'Memberships';
    load();
  }, [load]);

  const setEnabled = async (enabled) => {
    setBusy(true);
    try {
      await api('/studio/memberships/settings', { method: 'PUT', body: { enabled } });
      load();
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setBusy(false);
    }
  };

  const archive = async (tier, active) => {
    try {
      if (active) await api(`/studio/memberships/tiers/${tier.id}`, { method: 'PUT', body: { active: true } });
      else {
        const r = await api(`/studio/memberships/tiers/${tier.id}`, { method: 'DELETE' });
        toast(r.archived ? 'Tier archived. Existing members keep their membership.' : 'Tier deleted');
      }
      load();
    } catch (err) {
      toast(err.message, 'error');
    }
  };

  if (error) return <p className="form-error">{error}</p>;
  if (!data) return <Spinner />;

  return (
    <div className="studio-stack">
      <h1 className="studio-title">Memberships</h1>
      {!data.enabled && data.tiers.length === 0 ? (
        <EnableHero onEnable={() => setEnabled(true)} busy={busy} />
      ) : (
        <>
          <section className="studio-card">
            <div className="studio-list-head">
              <div>
                <h2 className="dash-h2">Membership is {data.enabled ? 'on' : 'off'}</h2>
                <p className="muted">
                  {data.enabled
                    ? data.tiers.some((t) => t.active)
                      ? 'Visitors can join from the Membership tab on your page.'
                      : 'Add at least one tier so visitors can join.'
                    : "Your Membership tab is hidden. Existing members keep their membership until they cancel."}
                </p>
              </div>
              <label className="switch">
                <input type="checkbox" checked={data.enabled} disabled={busy} onChange={(e) => setEnabled(e.target.checked)} />
                <span />
              </label>
            </div>
            <div className="stat-tiles">
              <div className="stat-tile">
                <strong>{data.members.filter((m) => m.status === 'active').length}</strong>
                <span>Active members</span>
              </div>
              <div className="stat-tile">
                <strong>{formatMoney(data.monthlyIncome)}</strong>
                <span>Monthly income</span>
              </div>
              <div className="stat-tile">
                <strong>{data.tiers.filter((t) => t.active).length}</strong>
                <span>Active tiers</span>
              </div>
            </div>
          </section>

          <section className="studio-card">
            <div className="studio-list-head">
              <h2 className="dash-h2">Tiers</h2>
              <button type="button" className="pill-btn pill-theme" onClick={() => setEditing('new')}>
                Add tier
              </button>
            </div>
            {data.tiers.length === 0 ? (
              <p className="muted">No tiers yet.</p>
            ) : (
              <ul className="dash-list">
                {data.tiers.map((t) => (
                  <li key={t.id} className={`dash-row${t.active ? '' : ' is-archived'}`}>
                    <span className="tier-icon">
                      <StarIcon width={20} height={20} />
                    </span>
                    <div className="dash-row-main">
                      <p>
                        <strong>{t.name}</strong> · {formatMoney(t.price)}/month
                        {!t.active && <span className="badge badge-muted">Archived</span>}
                      </p>
                      <p className="supporter-time">
                        {t.members} active {t.members === 1 ? 'member' : 'members'}
                        {t.perks.length > 0 && ` · ${t.perks.length} perks`}
                      </p>
                      {t.perks.length > 0 && (
                        <ul className="mini-perks">
                          {t.perks.map((p) => (
                            <li key={p}>
                              <CheckIcon width={14} height={14} /> {p}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                    <div className="row-actions">
                      <button type="button" className="pill-btn pill-outline pill-sm" onClick={() => setEditing(t)}>
                        Edit
                      </button>
                      <button type="button" className="pill-btn pill-outline pill-sm" onClick={() => archive(t, !t.active)}>
                        {t.active ? 'Archive' : 'Restore'}
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="studio-card">
            <h2 className="dash-h2">Members</h2>
            {data.members.length === 0 ? (
              <p className="muted">No members yet. Share your Membership page to get your first one.</p>
            ) : (
              <ul className="dash-list">
                {data.members.map((m) => (
                  <li key={m.id} className="dash-row">
                    <span className="supporter-avatar">{initials(m.name)}</span>
                    <div className="dash-row-main">
                      <p>
                        <strong>{m.name || 'Member'}</strong> · {m.tierName}
                        <span className={`badge${m.status === 'active' ? '' : ' badge-muted'}`}>{m.cancelRequested && m.status === 'active' ? 'cancelling' : m.status}</span>
                      </p>
                      {m.email && (
                        <p className="dash-email">
                          <a href={`mailto:${m.email}`}>{m.email}</a>
                        </p>
                      )}
                      <p className="supporter-time">Since {shortDate(m.startedAt)}</p>
                    </div>
                    <span className="dash-amount">{formatMoney(m.amount)}/mo</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
      {editing && (
        <TierModal
          tier={editing === 'new' ? null : editing}
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
