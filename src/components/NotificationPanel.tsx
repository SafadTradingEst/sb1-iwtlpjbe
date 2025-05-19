import React from 'react';
import { useNotifications } from '../contexts/NotificationContext';
import { useTranslation } from 'react-i18next';
import { Bell, Check, Trash2 } from 'lucide-react';

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationPanel: React.FC<NotificationPanelProps> = ({ isOpen, onClose }) => {
  const { notifications, markAsRead, markAllAsRead, clearNotifications } = useNotifications();
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden z-50">
      <div className="p-4 border-b dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold dark:text-white">
            {t('common.notifications')}
          </h3>
          <div className="flex space-x-2">
            <button
              onClick={markAllAsRead}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              title={t('notifications.markAllRead')}
            >
              <Check size={16} className="text-gray-600 dark:text-gray-400" />
            </button>
            <button
              onClick={clearNotifications}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              title={t('notifications.clearAll')}
            >
              <Trash2 size={16} className="text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-4 text-center text-gray-500 dark:text-gray-400">
            <Bell className="mx-auto h-8 w-8 mb-2 opacity-50" />
            <p>{t('notifications.noNotifications')}</p>
          </div>
        ) : (
          notifications.map(notification => (
            <div
              key={notification.id}
              className={`p-4 border-b dark:border-gray-700 ${
                notification.read ? 'bg-gray-50 dark:bg-gray-800' : 'bg-white dark:bg-gray-700'
              }`}
              onClick={() => markAsRead(notification.id)}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium dark:text-white">{notification.title}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{notification.message}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {new Date(notification.timestamp).toLocaleString()}
                  </p>
                </div>
                {!notification.read && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationPanel;