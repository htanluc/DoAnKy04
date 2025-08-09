import { useEffect, useState, useCallback } from 'react';
import { API_BASE_URL } from '@/lib/auth';

interface Notification {
  message: string;
  timestamp: string;
  type: 'GLOBAL' | 'USER' | 'APARTMENT' | 'PAYMENT';
  status?: string;
}

interface ChatMessage {
  content: string;
  sender: string;
  timestamp: string;
}

interface UserPresence {
  userId: number;
  username: string;
  apartmentId: number;
  timestamp: string;
}

export const useWebSocket = (userId?: number, apartmentId?: number, enabled: boolean = true) => {
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<UserPresence[]>([]);
  const [error, setError] = useState<string | null>(null);

  const connect = useCallback(() => {
    if (!enabled) return null;
    
    try {
      // Tạo WebSocket connection
      const ws = new WebSocket(`ws://localhost:8080/ws`);
      
      ws.onopen = () => {
        setIsConnected(true);
        setError(null);
        if (process.env.NODE_ENV === 'development') {
          console.log('WebSocket connected');
        }
        
        // Subscribe to notifications
        if (userId) {
          ws.send(JSON.stringify({
            destination: `/user/${userId}/queue/notifications`,
            type: 'SUBSCRIBE'
          }));
        }
        
        // Subscribe to apartment notifications
        if (apartmentId) {
          ws.send(JSON.stringify({
            destination: `/topic/apartment/${apartmentId}/notifications`,
            type: 'SUBSCRIBE'
          }));
          
          // Join apartment
          ws.send(JSON.stringify({
            destination: '/app/join-apartment',
            content: JSON.stringify({
              userId,
              username: 'User', // Will be replaced with actual username
              apartmentId
            })
          }));
        }
        
        // Subscribe to global notifications
        ws.send(JSON.stringify({
          destination: '/topic/notifications',
          type: 'SUBSCRIBE'
        }));
        
        // Subscribe to chat messages
        ws.send(JSON.stringify({
          destination: '/topic/messages',
          type: 'SUBSCRIBE'
        }));
      };
      
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === 'NOTIFICATION') {
            setNotifications(prev => [...prev, data]);
          } else if (data.type === 'CHAT_MESSAGE') {
            setChatMessages(prev => [...prev, data]);
          } else if (data.type === 'USER_PRESENCE') {
            setOnlineUsers(prev => {
              const filtered = prev.filter(user => user.userId !== data.userId);
              return [...filtered, data];
            });
          }
        } catch (e) {
          // Chỉ log lỗi parsing nếu đang trong development mode
          if (process.env.NODE_ENV === 'development') {
            console.warn('Error parsing WebSocket message:', e);
          }
        }
      };
      
      ws.onerror = (error) => {
        // Chỉ log lỗi nếu đang trong development mode và không phải là lỗi connection refused
        if (process.env.NODE_ENV === 'development') {
          console.warn('WebSocket connection error (this is normal if backend is not running):', error);
        }
        setError('WebSocket connection error');
      };
      
      ws.onclose = () => {
        setIsConnected(false);
        // Chỉ log disconnect nếu đang trong development mode
        if (process.env.NODE_ENV === 'development') {
          console.log('WebSocket disconnected (this is normal if backend is not running)');
        }
      };
      
      return ws;
    } catch (e) {
      setError('Failed to connect to WebSocket');
      // Chỉ log lỗi connection nếu đang trong development mode
      if (process.env.NODE_ENV === 'development') {
        console.warn('WebSocket connection failed (this is normal if backend is not running):', e);
      }
      return null;
    }
  }, [userId, apartmentId, enabled]);

  const sendChatMessage = useCallback((content: string, sender: string) => {
    if (!isConnected) return;
    
    const message = {
      destination: '/app/send-message',
      content: JSON.stringify({
        content,
        sender,
        timestamp: new Date().toISOString()
      })
    };
    
    // This would be sent through the WebSocket connection
    if (process.env.NODE_ENV === 'development') {
      console.log('Sending chat message:', message);
    }
  }, [isConnected]);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const clearChatMessages = useCallback(() => {
    setChatMessages([]);
  }, []);

  useEffect(() => {
    if (enabled && (userId || apartmentId)) {
      const ws = connect();
      return () => {
        if (ws) {
          ws.close();
        }
      };
    }
  }, [userId, apartmentId, connect, enabled]);

  return {
    isConnected,
    notifications,
    chatMessages,
    onlineUsers,
    error,
    sendChatMessage,
    clearNotifications,
    clearChatMessages
  };
}; 