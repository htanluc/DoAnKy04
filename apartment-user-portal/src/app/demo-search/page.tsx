"use client"

import React, { useState } from 'react';
import { 
  Search, 
  FileText, 
  Calendar, 
  Building2, 
  Receipt, 
  MessageSquare, 
  Star,
  Info,
  CheckCircle,
  AlertCircle,
  Zap,
  Globe,
  Database
} from 'lucide-react';
import { globalSearch, getSearchSuggestions } from '../../lib/search';

interface SearchResult {
  objectID: string;
  type: 'announcement' | 'event' | 'facility' | 'invoice' | 'support_request' | 'feedback';
  title: string;
  content: string;
  url: string;
  highlight?: string;
  metadata?: Record<string, any>;
}

interface SearchSuggestion {
  text: string;
  type: string;
  count: number;
}

export default function DemoSearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    setSearchError(null);

    try {
      // Perform search
      const searchResults = await globalSearch(searchQuery);
      
      // Check if searchResults has the expected structure
      if (searchResults && typeof searchResults === 'object' && 'hits' in searchResults) {
        setResults(searchResults.hits || []);
      } else {
        console.warn('Unexpected search results format:', searchResults);
        setResults([]);
      }

      // Get suggestions
      const searchSuggestions = await getSearchSuggestions(searchQuery);
      // Convert string[] to SearchSuggestion[]
      const formattedSuggestions = (searchSuggestions || []).map(text => ({
        text,
        type: 'keyword',
        count: 1
      }));
      setSuggestions(formattedSuggestions);

      console.log(`Search completed for "${searchQuery}":`, {
        results: searchResults?.hits?.length || 0,
        suggestions: searchSuggestions?.length || 0
      });
    } catch (error) {
      console.error('Search error:', error);
      setSearchError('Có lỗi xảy ra khi tìm kiếm');
      setResults([]);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (value: string) => {
    setQuery(value);
    setShowSuggestions(true);
    
    if (value.trim().length >= 2) {
      handleSearch(value);
    } else {
      setResults([]);
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    setShowSuggestions(false);
    handleSearch(suggestion);
  };

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'announcement':
        return <FileText className="w-5 h-5 text-blue-600" />;
      case 'event':
        return <Calendar className="w-5 h-5 text-green-600" />;
      case 'facility':
        return <Building2 className="w-5 h-5 text-purple-600" />;
      case 'invoice':
        return <Receipt className="w-5 h-5 text-orange-600" />;
      case 'support_request':
        return <MessageSquare className="w-5 h-5 text-red-600" />;
      case 'feedback':
        return <Star className="w-5 h-5 text-yellow-600" />;
      default:
        return <Search className="w-5 h-5 text-gray-600" />;
    }
  };

  const getResultTypeLabel = (type: string) => {
    switch (type) {
      case 'announcement':
        return 'Thông báo';
      case 'event':
        return 'Sự kiện';
      case 'facility':
        return 'Tiện ích';
      case 'invoice':
        return 'Hóa đơn';
      case 'support_request':
        return 'Yêu cầu hỗ trợ';
      case 'feedback':
        return 'Phản hồi';
      default:
        return 'Khác';
    }
  };

  const renderHighlightedText = (text: string, highlight?: string) => {
    if (highlight) {
      return <span dangerouslySetInnerHTML={{ __html: highlight }} />;
    }
    return text;
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-bold text-gray-900">
          Demo Hệ Thống Tìm Kiếm Nâng Cao
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Trải nghiệm hệ thống tìm kiếm thông minh hoạt động hoàn toàn offline với khả năng tìm kiếm 
          đa ngôn ngữ và xử lý dữ liệu phức tạp
        </p>
        
        {/* Feature highlights */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
          <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
            <Zap className="w-10 h-10 text-blue-600 mx-auto mb-3" />
            <h3 className="font-semibold text-blue-900 text-lg mb-2">Tốc độ cao</h3>
            <p className="text-sm text-blue-700">Tìm kiếm tức thì, không cần kết nối mạng</p>
          </div>
          
          <div className="bg-green-50 p-6 rounded-xl border border-green-200">
            <Globe className="w-10 h-10 text-green-600 mx-auto mb-3" />
            <h3 className="font-semibold text-green-900 text-lg mb-2">Đa ngôn ngữ</h3>
            <p className="text-sm text-green-700">Hỗ trợ tiếng Việt và tiếng Anh</p>
          </div>
          
          <div className="bg-purple-50 p-6 rounded-xl border border-purple-200">
            <Database className="w-10 h-10 text-purple-600 mx-auto mb-3" />
            <h3 className="font-semibold text-purple-900 text-lg mb-2">Dữ liệu phong phú</h3>
            <p className="text-sm text-purple-700">6 loại dữ liệu khác nhau</p>
          </div>
          
          <div className="bg-orange-50 p-6 rounded-xl border border-orange-200">
            <CheckCircle className="w-10 h-10 text-orange-600 mx-auto mb-3" />
            <h3 className="font-semibold text-orange-900 text-lg mb-2">Dễ sử dụng</h3>
            <p className="text-sm text-orange-700">Giao diện thân thiện, gợi ý thông minh</p>
          </div>
        </div>
      </div>

      {/* Search Section */}
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Thử Nghiệm Tìm Kiếm
        </h2>
        
        {/* Search Input */}
        <div className="relative max-w-2xl mx-auto">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
            <input
              type="text"
              value={query}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder="Nhập từ khóa tìm kiếm... (ví dụ: hóa đơn, gym, sự kiện, thông báo)"
              className="w-full pl-12 pr-4 py-4 text-lg border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all"
            />
          </div>

          {/* Suggestions */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-gray-200 rounded-xl shadow-xl z-10 max-h-60 overflow-y-auto">
              {suggestions.map((suggestion, index) => (
                <button
                  key={`suggestion_${suggestion.text}_${index}_${Date.now()}`}
                  onClick={() => handleSuggestionClick(suggestion.text)}
                  className="w-full text-left px-4 py-3 hover:bg-blue-50 focus:bg-blue-50 focus:outline-none border-b border-gray-100 last:border-b-0 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700 font-medium">{suggestion.text}</span>
                    <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                      {suggestion.type === 'keyword' ? 'Từ khóa' : 'Gợi ý'}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Search Tips */}
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-start space-x-4">
            <Info className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-blue-900 text-lg mb-3">Mẹo tìm kiếm hiệu quả:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-blue-800">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                  <strong>Hóa đơn:</strong> "hóa đơn", "bill", "phí", "tháng 11", "UNPAID"
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                  <strong>Tiện ích:</strong> "gym", "BBQ", "tiện ích", "facility", "phòng tập"
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                  <strong>Sự kiện:</strong> "sự kiện", "event", "họp", "tiệc", "meeting"
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                  <strong>Thông báo:</strong> "thông báo", "announcement", "tin tức", "news"
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                  <strong>Yêu cầu:</strong> "yêu cầu", "hỗ trợ", "support", "vấn đề", "issue"
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                  <strong>Phản hồi:</strong> "phản hồi", "feedback", "đánh giá", "review"
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
          <p className="mt-6 text-xl text-gray-600">Đang tìm kiếm...</p>
        </div>
      )}

      {/* Error State */}
      {searchError && (
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
          <div className="flex items-center space-x-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
            <div>
              <h3 className="text-lg font-semibold text-red-800 mb-2">Lỗi tìm kiếm</h3>
              <span className="text-red-700">{searchError}</span>
            </div>
          </div>
        </div>
      )}

      {/* Search Results */}
      {results.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Kết quả tìm kiếm ({results.length})
            </h2>
            <span className="text-lg text-gray-500 bg-gray-100 px-4 py-2 rounded-full">
              Cho từ khóa: "{query}"
            </span>
          </div>

          <div className="space-y-4">
            {results.map((result, index) => (
              <div
                key={`${result.type}_${result.objectID}_${index}_${Date.now()}`}
                className="bg-gray-50 border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-200 hover:border-blue-300"
              >
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
                      {getResultIcon(result.type)}
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3 mb-3">
                      <h3 className="text-xl font-semibold text-gray-900 truncate">
                        {renderHighlightedText(result.title, result.highlight)}
                      </h3>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                        {getResultTypeLabel(result.type)}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 mb-4 text-lg leading-relaxed">
                      {result.content}
                    </p>
                    
                    {result.metadata && Object.keys(result.metadata).length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {Object.entries(result.metadata).map(([key, value]) => {
                          if (value && typeof value === 'string' && value.length < 50) {
                            return (
                              <span
                                key={`${key}_${value}_${Date.now()}`}
                                className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium bg-white border border-gray-200 text-gray-700"
                              >
                                {key}: {value}
                              </span>
                            );
                          }
                          return null;
                        })}
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <a
                        href={result.url}
                        className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-800 font-semibold text-lg transition-colors"
                      >
                        <span>Xem chi tiết</span>
                        <span className="text-xl">→</span>
                      </a>
                      
                      {result.metadata?.relevanceScore && (
                        <span className="text-sm text-gray-500 bg-white px-3 py-1 rounded-full border border-gray-200">
                          Độ liên quan: {result.metadata.relevanceScore}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Results */}
      {!isLoading && !searchError && query.trim().length >= 2 && results.length === 0 && (
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
          <Search className="w-20 h-20 text-gray-300 mx-auto mb-6" />
          <h3 className="text-2xl font-semibold text-gray-900 mb-4">
            Không tìm thấy kết quả
          </h3>
          <p className="text-lg text-gray-600 mb-6">
            Không có kết quả nào cho từ khóa "{query}". Hãy thử từ khóa khác hoặc kiểm tra chính tả.
          </p>
          <div className="bg-gray-50 rounded-xl p-4 inline-block">
            <p className="text-sm text-gray-600">
              <strong>Gợi ý:</strong> Thử tìm kiếm với từ khóa đơn giản hơn hoặc sử dụng tiếng Anh
            </p>
          </div>
        </div>
      )}

      {/* System Information */}
      <div className="bg-gradient-to-r from-gray-50 to-blue-50 border border-gray-200 rounded-2xl p-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Thông tin hệ thống tìm kiếm
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <h4 className="font-semibold text-gray-900 mb-3">Công nghệ</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Local Search Engine</li>
              <li>• JavaScript-based</li>
              <li>• Real-time processing</li>
              <li>• No external dependencies</li>
            </ul>
          </div>
          
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <h4 className="font-semibold text-gray-900 mb-3">Dữ liệu</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• 6 loại dữ liệu</li>
              <li>• Nested data support</li>
              <li>• Metadata indexing</li>
              <li>• Relevance scoring</li>
            </ul>
          </div>
          
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <h4 className="font-semibold text-gray-900 mb-3">Tính năng</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Đa ngôn ngữ (VI/EN)</li>
              <li>• Gợi ý thông minh</li>
              <li>• Highlight kết quả</li>
              <li>• Debounced search</li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-xl">
          <p className="text-blue-800 text-center">
            <strong>Lưu ý:</strong> Đây là hệ thống tìm kiếm local hoạt động offline. 
            Để có hiệu suất tốt hơn với dữ liệu lớn, bạn có thể nâng cấp lên Meilisearch 
            bằng cách cài đặt Docker và chạy: <code className="bg-blue-100 px-2 py-1 rounded font-mono text-sm">docker run -p 7700:7700 getmeili/meilisearch:latest</code>
          </p>
        </div>
      </div>
    </div>
  );
}
