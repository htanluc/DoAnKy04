"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface WebSocketToggleProps {
  onToggle: (enabled: boolean) => void;
  isEnabled: boolean;
}

export default function WebSocketToggle({ onToggle, isEnabled }: WebSocketToggleProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="bg-white shadow-lg"
      >
        {isEnabled ? '🔌' : '🔌'} WebSocket
      </Button>

      {isOpen && (
        <Card className="absolute bottom-12 right-0 w-80 shadow-xl">
          <CardHeader>
            <CardTitle className="text-sm">WebSocket Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="websocket-toggle" className="text-sm">
                Enable WebSocket
              </Label>
              <Switch
                id="websocket-toggle"
                checked={isEnabled}
                onCheckedChange={onToggle}
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span>Status:</span>
                <Badge variant={isEnabled ? "default" : "secondary"}>
                  {isEnabled ? 'Enabled' : 'Disabled'}
                </Badge>
              </div>
              
              <div className="text-xs text-gray-500">
                {isEnabled 
                  ? 'Real-time notifications and chat are enabled'
                  : 'WebSocket is disabled to reduce console errors'
                }
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="w-full"
            >
              Close
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 