import { useState } from 'react';
import { useSettings } from '../hooks/useSettings';
import { clearAllEvents } from '../hooks/useEvents';
import { fetchFromCloud } from '../utils/sync';
import { useToast } from '../context/ToastContext';
import './Settings.css';

export default function Settings() {
  const { settings, updateSetting, resetSettings } = useSettings();
  const { showToast } = useToast();
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(settings?.babyName || '');
  const [isSyncing, setIsSyncing] = useState(false);

  const handleDeleteAllData = async () => {
    await clearAllEvents();
    await resetSettings();
    window.location.reload();
  };

  const handleSaveName = async () => {
    await updateSetting('babyName', tempName);
    setIsEditingName(false);
  };

  const handleSyncNow = async () => {
    if (isSyncing) return;
    setIsSyncing(true);
    const success = await fetchFromCloud();
    setIsSyncing(false);
    if (success) {
      showToast('Data synced from cloud!');
    } else {
      showToast('Sync failed. Check connection.', 'error');
    }
  };

  return (
    <div className="container settings-page">
      <header className="page-header">
        <h2>Settings</h2>
      </header>
      
      <section className="settings-section profile-section">
        <div className="profile-upload-container">
          <div className="profile-image-wrapper" onClick={() => document.getElementById('profile-upload').click()}>
            <img 
              src={settings?.profileImage || 'https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=120&q=80'} 
              alt="Baby Profile" 
              className="settings-avatar" 
              onError={(e) => { e.target.onerror = null; e.target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120"><circle cx="60" cy="60" r="60" fill="%23e6e9e4"/><path d="M60 30c-9.9 0-18 8.1-18 18s8.1 18 18 18 18-8.1 18-18-8.1-18-18-18zm0 40c-15.5 0-45 7.8-45 23.3V100h90v-6.7c0-15.5-29.5-23.3-45-23.3z" fill="%23a8ae9e"/></svg>'; }}
            />
            <div className="upload-overlay">
              <span className="material-symbols-outlined">photo_camera</span>
            </div>
            <input 
              type="file" 
              id="profile-upload" 
              accept="image/*" 
              onChange={async (e) => {
                const file = e.target.files[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onloadend = async () => {
                    await updateSetting('profileImage', reader.result);
                  };
                  reader.readAsDataURL(file);
                }
              }} 
              hidden 
            />
          </div>
          <div className="profile-info">
            <label>Baby's Profile Photo</label>
            <p className="setting-description">Tap the photo to upload a new one</p>
          </div>
        </div>
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

        <div className="setting-item">
          <label>Time Format</label>
          <div className="segment-control settings-segment">
            <button 
              className={`segment-btn ${settings?.timeFormat !== '12h' ? 'active' : ''}`}
              onClick={() => updateSetting('timeFormat', '24h')}
            >
              24 Hours
            </button>
            <button 
              className={`segment-btn ${settings?.timeFormat === '12h' ? 'active' : ''}`}
              onClick={() => updateSetting('timeFormat', '12h')}
            >
              12 Hours
            </button>
          </div>
        </div>
      </section>

      <section className="settings-section">
        <h3>Reminders & Suggestions</h3>
        <div className="setting-item">
          <label>Feeding Interval (Hours)</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '8px' }}>
            <input 
              type="range" 
              min="1" 
              max="8" 
              step="0.5"
              value={settings?.feedingInterval || 3} 
              onChange={(e) => updateSetting('feedingInterval', parseFloat(e.target.value))}
              style={{ flex: 1, accentColor: 'var(--color-primary)' }}
            />
            <span style={{ minWidth: '45px', fontWeight: '700', color: 'var(--color-primary)' }}>{settings?.feedingInterval || 3}h</span>
          </div>
          <p className="setting-description">Recommend next feed after this interval.</p>
        </div>

        <div className="setting-item">
          <label>Nappy Change Interval (Hours)</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '8px' }}>
            <input 
              type="range" 
              min="1" 
              max="8" 
              step="0.5"
              value={settings?.nappyInterval || 3} 
              onChange={(e) => updateSetting('nappyInterval', parseFloat(e.target.value))}
              style={{ flex: 1, accentColor: 'var(--color-primary)' }}
            />
            <span style={{ minWidth: '45px', fontWeight: '700', color: 'var(--color-primary)' }}>{settings?.nappyInterval || 3}h</span>
          </div>
          <p className="setting-description">Recommend next change after this interval.</p>
        </div>
      </section>
      
      <section className="settings-section">
        <h3>Daily Goals</h3>
        <div className="setting-item">
          <label>Tummy Time Goal (Minutes)</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '8px' }}>
            <input 
              type="range" 
              min="5" 
              max="120" 
              step="5"
              value={settings?.tummyGoal || 30} 
              onChange={(e) => updateSetting('tummyGoal', parseInt(e.target.value))}
              style={{ flex: 1, accentColor: 'var(--color-primary)' }}
            />
            <span style={{ minWidth: '45px', fontWeight: '700', color: 'var(--color-primary)' }}>{settings?.tummyGoal || 30}m</span>
          </div>
        </div>

        <div className="setting-item">
          <label>Feeding Goal (Number of feeds)</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '8px' }}>
            <input 
              type="range" 
              min="1" 
              max="15" 
              step="1"
              value={settings?.feedGoal || 8} 
              onChange={(e) => updateSetting('feedGoal', parseInt(e.target.value))}
              style={{ flex: 1, accentColor: 'var(--color-primary)' }}
            />
            <span style={{ minWidth: '45px', fontWeight: '700', color: 'var(--color-primary)' }}>{settings?.feedGoal || 8}</span>
          </div>
        </div>

        <div className="setting-item">
          <label>Nappy Change Goal (Number of changes)</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '8px' }}>
            <input 
              type="range" 
              min="1" 
              max="15" 
              step="1"
              value={settings?.nappyGoal || 6} 
              onChange={(e) => updateSetting('nappyGoal', parseInt(e.target.value))}
              style={{ flex: 1, accentColor: 'var(--color-primary)' }}
            />
            <span style={{ minWidth: '45px', fontWeight: '700', color: 'var(--color-primary)' }}>{settings?.nappyGoal || 6}</span>
          </div>
        </div>
      </section>

      <section className="settings-section">
        <h3>Data & Sync</h3>
        <div className="setting-item">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <label>Google Sheets Backup</label>
              <p className="setting-description">Automatic cloud backup enabled.</p>
              <p style={{ marginTop: '8px', fontSize: '12px', color: 'var(--color-on-surface-variant)' }}>
                <strong>Last Sync:</strong> {settings?.lastSync ? new Date(settings.lastSync).toLocaleString() : 'Never'}
              </p>
            </div>
            <button 
              className="btn-secondary" 
              onClick={handleSyncNow}
              disabled={isSyncing}
              style={{ padding: '8px 16px', borderRadius: '20px', fontSize: '13px', opacity: isSyncing ? 0.7 : 1 }}
            >
              {isSyncing ? 'Syncing...' : 'Sync Now'}
            </button>
          </div>

          <div style={{ marginTop: '20px' }}>
            <label style={{ fontSize: '13px', fontWeight: '600' }}>Sync Password / API Key</label>
            <input 
              type="password" 
              placeholder="Enter security key"
              value={settings?.syncPassword || ''} 
              onChange={(e) => updateSetting('syncPassword', e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '12px',
                border: '1px solid var(--color-surface-dim)',
                background: 'var(--color-surface-container)',
                marginTop: '8px',
                fontSize: '14px',
                outline: 'none'
              }}
            />
            <p className="setting-description" style={{ marginTop: '4px', fontSize: '11px' }}>
              Must match the password set in your Google Apps Script.
            </p>
          </div>
          <div className="status-badge" style={{ 
            marginTop: '16px', 
            padding: '8px 12px', 
            borderRadius: '8px', 
            background: 'var(--color-surface-container)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '12px',
            fontWeight: '600',
            color: 'var(--color-primary)'
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>check_circle</span>
            System connected and healthy
          </div>
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
