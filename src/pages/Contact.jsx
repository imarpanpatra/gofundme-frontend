import { useState } from 'react';
import InfoLayout from '../components/InfoLayout.jsx';
import { ContactBlock, contextFor } from '../content/policies.jsx';
import { api } from '../lib/api.js';

function ContactForm() {
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
        <h3>Thanks, your message has been sent.</h3>
        <p className="muted">I usually reply within 2 business days.</p>
        <button type="button" className="pill-btn pill-outline" onClick={() => setStatus('idle')}>
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form className="contact-form" onSubmit={submit}>
      <div className="contact-row">
        <input className="input-box input-sm" placeholder="Your name" maxLength={80} value={form.name} onChange={set('name')} required />
        <input
          className="input-box input-sm"
          type="email"
          placeholder="Your email"
          maxLength={120}
          value={form.email}
          onChange={set('email')}
          required
        />
      </div>
      <input className="input-box input-sm" placeholder="Subject (optional)" maxLength={150} value={form.subject} onChange={set('subject')} />
      <textarea
        className="input-box input-sm"
        placeholder="Your message"
        rows={6}
        maxLength={3000}
        value={form.message}
        onChange={set('message')}
        required
      />
      {error && <p className="form-error">{error}</p>}
      <button type="submit" className="support-btn" disabled={status === 'sending'}>
        {status === 'sending' ? <span className="dot-flashing" /> : 'Send message'}
      </button>
    </form>
  );
}

export default function Contact() {
  return (
    <InfoLayout title="Contact Us">
      {(creator) => (
        <div className="info-body">
          <p>
            Questions about a payment, a refund, cancelling monthly support, or anything else? Send a message using the form
            below or email directly. I usually reply within 2 business days.
          </p>
          <ContactBlock ctx={contextFor(creator)} showFormLink={false} />
          <h2>Send a message</h2>
          <ContactForm />
        </div>
      )}
    </InfoLayout>
  );
}
