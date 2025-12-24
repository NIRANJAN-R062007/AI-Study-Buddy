import { useState, useEffect, useCallback } from 'react';

export function useNotifications() {
  const [notifications, setNotifications] = useState([]);

  const showNotification = useCallback((title, message, type = 'info') => {
    const id = Date.now();
    const notification = {
      id,
      title,
      message,
      type,
      timestamp: new Date()
    };

    setNotifications(prev => [...prev, notification]);

    // Auto remove after 5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  }, []);

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return { notifications, showNotification, removeNotification };
}

// Notification Component
export function NotificationContainer({ notifications, onRemove }) {
  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      zIndex: 1000
    }}>
      {notifications.map(notification => (
        <div
          key={notification.id}
          style={{
            background: notification.type === 'success' ? '#d4edda' : 
                        notification.type === 'error' ? '#f8d7da' : 
                        notification.type === 'warning' ? '#fff3cd' : '#d1ecf1',
            border: `1px solid ${
              notification.type === 'success' ? '#c3e6cb' : 
              notification.type === 'error' ? '#f5c6cb' : 
              notification.type === 'warning' ? '#ffeaa7' : '#bee5eb'
            }`,
            color: notification.type === 'success' ? '#155724' : 
                   notification.type === 'error' ? '#721c24' : 
                   notification.type === 'warning' ? '#856404' : '#0c5460',
            padding: '12px 20px',
            marginBottom: '10px',
            borderRadius: '4px',
            minWidth: '300px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <strong>{notification.title}</strong>
              <div>{notification.message}</div>
            </div>
            <button
              onClick={() => onRemove(notification.id)}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '18px',
                cursor: 'pointer',
                color: 'inherit'
              }}
            >
              ×
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}