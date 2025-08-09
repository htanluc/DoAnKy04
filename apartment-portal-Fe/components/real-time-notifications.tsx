import React, { useState, useEffect } from 'react';
import { Bell, X, CheckCircle, AlertCircle, Info, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useWebSocket } from '@/hooks/use-websocket';
import { getToken } from '@/lib/auth';

export default function RealTimeNotifications() {
  const [isOpen, setIsOpen] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);
  
  useEffect(() => {
    // Lấy user ID từ token hoặc localStorage
    const token = getToken();
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUserId(payload.userId || payload.sub);
      } catch (e) {
        console.error('Error parsing token:', e);
      }
    }
  }, []);

  const { 
    isConnected, 
    notifications, 
    error, 
    clearNotifications 
  } = useWebSocket(userId || undefined, undefined, true); // Enable WebSocket when needed

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'PAYMENT':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'GLOBAL':
        return <Info className="h-4 w-4 text-blue-500" />;
      case 'APARTMENT':
        return <MessageSquare className="h-4 w-4 text-purple-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-orange-500" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'PAYMENT':
        return 'border-green-200 bg-green-50';
      case 'GLOBAL':
        return 'border-blue-200 bg-blue-50';
      case 'APARTMENT':
        return 'border-purple-200 bg-purple-50';
      default:
        return 'border-orange-200 bg-orange-50';
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
      >
        <Bell className="h-5 w-5" />
        {notifications.length > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs"
          >
            {notifications.length}
          </Badge>
        )}
      </Button>

      <div className="absolute -bottom-6 right-0 text-xs">
        {isConnected ? (
          <span className="text-green-600">🟢 Connected</span>
        ) : (
          <span className="text-red-600">🔴 Disconnected</span>
        )}
      </div>

      {isOpen && (
        <Card className="absolute right-0 top-12 w-80 z-50 shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Thông báo</CardTitle>
              <div className="flex items-center gap-2">
                {notifications.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearNotifications}
                    className="h-6 px-2 text-xs"
                  >
                    Xóa tất cả
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="h-6 w-6 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="pt-0">
            {error && (
              <div className="text-red-600 text-sm mb-3 p-2 bg-red-50 rounded">
                {error}
              </div>
            )}
            
            {notifications.length === 0 ? (
              <div className="text-center text-gray-500 py-4">
                <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Chưa có thông báo mới</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {notifications.map((notification, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg border ${getNotificationColor(notification.type)}`}
                  >
                    <div className="flex items-start gap-2">
                      {getNotificationIcon(notification.type)}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatTime(notification.timestamp)}
                        </p>
                        {notification.status && (
                          <Badge variant="outline" className="mt-1 text-xs">
                            {notification.status}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
} 