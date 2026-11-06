import { formatMoney } from '../lib/format.js';
import { useI18n } from '../i18n/index.jsx';

const strong = (text) => <strong>{text}</strong>;

export default function GoalCard({ goal, raised, supporters, currency }) {
  const { t, tr } = useI18n();
  const pct = (raised / goal.amount) * 100;
  const pctLabel = raised > 0 && pct < 1 ? '<1' : Math.floor(pct);
  const remaining = Math.ceil(goal.amount - raised);

  return (
    <section className="feature-box goal-card" aria-label={t('goal.label')}>
      {goal.title && <h2 className="goal-title">{goal.title}</h2>}
      {goal.raisingFor && (
        <p className="goal-for">
          {tr('goal.raisingFor', { names: strong(goal.raisingFor) })}
        </p>
      )}
      <p className="goal-amounts">
        {tr('goal.raisedOf', { raised: strong(formatMoney(Math.floor(raised), currency)), goal: formatMoney(goal.amount, currency) })}
      </p>
      <div className="goal-bar" role="progressbar" aria-label={t('goal.progress')} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.min(100, Math.floor(pct))}>
        <span style={{ width: raised > 0 ? `max(${Math.min(100, pct)}%, 8px)` : 0 }} />
      </div>
      <p className="goal-meta">
        <span>
          {tr('goal.funded', { pct: strong(`${pctLabel}%`) })}
          {' · '}
          {remaining > 0 ? t('goal.toGo', { amount: formatMoney(remaining, currency) }) : t('goal.reached')}
        </span>
        <span>
          {t('goal.supporters', { count: supporters })}
        </span>
      </p>
    </section>
  );
}
