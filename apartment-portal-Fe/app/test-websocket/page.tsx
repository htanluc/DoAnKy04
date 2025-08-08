"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { API_BASE_URL, getToken } from '@/lib/auth';
import RealTimeNotifications from '@/components/real-time-notifications';
import LiveChat from '@/components/live-chat';

export default function TestWebSocketPage() {
  const [message, setMessage] = useState('');
  const [userId, setUserId] = useState('');
  const [apartmentId, setApartmentId] = useState('');
  const [status, setStatus] = useState('SUCCESS');
  const [result, setResult] = useState('');

  const sendNotification = async (endpoint: string, params: any) => {
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await fetch(`${API_BASE_URL}${endpoint}?${queryString}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getToken()}`,
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      setResult(JSON.stringify(data, null, 2));
    } catch (error) {
      setResult(`Error: ${error}`);
    }
  };

  const testGlobalNotification = () => {
    sendNotification('/api/test/notifications/global', { message });
  };

  const testUserNotification = () => {
    sendNotification(`/api/test/notifications/user/${userId}`, { message });
  };

  const testApartmentNotification = () => {
    sendNotification(`/api/test/notifications/apartment/${apartmentId}`, { message });
  };

  const testPaymentNotification = () => {
    sendNotification(`/api/test/notifications/payment/${userId}`, { message, status });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">WebSocket Test Page</h1>
          <p className="text-gray-600">Test real-time notifications và chat</p>
        </div>
        <div className="flex items-center gap-4">
          <RealTimeNotifications />
          <LiveChat />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Test Controls */}
        <Card>
          <CardHeader>
            <CardTitle>Test Notifications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="message">Message</Label>
              <Input
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Enter notification message..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="userId">User ID</Label>
                <Input
                  id="userId"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  placeholder="User ID"
                />
              </div>
              <div>
                <Label htmlFor="apartmentId">Apartment ID</Label>
                <Input
                  id="apartmentId"
                  value={apartmentId}
                  onChange={(e) => setApartmentId(e.target.value)}
                  placeholder="Apartment ID"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="status">Payment Status</Label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full border rounded px-3 py-2"
                aria-label="Chọn trạng thái thanh toán"
              >
                <option value="SUCCESS">SUCCESS</option>
                <option value="FAILED">FAILED</option>
                <option value="PENDING">PENDING</option>
              </select>
            </div>

            <div className="space-y-2">
              <Button onClick={testGlobalNotification} className="w-full">
                Send Global Notification
              </Button>
              <Button onClick={testUserNotification} className="w-full" disabled={!userId}>
                Send User Notification
              </Button>
              <Button onClick={testApartmentNotification} className="w-full" disabled={!apartmentId}>
                Send Apartment Notification
              </Button>
              <Button onClick={testPaymentNotification} className="w-full" disabled={!userId}>
                Send Payment Notification
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Result Display */}
        <Card>
          <CardHeader>
            <CardTitle>API Response</CardTitle>
          </CardHeader>
          <CardContent>
            {result ? (
              <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto max-h-64">
                {result}
              </pre>
            ) : (
              <div className="text-gray-500 text-center py-8">
                Click a button to test notifications
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>How to Test</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p><strong>1.</strong> Open this page in multiple browser tabs/windows</p>
            <p><strong>2.</strong> Fill in the message and IDs</p>
            <p><strong>3.</strong> Click test buttons to send notifications</p>
            <p><strong>4.</strong> Watch for real-time notifications in the bell icon</p>
            <p><strong>5.</strong> Use the chat feature to test live messaging</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 