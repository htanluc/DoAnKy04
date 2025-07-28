"use client";
import { useState } from 'react';

export default function TestWaterMeterPage() {
  const [month, setMonth] = useState('2025-01');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const testGetAllReadings = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`http://localhost:8080/api/admin/water-readings`, {
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

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Test API - Chỉ số nước</h1>
      
      <div className="mb-6 space-y-4">
        <div>
          <h3 className="text-lg font-semibold mb-2">1. Lấy chỉ số nước theo tháng</h3>
          <div className="flex items-center gap-2">
            <label>Tháng (YYYY-MM):</label>
            <input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="border px-3 py-2 rounded"
            />
            <button
              onClick={testGetReadingsByMonth}
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
            >
              {loading ? 'Đang test...' : 'Test API theo tháng'}
            </button>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">2. Lấy tất cả chỉ số nước</h3>
          <button
            onClick={testGetAllReadings}
            disabled={loading}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:bg-gray-400"
          >
            {loading ? 'Đang test...' : 'Test API tất cả'}
          </button>
        </div>
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
            <pre className="mt-2 text-sm overflow-auto max-h-96">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
} 