import React, { useState, useEffect } from 'react';
import { MessageSquare, Send, Users, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useWebSocket } from '@/hooks/use-websocket';
import { getToken } from '@/lib/auth';

export default function LiveChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [username, setUsername] = useState('User');
  const [userId, setUserId] = useState<number | null>(null);

  useEffect(() => {
    const token = getToken();
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUserId(payload.userId || payload.sub);
        setUsername(payload.username || payload.name || 'User');
      } catch (e) {
        console.error('Error parsing token:', e);
      }
    }
  }, []);

  const { 
    isConnected, 
    chatMessages, 
    onlineUsers, 
    error,
    sendChatMessage, 
    clearChatMessages 
  } = useWebSocket(userId || undefined, undefined, true); // Enable WebSocket when needed

  const handleSendMessage = () => {
    if (message.trim() && isConnected) {
      sendChatMessage(message, username);
      setMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
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
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
      >
        <MessageSquare className="h-4 w-4" />
        {chatMessages.length > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 text-xs"
          >
            {chatMessages.length}
          </Badge>
        )}
      </Button>

      {isOpen && (
        <Card className="absolute right-0 top-12 w-80 h-96 z-50 shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Live Chat</CardTitle>
              <div className="flex items-center gap-2">
                {error && (
                  <Badge variant="destructive" className="text-xs">
                    Offline
                  </Badge>
                )}
                {isConnected && (
                  <Badge variant="default" className="text-xs">
                    Online
                  </Badge>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="h-6 w-6 p-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0 h-full flex flex-col">
            {/* Online Users */}
            {onlineUsers.length > 0 && (
              <div className="mb-3 p-2 bg-gray-50 rounded">
                <div className="flex items-center gap-2 mb-1">
                  <Users className="h-3 w-3" />
                  <span className="text-xs font-medium">Online ({onlineUsers.length})</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {onlineUsers.slice(0, 5).map((user, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {user.username}
                    </Badge>
                  ))}
                  {onlineUsers.length > 5 && (
                    <Badge variant="outline" className="text-xs">
                      +{onlineUsers.length - 5}
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto space-y-2 mb-3">
              {chatMessages.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Chưa có tin nhắn</p>
                </div>
              ) : (
                chatMessages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex ${msg.sender === username ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] p-2 rounded-lg ${
                        msg.sender === username
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium">{msg.sender}</span>
                        <span className="text-xs opacity-70">
                          {formatTime(msg.timestamp)}
                        </span>
                      </div>
                      <p className="text-sm">{msg.content}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Message Input */}
            <div className="flex gap-2">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Nhập tin nhắn..."
                className="flex-1"
                disabled={!isConnected}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!isConnected || !message.trim()}
                size="sm"
              >
                <Send className="h-3 w-3" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 