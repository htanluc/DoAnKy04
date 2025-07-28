'use client';

import { useState } from 'react';

export default function TestApiPage() {
  const [logs, setLogs] = useState<string[]>([]);
  const [month, setMonth] = useState('2025-01');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addLog = (message: string, type: 'info' | 'error' | 'success' = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    const logMessage = `[${timestamp}] ${message}`;
    console.log(logMessage);
    setLogs(prev => [...prev, logMessage]);
  };

  const testCors = async () => {
    addLog('🔍 Testing CORS preflight...');
    try {
      const response = await fetch('http://localhost:8080/api/auth/login', {
        method: 'OPTIONS',
        mode: 'cors',
        headers: {
          'Access-Control-Request-Method': 'POST',
          'Access-Control-Request-Headers': 'content-type',
          'Origin': window.location.origin
        }
      });

      addLog(`📡 CORS preflight response status: ${response.status}`);
      addLog(`📡 CORS headers: ${JSON.stringify(Object.fromEntries(response.headers.entries()), null, 2)}`);

      if (response.status === 200) {
        addLog('✅ CORS preflight successful', 'success');
      } else {
        addLog(`❌ CORS preflight failed with status: ${response.status}`, 'error');
      }
    } catch (error: any) {
      addLog(`❌ CORS preflight error: ${error.message}`, 'error');
    }
  };

  const testLogin = async () => {
    addLog('🚀 Testing login...');
    try {
      const response = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        mode: 'cors',
        credentials: 'omit',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Origin': window.location.origin
        },
        body: JSON.stringify({
          phoneNumber: 'admin',
          password: 'admin123'
        })
      });

      addLog(`📡 Response status: ${response.status}`);
      addLog(`📡 Response headers: ${JSON.stringify(Object.fromEntries(response.headers.entries()), null, 2)}`);

      if (!response.ok) {
        const errorText = await response.text();
        addLog(`❌ Error response: ${errorText}`, 'error');
        
        if (response.status === 403) {
          addLog('💡 This looks like a CORS issue. Check your backend CORS configuration.', 'error');
        }
        return;
      }

      const data = await response.json();
      addLog(`✅ Success response: ${JSON.stringify(data, null, 2)}`, 'success');
    } catch (error: any) {
      addLog(`❌ Error: ${error.message}`, 'error');
      if (error.message.includes('fetch')) {
        addLog('💡 This might be a CORS or network issue. Check if backend is running.', 'error');
      }
    }
  };

  const testRegister = async () => {
    addLog('🚀 Testing register...');
    try {
      const response = await fetch('http://localhost:8080/api/auth/register', {
        method: 'POST',
        mode: 'cors',
        credentials: 'omit',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Origin': window.location.origin
        },
        body: JSON.stringify({
          username: 'testuser',
          email: 'test@example.com',
          phoneNumber: '0123456789',
          password: 'password123'
        })
      });

      addLog(`📡 Response status: ${response.status}`);

      if (!response.ok) {
        const errorText = await response.text();
        addLog(`❌ Error response: ${errorText}`, 'error');
        return;
      }

      const data = await response.json();
      addLog(`✅ Success response: ${JSON.stringify(data, null, 2)}`, 'success');
    } catch (error: any) {
      addLog(`❌ Error: ${error.message}`, 'error');
    }
  };

  const testGetReadingsByMonth = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`http://localhost:8080/api/admin/water-readings/by-month?month=${month}`, {
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      
      const data = await res.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const clearLogs = () => {
    setLogs([]);
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">API Test - CORS Debugging</h1>
      
      <div className="mb-6">
        <p className="text-gray-600 mb-4">
          Current origin: <span className="font-mono">{typeof window !== 'undefined' ? window.location.origin : 'Loading...'}</span>
        </p>
        <p className="text-gray-600 mb-4">
          Backend URL: <span className="font-mono">http://localhost:8080</span>
        </p>
      </div>

      <div className="flex gap-4 mb-6">
        <button 
          onClick={testLogin}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Test Login
        </button>
        <button 
          onClick={testRegister}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Test Register
        </button>
        <button 
          onClick={testCors}
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
        >
          Test CORS Preflight
        </button>
        <button 
          onClick={clearLogs}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Clear Logs
        </button>
      </div>

      <div className="bg-gray-100 p-4 rounded border">
        <h2 className="text-lg font-semibold mb-2">Test Results:</h2>
        <div className="bg-white p-4 rounded border max-h-96 overflow-y-auto">
          {logs.length === 0 ? (
            <p className="text-gray-500">No logs yet. Click a test button to start.</p>
          ) : (
            logs.map((log, index) => (
              <div key={index} className="font-mono text-sm mb-1">
                {log}
              </div>
            ))
          )}
        </div>
      </div>

      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded">
        <h3 className="font-semibold text-yellow-800 mb-2">💡 Troubleshooting Tips:</h3>
        <ul className="text-yellow-700 text-sm space-y-1">
          <li>• Make sure your Spring Boot backend is running on port 8080</li>
          <li>• Check that CORS is properly configured in your backend</li>
          <li>• If you see 403 errors, it's likely a CORS configuration issue</li>
          <li>• If you see "Failed to fetch", check if the backend is accessible</li>
        </ul>
      </div>

      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Test API - Chỉ số nước theo tháng</h1>
        
        <div className="mb-4">
          <label className="block mb-2">Tháng (YYYY-MM):</label>
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="border px-3 py-2 rounded mr-2"
          />
          <button
            onClick={testGetReadingsByMonth}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? 'Đang test...' : 'Test API'}
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            <strong>Lỗi:</strong> {error}
          </div>
        )}

        {result && (
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2">Kết quả:</h3>
            <div className="bg-gray-100 p-3 rounded">
              <p><strong>Số lượng bản ghi:</strong> {result.length}</p>
              <pre className="mt-2 text-sm overflow-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 