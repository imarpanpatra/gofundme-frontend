import { Link } from 'react-router-dom';

export const POLICIES_UPDATED = '5 November 2026';

export function contextFor(creator) {
  return {
    name: creator.name,
    owner: creator.contact.legalName || creator.name,
    email: creator.contact.email,
    phone: creator.contact.phone,
    address: creator.contact.address,
    site: window.location.host,
    pageUrl: `/${creator.slug}`,
  };
}

export function ContactBlock({ ctx, showFormLink = true }) {
  return (
    <ul className="info-contact">
      <li>
        <strong>Name:</strong> {ctx.owner}
      </li>
      {ctx.email && (
        <li>
          <strong>Email:</strong> <a href={`mailto:${ctx.email}`}>{ctx.email}</a>
        </li>
      )}
      {ctx.phone && (
        <li>
          <strong>Phone:</strong> <a href={`tel:${ctx.phone.replace(/\s+/g, '')}`}>{ctx.phone}</a>
        </li>
      )}
      {ctx.address && (
        <li>
          <strong>Address:</strong> {ctx.address}
        </li>
      )}
      {showFormLink && (
        <li>
          <strong>Contact form:</strong> <Link to="/contact">{ctx.site}/contact</Link>
        </li>
      )}
    </ul>
  );
}

const Mail = ({ ctx }) =>
  ctx.email ? <a href={`mailto:${ctx.email}`}>{ctx.email}</a> : <Link to="/contact">our contact page</Link>;

export const POLICIES = {
  terms: {
    title: 'Terms & Conditions',
    render: (ctx) => (
      <>
        <p>
          These Terms &amp; Conditions ("Terms") govern your use of {ctx.site} (the "Site"), which is owned and operated by{' '}
          {ctx.owner} ("we", "us", "our"). By using the Site or making a payment through it, you agree to these Terms. If you do
          not agree, please do not use the Site.
        </p>

        <h2>1. What this Site is</h2>
        <p>
          The Site is a personal support page where visitors can make voluntary contributions to {ctx.name}. Contributions
          are gifts. They are not a purchase of goods or services, not an investment, and not a donation to a registered
          charity. You do not receive any product, equity, interest, reward or guaranteed deliverable in return.
        </p>

        <h2>2. Eligibility</h2>
        <p>
          You must be at least 18 years old, or have the consent of a parent or legal guardian, and be legally able to enter
          into a binding contract to make a payment on the Site.
        </p>

        <h2>3. Payments</h2>
        <ul>
          <li>All payments are processed by Razorpay Software Private Limited ("Razorpay") in Indian Rupees (INR).</li>
          <li>
            We never see or store your card number, CVV, UPI PIN or net-banking credentials. Razorpay's own terms and privacy
            policy also apply to your payment.
          </li>
          <li>
            A contribution is complete only when Razorpay confirms it as successful. We are not responsible for delays or
            failures caused by Razorpay, your bank or your payment provider.
          </li>
          <li>You confirm that you are authorised to use the payment method you choose.</li>
        </ul>

        <h2>4. Monthly support</h2>
        <p>
          If you tick "Make this monthly", you authorise a recurring charge of the same amount every month through a Razorpay
          subscription until you cancel. You can cancel at any time by writing to <Mail ctx={ctx} /> with your payment or
          subscription ID. Cancellation stops future charges. Charges made before cancellation are handled under our{' '}
          <Link to="/refund-policy">Refund Policy</Link>.
        </p>

        <h2>5. Names and messages</h2>
        <ul>
          <li>
            The name and message you enter are shown publicly in "Recent supporters", unless you mark the message as private.
            Private messages are visible only to {ctx.name}.
          </li>
          <li>
            You are responsible for what you post. Do not post anything unlawful, abusive, hateful, misleading, or anything
            that infringes someone else's rights, and do not impersonate another person.
          </li>
          <li>We may hide or remove any name or message at our discretion, without notice.</li>
        </ul>

        <h2>6. How contributions are used</h2>
        <p>
          Contributions are used at {ctx.name}'s discretion, generally for the purpose described on the{' '}
          <Link to={ctx.pageUrl}>support page</Link>. Plans can change. Any travel stories, photos, videos or tips shared
          afterwards are offered as goodwill and are not something you purchase or are entitled to.
        </p>

        <h2>7. Acceptable use</h2>
        <p>
          You agree not to misuse the Site. This includes using stolen or unauthorised payment methods, attempting fraud or
          money laundering, interfering with the Site's security or operation, or scraping it in an abusive way. We may block
          access and report suspected unlawful activity to the authorities.
        </p>

        <h2>8. Intellectual property</h2>
        <p>
          The text, images and other content on the Site belong to {ctx.owner} or are used with permission. You may not copy
          or reuse them commercially without written permission.
        </p>

        <h2>9. Disclaimer and limitation of liability</h2>
        <p>
          The Site is provided "as is" and "as available". To the maximum extent permitted by law, we are not liable for any
          indirect, incidental or consequential loss arising from your use of the Site. Our total liability to you for any
          claim is limited to the amount you contributed through the Site in the 12 months before the claim. See also our{' '}
          <Link to="/disclaimer">Disclaimer</Link>.
        </p>

        <h2>10. Changes to these Terms</h2>
        <p>
          We may update these Terms from time to time. The "Last updated" date above shows when they last changed. If you
          keep using the Site after a change, you accept the updated Terms.
        </p>

        <h2>11. Governing law</h2>
        <p>
          These Terms are governed by the laws of India. Any dispute is subject to the exclusive jurisdiction of the competent
          courts in India.
        </p>

        <h2>12. Contact</h2>
        <ContactBlock ctx={ctx} />
      </>
    ),
  },

  privacy: {
    title: 'Privacy Policy',
    render: (ctx) => (
      <>
        <p>
          This Privacy Policy explains what personal data {ctx.owner} ("we", "us") collects on {ctx.site}, why we collect it,
          and the choices you have. We follow the Digital Personal Data Protection Act, 2023 and other applicable Indian law.
        </p>

        <h2>1. Information we collect</h2>
        <ul>
          <li>
            <strong>When you support:</strong> the name or social handle and the message you enter, the amount, whether the
            message is private, and whether the support is monthly.
          </li>
          <li>
            <strong>From Razorpay:</strong> the payment or subscription ID, amount, currency, status and time. Razorpay
            collects your email address, phone number and payment details directly to process the payment. We do not receive
            or store full card numbers, CVV, UPI PIN or banking passwords.
          </li>
          <li>
            <strong>When you contact us:</strong> your name, email address, subject and message.
          </li>
          <li>
            <strong>Technical data:</strong> our server receives your IP address and browser details with each request. We
            use them for security, rate limiting and troubleshooting.
          </li>
        </ul>

        <h2>2. How we use it</h2>
        <ul>
          <li>To process payments and monthly subscriptions, and to confirm them</li>
          <li>To show your name and public message in "Recent supporters"</li>
          <li>To reply to your messages and refund requests</li>
          <li>To prevent fraud and abuse and keep the Site secure</li>
          <li>To keep the financial records that tax and accounting law requires</li>
        </ul>

        <h2>3. What is public</h2>
        <p>
          Your name or handle, the amount, the time of the payment, and your message (unless you marked it private) appear on
          the public support page. If you want to support anonymously, leave the name blank and you will appear as
          "Someone".
        </p>

        <h2>4. Sharing</h2>
        <p>We do not sell or rent your personal data. We share it only with:</p>
        <ul>
          <li>Razorpay, to process payments</li>
          <li>Our hosting and database providers, which store the Site's data on our behalf</li>
          <li>Google Fonts, which serves the Site's font and receives your IP address when the page loads</li>
          <li>Government or law-enforcement authorities, when the law requires it</li>
        </ul>

        <h2>5. Cookies and local storage</h2>
        <p>
          We do not use advertising or analytics cookies. The Site stores a login token in your browser's local storage only
          if you log in as the page owner. Razorpay Checkout may set its own cookies to process your payment securely.
        </p>

        <h2>6. Retention</h2>
        <p>
          We keep payment records for as long as tax and accounting law requires. We keep contact messages only as long as we
          need them to deal with your request. If you ask us to, we will remove your name and message from the public page.
        </p>

        <h2>7. Your rights</h2>
        <p>
          You can ask to access, correct or delete your personal data, or withdraw your consent, by writing to{' '}
          <Mail ctx={ctx} />. We will respond within 30 days. Some payment records may have to be kept to meet legal
          obligations.
        </p>

        <h2>8. Security</h2>
        <p>
          We use HTTPS, access controls and payment-signature verification to protect your data. No method of transmission or
          storage is completely secure, but we work to protect your information.
        </p>

        <h2>9. Children</h2>
        <p>
          The Site is not intended for children under 18. We do not knowingly collect personal data from children without
          verifiable consent from a parent or guardian.
        </p>

        <h2>10. Changes</h2>
        <p>We may update this policy. The "Last updated" date above shows the latest version.</p>

        <h2>11. Grievance officer and contact</h2>
        <ContactBlock ctx={ctx} />
      </>
    ),
  },

  refund: {
    title: 'Refund & Cancellation Policy',
    render: (ctx) => (
      <>
        <p>
          Contributions on {ctx.site} are voluntary gifts to {ctx.name}. Please make sure of the amount before you pay. As a
          rule, contributions are <strong>non-refundable</strong>, except in the cases below.
        </p>

        <h2>1. When we will refund you</h2>
        <ul>
          <li>You were charged more than once for the same contribution (a duplicate payment)</li>
          <li>A technical error charged an amount different from the one you entered</li>
          <li>The payment was made without your authorisation</li>
          <li>You were charged for a monthly support after you had asked us to cancel it</li>
        </ul>

        <h2>2. How to request a refund</h2>
        <p>
          Email <Mail ctx={ctx} /> within <strong>7 days</strong> of the charge. Include:
        </p>
        <ul>
          <li>The Razorpay payment ID (it starts with "pay_" and appears in Razorpay's confirmation email)</li>
          <li>The amount and the date of the payment</li>
          <li>The reason for the request</li>
        </ul>

        <h2>3. Processing time</h2>
        <p>
          We review each request and reply within 3 business days. Approved refunds are made through Razorpay to the{' '}
          <strong>original payment method</strong>. Your bank usually credits the money within 5–7 business days after we
          start the refund. The exact time depends on your bank or card issuer.
        </p>

        <h2>4. Failed payments</h2>
        <p>
          If money left your account but the payment shows as failed, Razorpay or your bank normally reverses it automatically
          within 5–7 business days. If it hasn't come back after that, contact us with the details and we will help.
        </p>

        <h2>5. Cancelling monthly support</h2>
        <p>
          You can cancel monthly support at any time. Email <Mail ctx={ctx} /> with your payment or subscription ID. We will
          cancel the Razorpay subscription within 2 business days and confirm by email. Charges made before you cancelled are
          not refunded, unless one of the cases in section 1 applies.
        </p>

        <h2>6. Chargebacks</h2>
        <p>
          Please contact us before you raise a dispute or chargeback with your bank. Most issues can be fixed faster directly.
        </p>

        <h2>7. Contact</h2>
        <ContactBlock ctx={ctx} />
      </>
    ),
  },

  return: {
    title: 'Return & Shipping Policy',
    render: (ctx) => (
      <>
        <p>
          {ctx.site} accepts voluntary contributions only. <strong>No physical products are sold, shipped or delivered</strong>{' '}
          through this Site.
        </p>

        <h2>1. Returns and exchanges</h2>
        <p>
          A contribution does not involve any physical or digital product, so there is nothing to return or exchange. If you
          want your money back, our <Link to="/refund-policy">Refund &amp; Cancellation Policy</Link> explains when refunds
          are given and how to ask for one.
        </p>

        <h2>2. Shipping and delivery</h2>
        <p>
          Shipping does not apply. Nothing is dispatched to you, so there are no shipping charges, delivery times or courier
          partners. Once Razorpay confirms your payment, the support page and Razorpay's confirmation email acknowledge it
          straight away.
        </p>

        <h2>3. Content shared by the creator</h2>
        <p>
          Any stories, photos, videos or travel tips {ctx.name} shares are free goodwill content. They are not something you
          buy, and they cannot be returned or exchanged.
        </p>

        <h2>4. Contact</h2>
        <ContactBlock ctx={ctx} />
      </>
    ),
  },

  disclaimer: {
    title: 'Disclaimer',
    render: (ctx) => (
      <>
        <p>
          The information on {ctx.site} is published by {ctx.owner} in good faith and for general information only.
        </p>

        <h2>1. Personal fundraising, not a charity</h2>
        <p>
          This is a personal support page. {ctx.owner} is not a registered charity, NGO, trust or crowdfunding platform.
          Contributions are <strong>not tax-deductible</strong>, and no 80G or similar tax receipts are issued.
        </p>

        <h2>2. Not an investment</h2>
        <p>
          Contributions are gifts. They do not buy you any ownership, profit share, interest, refund right (except as set out
          in the <Link to="/refund-policy">Refund Policy</Link>) or guaranteed reward.
        </p>

        <h2>3. No professional advice</h2>
        <p>
          Travel stories, tips, recommendations and other content shared here or on linked channels reflect personal
          experience. They are not professional, legal, financial, medical or travel-safety advice. Check details with
          official sources before you rely on them. Travel at your own risk.
        </p>

        <h2>4. Accuracy</h2>
        <p>
          We try to keep information accurate and up to date, but we make no warranty about its completeness or accuracy.
          Plans, prices and details can change without notice.
        </p>

        <h2>5. External links</h2>
        <p>
          The Site links to external websites and social profiles that we do not control. We are not responsible for their
          content, availability or privacy practices.
        </p>

        <h2>6. Trademarks and affiliation</h2>
        <p>
          Product names, logos and brands that appear on this Site, including inside images, belong to their respective
          owners. This Site is independent. It is not affiliated with, sponsored or endorsed by any crowdfunding or tipping
          platform. Razorpay is used only as the payment processor.
        </p>

        <h2>7. Contact</h2>
        <ContactBlock ctx={ctx} />
      </>
    ),
  },
};
