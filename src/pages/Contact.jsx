import { useState } from 'react';
import InfoLayout from '../components/InfoLayout.jsx';
import { ContactBlock, contextFor } from '../content/policies.jsx';
import { api } from '../lib/api.js';
import { useI18n } from '../i18n/index.jsx';

function ContactForm() {
  const { t } = useI18n();
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setStatus('sending');
    try {
      await api('/contact', { method: 'POST', body: form });
      setStatus('sent');
      setForm({ name: '', email: '', subject: '', message: '' });
    } catch (err) {
      setError(err.message);
      setStatus('idle');
    }
  };

  if (status === 'sent') {
    return (
      <div className="contact-sent">
        <h3>{t('contact.sent')}</h3>
        <p className="muted">{t('contact.replyTime')}</p>
        <button type="button" className="pill-btn pill-outline" onClick={() => setStatus('idle')}>
          {t('contact.another')}
        </button>
      </div>
    );
  }

  return (
    <form className="contact-form" onSubmit={submit}>
      <div className="contact-row">
        <input className="input-box input-sm" placeholder={t('auth.name')} maxLength={80} value={form.name} onChange={set('name')} required />
        <input
          className="input-box input-sm"
          type="email"
          placeholder={t('contact.email')}
          maxLength={120}
          value={form.email}
          onChange={set('email')}
          required
        />
      </div>
      <input className="input-box input-sm" placeholder={t('contact.subject')} maxLength={150} value={form.subject} onChange={set('subject')} />
      <textarea
        className="input-box input-sm"
        placeholder={t('contact.message')}
        rows={6}
        maxLength={3000}
        value={form.message}
        onChange={set('message')}
        required
      />
      {error && <p className="form-error">{error}</p>}
      <button type="submit" className="support-btn" disabled={status === 'sending'}>
        {status === 'sending' ? <span className="dot-flashing" /> : t('contact.send')}
      </button>
    </form>
  );
}

export default function Contact() {
  const { t } = useI18n();
  return (
    <InfoLayout title={t('footer.contact')}>
      {(creator) => (
        <div className="info-body">
          <p>{t('contact.intro')}</p>
          <ContactBlock ctx={contextFor(creator)} showFormLink={false} />
          <h2>{t('contact.formTitle')}</h2>
          <ContactForm />
        </div>
      )}
    </InfoLayout>
  );
}
