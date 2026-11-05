import { useEffect, useState } from 'react';
import Spinner from '../../components/Spinner.jsx';
import TransactionList from '../../components/studio/TransactionList.jsx';
import { CalendarIcon, CoinIcon, HeartIcon } from '../../components/icons.jsx';
import { EmptyFirstSupporter } from './StudioHome.jsx';
import { api } from '../../lib/api.js';
import { formatMoney } from '../../lib/format.js';

const TABS = [
  ['tip', 'One-time & monthly'],
  ['membership', 'Memberships'],
  ['shop', 'Shop orders'],
  ['', 'All'],
];

const STATUSES = [
  ['paid', 'Successful'],
  ['created', 'Pending'],
  ['failed', 'Failed'],
];

function peopleLabel(type, n) {
  const [one, many] = type === 'shop' ? ['Buyer', 'Buyers'] : type === 'membership' ? ['Member', 'Members'] : ['Supporter', 'Supporters'];
  return n === 1 ? one : many;
}

export function TransactionsPanel({ type, title }) {
  const [status, setStatus] = useState('paid');
  const [page, setPage] = useState(1);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    setData(null);
    setError('');
    const q = new URLSearchParams({ status, page: String(page), ...(type ? { type } : {}) });
    api(`/studio/transactions?${q}`)
      .then(setData)
      .catch((err) => setError(err.message));
  }, [type, status, page]);

  return (
    <section className="studio-card">
      {data && (
        <div className="stat-tiles">
          <div className="stat-tile">
            <strong>{data.stats.supporters}</strong>
            <span>
              <HeartIcon width={16} height={16} /> {peopleLabel(type, data.stats.supporters)}
            </span>
          </div>
          <div className="stat-tile">
            <strong>{formatMoney(data.stats.last30.total)}</strong>
            <span>
              <CalendarIcon width={16} height={16} /> Last 30 days
            </span>
          </div>
          <div className="stat-tile">
            <strong>{formatMoney(data.stats.allTime.total)}</strong>
            <span>
              <CoinIcon width={16} height={16} /> All-time
            </span>
          </div>
        </div>
      )}
      <div className="studio-list-head">
        {title && <h2 className="dash-h2">{title}</h2>}
        <select className="period-select" value={status} onChange={(e) => (setStatus(e.target.value), setPage(1))} aria-label="Status">
          {STATUSES.map(([v, label]) => (
            <option key={v} value={v}>
              {label}
            </option>
          ))}
        </select>
      </div>
      {error && <p className="form-error">{error}</p>}
      {!data && !error && <Spinner />}
      {data && data.transactions.length === 0 && (status === 'paid' ? <EmptyFirstSupporter /> : <p className="muted dash-empty">Nothing here.</p>)}
      {data && data.transactions.length > 0 && <TransactionList items={data.transactions} />}
      {data && data.pages > 1 && (
        <div className="pager">
          <button type="button" className="pill-btn pill-outline" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            Previous
          </button>
          <span className="muted">
            Page {data.page} of {data.pages}
          </span>
          <button type="button" className="pill-btn pill-outline" disabled={page >= data.pages} onClick={() => setPage((p) => p + 1)}>
            Next
          </button>
        </div>
      )}
    </section>
  );
}

export default function StudioSupporters() {
  const [type, setType] = useState('tip');

  useEffect(() => {
    document.title = 'Supporters';
  }, []);

  return (
    <div className="studio-stack">
      <h1 className="studio-title">Supporters</h1>
      <div className="underline-tabs" role="tablist">
        {TABS.map(([v, label]) => (
          <button key={v} type="button" role="tab" aria-selected={type === v} className={type === v ? 'active' : ''} onClick={() => setType(v)}>
            {label}
          </button>
        ))}
      </div>
      <TransactionsPanel key={type} type={type} />
    </div>
  );
}
