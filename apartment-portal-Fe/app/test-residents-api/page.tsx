"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { api } from '@/lib/api';

export default function TestResidentsAPI() {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const testGetAllResidents = async () => {
    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const result = await api.get('/api/admin/residents');
      
      if (result.ok) {
        const data = await result.json();
        setResponse(data);
        console.log('Residents API Response:', data);
      } else {
        const errorData = await result.json();
        setError(`Error ${result.status}: ${errorData.message || 'Unknown error'}`);
      }
    } catch (err) {
      console.error('API Error:', err);
      setError('Network error or server unavailable');
    } finally {
      setLoading(false);
    }
  };

  const testGetResidentById = async () => {
    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      // Test với ID đầu tiên từ database (có vẻ như 5549, 5503, etc.)
      const result = await api.get('/api/admin/residents/5549');
      
      if (result.ok) {
        const data = await result.json();
        setResponse(data);
        console.log('Single Resident API Response:', data);
      } else {
        const errorData = await result.json();
        setError(`Error ${result.status}: ${errorData.message || 'Unknown error'}`);
      }
    } catch (err) {
      console.error('API Error:', err);
      setError('Network error or server unavailable');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Test Residents API</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Button onClick={testGetAllResidents} disabled={loading}>
          {loading ? 'Testing...' : 'Test GET All Residents'}
        </Button>
        
        <Button onClick={testGetResidentById} disabled={loading}>
          {loading ? 'Testing...' : 'Test GET Resident by ID (5549)'}
        </Button>
      </div>

      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      )}

      {response && (
        <Card>
          <CardHeader>
            <CardTitle>API Response</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-100 p-4 rounded-lg overflow-auto text-sm">
              {JSON.stringify(response, null, 2)}
            </pre>
            
            {Array.isArray(response) && response.length > 0 && (
              <div className="mt-4">
                <h3 className="font-semibold mb-2">Available Fields in First Record:</h3>
                <ul className="list-disc list-inside space-y-1">
                  {Object.keys(response[0]).map(key => (
                    <li key={key} className="text-sm">
                      <span className="font-mono bg-gray-200 px-1 rounded">{key}</span>: 
                      <span className="ml-2">{typeof response[0][key]} - {String(response[0][key])}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {response && !Array.isArray(response) && typeof response === 'object' && (
              <div className="mt-4">
                <h3 className="font-semibold mb-2">Available Fields:</h3>
                <ul className="list-disc list-inside space-y-1">
                  {Object.keys(response).map(key => (
                    <li key={key} className="text-sm">
                      <span className="font-mono bg-gray-200 px-1 rounded">{key}</span>: 
                      <span className="ml-2">{typeof response[key]} - {String(response[key])}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p>1. Click "Test GET All Residents" để kiểm tra API trả về danh sách cư dân</p>
            <p>2. Click "Test GET Resident by ID" để kiểm tra API trả về cư dân cụ thể</p>
            <p>3. Kiểm tra response để xem tên trường thực tế từ backend</p>
            <p>4. Mở Developer Console để xem log chi tiết</p>
            <p className="font-semibold text-blue-600">
              Dựa vào database schema, tìm kiếm trường "id_card_number" trong response
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}