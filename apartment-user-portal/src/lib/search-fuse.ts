// Tìm kiếm local sử dụng Fuse.js cho fuzzy search
import Fuse from 'fuse.js';
import { 
  fetchAnnouncements, 
  fetchEvents, 
  fetchFacilities, 
  fetchInvoices, 
  fetchMySupportRequests
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
  score?: number;
  relevance?: 'high' | 'medium' | 'low';
  category?: string;
  tags?: string[];
  createdAt?: string;
}

export interface GlobalSearchResult {
  query: string;
  hits: SearchResult[];
  totalHits: number;
  processingTimeMS: number;
  facets?: any;
  pagination?: any;
  suggestions?: string[];
}

// Fuse.js configuration tối ưu
const FUSE_OPTIONS = {
  includeScore: true,
  includeMatches: true,
  threshold: 0.4, // Độ chính xác vừa phải để có nhiều kết quả
  minMatchCharLength: 2,
  findAllMatches: true,
  useExtendedSearch: true, // Hỗ trợ tìm kiếm nâng cao
  distance: 100, // Khoảng cách tối đa giữa các từ
  keys: [
    { name: 'title', weight: 0.6 },      // Tiêu đề quan trọng nhất
    { name: 'content', weight: 0.25 },   // Nội dung
    { name: 'category', weight: 0.1 },   // Danh mục
    { name: 'tags', weight: 0.05 }       // Tags
  ]
};

// Cấu hình riêng cho từng loại dữ liệu
const TYPE_SPECIFIC_OPTIONS = {
  announcement: {
    ...FUSE_OPTIONS,
    keys: [
      { name: 'title', weight: 0.6 },
      { name: 'content', weight: 0.3 },
      { name: 'category', weight: 0.1 }
    ]
  },
  event: {
    ...FUSE_OPTIONS,
    keys: [
      { name: 'title', weight: 0.5 },
      { name: 'description', weight: 0.3 },
      { name: 'location', weight: 0.15 },
      { name: 'category', weight: 0.05 }
    ]
  },
  facility: {
    ...FUSE_OPTIONS,
    keys: [
      { name: 'name', weight: 0.5 },
      { name: 'description', weight: 0.3 },
      { name: 'facilityType', weight: 0.15 },
      { name: 'amenities', weight: 0.05 }
    ]
  },
  invoice: {
    ...FUSE_OPTIONS,
    keys: [
      { name: 'billingPeriod', weight: 0.4 },
      { name: 'status', weight: 0.3 },
      { name: 'feeTypes', weight: 0.2 },
      { name: 'totalAmount', weight: 0.1 }
    ]
  },
  support_request: {
    ...FUSE_OPTIONS,
    keys: [
      { name: 'title', weight: 0.5 },
      { name: 'description', weight: 0.3 },
      { name: 'category', weight: 0.15 },
      { name: 'priority', weight: 0.05 }
    ]
  }
};

// Helper function to process API responses
function processApiResponse(data: any): any[] {
  if (Array.isArray(data)) return data;
  if (data?.success?.data) return data.success.data;
  if (data?.content) return data.content;
  if (data?.data) return data.data;
  return [];
}

// Hàm highlight text với Fuse.js matches - tối ưu hóa
const highlightText = (text: string, matches: any[]): string => {
  if (!text || !matches || matches.length === 0) return text;
  
  try {
    // Sắp xếp matches theo thứ tự từ cuối lên đầu để tránh conflict index
    const sortedMatches = [...matches].sort((a, b) => {
      if (a.indices && b.indices && a.indices.length > 0 && b.indices.length > 0) {
        return b.indices[0][0] - a.indices[0][0];
      }
      return 0;
    });
    
    let highlightedText = text;
    sortedMatches.forEach(match => {
      if (match.indices && match.indices.length > 0) {
        match.indices.forEach(([start, end]: [number, number]) => {
          if (start >= 0 && end >= start && end < highlightedText.length) {
            const before = highlightedText.substring(0, start);
            const matched = highlightedText.substring(start, end + 1);
            const after = highlightedText.substring(end + 1);
            highlightedText = `${before}<mark class="search-highlight">${matched}</mark>${after}`;
          }
        });
      }
    });
    return highlightedText;
  } catch (error) {
    console.error('Error highlighting text:', error);
    // Trả về text gốc nếu có lỗi
    return text;
  }
};

// Hàm tính điểm relevance
const calculateRelevance = (fuseScore: number | undefined): 'high' | 'medium' | 'low' => {
  if (fuseScore === undefined) return 'medium';
  if (fuseScore <= 0.2) return 'high';
  if (fuseScore <= 0.5) return 'medium';
  return 'low';
};

// Tạo dữ liệu mẫu phong phú
const createSampleData = () => {
  return {
    announcements: [
      {
        id: 'ann-1',
        title: 'Thông báo về việc bảo trì hệ thống điện',
        content: 'Hệ thống điện sẽ được bảo trì vào ngày 20/12/2024 từ 8h-12h. Vui lòng chuẩn bị sẵn đèn pin và thiết bị dự phòng.',
        category: 'Bảo trì',
        status: 'Hoạt động',
        createdAt: '2024-12-15T10:00:00Z',
        tags: ['điện', 'bảo trì', 'hệ thống']
      },
      {
        id: 'ann-2',
        title: 'Thông báo về sự kiện cuối năm 2024',
        content: 'Sự kiện tổng kết năm 2024 sẽ diễn ra vào ngày 30/12/2024 tại hội trường chính. Tất cả cư dân đều được mời tham dự.',
        category: 'Sự kiện',
        status: 'Hoạt động',
        createdAt: '2024-12-14T15:30:00Z',
        tags: ['sự kiện', 'cuối năm', 'tổng kết']
      },
      {
        id: 'ann-3',
        title: 'Thông báo về quy định an ninh mới',
        content: 'Từ ngày 01/01/2025, tất cả khách vào chung cư phải đăng ký tại bảo vệ và xuất trình giấy tờ tùy thân.',
        category: 'An ninh',
        status: 'Hoạt động',
        createdAt: '2024-12-13T09:15:00Z',
        tags: ['an ninh', 'quy định', 'khách']
      },
      {
        id: 'ann-4',
        title: 'Thông báo về dịch vụ vệ sinh',
        content: 'Dịch vụ vệ sinh sẽ được thực hiện vào thứ 2, 4, 6 hàng tuần. Vui lòng để rác đúng nơi quy định.',
        category: 'Dịch vụ',
        status: 'Hoạt động',
        createdAt: '2024-12-12T14:20:00Z',
        tags: ['vệ sinh', 'dịch vụ', 'rác']
      }
    ],
    events: [
      {
        id: 'evt-1',
        title: 'Họp cư dân tháng 12/2024',
        description: 'Cuộc họp định kỳ với cư dân để thảo luận các vấn đề chung về quản lý chung cư và kế hoạch năm 2025.',
        location: 'Hội trường tầng 1',
        startDate: '2024-12-25T19:00:00Z',
        endDate: '2024-12-25T21:00:00Z',
        category: 'Họp',
        status: 'Sắp diễn ra',
        tags: ['họp', 'cư dân', 'thảo luận']
      },
      {
        id: 'evt-2',
        title: 'Tiệc Giáng sinh 2024',
        description: 'Tiệc mừng Giáng sinh cho tất cả cư dân với chương trình ca nhạc, ẩm thực và quà tặng hấp dẫn.',
        location: 'Sân vườn chung',
        startDate: '2024-12-24T18:00:00Z',
        endDate: '2024-12-24T22:00:00Z',
        category: 'Tiệc',
        status: 'Sắp diễn ra',
        tags: ['giáng sinh', 'tiệc', 'ca nhạc']
      },
      {
        id: 'evt-3',
        title: 'Tiệc Giáng sinh 2025 - Gala Dinner',
        description: 'Tiệc Giáng sinh sang trọng cho cư dân với nhiều hoạt động vui nhộn, ẩm thực đa dạng và chương trình văn nghệ đặc sắc.',
        location: 'Hội trường chính',
        startDate: '2024-12-24T18:00:00Z',
        endDate: '2024-12-24T22:00:00Z',
        category: 'Tiệc',
        status: 'Sắp diễn ra',
        tags: ['giáng sinh', 'tiệc', 'gala', '2025']
      },
      {
        id: 'evt-4',
        title: 'Tiệc mừng năm mới 2025 - Countdown Party',
        description: 'Đếm ngược chào đón năm mới 2025 với chương trình ca nhạc sôi động, pháo hoa và tiệc buffet đặc biệt.',
        location: 'Sân thượng tầng 20',
        startDate: '2024-12-31T21:00:00Z',
        endDate: '2025-01-01T01:00:00Z',
        category: 'Tiệc',
        status: 'Sắp diễn ra',
        tags: ['năm mới', 'countdown', 'tiệc', '2025']
      },
      {
        id: 'evt-5',
        title: 'Lớp yoga miễn phí',
        description: 'Lớp yoga miễn phí cho cư dân vào sáng chủ nhật hàng tuần. Phù hợp cho mọi lứa tuổi.',
        location: 'Sân thượng tầng 20',
        startDate: '2024-12-22T07:00:00Z',
        endDate: '2024-12-22T08:30:00Z',
        category: 'Thể thao',
        status: 'Sắp diễn ra',
        tags: ['yoga', 'miễn phí', 'thể thao']
      }
    ],
    facilities: [
      {
        id: 'fac-1',
        name: 'Phòng tập Gym cao cấp',
        description: 'Phòng tập thể dục với đầy đủ thiết bị hiện đại, máy chạy bộ, tạ, xe đạp tập và phòng xông hơi.',
        facilityType: 'Thể thao',
        bookingType: 'Đặt trước',
        status: 'Hoạt động',
        amenities: ['Máy chạy bộ', 'Tạ', 'Xe đạp tập', 'Phòng xông hơi', 'Tủ đồ'],
        usageFee: 50000,
        category: 'Thể thao',
        tags: ['gym', 'thể dục', 'máy tập']
      },
      {
        id: 'fac-2',
        name: 'Khu BBQ ngoài trời',
        description: 'Khu vực nướng BBQ ngoài trời với bàn ghế, mái che, bếp nướng và không gian rộng rãi.',
        facilityType: 'Giải trí',
        bookingType: 'Đặt trước',
        status: 'Hoạt động',
        amenities: ['Bếp nướng', 'Bàn ghế', 'Mái che', 'Quạt mát', 'Nhà vệ sinh'],
        usageFee: 100000,
        category: 'Giải trí',
        tags: ['BBQ', 'nướng', 'tiệc']
      },
      {
        id: 'fac-3',
        name: 'Phòng họp đa năng',
        description: 'Phòng họp hiện đại với trang thiết bị trình chiếu, âm thanh và sức chứa lên đến 50 người.',
        facilityType: 'Họp',
        bookingType: 'Đặt trước',
        status: 'Hoạt động',
        amenities: ['Máy chiếu', 'Âm thanh', 'Bàn ghế', 'Điều hòa', 'WiFi'],
        usageFee: 200000,
        category: 'Họp',
        tags: ['họp', 'trình chiếu', 'đa năng']
      }
    ],
    invoices: [
      {
        id: 'inv-1',
        billingPeriod: '12/2024',
        status: 'Chưa thanh toán',
        totalAmount: 1500000,
        issueDate: '2024-12-01',
        dueDate: '2024-12-31',
        items: [
          { feeType: 'Phí điện', description: 'Tiền điện tháng 12/2024', amount: 500000 },
          { feeType: 'Phí nước', description: 'Tiền nước tháng 12/2024', amount: 300000 },
          { feeType: 'Phí dịch vụ', description: 'Dịch vụ vệ sinh, an ninh', amount: 700000 }
        ],
        category: 'Chưa thanh toán',
        tags: ['hóa đơn', 'phí điện', 'phí nước']
      },
      {
        id: 'inv-2',
        billingPeriod: '11/2024',
        status: 'Đã thanh toán',
        totalAmount: 1200000,
        issueDate: '2024-11-01',
        dueDate: '2024-11-30',
        items: [
          { feeType: 'Phí điện', description: 'Tiền điện tháng 11/2024', amount: 400000 },
          { feeType: 'Phí nước', description: 'Tiền nước tháng 11/2024', amount: 250000 },
          { feeType: 'Phí dịch vụ', description: 'Dịch vụ vệ sinh, an ninh', amount: 550000 }
        ],
        category: 'Đã thanh toán',
        tags: ['hóa đơn', 'đã thanh toán', 'tháng 11']
      },
      {
        id: 'inv-3',
        billingPeriod: '10/2024',
        status: 'Đã thanh toán',
        totalAmount: 1100000,
        issueDate: '2024-10-01',
        dueDate: '2024-10-31',
        items: [
          { feeType: 'Phí điện', description: 'Tiền điện tháng 10/2024', amount: 350000 },
          { feeType: 'Phí nước', description: 'Tiền nước tháng 10/2024', amount: 200000 },
          { feeType: 'Phí dịch vụ', description: 'Dịch vụ vệ sinh, an ninh', amount: 550000 }
        ],
        category: 'Đã thanh toán',
        tags: ['hóa đơn', 'đã thanh toán', 'tháng 10']
      }
    ],
    supportRequests: [
      {
        id: 'sup-1',
        title: 'Yêu cầu sửa chữa điều hòa',
        description: 'Điều hòa phòng khách không hoạt động, cần kiểm tra và sửa chữa. Có tiếng ồn lạ khi khởi động.',
        category: 'Sửa chữa',
        status: 'Đang xử lý',
        priority: 'Cao',
        createdAt: '2024-12-16T09:00:00Z',
        tags: ['điều hòa', 'sửa chữa', 'khẩn cấp']
      },
      {
        id: 'sup-2',
        title: 'Yêu cầu thay thế bóng đèn',
        description: 'Bóng đèn hành lang tầng 2 bị cháy, cần thay thế để đảm bảo an toàn cho cư dân.',
        category: 'Bảo trì',
        status: 'Chờ xử lý',
        priority: 'Trung bình',
        createdAt: '2024-12-15T14:00:00Z',
        tags: ['bóng đèn', 'hành lang', 'bảo trì']
      },
      {
        id: 'sup-3',
        title: 'Báo cáo vòi nước bị rò rỉ',
        description: 'Vòi nước trong nhà vệ sinh bị rò rỉ, nước chảy liên tục gây lãng phí.',
        category: 'Sửa chữa',
        status: 'Đã xử lý',
        priority: 'Trung bình',
        createdAt: '2024-12-14T11:30:00Z',
        tags: ['vòi nước', 'rò rỉ', 'đã xử lý']
      }
    ]
  };
};

// Global search function sử dụng Fuse.js với logic thông minh
export async function globalSearch(query: string, options?: any): Promise<GlobalSearchResult> {
  const startTime = Date.now();
  
  if (!query || typeof query !== 'string' || query.trim().length < 2) {
    return {
      query: query || '',
      hits: [],
      totalHits: 0,
      processingTimeMS: 0,
      facets: {},
      pagination: {},
      suggestions: []
    };
  }

  // Chuẩn hóa query
  const normalizedQuery = query.trim().toLowerCase();
  console.log('🔍 Fuse.js search query:', normalizedQuery);
  
  // Tạo các biến thể query để tìm kiếm tốt hơn
  const queryVariants = [
    normalizedQuery,
    normalizedQuery.replace(/[àáạảãâầấậẩẫăằắặẳẵ]/g, 'a'),
    normalizedQuery.replace(/[èéẹẻẽêềếệểễ]/g, 'e'),
    normalizedQuery.replace(/[ìíịỉĩ]/g, 'i'),
    normalizedQuery.replace(/[òóọỏõôồốộổỗơờớợởỡ]/g, 'o'),
    normalizedQuery.replace(/[ùúụủũưừứựửữ]/g, 'u'),
    normalizedQuery.replace(/[ỳýỵỷỹ]/g, 'y'),
    normalizedQuery.replace(/[đ]/g, 'd')
  ];

  try {
    // Fetch all data sources
    const [announcements, events, facilities, invoices, supportRequests] = await Promise.all([
      fetchAnnouncements().then(processApiResponse),
      fetchEvents().then(processApiResponse),
      fetchFacilities().then(processApiResponse),
      fetchInvoices().then(processApiResponse),
      fetchMySupportRequests().then(processApiResponse)
    ]);

    console.log('📊 Raw data loaded:', {
      announcements: announcements.length,
      events: events.length,
      facilities: facilities.length,
      invoices: invoices.length,
      supportRequests: supportRequests.length
    });
    
    // Kiểm tra xem có dữ liệu nào không
    if (announcements.length === 0 && events.length === 0 && facilities.length === 0 && 
        invoices.length === 0 && supportRequests.length === 0) {
      console.log('🔄 Creating sample data for testing...');
      const sampleData = createSampleData();
      announcements.push(...sampleData.announcements);
      events.push(...sampleData.events);
      facilities.push(...sampleData.facilities);
      invoices.push(...sampleData.invoices);
      supportRequests.push(...sampleData.supportRequests);
      console.log('✅ Added sample data for testing');
    }

    const results: SearchResult[] = [];

    // Search in announcements với multiple queries
    if (announcements.length > 0) {
      const fuse = new Fuse(announcements, TYPE_SPECIFIC_OPTIONS.announcement);
      let allSearchResults: any[] = [];
      
      // Tìm kiếm với tất cả biến thể query
      queryVariants.forEach(variant => {
        const searchResults = fuse.search(variant);
        allSearchResults.push(...searchResults);
      });
      
      // Loại bỏ duplicates và sắp xếp theo score
      const uniqueResults = allSearchResults.filter((result, index, self) => 
        index === self.findIndex(r => r.item.id === result.item.id)
      ).sort((a, b) => (a.score || 1) - (b.score || 1));
      
      uniqueResults.forEach((result) => {
        const item = result.item;
        const relevance = calculateRelevance(result.score);
        
        // Tối ưu hóa highlight - ưu tiên title trước
        let highlightedTitle = '';
        if (result.matches && result.matches.length > 0) {
          const titleMatch = result.matches.find((match: any) => match.key === 'title');
          if (titleMatch) {
            highlightedTitle = highlightText(item.title || '', [titleMatch]);
          } else {
            highlightedTitle = highlightText(item.title || item.content || '', Array.from(result.matches || []));
          }
        }
        
        results.push({
          objectID: `announcement_${item.id}`,
          type: 'announcement',
          title: item.title || 'Thông báo',
          content: item.content || '',
          url: `/dashboard/announcements/${item.id}`,
          highlight: highlightedTitle || item.title || item.content || '',
          metadata: { category: item.category, status: item.status, fuseScore: result.score },
          score: result.score ? 1 - result.score : 0.5,
          relevance,
          category: item.category,
          tags: item.tags || [],
          createdAt: item.createdAt
        });
      });
    }

    // Search in events với multiple queries
    if (events.length > 0) {
      const fuse = new Fuse(events, TYPE_SPECIFIC_OPTIONS.event);
      let allSearchResults: any[] = [];
      
      queryVariants.forEach(variant => {
        const searchResults = fuse.search(variant);
        allSearchResults.push(...searchResults);
      });
      
      const uniqueResults = allSearchResults.filter((result, index, self) => 
        index === self.findIndex(r => r.item.id === result.item.id)
      ).sort((a, b) => (a.score || 1) - (b.score || 1));
      
      uniqueResults.forEach((result) => {
        const item = result.item;
        const relevance = calculateRelevance(result.score);
        
        let highlightedTitle = '';
        if (result.matches && result.matches.length > 0) {
          const titleMatch = result.matches.find((match: any) => match.key === 'title');
          if (titleMatch) {
            highlightedTitle = highlightText(item.title || '', [titleMatch]);
          } else {
            highlightedTitle = highlightText(item.title || item.description || '', Array.from(result.matches || []));
          }
        }
        
        results.push({
          objectID: `event_${item.id}`,
          type: 'event',
          title: item.title || 'Sự kiện',
          content: item.description || '',
          url: `/dashboard/events/${item.id}`,
          highlight: highlightedTitle || item.title || item.description || '',
          metadata: { location: item.location, status: item.status, fuseScore: result.score },
          score: result.score ? 1 - result.score : 0.5,
          relevance,
          category: item.category,
          tags: item.tags || [],
          createdAt: item.startDate || item.createdAt
        });
      });
    }

    // Search in facilities
    if (facilities.length > 0) {
      const fuse = new Fuse(facilities, TYPE_SPECIFIC_OPTIONS.facility);
      const searchResults = fuse.search(query);
      
      searchResults.forEach((result) => {
        const item = result.item;
        const relevance = calculateRelevance(result.score);
        
        results.push({
          objectID: `facility_${item.id}`,
          type: 'facility',
          title: item.name || 'Tiện ích',
          content: item.description || '',
          url: `/dashboard/facility-bookings`,
          highlight: highlightText(item.name || item.description || '', Array.from(result.matches || [])),
          metadata: { facilityType: item.facilityType, status: item.status, fuseScore: result.score },
          score: result.score ? 1 - result.score : 0.5,
          relevance,
          category: item.category,
          tags: item.amenities || [],
          createdAt: item.createdAt
        });
      });
    }

    // Search in invoices
    if (invoices.length > 0) {
      const fuse = new Fuse(invoices, TYPE_SPECIFIC_OPTIONS.invoice);
      const searchResults = fuse.search(query);
      
      searchResults.forEach((result) => {
        const item = result.item;
        const relevance = calculateRelevance(result.score);
        
        results.push({
          objectID: `invoice_${item.id}`,
          type: 'invoice',
          title: `Hóa đơn ${item.billingPeriod}`,
          content: `Tổng tiền: ${item.totalAmount?.toLocaleString('vi-VN')} VND - Trạng thái: ${item.status}`,
          url: `/dashboard/invoices/${item.id}`,
          highlight: highlightText(`Hóa đơn ${item.billingPeriod}`, Array.from(result.matches || [])),
          metadata: { billingPeriod: item.billingPeriod, status: item.status, fuseScore: result.score },
          score: result.score ? 1 - result.score : 0.5,
          relevance,
          category: item.status,
          tags: item.tags || [],
          createdAt: item.issueDate || item.createdAt
        });
      });
    }

    // Search in support requests
    if (supportRequests.length > 0) {
      const fuse = new Fuse(supportRequests, TYPE_SPECIFIC_OPTIONS.support_request);
      const searchResults = fuse.search(query);
      
      searchResults.forEach((result) => {
        const item = result.item;
        const relevance = calculateRelevance(result.score);
        
        results.push({
          objectID: `support_request_${item.id}`,
          type: 'support_request',
          title: item.title || 'Yêu cầu hỗ trợ',
          content: item.description || '',
          url: `/dashboard/support-requests/${item.id}`,
          highlight: highlightText(item.title || item.description || '', Array.from(result.matches || [])),
          metadata: { category: item.category, status: item.status, fuseScore: result.score },
          score: result.score ? 1 - result.score : 0.5,
          relevance,
          category: item.category,
          tags: item.tags || [],
          createdAt: item.createdAt
        });
      });
    }

    // Sort results by relevance score
    results.sort((a, b) => (b.score || 0) - (a.score || 0));
    
    console.log(`🎯 Final results count: ${results.length}`);
    if (results.length > 0) {
      console.log(`🎯 Top 3 results:`, results.slice(0, 3).map(r => ({
        type: r.type,
        title: r.title,
        score: r.score,
        relevance: r.relevance
      })));
    }

    const processingTime = Date.now() - startTime;

    return {
      query,
      hits: results,
      totalHits: results.length,
      processingTimeMS: processingTime,
      facets: {},
      pagination: {},
      suggestions: []
    };

  } catch (error) {
    console.error('Fuse.js search error:', error);
    return {
      query,
      hits: [],
      totalHits: 0,
      processingTimeMS: Date.now() - startTime,
      facets: {},
      pagination: {},
      suggestions: []
    };
  }
}

// Get search suggestions
export const getSearchSuggestions = async (query: string): Promise<string[]> => {
  try {
    if (!query || typeof query !== 'string' || query.trim().length < 2) return [];

    const [announcements, events, facilities, invoices, supportRequests] = await Promise.all([
      fetchAnnouncements().then(processApiResponse),
      fetchEvents().then(processApiResponse),
      fetchFacilities().then(processApiResponse),
      fetchInvoices().then(processApiResponse),
      fetchMySupportRequests().then(processApiResponse)
    ]);

    // Tạo dữ liệu mẫu nếu cần
    if (announcements.length === 0 && events.length === 0 && facilities.length === 0 && 
        invoices.length === 0 && supportRequests.length === 0) {
      const sampleData = createSampleData();
      announcements.push(...sampleData.announcements);
      events.push(...sampleData.events);
      facilities.push(...sampleData.facilities);
      invoices.push(...sampleData.invoices);
      supportRequests.push(...sampleData.supportRequests);
    }

    // Tạo danh sách gợi ý từ dữ liệu thực và mẫu
    const allData = [
      ...announcements.map(item => ({ 
        text: item.title || item.name || '', 
        type: 'announcement',
        original: item 
      })),
      ...events.map(item => ({ 
        text: item.title || '', 
        type: 'event',
        original: item 
      })),
      ...facilities.map(item => ({ 
        text: item.name || '', 
        type: 'facility',
        original: item 
      })),
      ...invoices.map(item => ({ 
        text: `Hóa đơn ${item.billingPeriod}`, 
        type: 'invoice',
        original: item 
      })),
      ...supportRequests.map(item => ({ 
        text: item.title || '', 
        type: 'support_request',
        original: item 
      }))
    ].filter(item => item.text && item.text.trim().length > 0);

    // Tìm kiếm chính xác trước
    const exactMatches = allData.filter(item => 
      item.text.toLowerCase().includes(query.toLowerCase())
    );

    // Sử dụng Fuse.js cho tìm kiếm fuzzy
    const fuse = new Fuse(allData, { 
      keys: ['text'], 
      threshold: 0.4,
      includeScore: true 
    });
    
    const fuzzyResults = fuse.search(query);
    
    // Kết hợp kết quả chính xác và fuzzy
    const allResults = [...exactMatches];
    
    fuzzyResults.forEach((result) => {
      if (result.score && result.score < 0.6) { // Chỉ lấy kết quả có độ chính xác cao
        const existing = allResults.find(item => item.text === result.item.text);
        if (!existing) {
          allResults.push(result.item);
        }
      }
    });

    // Tạo danh sách gợi ý duy nhất
    const suggestions: string[] = [];
    allResults.forEach((item) => {
      if (item.text && !suggestions.includes(item.text)) {
        suggestions.push(item.text);
      }
    });

    // Thêm một số gợi ý chung nếu không có đủ kết quả
    if (suggestions.length < 3) {
      const commonSuggestions = [
        'Tiệc Giáng sinh 2025 - Gala Dinner',
        'Tiệc mừng năm mới 2025 - Countdown Party',
        'Họp cư dân tháng 12/2024',
        'Phòng tập Gym cao cấp',
        'Khu BBQ ngoài trời'
      ];
      
      commonSuggestions.forEach(suggestion => {
        if (!suggestions.includes(suggestion)) {
          suggestions.push(suggestion);
        }
      });
    }

    console.log(`🔍 Generated ${suggestions.length} suggestions for query: "${query}"`);
    return suggestions.slice(0, 10);
  } catch (error) {
    console.error('Get Fuse.js suggestions error:', error);
    // Trả về gợi ý mặc định nếu có lỗi
    return [
      'Tiệc Giáng sinh 2025 - Gala Dinner',
      'Tiệc mừng năm mới 2025 - Countdown Party',
      'Họp cư dân tháng 12/2024'
    ];
  }
};

// Export constants và placeholder functions
export const SEARCH_INDICES = {
  ANNOUNCEMENTS: 'announcements',
  EVENTS: 'events',
  FACILITIES: 'facilities',
  INVOICES: 'invoices',
  SUPPORT_REQUESTS: 'support_requests'
};

export const searchByType = async (query: string, type: string) => {
  const results = await globalSearch(query);
  return results.hits.filter(hit => hit.type === type);
};

export const initializeSearchIndexes = async () => {
  console.log('🚀 Fuse.js search system initialized');
  return true;
};

export const syncDataToSearch = async () => true;
export const removeDocumentFromSearch = async () => true;
export const syncAllDataToSearch = async () => true;
export const syncDataChange = async () => true;
export const checkMeilisearchHealth = async () => ({ status: 'healthy', message: 'Fuse.js search system đang hoạt động' });
export const getIndexStats = async () => ({ fuse: { numberOfDocuments: 'Dynamic' } });

export const searchClient = {
  health: async () => ({ status: 'healthy' }),
  index: (name: string) => ({
    search: async (query: string) => {
      const results = await globalSearch(query);
      return { hits: results.hits, totalHits: results.totalHits };
    }
  })
};
