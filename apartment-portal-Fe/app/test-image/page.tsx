"use client";

import React, { useState } from 'react';
import { config, buildImageUrlWithToken } from '@/lib/config';

export default function TestImagePage() {
  const [testUrl, setTestUrl] = useState('http://localhost:8080/api/files/vehicles/user_1/20250924/5_1758699242196_cef1eb6c.jpg');
  const [imageError, setImageError] = useState(false);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Test Image Loading</h1>
      
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Image URL:</label>
        <input
          type="text"
          value={testUrl}
          onChange={(e) => setTestUrl(e.target.value)}
          className="w-full p-2 border rounded"
        />
      </div>

      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Test Image:</h3>
        <div className="border p-4 rounded">
          {testUrl ? (
            <img
              src={testUrl}
              alt="Test image"
              className="max-w-md h-auto"
              onError={() => {
                console.error('Image failed to load:', testUrl);
                setImageError(true);
              }}
              onLoad={() => {
                console.log('Image loaded successfully:', testUrl);
                setImageError(false);
              }}
            />
          ) : (
            <p className="text-gray-500">No URL provided</p>
          )}
        </div>
        
        {imageError && (
          <div className="mt-2 p-2 bg-red-100 text-red-700 rounded">
            ❌ Image failed to load: {testUrl}
          </div>
        )}
      </div>

      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">API Base URL:</h3>
        <p className="text-sm text-gray-600">{config.API_BASE_URL}</p>
      </div>

      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Test với helper function:</h3>
        <div className="border p-4 rounded">
          <img
            src={buildImageUrlWithToken(testUrl)}
            alt="Test image với helper function"
            className="max-w-md h-auto"
            onError={() => {
              console.error('Helper function image failed to load:', testUrl);
            }}
            onLoad={() => {
              console.log('Helper function image loaded successfully:', testUrl);
            }}
          />
        </div>
      </div>

      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Test with different URLs:</h3>
        <div className="space-y-2">
          <button
            onClick={() => setTestUrl('http://localhost:8080/api/files/vehicles/user_1/20250924/5_1758699242196_cef1eb6c.jpg')}
            className="block p-2 bg-blue-100 hover:bg-blue-200 rounded text-left"
          >
            Direct backend URL (localhost)
          </button>
          <button
            onClick={() => setTestUrl('http://10.0.3.2:8080/api/files/vehicles/user_1/20250924/5_1758699242196_cef1eb6c.jpg')}
            className="block p-2 bg-orange-100 hover:bg-orange-200 rounded text-left"
          >
            Mobile IP URL (sẽ được convert sang localhost)
          </button>
          <button
            onClick={() => setTestUrl(`${config.API_BASE_URL}/api/files/vehicles/user_1/20250925/2_1758767169673_a2fd1f62.jpg`)}
            className="block p-2 bg-green-100 hover:bg-green-200 rounded text-left"
          >
            API_BASE_URL + path
          </button>
          <button
            onClick={() => setTestUrl('/api/files/vehicles/user_1/20250925/2_1758767169673_a2fd1f62.jpg')}
            className="block p-2 bg-purple-100 hover:bg-purple-200 rounded text-left"
          >
            Relative path (sẽ được xử lý bởi image proxy)
          </button>
          <button
            onClick={() => setTestUrl('https://via.placeholder.com/300x200/0000FF/FFFFFF?text=Test+Image')}
            className="block p-2 bg-yellow-100 hover:bg-yellow-200 rounded text-left"
          >
            Placeholder image (should work)
          </button>
        </div>
      </div>
    </div>
  );
}
