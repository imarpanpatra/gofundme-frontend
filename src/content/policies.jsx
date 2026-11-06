import { Link } from 'react-router-dom';

export const POLICIES_UPDATED = '6 November 2026';

export function contextFor(creator) {
  return {
    name: creator.name,
    brand: creator.siteName.replace(/^[\p{Extended_Pictographic}️‍\s]+/u, '') || creator.name,
    owner: creator.contact.legalName || creator.name,
    email: creator.contact.email,
    phone: creator.contact.phone,
    address: creator.contact.address,
    site: window.location.host,
    pageUrl: `/${creator.slug}`,
    shopUrl: `/${creator.slug}/shop`,
    membershipUrl: `/${creator.slug}/membership`,
  };
}

export function ContactBlock({ ctx, showFormLink = true }) {
  return (
    <ul className="info-contact">
      <li>
        <strong>Name:</strong> {ctx.owner}
      </li>
      {ctx.owner !== ctx.brand && (
        <li>
          <strong>Brand name:</strong> {ctx.brand}
        </li>
      )}
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

const Operator = ({ ctx }) => (
  <>
    {ctx.owner}
    {ctx.owner !== ctx.brand && <> (brand name "{ctx.brand}")</>}
  </>
);

const MyAccount = () => <Link to="/account">My account</Link>;

export const POLICIES = {
  terms: {
    title: 'Terms & Conditions',
    render: (ctx) => (
      <>
        <p>
          These Terms &amp; Conditions ("Terms") govern your use of {ctx.site} (the "Site"), which is owned and operated by{' '}
          <Operator ctx={ctx} />, an individual based in India ("we", "us", "our"). By creating an account, using the Site
          or making a payment through it, you agree to these Terms. If you do not agree, please do not use the Site.
        </p>

        <h2>1. What this Site offers</h2>
        <p>The Site is the personal creator page of {ctx.name}. Through it you can:</p>
        <ul>
          <li>
            <strong>Support</strong> {ctx.name} with a one-time or monthly payment of an amount you choose
          </li>
          <li>
            <strong>Join a membership</strong>, a monthly subscription that gives you the benefits listed on the{' '}
            <Link to={ctx.membershipUrl}>Membership page</Link>
          </li>
          <li>
            <strong>Buy digital products and services</strong> from the <Link to={ctx.shopUrl}>Shop</Link>, such as
            software, digital downloads, 1-on-1 video calls, Instagram close-friends access and event tickets
          </li>
          <li>Read posts, some of which are only for logged-in users, supporters or members, and like or comment on them</li>
        </ul>
        <p>
          <strong>We do not sell or ship physical goods.</strong> Everything sold on the Site is delivered digitally or as an
          online service, as described in our <Link to="/return-policy">Shipping &amp; Delivery Policy</Link>.
        </p>

        <h2>2. Eligibility</h2>
        <p>
          You must be at least 18 years old, or have the consent of a parent or legal guardian, and be legally able to enter
          into a binding contract to create an account or make a payment on the Site.
        </p>

        <h2>3. Your account</h2>
        <ul>
          <li>You need a free account to make any payment, join a membership, buy from the Shop, or comment.</li>
          <li>Give accurate details, keep your password secret, and tell us straight away if you think someone else has used your account.</li>
          <li>You are responsible for everything done through your account.</li>
          <li>We may suspend or close an account that breaks these Terms.</li>
        </ul>

        <h2>4. Prices and payments</h2>
        <ul>
          <li>Prices are shown in Indian Rupees (INR) and are the full amount you pay. There are no shipping charges.</li>
          <li>All payments are processed by Razorpay Software Private Limited ("Razorpay").</li>
          <li>
            We never see or store your card number, CVV, UPI PIN or net-banking credentials. Razorpay's own terms and privacy
            policy also apply to your payment.
          </li>
          <li>
            A payment is complete only when Razorpay confirms it as successful. We are not responsible for delays or failures
            caused by Razorpay, your bank or your payment provider.
          </li>
          <li>You confirm that you are authorised to use the payment method you choose.</li>
        </ul>

        <h2>5. Support payments</h2>
        <p>
          One-time and monthly support payments are voluntary gifts to {ctx.name}. They are not a purchase of goods or
          services, not an investment, and not a donation to a registered charity, and you receive nothing in return. If you
          tick "Make this monthly", you authorise a charge of the same amount every month through a Razorpay subscription
          until you cancel it from <MyAccount />.
        </p>

        <h2>6. Memberships</h2>
        <ul>
          <li>
            A membership is a monthly subscription. When you join, you authorise Razorpay to charge the tier price every month
            until you cancel.
          </li>
          <li>
            Your benefits are the ones described for your tier when you join. We may change a tier's benefits in future
            months. If a change materially reduces them, we will tell you, and you can cancel before your next charge.
          </li>
          <li>
            You can cancel at any time from <MyAccount />. Cancellation takes effect at the end of the month you have already
            paid for. You keep your benefits until then and are not charged again.
          </li>
          <li>
            Members-only posts are for you alone. Do not copy, publish or share them with people who are not members.
          </li>
        </ul>

        <h2>7. Digital products and services</h2>
        <ul>
          <li>Each item's description in the Shop sets out what you get. Please read it before you buy.</li>
          <li>
            Downloads and software are delivered right after payment. Calls, close-friends access and other services are
            delivered within the times in our <Link to="/return-policy">Shipping &amp; Delivery Policy</Link>.
          </li>
          <li>
            <strong>Software and digital files:</strong> unless the item says otherwise, you get a personal, non-exclusive,
            non-transferable licence to use them for your own purposes. You may not resell, sublicense, redistribute or
            publicly share them, or remove any licence or copyright notice. Ownership stays with {ctx.owner}.
          </li>
          <li>
            Software is provided as described, and it is your responsibility to check the system requirements stated for an
            item before you buy. If software does not work as described, we will help you fix it or refund you as set out
            in our <Link to="/refund-policy">Refund &amp; Cancellation Policy</Link>.
          </li>
          <li>
            Calls are scheduled with you by email at a time that suits both of us. Event tickets are valid only for the event
            and date shown.
          </li>
        </ul>

        <h2>8. What you post</h2>
        <ul>
          <li>
            Your name, message and any video message you send with a support payment are shown publicly on the support page
            and in the Hall of Fame, unless you mark the message as private. Private messages and videos are visible only to{' '}
            {ctx.name}.
          </li>
          <li>Comments on posts are public and show your account name.</li>
          <li>
            You are responsible for what you post. Do not post anything unlawful, abusive, hateful, misleading or sexually
            explicit, anything that infringes someone else's rights, or anything that impersonates another person.
          </li>
          <li>We may hide or remove any name, message, video or comment at our discretion, without notice.</li>
        </ul>

        <h2>9. Acceptable use</h2>
        <p>
          You agree not to misuse the Site. This includes using stolen or unauthorised payment methods, attempting fraud or
          money laundering, sharing paid content or licences without permission, interfering with the Site's security or
          operation, or scraping it in an abusive way. We may block access and report suspected unlawful activity to the
          authorities.
        </p>

        <h2>10. Intellectual property</h2>
        <p>
          The text, images, videos, posts, software and other content on the Site belong to {ctx.owner} or are used with
          permission. Apart from the licence in section 7, you may not copy or reuse them without written permission.
        </p>

        <h2>11. Disclaimer and limitation of liability</h2>
        <p>
          Apart from what is expressly promised for a product or membership, the Site is provided "as is" and "as available".
          To the maximum extent permitted by law, we are not liable for any indirect, incidental or consequential loss arising
          from your use of the Site or of anything bought through it. Our total liability to you for any claim is limited to
          the amount you paid through the Site in the 12 months before the claim. See also our{' '}
          <Link to="/disclaimer">Disclaimer</Link>.
        </p>

        <h2>12. Changes to these Terms</h2>
        <p>
          We may update these Terms from time to time. The "Last updated" date above shows when they last changed. If you
          keep using the Site after a change, you accept the updated Terms. Changes do not affect purchases already made.
        </p>

        <h2>13. Governing law</h2>
        <p>
          These Terms are governed by the laws of India. Any dispute is subject to the exclusive jurisdiction of the competent
          courts in India.
        </p>

        <h2>14. Contact</h2>
        <ContactBlock ctx={ctx} />
      </>
    ),
  },

  privacy: {
    title: 'Privacy Policy',
    render: (ctx) => (
      <>
        <p>
          This Privacy Policy explains what personal data <Operator ctx={ctx} /> ("we", "us") collects on {ctx.site}, why
          we collect it, and the choices you have. We follow the Digital Personal Data Protection Act, 2023 and other
          applicable Indian law.
        </p>

        <h2>1. Information we collect</h2>
        <ul>
          <li>
            <strong>Your account:</strong> your name, email address and password. We store the password only in a scrambled
            (hashed) form that cannot be read back.
          </li>
          <li>
            <strong>When you support:</strong> the name or social handle and the message you enter, any video message you
            record or upload, the amount, whether the message is private, and whether the support is monthly.
          </li>
          <li>
            <strong>When you join a membership or buy from the Shop:</strong> the tier or item, the price, its status, and your
            answer to any question the item asks (for example your Instagram username, or your email and preferred times for
            a call).
          </li>
          <li>
            <strong>Posts:</strong> the posts you like and the comments you write.
          </li>
          <li>
            <strong>From Razorpay:</strong> the payment or subscription ID, amount, currency, status and time. Razorpay
            collects your phone number and payment details directly to process the payment. We do not receive or store full
            card numbers, CVV, UPI PIN or banking passwords.
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
          <li>To create and secure your account and log you in</li>
          <li>To process payments, memberships and monthly subscriptions, and to confirm them</li>
          <li>To deliver what you bought, including emailing you to arrange calls or other services</li>
          <li>To give members and supporters access to the posts meant for them</li>
          <li>To show your name, public message and support in "Recent supporters" and the Hall of Fame</li>
          <li>To reply to your messages, refund requests and cancellation questions</li>
          <li>To prevent fraud and abuse and keep the Site secure</li>
          <li>To keep the financial records that tax and accounting law requires</li>
        </ul>

        <h2>3. What is public</h2>
        <ul>
          <li>
            Your support name or handle, the amount, the time of the payment, and your message and video message (unless you
            marked the message private) appear on the public support page.
          </li>
          <li>The Hall of Fame shows supporters' names with the total they have given and their number of payments.</li>
          <li>Comments on posts show your account name.</li>
          <li>
            To support anonymously, leave the name blank: you will appear as "Someone". Your email address is never shown
            publicly.
          </li>
        </ul>

        <h2>4. Sharing</h2>
        <p>We do not sell or rent your personal data. We share it only with:</p>
        <ul>
          <li>Razorpay, to process payments and subscriptions</li>
          <li>Our hosting and database providers (Vercel, Netlify and MongoDB Atlas), which run the Site and store its data on our behalf</li>
          <li>
            catbox.moe, which stores the images and video messages uploaded to the Site. Anyone who has a file's direct link
            can open it, so please do not record anything confidential in a video message.
          </li>
          <li>YouTube, when a page shows an embedded video. We use YouTube's privacy-enhanced mode.</li>
          <li>Google Fonts, which serves the Site's font and receives your IP address when the page loads</li>
          <li>Government or law-enforcement authorities, when the law requires it</li>
        </ul>

        <h2>5. Cookies and browser storage</h2>
        <p>
          We do not use advertising or analytics cookies. When you log in, the Site keeps a login token in your browser's
          local storage until you log out or it expires after 7 days. If you start a support payment and are asked to sign
          up first, your unfinished message is kept in your browser's session storage until you finish or close the tab.
          Razorpay Checkout and embedded YouTube videos may set their own cookies.
        </p>

        <h2>6. Retention</h2>
        <p>
          We keep your account until you ask us to delete it. We keep payment and purchase records for as long as tax and
          accounting law requires. We keep contact messages only as long as we need them to deal with your request. If you
          ask us to, we will remove your name, message, video message and comments from the public pages.
        </p>

        <h2>7. Your rights</h2>
        <p>
          You can ask to access, correct or delete your personal data or your account, or withdraw your consent, by writing to{' '}
          <Mail ctx={ctx} />. We will respond within 30 days. Some payment records may have to be kept to meet legal
          obligations.
        </p>

        <h2>8. Security</h2>
        <p>
          We use HTTPS, hashed passwords, access controls and payment-signature verification to protect your data. No method
          of transmission or storage is completely secure, but we work to protect your information.
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
          This policy explains when you can get a refund for a payment made on {ctx.site}, and how to cancel a membership or
          monthly support. Payments are made to <Operator ctx={ctx} />. Please check the amount and the item before you pay.
        </p>

        <h2>1. Support payments (one-time and monthly)</h2>
        <p>Support payments are voluntary gifts and are not refundable, except when:</p>
        <ul>
          <li>You were charged more than once for the same payment (a duplicate payment)</li>
          <li>A technical error charged an amount different from the one you entered</li>
          <li>The payment was made without your authorisation</li>
          <li>You were charged for monthly support after your cancellation had taken effect</li>
        </ul>

        <h2>2. Memberships</h2>
        <ul>
          <li>
            You can cancel a membership at any time from <MyAccount />. It ends at the end of the month you have already paid
            for, and you are not charged again.
          </li>
          <li>We do not give partial refunds for the unused part of a month.</li>
          <li>
            We refund a membership charge in full if it was a duplicate, was made after your cancellation took effect, or was
            made without your authorisation.
          </li>
        </ul>

        <h2>3. Software and digital downloads</h2>
        <p>
          Digital items are delivered instantly and cannot be returned, so they are not refundable once delivered, except
          when:
        </p>
        <ul>
          <li>The file or download link does not work, and we cannot fix it or send a working copy within 7 days of your report</li>
          <li>The software or file is materially different from its description in the Shop</li>
          <li>The item was not delivered (see our <Link to="/return-policy">Shipping &amp; Delivery Policy</Link>)</li>
          <li>You were charged twice for the same item</li>
        </ul>

        <h2>4. Calls, close-friends access and other services</h2>
        <ul>
          <li>
            You get a full refund if we cancel a call and cannot offer another time that suits you, or if we cannot schedule
            it within 30 days of your purchase.
          </li>
          <li>
            You can reschedule a call once by telling us at least 24 hours before it starts. If you miss a call without notice,
            it is not refunded.
          </li>
          <li>For close-friends access and similar services, you get a full refund if we do not provide them within 7 days.</li>
        </ul>

        <h2>5. Event tickets</h2>
        <p>
          Tickets are not refundable, except that you get a full refund if the event is cancelled, or if it moves to a new
          date and you cannot attend.
        </p>

        <h2>6. How to request a refund</h2>
        <p>
          Email <Mail ctx={ctx} /> within <strong>7 days</strong> of the charge (or of the problem, for items delivered
          later). Include:
        </p>
        <ul>
          <li>The Razorpay payment ID (it starts with "pay_" and appears in Razorpay's confirmation email)</li>
          <li>The email address of your account</li>
          <li>The item or membership, the amount and the date of the payment</li>
          <li>The reason for the request</li>
        </ul>

        <h2>7. Processing time</h2>
        <p>
          We review each request and reply within 3 business days. Approved refunds are made through Razorpay to the{' '}
          <strong>original payment method</strong>. Your bank usually credits the money within 5–7 business days after we
          start the refund. The exact time depends on your bank or card issuer.
        </p>

        <h2>8. Failed payments</h2>
        <p>
          If money left your account but the payment shows as failed, Razorpay or your bank normally reverses it automatically
          within 5–7 business days. If it hasn't come back after that, contact us with the details and we will help.
        </p>

        <h2>9. Cancelling monthly support or a membership</h2>
        <p>
          Go to <MyAccount /> and press <strong>Cancel</strong> next to the subscription. If you cannot, email{' '}
          <Mail ctx={ctx} /> with your payment or subscription ID, and we will cancel it within 2 business days and confirm by
          email. Charges made before the cancellation takes effect are not refunded, unless sections 1 or 2 say otherwise.
        </p>

        <h2>10. Chargebacks</h2>
        <p>
          Please contact us before you raise a dispute or chargeback with your bank. Most issues can be fixed faster directly.
        </p>

        <h2>11. Contact</h2>
        <ContactBlock ctx={ctx} />
      </>
    ),
  },

  return: {
    title: 'Shipping, Delivery & Return Policy',
    render: (ctx) => (
      <>
        <p>
          <Operator ctx={ctx} /> sells only digital products, online services and memberships on {ctx.site}.{' '}
          <strong>No physical goods are sold, shipped or delivered</strong>, so there are no shipping charges, couriers or
          delivery addresses.
        </p>

        <h2>1. How and when you receive your purchase</h2>
        <p>Delivery starts as soon as Razorpay confirms your payment:</p>
        <ul>
          <li>
            <strong>Software and digital downloads:</strong> delivered instantly. The download link appears on the
            confirmation screen and stays available under Purchases in <MyAccount />.
          </li>
          <li>
            <strong>Memberships:</strong> start instantly. Members-only posts unlock right away, and your membership is listed
            in <MyAccount />.
          </li>
          <li>
            <strong>1-on-1 calls:</strong> we email you within 24 hours, at your account email, to agree a time. The call takes
            place online within 30 days of your purchase.
          </li>
          <li>
            <strong>Instagram close-friends access and similar services:</strong> provided within 24 hours.
          </li>
          <li>
            <strong>Event tickets:</strong> your ticket is confirmed instantly on screen and in <MyAccount />. Show it at the
            entrance.
          </li>
        </ul>
        <p>
          If an item's description in the Shop states a different delivery time, that time applies. Nothing is ever delivered
          later than 7 days after payment, except calls and events, which take place on the agreed or advertised date.
        </p>

        <h2>2. If you don't receive it</h2>
        <p>
          Check <MyAccount /> first, and your spam folder for our email. If something is still missing after the delivery time
          above, email <Mail ctx={ctx} /> with your Razorpay payment ID and we will deliver it or refund you.
        </p>

        <h2>3. Returns and exchanges</h2>
        <p>
          Digital items and services cannot be returned or exchanged once delivered. If an item does not work or is not as
          described, our <Link to="/refund-policy">Refund &amp; Cancellation Policy</Link> explains when you get a refund and
          how to ask for one.
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
          The information on {ctx.site} is published by <Operator ctx={ctx} /> in good faith and for general information
          only.
        </p>

        <h2>1. Personal creator page, not a charity</h2>
        <p>
          This is the personal page of an individual creator. {ctx.owner} is not a registered charity, NGO, trust or
          crowdfunding platform. Support payments are <strong>not tax-deductible</strong>, and no 80G or similar tax receipts
          are issued.
        </p>

        <h2>2. Not an investment</h2>
        <p>
          Support payments are gifts. Memberships and Shop purchases give you only what their descriptions state. None of them
          buys you any ownership, profit share, interest or guaranteed return.
        </p>

        <h2>3. Software</h2>
        <p>
          Software sold on the Site is provided as described in its listing. Apart from that description, it is provided
          without any other warranty. Keep backups of your data, and check the stated system requirements before you buy and
          install anything.
        </p>

        <h2>4. No professional advice</h2>
        <p>
          Posts, tips, recommendations, calls and other content shared here or on linked channels reflect personal
          experience. They are not professional, legal, financial, medical or safety advice. Check details with official
          sources before you rely on them.
        </p>

        <h2>5. Accuracy</h2>
        <p>
          We try to keep information accurate and up to date, but we make no warranty about its completeness or accuracy.
          Plans and details can change without notice. Prices for an order are fixed once you pay.
        </p>

        <h2>6. External links</h2>
        <p>
          The Site links to external websites and social profiles that we do not control. We are not responsible for their
          content, availability or privacy practices.
        </p>

        <h2>7. Trademarks and affiliation</h2>
        <p>
          Product names, logos and brands that appear on this Site, including inside images, belong to their respective
          owners. This Site is independent. It is not affiliated with, sponsored or endorsed by any crowdfunding or tipping
          platform. Razorpay is used only as the payment processor.
        </p>

        <h2>8. Contact</h2>
        <ContactBlock ctx={ctx} />
      </>
    ),
  },
};
