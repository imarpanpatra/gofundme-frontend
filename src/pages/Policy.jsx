import InfoLayout from '../components/InfoLayout.jsx';
import { POLICIES, POLICIES_UPDATED, contextFor } from '../content/policies.jsx';

export default function Policy({ kind }) {
  const policy = POLICIES[kind];
  return (
    <InfoLayout title={policy.title} updated={POLICIES_UPDATED}>
      {(creator) => <div className="info-body">{policy.render(contextFor(creator))}</div>}
    </InfoLayout>
  );
}
