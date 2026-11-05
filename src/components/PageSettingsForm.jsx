import { useEffect, useRef, useState } from 'react';
import Spinner from './Spinner.jsx';
import { CameraIcon, LinkIcon } from './icons.jsx';
import { api, assetUrl } from '../lib/api.js';
import { useToast } from '../context/ToastContext.jsx';
import { themeVars } from '../lib/format.js';
import { prepareImage } from '../lib/image.js';

const SWATCHES = ['#5F7FFF', '#FF813F', '#FF5F5F', '#BD5FFF', '#29ABE0', '#79D16B', '#FFDD00', '#222222'];

export function RichEditor({ initialHtml, editorRef }) {
  useEffect(() => {
    editorRef.current.innerHTML = initialHtml || '';
  }, []);

  const exec = (cmd, arg) => {
    editorRef.current.focus();
    document.execCommand(cmd, false, arg);
  };

  const addLink = () => {
    const url = window.prompt('Link URL');
    if (url) exec('createLink', /^https?:\/\//i.test(url) ? url : `https://${url}`);
  };

  return (
    <div className="rich">
      <div className="rich-toolbar">
        <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => exec('bold')} aria-label="Bold">
          <b>B</b>
        </button>
        <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => exec('italic')} aria-label="Italic">
          <i>I</i>
        </button>
        <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => exec('underline')} aria-label="Underline">
          <u>U</u>
        </button>
        <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={addLink} aria-label="Add link">
          <LinkIcon width={16} height={16} />
        </button>
      </div>
      <div ref={editorRef} className="rich-area" contentEditable suppressContentEditableWarning />
    </div>
  );
}

export default function PageSettingsForm({ creator, onSaved, onCancel }) {
  const toast = useToast();
  const editorRef = useRef(null);
  const fileRef = useRef(null);
  const [name, setName] = useState(creator.name);
  const [links, setLinks] = useState(creator.links.join('\n'));
  const [themeColor, setThemeColor] = useState(creator.themeColor);
  const [amounts, setAmounts] = useState(creator.suggestedAmounts.map(String));
  const [buttonText, setButtonText] = useState(creator.supportButtonText);
  const [recurring, setRecurring] = useState(creator.recurringEnabled);
  const [avatar, setAvatar] = useState(creator.avatar);
  const [contact, setContact] = useState(creator.contact);
  const [featuredVideo, setFeaturedVideo] = useState(creator.featuredVideoId ? `https://youtu.be/${creator.featuredVideoId}` : '');
  const setContactField = (key) => (e) => setContact((c) => ({ ...c, [key]: e.target.value }));
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const uploadAvatar = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const form = new FormData();
      form.append('avatar', await prepareImage(file, 600, 600));
      const { creator: updated } = await api('/pages/me/avatar', { method: 'POST', form });
      setAvatar(updated.avatar);
      onSaved(updated, { keepOpen: true });
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setUploading(false);
    }
  };

  const save = async () => {
    setSaving(true);
    try {
      const { creator: updated } = await api('/pages/me', {
        method: 'PUT',
        body: {
          name,
          about: editorRef.current.innerHTML,
          links: links.split('\n'),
          themeColor,
          suggestedAmounts: amounts.map(Number),
          supportButtonText: buttonText,
          recurringEnabled: recurring,
          contact,
          featuredVideo,
        },
      });
      onSaved(updated);
      toast('Page updated');
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="settings-form" style={themeVars(themeColor)}>
      <div className="form-grid">
        <div className="avatar-edit">
          <button type="button" className="avatar-edit-btn" onClick={() => fileRef.current.click()} disabled={uploading}>
            {avatar ? <img src={assetUrl(avatar)} alt="" /> : <span>{name[0]}</span>}
            <span className="avatar-edit-overlay">{uploading ? <Spinner small /> : <CameraIcon />}</span>
          </button>
          <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp,image/gif" hidden onChange={(e) => uploadAvatar(e.target.files[0])} />
          <div className="field grow">
            <label htmlFor="edit-name">Name</label>
            <input id="edit-name" className="input-box input-sm" value={name} maxLength={60} onChange={(e) => setName(e.target.value)} />
          </div>
        </div>

        <div className="field">
          <label>About</label>
          <RichEditor initialHtml={creator.about} editorRef={editorRef} />
        </div>

        <div className="field">
          <label htmlFor="edit-video">Featured video (YouTube link)</label>
          <input
            id="edit-video"
            className="input-box input-sm"
            placeholder="https://youtu.be/…"
            value={featuredVideo}
            onChange={(e) => setFeaturedVideo(e.target.value)}
          />
          <span className="field-hint">Shown at the top of your About section. Leave empty to hide it.</span>
        </div>

        <div className="field">
          <label htmlFor="edit-links">Website or social links (one per line)</label>
          <textarea id="edit-links" className="input-box input-sm" rows={3} value={links} onChange={(e) => setLinks(e.target.value)} />
        </div>

        <div className="field">
          <label>Theme color</label>
          <div className="swatches">
            {SWATCHES.map((c) => (
              <button
                type="button"
                key={c}
                className={`swatch${themeColor.toUpperCase() === c ? ' active' : ''}`}
                style={{ background: c }}
                onClick={() => setThemeColor(c)}
                aria-label={c}
              />
            ))}
            <input type="color" value={themeColor} onChange={(e) => setThemeColor(e.target.value.toUpperCase())} aria-label="Custom color" />
          </div>
        </div>

        <div className="field">
          <label>Suggested amounts (₹)</label>
          <div className="amount-edit">
            {amounts.map((a, i) => (
              <input
                key={i}
                className="input-box input-sm"
                type="number"
                min="1"
                value={a}
                onChange={(e) => setAmounts((prev) => prev.map((v, j) => (j === i ? e.target.value : v)))}
              />
            ))}
          </div>
        </div>

        <div className="field">
          <label htmlFor="edit-btn">Button text</label>
          <input id="edit-btn" className="input-box input-sm" value={buttonText} maxLength={20} onChange={(e) => setButtonText(e.target.value)} />
        </div>

        <label className="checkbox" htmlFor="edit-recurring">
          <input id="edit-recurring" type="checkbox" checked={recurring} onChange={(e) => setRecurring(e.target.checked)} />
          <span className="checkmark" aria-hidden="true" />
          <span className="checkbox-label">Allow monthly support</span>
        </label>

        <div className="field-group">
          <h3>Contact details</h3>
          <p className="muted">Shown on the Contact Us page and in every policy page. Razorpay checks these during website verification.</p>
          <div className="contact-row">
            <div className="field">
              <label htmlFor="edit-legal">Legal name</label>
              <input id="edit-legal" className="input-box input-sm" maxLength={100} value={contact.legalName} onChange={setContactField('legalName')} />
            </div>
            <div className="field">
              <label htmlFor="edit-cemail">Contact email</label>
              <input id="edit-cemail" type="email" className="input-box input-sm" maxLength={120} value={contact.email} onChange={setContactField('email')} />
            </div>
          </div>
          <div className="field">
            <label htmlFor="edit-phone">Phone</label>
            <input id="edit-phone" type="tel" className="input-box input-sm" maxLength={30} placeholder="+91 …" value={contact.phone} onChange={setContactField('phone')} />
          </div>
          <div className="field">
            <label htmlFor="edit-address">Address</label>
            <textarea id="edit-address" className="input-box input-sm" rows={2} maxLength={300} value={contact.address} onChange={setContactField('address')} />
          </div>
        </div>
      </div>
      <div className="form-actions">
        {onCancel && (
          <button type="button" className="pill-btn pill-outline" onClick={onCancel}>
            Cancel
          </button>
        )}
        <button type="button" className="pill-btn pill-theme" onClick={save} disabled={saving}>
          {saving ? <Spinner small /> : 'Save changes'}
        </button>
      </div>
    </div>
  );
}
