import { 
  fetchAnnouncements, 
  fetchEvents, 
  fetchFacilities, 
  fetchInvoices, 
  fetchMySupportRequests, 
  fetchMyFeedback 
} from './api';

// Types for search results
export interface SearchResult {
  objectID: string;
  type: 'announcement' | 'event' | 'facility' | 'invoice' | 'support_request' | 'feedback';
  title: string;
  content: string;
  url: string;
  highlight?: string;
  metadata?: Record<string, any>;
}

export interface SearchSuggestion {
  text: string;
  type: string;
  count: number;
}

// Common Vietnamese and English keywords for better search relevance
const COMMON_KEYWORDS = {
  // Vietnamese keywords
  vi: {
    // General terms
    chung: ['chung', 'tổng', 'tất cả', 'mọi', 'các'],
    
    // Announcements
    thongBao: ['thông báo', 'thông tin', 'tin tức', 'cập nhật', 'quan trọng', 'khẩn cấp'],
    
    // Events
    suKien: ['sự kiện', 'lễ hội', 'họp', 'gặp gỡ', 'tiệc', 'buổi', 'chương trình'],
    
    // Facilities
    tienIch: ['tiện ích', 'cơ sở', 'phòng', 'khu vực', 'dịch vụ', 'thiết bị'],
    gym: ['gym', 'phòng tập', 'thể dục', 'thể thao', 'tập luyện', 'vận động'],
    bbq: ['bbq', 'nướng', 'tiệc nướng', 'khu nướng', 'nấu ăn', 'ăn uống'],
    parking: ['giữ xe', 'đỗ xe', 'bãi xe', 'xe hơi', 'xe máy', 'gara'],
    
    // Invoices and billing
    hoaDon: ['hóa đơn', 'hóa đơn', 'bill', 'phí', 'tiền', 'thanh toán', 'chi phí'],
    phiDien: ['phí điện', 'điện', 'tiền điện', 'kwh', 'đồng hồ điện'],
    phiNuoc: ['phí nước', 'nước', 'tiền nước', 'm3', 'đồng hồ nước'],
    phiInternet: ['phí internet', 'internet', 'wifi', 'mạng', 'truyền hình'],
    phiBaoTri: ['phí bảo trì', 'bảo trì', 'sửa chữa', 'duy tu', 'bảo dưỡng'],
    phiVeSinh: ['phí vệ sinh', 'vệ sinh', 'dọn dẹp', 'lau chùi', 'làm sạch'],
    phiAnNinh: ['phí an ninh', 'an ninh', 'bảo vệ', 'canh gác', 'giữ an toàn'],
    phiCayXanh: ['phí cây xanh', 'cây xanh', 'cây cảnh', 'vườn', 'cảnh quan'],
    
    // Support requests
    yeuCau: ['yêu cầu', 'đề nghị', 'khiếu nại', 'báo cáo', 'vấn đề', 'sự cố'],
    hoTro: ['hỗ trợ', 'giúp đỡ', 'tư vấn', 'hướng dẫn', 'giải đáp'],
    
    // Feedback
    phanHoi: ['phản hồi', 'đánh giá', 'nhận xét', 'ý kiến', 'góp ý', 'bình luận'],
    
    // Status
    trangThai: ['trạng thái', 'tình trạng', 'tình hình', 'kết quả'],
    chuaThanhToan: ['chưa thanh toán', 'nợ', 'quá hạn', 'chậm', 'trễ'],
    daThanhToan: ['đã thanh toán', 'hoàn thành', 'xong', 'ok', 'done'],
    quaHan: ['quá hạn', 'trễ', 'muộn', 'chậm', 'nợ'],
    
    // Time periods
    thoiGian: ['thời gian', 'ngày', 'tháng', 'năm', 'kỳ', 'chu kỳ'],
    thang11: ['tháng 11', '11/2024', '2024-11', 'november'],
    thang10: ['tháng 10', '10/2024', '2024-10', 'october'],
    thang9: ['tháng 9', '9/2024', '2024-09', 'september'],
    thang8: ['tháng 8', '8/2024', '2024-08', 'august'],
    thang7: ['tháng 7', '7/2024', '2024-07', 'july'],
    
    // Amount ranges
    soTien: ['số tiền', 'tổng tiền', 'phí', 'chi phí', 'giá', 'định mức'],
    duoi1Trieu: ['dưới 1 triệu', 'ít hơn 1 triệu', 'nhỏ hơn 1 triệu'],
    tren1Trieu: ['trên 1 triệu', 'nhiều hơn 1 triệu', 'lớn hơn 1 triệu']
  },
  
  // English keywords
  en: {
    // General terms
    general: ['general', 'all', 'total', 'overview', 'summary'],
    
    // Announcements
    announcements: ['announcement', 'notice', 'information', 'news', 'update', 'important', 'urgent'],
    
    // Events
    events: ['event', 'meeting', 'party', 'gathering', 'program', 'activity'],
    
    // Facilities
    facilities: ['facility', 'service', 'room', 'area', 'equipment', 'amenity'],
    gym: ['gym', 'fitness', 'exercise', 'workout', 'training', 'sports'],
    bbq: ['bbq', 'barbecue', 'grill', 'cooking', 'dining', 'outdoor'],
    parking: ['parking', 'car', 'vehicle', 'garage', 'lot'],
    
    // Invoices and billing
    invoices: ['invoice', 'bill', 'payment', 'fee', 'charge', 'cost', 'expense'],
    electricity: ['electricity', 'power', 'energy', 'kwh', 'meter'],
    water: ['water', 'utility', 'meter', 'consumption'],
    internet: ['internet', 'wifi', 'network', 'cable', 'tv'],
    maintenance: ['maintenance', 'repair', 'service', 'upkeep'],
    cleaning: ['cleaning', 'sanitation', 'hygiene', 'cleaning'],
    security: ['security', 'safety', 'guard', 'protection'],
    gardening: ['gardening', 'landscaping', 'plants', 'garden'],
    
    // Support requests
    support: ['support', 'request', 'help', 'assistance', 'issue', 'problem'],
    
    // Feedback
    feedback: ['feedback', 'review', 'comment', 'opinion', 'suggestion'],
    
    // Status
    status: ['status', 'state', 'condition', 'result'],
    unpaid: ['unpaid', 'pending', 'due', 'overdue', 'late'],
    paid: ['paid', 'completed', 'done', 'finished', 'ok'],
    overdue: ['overdue', 'late', 'delayed', 'past due'],
    
    // Time periods
    time: ['time', 'date', 'month', 'year', 'period', 'cycle'],
    november: ['november', 'nov', '11', '11/2024', '2024-11'],
    october: ['october', 'oct', '10', '10/2024', '2024-10'],
    september: ['september', 'sep', '9', '9/2024', '2024-09'],
    august: ['august', 'aug', '8', '8/2024', '2024-08'],
    july: ['july', 'jul', '7', '7/2024', '2024-07'],
    
    // Amount ranges
    amount: ['amount', 'total', 'fee', 'cost', 'price', 'rate'],
    under1M: ['under 1 million', 'less than 1 million', 'below 1 million'],
    over1M: ['over 1 million', 'more than 1 million', 'above 1 million']
  }
};

// Helper function to process API responses
function processApiResponse(data: any): any[] {
  if (Array.isArray(data)) {
    return data;
  }
  
  if (data && typeof data === 'object') {
    if (data.success && Array.isArray(data.data)) {
      return data.data;
    }
    
    if (data.content && Array.isArray(data.content)) {
      return data.content;
    }
    
    if (data.data && Array.isArray(data.data)) {
      return data.data;
    }
  }
  
  return [];
}

// Helper function to highlight search terms
export function highlightText(text: string, query: string): string {
  if (!text || !query) return text;
  
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
}

// Enhanced search function with comprehensive keyword matching
export async function globalSearch(query: string): Promise<SearchResult[]> {
  if (!query || query.trim().length < 2) {
    return [];
  }

  const normalizedQuery = query.toLowerCase().trim();
  const results: SearchResult[] = [];

  try {
    // Fetch all data sources
    const [announcements, events, facilities, invoices, supportRequests, feedback] = await Promise.all([
      fetchAnnouncements().then(processApiResponse),
      fetchEvents().then(processApiResponse),
      fetchFacilities().then(processApiResponse),
      fetchInvoices().then(processApiResponse),
      fetchMySupportRequests().then(processApiResponse),
      fetchMyFeedback().then(processApiResponse)
    ]);

    console.log('Search data loaded:', {
      announcements: announcements.length,
      events: events.length,
      facilities: facilities.length,
      invoices: invoices.length,
      supportRequests: supportRequests.length,
      feedback: feedback.length
    });

    // Search in announcements
    announcements.forEach((item: any) => {
      const searchableText = [
        item.title || '',
        item.content || '',
        item.category || '',
        item.status || ''
      ].join(' ').toLowerCase();

      if (searchableText.includes(normalizedQuery)) {
        results.push({
          objectID: `announcement_${item.id}`,
          type: 'announcement',
          title: item.title || 'Thông báo',
          content: item.content || '',
          url: `/dashboard/announcements/${item.id}`,
          highlight: highlightText(item.title || item.content || '', query),
          metadata: {
            category: item.category,
            status: item.status,
            createdAt: item.createdAt
          }
        });
      }
    });

    // Search in events
    events.forEach((item: any) => {
      const searchableText = [
        item.title || '',
        item.description || '',
        item.location || '',
        item.status || '',
        item.startDate || '',
        item.endDate || ''
      ].join(' ').toLowerCase();

      if (searchableText.includes(normalizedQuery)) {
        results.push({
          objectID: `event_${item.id}`,
          type: 'event',
          title: item.title || 'Sự kiện',
          content: item.description || '',
          url: `/dashboard/events/${item.id}`,
          highlight: highlightText(item.title || item.description || '', query),
          metadata: {
            location: item.location,
            status: item.status,
            startDate: item.startDate,
            endDate: item.endDate
          }
        });
      }
    });

    // Search in facilities
    facilities.forEach((item: any) => {
      const searchableText = [
        item.name || '',
        item.description || '',
        item.facilityType || '',
        item.bookingType || '',
        item.status || ''
      ].join(' ').toLowerCase();

      if (searchableText.includes(normalizedQuery)) {
        results.push({
          objectID: `facility_${item.id}`,
          type: 'facility',
          title: item.name || 'Tiện ích',
          content: item.description || '',
          url: `/dashboard/facility-bookings`,
          highlight: highlightText(item.name || item.description || '', query),
          metadata: {
            facilityType: item.facilityType,
            bookingType: item.bookingType,
            status: item.status,
            usageFee: item.usageFee
          }
        });
      }
    });

    // Enhanced search in invoices with nested items
    invoices.forEach((item: any) => {
      const searchableText = [
        item.billingPeriod || '',
        item.status || '',
        item.totalAmount?.toString() || '',
        ...(item.items || []).map((feeItem: any) => [
          feeItem.feeType || '',
          feeItem.description || '',
          feeItem.amount?.toString() || ''
        ].join(' '))
      ].join(' ').toLowerCase();

      if (searchableText.includes(normalizedQuery)) {
        results.push({
          objectID: `invoice_${item.id}`,
          type: 'invoice',
          title: `Hóa đơn ${item.billingPeriod}`,
          content: `Tổng tiền: ${item.totalAmount?.toLocaleString('vi-VN')} VND - Trạng thái: ${item.status}`,
          url: `/dashboard/invoices/${item.id}`,
          highlight: highlightText(`Hóa đơn ${item.billingPeriod}`, query),
          metadata: {
            billingPeriod: item.billingPeriod,
            status: item.status,
            totalAmount: item.totalAmount,
            issueDate: item.issueDate,
            dueDate: item.dueDate
          }
        });
      }
    });

    // Search in support requests
    supportRequests.forEach((item: any) => {
      const searchableText = [
        item.title || '',
        item.description || '',
        item.category || '',
        item.status || '',
        item.priority || ''
      ].join(' ').toLowerCase();

      if (searchableText.includes(normalizedQuery)) {
        results.push({
          objectID: `support_request_${item.id}`,
          type: 'support_request',
          title: item.title || 'Yêu cầu hỗ trợ',
          content: item.description || '',
          url: `/dashboard/support-requests/${item.id}`,
          highlight: highlightText(item.title || item.description || '', query),
          metadata: {
            category: item.category,
            status: item.status,
            priority: item.priority,
            createdAt: item.createdAt
          }
        });
      }
    });

    // Search in feedback
    feedback.forEach((item: any) => {
      const searchableText = [
        item.title || '',
        item.content || '',
        item.category || '',
        item.rating?.toString() || '',
        item.status || ''
      ].join(' ').toLowerCase();

      if (searchableText.includes(normalizedQuery)) {
        results.push({
          objectID: `feedback_${item.id}`,
          type: 'feedback',
          title: item.title || 'Phản hồi',
          content: item.content || '',
          url: `/dashboard/feedbacks/${item.id}`,
          highlight: highlightText(item.title || item.content || '', query),
          metadata: {
            category: item.category,
            rating: item.rating,
            status: item.status,
            createdAt: item.createdAt
          }
        });
      }
    });

    // Additional keyword-based matching for better relevance
    const allKeywords = [
      ...Object.values(COMMON_KEYWORDS.vi).flat(),
      ...Object.values(COMMON_KEYWORDS.en).flat()
    ];

    // Check if query matches any common keywords
    const matchingKeywords = allKeywords.filter(keyword => 
      keyword.toLowerCase().includes(normalizedQuery) || 
      normalizedQuery.includes(keyword.toLowerCase())
    );

    if (matchingKeywords.length > 0) {
      console.log('Matching keywords found:', matchingKeywords);
      
      // Boost results that contain matching keywords
      results.forEach(result => {
        const resultText = `${result.title} ${result.content}`.toLowerCase();
        const keywordMatches = matchingKeywords.filter(keyword => 
          resultText.includes(keyword.toLowerCase())
        );
        
        if (keywordMatches.length > 0) {
          result.metadata = {
            ...result.metadata,
            keywordMatches,
            relevanceScore: keywordMatches.length
          };
        }
      });
    }

    // Sort results by relevance
    results.sort((a, b) => {
      const aScore = (a.metadata?.relevanceScore || 0) + 
                     (a.title.toLowerCase().includes(normalizedQuery) ? 2 : 0) +
                     (a.content.toLowerCase().includes(normalizedQuery) ? 1 : 0);
      
      const bScore = (b.metadata?.relevanceScore || 0) + 
                     (b.title.toLowerCase().includes(normalizedQuery) ? 2 : 0) +
                     (b.content.toLowerCase().includes(normalizedQuery) ? 1 : 0);
      
      return bScore - aScore;
    });

    console.log(`Search completed. Found ${results.length} results for query: "${query}"`);
    return results;

  } catch (error) {
    console.error('Search error:', error);
    return [];
  }
}

// Search by specific type
export async function searchByType(query: string, type: string): Promise<SearchResult[]> {
  const allResults = await globalSearch(query);
  return allResults.filter(result => result.type === type);
}

// Get search suggestions based on available data
export async function getSearchSuggestions(query: string): Promise<SearchSuggestion[]> {
  if (!query || query.trim().length < 1) {
    return [];
  }

  const normalizedQuery = query.toLowerCase().trim();
  const suggestions: Map<string, SearchSuggestion> = new Map();

  try {
    const [announcements, events, facilities, invoices, supportRequests, feedback] = await Promise.all([
      fetchAnnouncements().then(processApiResponse),
      fetchEvents().then(processApiResponse),
      fetchFacilities().then(processApiResponse),
      fetchInvoices().then(processApiResponse),
      fetchMySupportRequests().then(processApiResponse),
      fetchMyFeedback().then(processApiResponse)
    ]);

    // Extract suggestions from all data sources
    const allTexts = [
      ...announcements.map((item: any) => [item.title, item.content, item.category]),
      ...events.map((item: any) => [item.title, item.description, item.location]),
      ...facilities.map((item: any) => [item.name, item.description, item.facilityType]),
      ...invoices.map((item: any) => [item.billingPeriod, item.status]),
      ...supportRequests.map((item: any) => [item.title, item.category, item.priority]),
      ...feedback.map((item: any) => [item.title, item.category])
    ].flat().filter(Boolean);

    // Find matching suggestions
    allTexts.forEach(text => {
      if (typeof text === 'string' && text.toLowerCase().includes(normalizedQuery)) {
        const words = text.split(/\s+/);
        words.forEach(word => {
          if (word.toLowerCase().includes(normalizedQuery) && word.length > 2) {
            const key = word.toLowerCase();
            if (suggestions.has(key)) {
              suggestions.get(key)!.count++;
            } else {
              suggestions.set(key, {
                text: word,
                type: 'text',
                count: 1
              });
            }
          }
        });
      }
    });

    // Add common keyword suggestions
    const allKeywords = [
      ...Object.values(COMMON_KEYWORDS.vi).flat(),
      ...Object.values(COMMON_KEYWORDS.en).flat()
    ];

    allKeywords.forEach(keyword => {
      if (keyword.toLowerCase().includes(normalizedQuery) && keyword.length > 2) {
        const key = keyword.toLowerCase();
        if (!suggestions.has(key)) {
          suggestions.set(key, {
            text: keyword,
            type: 'keyword',
            count: 5 // Higher weight for common keywords
          });
        }
      }
    });

    // Thêm các gợi ý đặc biệt cho các sự kiện mới
    const specialEvents = [
      'Tiệc Giáng sinh 2025 - Gala Dinner',
      'Tiệc mừng năm mới 2025 - Countdown Party',
      'Họp cư dân tháng 12/2024',
      'Phòng tập Gym cao cấp',
      'Khu BBQ ngoài trời'
    ];

    specialEvents.forEach(event => {
      if (event.toLowerCase().includes(normalizedQuery)) {
        const key = event.toLowerCase();
        if (!suggestions.has(key)) {
          suggestions.set(key, {
            text: event,
            type: 'event',
            count: 10 // Highest weight for special events
          });
        }
      }
    });

    // Convert to array and sort by count
    const suggestionsArray = Array.from(suggestions.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    console.log(`🔍 Enhanced search suggestions: ${suggestionsArray.length} suggestions for "${query}"`);
    return suggestionsArray;

  } catch (error) {
    console.error('Error getting suggestions:', error);
    // Trả về gợi ý mặc định nếu có lỗi
    return [
      {
        text: 'Tiệc Giáng sinh 2025 - Gala Dinner',
        type: 'event',
        count: 10
      },
      {
        text: 'Tiệc mừng năm mới 2025 - Countdown Party',
        type: 'event',
        count: 10
      },
      {
        text: 'Họp cư dân tháng 12/2024',
        type: 'event',
        count: 8
      }
    ];
  }
}

// Placeholder exports for compatibility with Meilisearch
export const searchClient = {
  index: () => ({
    search: () => Promise.resolve({ hits: [] }),
    addDocuments: () => Promise.resolve(),
    deleteDocument: () => Promise.resolve()
  })
};

export const SEARCH_INDICES = {
  ANNOUNCEMENTS: 'announcements',
  EVENTS: 'events',
  FACILITIES: 'facilities',
  INVOICES: 'invoices',
  SUPPORT_REQUESTS: 'support_requests',
  FEEDBACK: 'feedback'
};

export const initializeSearchIndexes = () => Promise.resolve();
export const syncDataToSearch = () => Promise.resolve();
export const removeDocumentFromSearch = () => Promise.resolve();
