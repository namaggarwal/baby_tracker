import { useState } from 'react';
import { useSettings } from '../hooks/useSettings';
import { clearAllEvents } from '../hooks/useEvents';
import './Settings.css';

export default function Settings() {
  const { settings, updateSetting, resetSettings } = useSettings();
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(settings?.babyName || '');

  const handleDeleteAllData = async () => {
    await clearAllEvents();
    await resetSettings();
    window.location.reload();
  };

  const handleSaveName = async () => {
    await updateSetting('babyName', tempName);
    setIsEditingName(false);
  };

  return (
    <div className="container settings-page">
      <header className="page-header">
        <h2>Settings</h2>
      </header>
      
      <section className="settings-section">
        <h3>General</h3>
        <div className="setting-item">
          <label>Baby's Name</label>
          <div className="name-edit-container">
            {isEditingName ? (
              <div className="inline-edit">
                <input 
                  type="text" 
                  value={tempName} 
                  onChange={(e) => setTempName(e.target.value)}
                  placeholder="e.g. Tara"
                  className="settings-input"
                  autoFocus
                />
                <button className="icon-btn-small save" onClick={handleSaveName}>
                  <span className="material-symbols-outlined">check</span>
                </button>
                <button className="icon-btn-small cancel" onClick={() => setIsEditingName(false)}>
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
            ) : (
              <div className="name-display" onClick={() => { setTempName(settings?.babyName || 'Tara'); setIsEditingName(true); }}>
                <span className="display-text">{settings?.babyName || 'Tara'}</span>
                <span className="material-symbols-outlined edit-icon">edit</span>
              </div>
            )}
          </div>
        </div>
      </section>
      
      <section className="settings-section">
        <h3>Data & Sync</h3>
        <div className="setting-item">
          <label>Google Sheets Sync</label>
          <p className="setting-description">Connect to Google Sheets to back up your data.</p>
          <button className="btn-secondary" disabled style={{ opacity: 0.5 }}>Connect (Coming Soon)</button>
        </div>
      </section>

      <section className="settings-section danger-zone">
        <h3 className="danger-title">Danger Zone</h3>
        <div className="setting-item">
          <p className="setting-description">Permanently delete all events and reset settings.</p>
          <button className="btn-danger" onClick={() => setShowConfirmModal(true)}>
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>delete_forever</span>
            Delete All Data
          </button>
        </div>
      </section>

      {showConfirmModal && (
        <div className="modal-overlay" onClick={() => setShowConfirmModal(false)}>
          <div className="confirmation-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-icon-header">
              <span className="material-symbols-outlined danger-text" style={{ fontSize: '48px' }}>warning</span>
            </div>
            <h3>Are you absolutely sure?</h3>
            <p>This action will permanently delete all your activity logs and reset your settings. This cannot be undone.</p>
            <div className="modal-actions">
              <button className="modal-btn-cancel" onClick={() => setShowConfirmModal(false)}>Cancel</button>
              <button className="modal-btn-confirm" onClick={handleDeleteAllData}>Yes, Delete Everything</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
