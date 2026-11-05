import { useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import PageSettingsForm from '../../components/PageSettingsForm.jsx';
import { refreshSite } from '../../lib/useSite.js';
import { primeCreator } from '../../lib/useCreator.js';

export default function StudioSettings() {
  const { creator, setCreator } = useOutletContext();

  useEffect(() => {
    document.title = 'Page settings';
  }, []);

  return (
    <div className="studio-stack">
      <h1 className="studio-title">Page settings</h1>
      <section className="studio-card">
        <PageSettingsForm
          creator={creator}
          onSaved={(updated) => {
            setCreator(updated);
            refreshSite(updated);
            primeCreator(updated);
          }}
        />
      </section>
    </div>
  );
}
