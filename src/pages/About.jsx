import { assetUrl } from '../lib/api.js';
import { Link } from 'react-router-dom';
import InfoLayout from '../components/InfoLayout.jsx';
import { hostOf } from '../lib/format.js';

export default function About() {
  return (
    <InfoLayout title="About">
      {(creator) => (
        <div className="info-body">
          <div className="about-hero">
            {creator.avatar && <img src={assetUrl(creator.avatar)} alt={creator.name} className="about-hero-avatar" />}
            <div>
              <h2 className="about-hero-name">{creator.name}</h2>
              <p className="muted">Full Stack Software Engineer building scalable web applications</p>
            </div>
          </div>

          <h2>Who I am</h2>
          <p>
            Hi, I'm {creator.name}. I'm a full stack software engineer who builds scalable web applications. I love
            building things for the web and sharing what I learn along the way.
          </p>

          <h2>About this page</h2>
          <div className="about-body" dangerouslySetInnerHTML={{ __html: creator.about }} />

          <h2>What you can do here</h2>
          <ul>
            <li>
              <strong>Support me</strong> with any amount, once or monthly, on the <Link to={`/${creator.slug}`}>support page</Link>.
            </li>
            <li>
              <strong>Become a member</strong> for a monthly fee and get the benefits listed on the{' '}
              <Link to={`/${creator.slug}/membership`}>Membership page</Link>, such as members-only posts.
            </li>
            <li>
              <strong>Buy digital products</strong> such as software and downloads, or book a 1-on-1 call, in the{' '}
              <Link to={`/${creator.slug}/shop`}>Shop</Link>. Downloads are delivered instantly. Nothing physical is sold or
              shipped.
            </li>
          </ul>

          <h2>Good to know</h2>
          <ul>
            <li>You need a free account to pay, so your purchases and memberships are always in My account.</li>
            <li>Payments are processed securely by Razorpay. Card and bank details never reach this site.</li>
            <li>Your name and message appear in "Recent supporters", unless you keep the message private.</li>
            <li>
              Please read the <Link to="/terms">Terms</Link>, <Link to="/refund-policy">Refund Policy</Link>,{' '}
              <Link to="/return-policy">Shipping &amp; Delivery Policy</Link> and <Link to="/privacy">Privacy Policy</Link>{' '}
              before you pay.
            </li>
          </ul>

          {creator.links.length > 0 && (
            <>
              <h2>Find me online</h2>
              <ul>
                {creator.links.map((url) => (
                  <li key={url}>
                    <a href={url} target="_blank" rel="noopener noreferrer">
                      {hostOf(url)}
                    </a>
                  </li>
                ))}
              </ul>
            </>
          )}

          <h2>Get in touch</h2>
          <p>
            Have a question or a travel tip for me? <Link to="/contact">Contact me</Link>.
          </p>
        </div>
      )}
    </InfoLayout>
  );
}
