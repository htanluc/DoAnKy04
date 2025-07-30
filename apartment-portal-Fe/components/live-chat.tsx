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
    sendChatMessage, 
    clearChatMessages 
  } = useWebSocket(userId || undefined);

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
    <div className="fixed bottom-4 right-4 z-50">
      {/* Chat Toggle Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="rounded-full w-12 h-12 shadow-lg"
        variant={isOpen ? "default" : "outline"}
      >
        <MessageSquare className="h-5 w-5" />
      </Button>

      {/* Chat Window */}
      {isOpen && (
        <Card className="absolute bottom-16 right-0 w-80 h-96 shadow-xl">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CardTitle className="text-sm">Live Chat</CardTitle>
                <Badge variant={isConnected ? "default" : "secondary"} className="text-xs">
                  {isConnected ? "🟢 Online" : "🔴 Offline"}
                </Badge>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="h-6 w-6 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Online Users */}
            {onlineUsers.length > 0 && (
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Users className="h-3 w-3" />
                <span>{onlineUsers.length} online</span>
              </div>
            )}
          </CardHeader>

          <CardContent className="pt-0 flex flex-col h-80">
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto space-y-2 mb-3 p-2 bg-gray-50 rounded">
              {chatMessages.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Chưa có tin nhắn</p>
                  <p className="text-xs">Bắt đầu cuộc trò chuyện!</p>
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
                          : 'bg-white border'
                      }`}
                    >
                      <div className="text-xs opacity-75 mb-1">
                        {msg.sender} • {formatTime(msg.timestamp)}
                      </div>
                      <div className="text-sm">{msg.content}</div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Input Area */}
            <div className="flex gap-2">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Nhập tin nhắn..."
                disabled={!isConnected}
                className="flex-1"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!isConnected || !message.trim()}
                size="sm"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>

            {/* Clear Messages Button */}
            {chatMessages.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearChatMessages}
                className="mt-2 text-xs"
              >
                Xóa tin nhắn
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
} 