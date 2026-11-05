import Modal from './Modal.jsx';
import PageSettingsForm from './PageSettingsForm.jsx';

export default function EditPageModal({ creator, onClose, onSaved }) {
  return (
    <Modal title="Edit page" onClose={onClose} width={600}>
      <PageSettingsForm creator={creator} onSaved={onSaved} onCancel={onClose} />
    </Modal>
  );
}
