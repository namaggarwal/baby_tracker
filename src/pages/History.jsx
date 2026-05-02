import { useEvents } from '../hooks/useEvents';
import './History.css';

export default function History() {
  const events = useEvents();

  // Group events by date
  const groupedEvents = events?.reduce((acc, event) => {
    const date = new Date(event.timestamp).toLocaleDateString();
    if (!acc[date]) acc[date] = [];
    acc[date].push(event);
    return acc;
  }, {});

  return (
    <div className="container history-page">
      <header className="page-header">
        <h2>History</h2>
      </header>
      
      <div className="timeline-container">
        {groupedEvents && Object.keys(groupedEvents).map(date => (
          <div key={date} className="timeline-day">
            <h3 className="date-header">{date}</h3>
            <div className="day-events">
              {groupedEvents[date].map(event => (
                <div key={event.id} className="timeline-item">
                  <div className="timeline-time">
                    {new Date(event.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </div>
                  <div className="timeline-dot-container">
                    <div className="timeline-line"></div>
                    <div className="timeline-icon" style={{
                      backgroundColor: event.type === 'feed' ? 'var(--color-sage)' :
                                     event.type === 'sleep' ? 'var(--color-lavender)' :
                                     event.type === 'diaper' ? '#c2b280' : '#8fbcd4'
                    }}>
                      {event.type === 'feed' && <span className="material-symbols-outlined material-icons-filled" style={{ fontSize: '16px', color: '#fff' }}>nutrition</span>}
                      {event.type === 'sleep' && <span className="material-symbols-outlined material-icons-filled" style={{ fontSize: '16px', color: '#fff' }}>bedtime</span>}
                      {event.type === 'diaper' && <span className="material-symbols-outlined material-icons-filled" style={{ fontSize: '16px', color: '#fff' }}>water_drop</span>}
                      {event.type === 'bath' && <span className="material-symbols-outlined material-icons-filled" style={{ fontSize: '16px', color: '#fff' }}>bathtub</span>}
                      {event.type === 'tummy' && <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#fff' }}>face</span>}
                    </div>
                  </div>
                  <div className="timeline-content glass">
                    <div className="content-title">
                      {event.type === 'feed' 
                        ? (event.subtype === 'breast' ? 'Breast Feed' : 'Formula Feed') 
                        : event.type === 'diaper' ? `${event.subtype ? event.subtype.charAt(0).toUpperCase() + event.subtype.slice(1) : 'Wet'} Nappy` : event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                    </div>
                    <div className="content-details">
                      {event.type === 'sleep' ? (
                        <>
                          <span>{new Date(event.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {event.endTime ? new Date(event.endTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Ongoing'}</span>
                          {event.duration && <span style={{ opacity: 0.8 }}> • {event.duration}</span>}
                          {event.notes && <div style={{ fontStyle: 'italic', marginTop: '4px', opacity: 0.8 }}>"{event.notes}"</div>}
                        </>
                      ) : event.type === 'feed' ? (
                        <>
                          <span>{event.quantity_ml ? `${event.quantity_ml}ml ` : ''}{event.subtype === 'breast' ? 'Breastmilk' : 'Formula'}</span>
                          {event.subtype === 'breast' && event.side && (
                            <span> • {event.side.charAt(0).toUpperCase() + event.side.slice(1)} Side</span>
                          )}
                          {event.notes && <div style={{ fontStyle: 'italic', marginTop: '4px', opacity: 0.8 }}>"{event.notes}"</div>}
                        </>
                      ) : event.type === 'diaper' ? (
                        <>
                          <span>{event.size ? `${event.size === 'S' ? 'Small' : event.size === 'M' ? 'Medium' : 'Large'}` : 'Normal'}</span>
                          {event.notes && <div style={{ fontStyle: 'italic', marginTop: '4px', opacity: 0.8 }}>"{event.notes}"</div>}
                        </>
                      ) : (
                        event.notes ? <div style={{ fontStyle: 'italic', marginTop: '4px', opacity: 0.8 }}>"{event.notes}"</div> : 'Recorded entry'
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
        {(!events || events.length === 0) && (
          <div className="empty-state">
            <div className="empty-icon-container">
              <span className="material-symbols-outlined" style={{ fontSize: '64px' }}>history_toggle_off</span>
            </div>
            <h3>No activities yet</h3>
            <p>Your baby's journey starts here. Log your first activity to see it in the timeline.</p>
          </div>
        )}
      </div>
    </div>
  );
}
