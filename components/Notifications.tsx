
import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from '../contexts/LanguageContext';

// This is the function that will be passed up to the parent to trigger a notification
const showBrowserNotification = (title: string, body: string) => {
    if ('Notification' in window && Notification.permission === 'granted') {
        // Use a placeholder icon
        const icon = '/favicon.svg';
        new Notification(title, { body, icon });
    }
};

interface NotificationsProps {
  onNotificationGranted: (showFn: (title: string, body: string) => void) => void;
}

const Notifications: React.FC<NotificationsProps> = ({ onNotificationGranted }) => {
    const [permission, setPermission] = useState('Notification' in window ? Notification.permission : 'denied');
    const { t } = useTranslation();

    // Effect to pass the show function up if permission is already granted on mount
    useEffect(() => {
        if (permission === 'granted') {
            onNotificationGranted(showBrowserNotification);
        }
    }, [permission, onNotificationGranted]);

    const requestPermission = useCallback(async () => {
        if (!('Notification' in window)) return;
        
        const result = await Notification.requestPermission();
        setPermission(result);
        if (result === 'granted') {
            onNotificationGranted(showBrowserNotification);
            showBrowserNotification(t('notifications.banner.enabledTitle'), t('notifications.banner.enabledBody'));
        }
    }, [onNotificationGranted, t]);

    // Only show the permission banner if the browser supports notifications and permission hasn't been granted/denied yet
    if (permission === 'default') {
        return (
            <div className="fixed bottom-4 right-4 bg-white shadow-lg rounded-lg p-4 max-w-sm w-11/12 z-50 animate-fade-in-up">
                <h4 className="font-semibold text-gray-800">{t('notifications.banner.title')}</h4>
                <p className="mt-1 text-sm text-gray-700">{t('notifications.banner.body')}</p>
                <div className="mt-3 flex gap-2">
                     <button
                        onClick={requestPermission}
                        className="flex-1 bg-red-800 text-white px-3 py-1.5 rounded-md text-sm font-semibold hover:bg-red-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                        {t('notifications.banner.enableButton')}
                    </button>
                    <button
                        onClick={() => setPermission('denied')} // User can dismiss it for the session
                        className="flex-1 bg-gray-200 text-gray-700 px-3 py-1.5 rounded-md text-sm font-semibold hover:bg-gray-300"
                    >
                        {t('notifications.banner.laterButton')}
                    </button>
                </div>
            </div>
        );
    }
    
    return null; // Don't render anything if permissions are granted or denied
};

export default Notifications;