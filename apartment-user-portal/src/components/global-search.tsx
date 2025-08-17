"use client"

import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  X, 
  FileText, 
  Calendar, 
  Building2, 
  Receipt, 
  MessageSquare, 
  Star,
  ChevronRight,
  Clock
} from 'lucide-react';
import { globalSearch, getSearchSuggestions } from '../lib/search';
import { userDataService } from '../lib/user-data-service';

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

interface GlobalSearchProps {
  isOpen?: boolean;
  onClose?: () => void;
  placeholder?: string;
}

export default function GlobalSearch({ isOpen: externalIsOpen, onClose, placeholder }: GlobalSearchProps) {
  const [isOpen, setIsOpen] = useState(externalIsOpen || false);
  const [query, setQuery] = useState<string>('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync with external state
  useEffect(() => {
    if (externalIsOpen !== undefined) {
      setIsOpen(externalIsOpen);
    }
  }, [externalIsOpen]);

  // Debounced search function với tối ưu hóa
  const debouncedSearch = (searchQuery: string) => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Đảm bảo searchQuery luôn là string
    const safeQuery = searchQuery || '';
    
    // Clear results ngay lập tức nếu query quá ngắn
    if (safeQuery.trim().length < 2) {
      setResults([]);
      setSuggestions([]);
      return;
    }
    
    // Debounce với thời gian ngắn hơn để UX tốt hơn
    searchTimeoutRef.current = setTimeout(() => {
      performSearch(safeQuery);
    }, 200); // Giảm từ 300ms xuống 200ms
  };

  const performSearch = async (searchQuery: string) => {
    // Đảm bảo searchQuery luôn là string
    const safeQuery = searchQuery || '';
    
    setIsLoading(true);
    setSearchError(null);

    try {
      // Thử tìm kiếm trong dữ liệu user trước (nhanh hơn)
      let searchResults;
      let searchSource = 'global';
      
      // Lấy userId từ context hoặc localStorage (tùy vào cách auth của bạn)
      const userId = localStorage.getItem('userId') || 'default';
      
      if (userId && userId !== 'default') {
        try {
          searchResults = await userDataService.searchInUserData(userId, safeQuery);
          searchSource = 'user-data';
          
          if (searchResults.hits && searchResults.hits.length > 0) {
            // User data search thành công
          } else {
            // Nếu không có kết quả, thử global search
            searchResults = await globalSearch(safeQuery);
            searchSource = 'global';
          }
        } catch (error) {
          // Fallback về global search nếu có lỗi
          searchResults = await globalSearch(safeQuery);
          searchSource = 'global';
        }
      } else {
        // Không có userId, sử dụng global search
        searchResults = await globalSearch(safeQuery);
        searchSource = 'global';
      }
      
      // Check if searchResults has the expected structure
      if (searchResults && typeof searchResults === 'object' && 'hits' in searchResults) {
        const hits = searchResults.hits || [];
        setResults(hits);
        
        // Nếu không có kết quả, thử tìm kiếm với từ khóa đơn giản hơn
        if (hits.length === 0 && safeQuery.length > 3) {
          const simplifiedQuery = safeQuery.split(' ').slice(0, 2).join(' '); // Lấy 2 từ đầu tiên
          if (simplifiedQuery !== safeQuery) {
            const simplifiedResults = await globalSearch(simplifiedQuery);
            if (simplifiedResults && simplifiedResults.hits && simplifiedResults.hits.length > 0) {
              setResults(simplifiedResults.hits);
            }
          }
        }
      } else {
        console.warn('Unexpected search results format:', searchResults);
        setResults([]);
      }

      // Get suggestions
      setIsLoadingSuggestions(true);
      const searchSuggestions = await getSearchSuggestions(safeQuery);
      // Convert string[] to SearchSuggestion[]
      const formattedSuggestions = (searchSuggestions || []).map(text => ({
        text,
        type: 'keyword',
        count: 1
      }));
      setSuggestions(formattedSuggestions);
      setIsLoadingSuggestions(false);

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
    const safeValue = value || '';
    setQuery(safeValue);
    setShowSuggestions(true);
    debouncedSearch(safeValue);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    setShowSuggestions(false);
    setResults([]); // Clear previous results
    setSearchError(null); // Clear any previous errors
    
    // Perform search immediately
    performSearch(suggestion);
  };

  const handleResultClick = (result: SearchResult) => {
    // Đóng search modal
    setIsOpen(false);
    onClose?.();
    
    // Clear search state
    setQuery('');
    setResults([]);
    setSuggestions([]);
    
    // Xử lý navigation dựa trên loại kết quả
    try {
      if (result.url && result.url.startsWith('/')) {
        // Kiểm tra xem có phải là route hợp lệ không
        const validRoutes = [
          '/search-demo',
          '/dashboard/announcements',
          '/dashboard/events', 
          '/dashboard/facility-bookings',
          '/dashboard/invoices',
          '/dashboard/support-requests',
          '/dashboard/feedback'
        ];
        
        const isValidRoute = validRoutes.some(route => result.url.startsWith(route));
        
        if (isValidRoute) {
          // Sử dụng Next.js router nếu có, hoặc fallback về window.location
          if (typeof window !== 'undefined') {
            // Nếu là search-demo, thêm thông tin về kết quả được click
            if (result.url.startsWith('/search-demo')) {
              const url = new URL(result.url, window.location.origin);
              url.searchParams.set('result', JSON.stringify({
                type: result.type,
                title: result.title,
                content: result.content,
                metadata: result.metadata
              }));
              
              // Navigate đến trang demo với thông tin kết quả
              window.location.href = url.toString();
            } else {
              // Các route khác
              window.location.href = result.url;
            }
          }
        } else {
          // Route không hợp lệ, hiển thị thông báo
          console.warn('Invalid route:', result.url);
          alert(`Trang ${result.url} chưa được tạo. Vui lòng liên hệ admin.`);
        }
      } else {
        console.warn('Invalid URL:', result.url);
      }
    } catch (error) {
      console.error('Navigation error:', error);
      // Fallback: hiển thị thông báo
      alert('Có lỗi xảy ra khi chuyển trang. Vui lòng thử lại.');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      onClose?.();
      setQuery('');
      setResults([]);
      setSuggestions([]);
    }
  };

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'announcement':
        return <FileText className="w-4 h-4 text-blue-600" />;
      case 'event':
        return <Calendar className="w-4 h-4 text-green-600" />;
      case 'facility':
        return <Building2 className="w-4 h-4 text-purple-600" />;
      case 'invoice':
        return <Receipt className="w-4 h-4 text-orange-600" />;
      case 'support_request':
        return <MessageSquare className="w-4 h-4 text-red-600" />;
      case 'feedback':
        return <Star className="w-4 h-4 text-yellow-600" />;
      default:
        return <Search className="w-4 h-4 text-gray-600" />;
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
    if (!text) return '';
    
    // Nếu có highlight và highlight khác với text gốc
    if (highlight && highlight !== text) {
      // Kiểm tra xem highlight có chứa HTML tags không
      if (highlight.includes('<mark') && highlight.includes('</mark>')) {
        try {
          // Sử dụng dangerouslySetInnerHTML để render HTML highlight
          return <span dangerouslySetInnerHTML={{ __html: highlight }} />;
        } catch (error) {
          console.error('Error rendering highlight:', error);
          // Fallback về text gốc nếu có lỗi
          return text;
        }
      }
      // Nếu highlight không có HTML, sử dụng text gốc
      return text;
    }
    
    // Trả về text gốc nếu không có highlight
    return text;
  };

  // Thêm CSS cho highlight
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .search-highlight {
        background: linear-gradient(120deg, #fef3c7 0%, #fde68a 100%) !important;
        padding: 2px 6px !important;
        border-radius: 6px !important;
        font-weight: 700 !important;
        color: #92400e !important;
        box-shadow: 0 1px 3px rgba(0,0,0,0.1) !important;
        border: 1px solid #f59e0b !important;
        text-shadow: none !important;
        display: inline-block !important;
        margin: 0 1px !important;
        line-height: 1.4 !important;
        white-space: nowrap !important;
        transition: all 0.2s ease !important;
      }
      
      .search-highlight:hover {
        background: linear-gradient(120deg, #fde68a 0%, #fbbf24 100%) !important;
        transform: translateY(-1px) !important;
        box-shadow: 0 2px 6px rgba(0,0,0,0.15) !important;
      }
      
      /* Đảm bảo text không bị cắt */
      .search-result-title {
        word-break: break-word !important;
        overflow-wrap: break-word !important;
        line-height: 1.5 !important;
        font-size: 14px !important;
        font-weight: 600 !important;
        color: #1f2937 !important;
      }
      
      /* Xử lý highlight trong title */
      .search-result-title .search-highlight {
        white-space: normal !important;
        word-break: break-word !important;
        font-size: inherit !important;
        font-weight: inherit !important;
      }
      
      /* Cải thiện search result card */
      .search-result-card {
        transition: all 0.2s ease !important;
        border-radius: 8px !important;
        border: 1px solid #e5e7eb !important;
      }
      
      .search-result-card:hover {
        background-color: #f9fafb !important;
        border-color: #d1d5db !important;
        transform: translateY(-1px) !important;
        box-shadow: 0 4px 12px rgba(0,0,0,0.1) !important;
      }
      
      /* Cải thiện metadata tags */
      .search-metadata-tag {
        background: #f3f4f6 !important;
        color: #374151 !important;
        border: 1px solid #e5e7eb !important;
        border-radius: 6px !important;
        padding: 2px 8px !important;
        font-size: 11px !important;
        font-weight: 500 !important;
        transition: all 0.2s ease !important;
      }
      
      .search-metadata-tag:hover {
        background: #e5e7eb !important;
        border-color: #d1d5db !important;
      }
      
      /* Cải thiện type badge */
      .search-type-badge {
        background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%) !important;
        color: white !important;
        border-radius: 12px !important;
        padding: 2px 8px !important;
        font-size: 11px !important;
        font-weight: 600 !important;
        box-shadow: 0 1px 3px rgba(59, 130, 246, 0.3) !important;
        transition: all 0.2s ease !important;
      }
      
      .search-type-badge:hover {
        transform: scale(1.05) !important;
        box-shadow: 0 2px 6px rgba(59, 130, 246, 0.4) !important;
      }
      
      /* Cải thiện content text */
      .search-result-content {
        color: #6b7280 !important;
        line-height: 1.5 !important;
        font-size: 13px !important;
        margin: 8px 0 !important;
      }
      
      /* Cải thiện action text */
      .search-action-text {
        color: #9ca3af !important;
        font-size: 11px !important;
        font-weight: 500 !important;
        transition: color 0.2s ease !important;
      }
      
      .search-result-card:hover .search-action-text {
        color: #6b7280 !important;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
    };
  }, []);

  // Focus input when search opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  return (
    <>
      {/* Search Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        title="Tìm kiếm toàn diện"
      >
        <Search className="w-5 h-5" />
        <span className="hidden md:inline">Tìm kiếm</span>
      </button>

      {/* Search Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-start justify-center min-h-screen pt-16 px-4">
            {/* Backdrop */}
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
              onClick={() => {
                setIsOpen(false);
                onClose?.();
              }}
            />

            {/* Search Modal */}
            <div className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
              {/* Header */}
              <div className="flex items-center space-x-3 p-4 border-b border-gray-200">
                <Search className="w-5 h-5 text-gray-400" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query || ''}
                  onChange={(e) => handleInputChange(e.target.value || '')}
                  onKeyDown={handleKeyDown}
                  placeholder={placeholder || "Tìm kiếm thông báo, sự kiện, tiện ích, hóa đơn, yêu cầu hỗ trợ, phản hồi..."}
                  className="flex-1 text-lg border-none outline-none placeholder-gray-400"
                />
                                                                  <button
                                   onClick={() => {
                                     setIsOpen(false);
                                     onClose?.();
                                   }}
                                   className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                                   title="Đóng tìm kiếm"
                                   aria-label="Đóng tìm kiếm"
                                 >
                                   <X className="w-5 h-5 text-gray-400" />
                                 </button>
              </div>

              {/* Content */}
              <div className="max-h-[calc(80vh-80px)] overflow-y-auto">
                {/* Loading State */}
                {isLoading && (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-3 text-gray-600">Đang tìm kiếm...</span>
                  </div>
                )}

                {/* Error State */}
                {searchError && (
                  <div className="p-4 text-center text-red-600">
                    {searchError}
                  </div>
                )}

                {/* Suggestions */}
                {!isLoading && !searchError && showSuggestions && suggestions.length > 0 && (
                  <div className="border-b border-gray-200">
                    <div className="px-4 py-2 bg-gray-50 text-sm font-medium text-gray-700">
                      Gợi ý tìm kiếm
                    </div>
                    {suggestions.map((suggestion, index) => (
                      <button
                        key={`suggestion_${suggestion.text}_${index}_${Date.now()}`}
                        onClick={() => handleSuggestionClick(suggestion.text)}
                        className="w-full text-left px-4 py-3 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none border-b border-gray-100 last:border-b-0"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-700">{suggestion.text}</span>
                          </div>
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                            {suggestion.type === 'keyword' ? 'Từ khóa' : 'Gợi ý'}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* Search Results */}
                {!isLoading && !searchError && results.length > 0 && (
                  <div>
                    <div className="px-4 py-2 bg-gray-50 text-sm font-medium text-gray-700">
                      Kết quả tìm kiếm ({results.length})
                    </div>
                    {results.map((result, index) => (
                      <button
                        key={`${result.type}_${result.objectID}_${index}_${Date.now()}`}
                        onClick={() => handleResultClick(result)}
                        className="w-full text-left px-4 py-3 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none border-b border-gray-100 last:border-b-0 search-result-card"
                      >
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0 mt-1">
                            {getResultIcon(result.type)}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-2">
                              <h3 className="text-sm font-medium text-gray-900 truncate search-result-title flex-1">
                                {renderHighlightedText(result.title, result.highlight)}
                              </h3>
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium search-type-badge">
                                {getResultTypeLabel(result.type)}
                              </span>
                            </div>
                            
                            <p className="text-sm text-gray-600 line-clamp-2 mb-3 search-result-content">
                              {result.content}
                            </p>
                            
                            {result.metadata && Object.keys(result.metadata).length > 0 && (
                              <div className="flex flex-wrap gap-2 mb-3">
                                {Object.entries(result.metadata).slice(0, 3).map(([key, value]) => {
                                  if (value && typeof value === 'string' && value.length < 30) {
                                    return (
                                      <span
                                        key={`${key}_${value}_${Date.now()}`}
                                        className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium search-metadata-tag"
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
                              <span className="text-xs text-gray-500 search-action-text">
                                Nhấn để xem chi tiết
                              </span>
                              
                              {result.metadata?.relevanceScore && (
                                <span className="text-xs text-gray-500">
                                  Độ liên quan: {result.metadata.relevanceScore}
                                </span>
                              )}
                            </div>
                          </div>
                          
                          <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* No Results */}
                {!isLoading && !searchError && (query || '').trim().length >= 2 && results.length === 0 && (
                  <div className="text-center py-12">
                    <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Không tìm thấy kết quả
                    </h3>
                    <p className="text-gray-600">
                      Không có kết quả nào cho từ khóa "{query}". Hãy thử từ khóa khác.
                    </p>
                  </div>
                )}

                {/* Search Tips */}
                {!isLoading && !searchError && (query || '').trim().length === 0 && (
                  <div className="p-4">
                    <div className="text-sm text-gray-600 space-y-2">
                      <p className="font-medium text-gray-900">Mẹo tìm kiếm:</p>
                      <div className="grid grid-cols-1 gap-1 text-xs">
                        <div>• <strong>Hóa đơn:</strong> "hóa đơn", "bill", "phí", "tháng 11"</div>
                        <div>• <strong>Tiện ích:</strong> "gym", "BBQ", "tiện ích", "facility"</div>
                        <div>• <strong>Sự kiện:</strong> "sự kiện", "event", "họp", "tiệc"</div>
                        <div>• <strong>Thông báo:</strong> "thông báo", "announcement", "tin tức"</div>
                        <div>• <strong>Yêu cầu:</strong> "yêu cầu", "hỗ trợ", "support", "vấn đề"</div>
                        <div>• <strong>Phản hồi:</strong> "phản hồi", "feedback", "đánh giá"</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
