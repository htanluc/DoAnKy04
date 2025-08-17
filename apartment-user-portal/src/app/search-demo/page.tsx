"use client"

import React, { useState, useEffect } from 'react';
import GlobalSearch from '../../components/global-search';

export default function SearchDemoPage() {
  const [searchResult, setSearchResult] = useState<any>(null);

  // Lấy thông tin kết quả từ URL params khi component mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const resultParam = urlParams.get('result');
      
      if (resultParam) {
        try {
          const result = JSON.parse(resultParam);
          setSearchResult(result);
        } catch (error) {
          console.error('Error parsing result param:', error);
        }
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-2xl font-bold text-gray-900">
              Search Demo & Testing
            </h1>
            <div className="flex items-center space-x-4">
              <GlobalSearch />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Result Display */}
        {searchResult && (
          <div className="mb-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              🎯 Kết quả tìm kiếm được click
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Thông tin cơ bản:</h3>
                <div className="space-y-2 text-sm">
                  <div><span className="font-medium">Loại:</span> {searchResult.type}</div>
                  <div><span className="font-medium">Tiêu đề:</span> {searchResult.title}</div>
                  <div><span className="font-medium">Nội dung:</span> {searchResult.content}</div>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Metadata:</h3>
                <div className="space-y-2 text-sm">
                  {searchResult.metadata && Object.entries(searchResult.metadata).map(([key, value]) => (
                    <div key={key}>
                      <span className="font-medium">{key}:</span> {String(value)}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Lưu ý:</strong> Đây là trang demo để test chức năng tìm kiếm. 
                Trong thực tế, bạn sẽ được chuyển đến trang chi tiết tương ứng.
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Search Demo Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              🔍 Global Search Demo
            </h2>
            <p className="text-gray-600 mb-4">
              Sử dụng thanh tìm kiếm ở header để test chức năng tìm kiếm toàn diện.
            </p>
            
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                <span>Tìm kiếm thông báo, sự kiện, tiện ích</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span>Highlight từ khóa tìm kiếm</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                <span>Gợi ý tìm kiếm thông minh</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                <span>Kết quả được format đẹp</span>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-2">💡 Mẹo tìm kiếm:</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Thử tìm: "Tiệc Giáng sinh", "Gym", "Hóa đơn"</li>
                <li>• Click vào gợi ý để tìm kiếm nhanh</li>
                <li>• Kết quả sẽ có highlighting đẹp mắt</li>
              </ul>
            </div>
          </div>

          {/* Features Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              ✨ Tính năng mới
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-green-600 text-sm font-bold">✓</span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Highlight đẹp mắt</h3>
                  <p className="text-sm text-gray-600">Từ khóa tìm kiếm được highlight với gradient và animation</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 text-sm font-bold">⚡</span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Tìm kiếm nhanh</h3>
                  <p className="text-sm text-gray-600">Cache dữ liệu user để tìm kiếm tức thì</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-purple-600 text-sm font-bold">🎯</span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Gợi ý thông minh</h3>
                  <p className="text-sm text-gray-600">Gợi ý dựa trên dữ liệu thực và fuzzy search</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-orange-600 text-sm font-bold">🛡️</span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Xử lý lỗi an toàn</h3>
                  <p className="text-sm text-gray-600">Fallback về text gốc nếu highlighting lỗi</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Debug Info */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            🐛 Debug Information
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Console Logs</h3>
              <p className="text-sm text-gray-600 mb-2">
                Mở Developer Tools (F12) để xem logs:
              </p>
              <ul className="text-xs text-gray-500 space-y-1 font-mono">
                <li>🔍 Performing search for: "query"</li>
                <li>📦 Returning cached data</li>
                <li>✅ Search results found</li>
                <li>🎯 Result clicked</li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium text-gray-900 mb-2">Known Issues</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Một số trang dashboard chưa được tạo</li>
                <li>• Navigation có thể cần Next.js router</li>
                <li>• Cache sẽ tự động refresh sau 5 phút</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
