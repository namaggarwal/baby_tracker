import { addEvent } from '../hooks/useEvents';
import { useNavigate } from 'react-router-dom';
import './QuickAddMenu.css';

export default function QuickAddMenu({ onClose }) {
  const navigate = useNavigate();
  const actions = [
    { id: 'feed', icon: 'baby_changing_station', label: 'Feeding', color: 'rgba(67, 100, 68, 0.1)' },
    { id: 'sleep', icon: 'bedtime', label: 'Sleep', color: 'rgba(97, 89, 126, 0.2)' },
    { id: 'diaper', icon: 'layers', label: 'Nappy', color: 'rgba(93, 92, 85, 0.1)' },
    { id: 'medicine', icon: 'medical_services', label: 'Medicine', color: 'rgba(186, 26, 26, 0.1)' },
    { id: 'tummy', icon: 'child_care', label: 'Tummy', color: 'rgba(159, 168, 163, 0.2)' },
    { id: 'bath', icon: 'bathtub', label: 'Bath', color: 'rgba(203, 240, 204, 0.5)' },
  ];

  const handleAction = async (actionId) => {
    onClose();
    if (actionId === 'feed') {
      navigate('/log/feed');
    } else if (actionId === 'diaper') {
      navigate('/log/nappy');
    } else if (actionId === 'sleep') {
      navigate('/log/sleep');
    } else if (actionId === 'medicine') {
      navigate('/log/medicine');
    } else {
      await addEvent({ type: actionId });
    }
  };

  return (
    <div className="sheet-overlay" onClick={onClose}>
      <div className="quick-add-sheet" onClick={e => e.stopPropagation()}>
        <div className="sheet-header">
          <h3>Quick Log</h3>
        </div>
        <div className="actions-grid">
          {actions.map(action => (
            <button key={action.id} className="action-card" onClick={() => handleAction(action.id)}>
              <div className="icon-circle" style={{ backgroundColor: action.color }}>
                <span className="material-symbols-outlined material-icons-filled" style={{ fontSize: '32px' }}>
                  {action.icon}
                </span>
              </div>
              <span className="action-label">{action.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
