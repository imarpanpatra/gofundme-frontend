export default function Spinner({ fullPage, small }) {
  const ring = <span className={`spinner${small ? ' spinner-sm' : ''}`} aria-label="Loading" />;
  return fullPage ? <div className="spinner-page">{ring}</div> : ring;
}
