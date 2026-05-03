import { useEffect, useRef } from 'react';
import { useEvents } from '../hooks/useEvents';
import { useSettings } from '../hooks/useSettings';

export default function NotificationManager() {
  const events = useEvents();
  const { settings } = useSettings();
  const lastNotifiedRef = useRef({ feed: 0, diaper: 0 });

  useEffect(() => {
    if (!settings?.notificationsEnabled || !events) return;

    const checkNotifications = () => {
      const now = Date.now();
      
      // Check Feed
      const lastFeed = events.find(e => e.type === 'feed');
      if (lastFeed && lastFeed.timestamp) {
        const intervalMs = (settings.feedingInterval || 3) * 60 * 60 * 1000;
        const timeSinceLast = now - lastFeed.timestamp;
        
        if (timeSinceLast >= intervalMs && (now - lastNotifiedRef.current.feed) > 1800000) { // Notify max once per 30 mins
          sendNotification('Feeding Reminder', `It's been ${Math.floor(timeSinceLast / 3600000)} hours since the last feed.`);
          lastNotifiedRef.current.feed = now;
        }
      }

      // Check Diaper
      const lastDiaper = events.find(e => e.type === 'diaper');
      if (lastDiaper && lastDiaper.timestamp) {
        const intervalMs = (settings.nappyInterval || 3) * 60 * 60 * 1000;
        const timeSinceLast = now - lastDiaper.timestamp;
        
        if (timeSinceLast >= intervalMs && (now - lastNotifiedRef.current.diaper) > 1800000) {
          sendNotification('Nappy Change Reminder', `It's been ${Math.floor(timeSinceLast / 3600000)} hours since the last change.`);
          lastNotifiedRef.current.diaper = now;
        }
      }
    };

    const sendNotification = (title, body) => {
      if (Notification.permission === 'granted') {
        new Notification(title, {
          body,
          icon: '/favicon.svg'
        });
      }
    };

    const interval = setInterval(checkNotifications, 60000); // Check every minute
    checkNotifications(); // Check immediately on load

    return () => clearInterval(interval);
  }, [events, settings]);

  return null; // This is a background logic component
}
