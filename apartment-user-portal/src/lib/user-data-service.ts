import { globalSearch, getSearchSuggestions } from './search-fuse';

// Interface cho dữ liệu user
export interface UserData {
  profile: any;
  apartments: any[];
  announcements: any[];
  events: any[];
  facilities: any[];
  invoices: any[];
  supportRequests: any[];
  feedback: any[];
  notifications: any[];
}

// Interface cho cache entry
export interface CacheEntry {
  data: UserData;
  timestamp: number;
  expiresAt: number;
}

// Service để quản lý dữ liệu user và cache
export class UserDataService {
  private static instance: UserDataService;
  private cache: Map<string, CacheEntry> = new Map();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 phút
  private readonly MAX_CACHE_SIZE = 100; // Tối đa 100 user

  private constructor() {}

  public static getInstance(): UserDataService {
    if (!UserDataService.instance) {
      UserDataService.instance = new UserDataService();
    }
    return UserDataService.instance;
  }

  // Lấy dữ liệu user từ API hoặc cache
  async getUserData(userId: string, forceRefresh: boolean = false): Promise<UserData> {
    try {
      // Kiểm tra cache trước
      if (!forceRefresh) {
        const cachedData = this.getFromCache(userId);
        if (cachedData) {
          return cachedData;
        }
      }

      // Fetch từ API
      const response = await fetch(`/api/user-data?userId=${userId}${forceRefresh ? '&refresh=true' : ''}`);
      
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        // Cache dữ liệu mới
        this.setCache(userId, result.data);
        return result.data;
      } else {
        throw new Error(result.error || 'Failed to fetch user data');
      }

    } catch (error) {
      console.error('Error fetching user data:', error);
      
      // Fallback: trả về dữ liệu mẫu nếu có lỗi
      const fallbackData = this.getFallbackData();
      this.setCache(userId, fallbackData);
      return fallbackData;
    }
  }

  // Tìm kiếm trong dữ liệu đã cache
  async searchInUserData(userId: string, query: string): Promise<any> {
    try {
      // Lấy dữ liệu từ cache hoặc API
      const userData = await this.getUserData(userId);
      
      // Tìm kiếm trong dữ liệu đã cache
      const searchResults = await this.performLocalSearch(userData, query);
      
      return {
        query,
        hits: searchResults,
        totalHits: searchResults.length,
        processingTimeMS: 0,
        cached: true,
        source: 'user-data-cache'
      };

    } catch (error) {
      console.error('Error searching in user data:', error);
      
      // Fallback: sử dụng global search
      return await globalSearch(query);
    }
  }

  // Tìm kiếm local trong dữ liệu đã cache
  private async performLocalSearch(userData: UserData, query: string): Promise<any[]> {
    const results: any[] = [];
    const normalizedQuery = query.toLowerCase().trim();

    // Tìm kiếm trong announcements
    if (userData.announcements) {
      userData.announcements.forEach(announcement => {
        if (this.matchesQuery(announcement.title || announcement.content || '', normalizedQuery)) {
          const title = announcement.title || 'Thông báo';
          const content = announcement.content || '';
          
          results.push({
            objectID: `announcement_${announcement.id}`,
            type: 'announcement',
            title: title,
            content: content,
            url: `/search-demo?type=announcement&id=${announcement.id}`,
            highlight: this.createSimpleHighlight(title, normalizedQuery),
            metadata: { category: announcement.category, status: announcement.status },
            score: 0.9,
            relevance: 'high'
          });
        }
      });
    }

    // Tìm kiếm trong events
    if (userData.events) {
      userData.events.forEach(event => {
        if (this.matchesQuery(event.title || event.description || '', normalizedQuery)) {
          const title = event.title || 'Sự kiện';
          const description = event.description || '';
          
          results.push({
            objectID: `event_${event.id}`,
            type: 'event',
            title: title,
            content: description,
            url: `/search-demo?type=event&id=${event.id}`,
            highlight: this.createSimpleHighlight(title, normalizedQuery),
            metadata: { location: event.location, status: event.status },
            score: 0.9,
            relevance: 'high'
          });
        }
      });
    }

    // Tìm kiếm trong facilities
    if (userData.facilities) {
      userData.facilities.forEach(facility => {
        if (this.matchesQuery(facility.name || facility.description || '', normalizedQuery)) {
          const name = facility.name || 'Tiện ích';
          const description = facility.description || '';
          
          results.push({
            objectID: `facility_${facility.id}`,
            type: 'facility',
            title: name,
            content: description,
            url: `/search-demo?type=facility&id=${facility.id}`,
            highlight: this.createSimpleHighlight(name, normalizedQuery),
            metadata: { facilityType: facility.facilityType, status: facility.status },
            score: 0.9,
            relevance: 'high'
          });
        }
      });
    }

    // Tìm kiếm trong invoices
    if (userData.invoices) {
      userData.invoices.forEach(invoice => {
        const invoiceText = `Hóa đơn ${invoice.billingPeriod}`;
        if (this.matchesQuery(invoiceText || invoice.status || '', normalizedQuery)) {
          results.push({
            objectID: `invoice_${invoice.id}`,
            type: 'invoice',
            title: invoiceText,
            content: `Tổng tiền: ${invoice.totalAmount?.toLocaleString('vi-VN')} VND - Trạng thái: ${invoice.status}`,
            url: `/search-demo?type=invoice&id=${invoice.id}`,
            highlight: this.createSimpleHighlight(invoiceText, normalizedQuery),
            metadata: { billingPeriod: invoice.billingPeriod, status: invoice.status },
            score: 0.9,
            relevance: 'high'
          });
        }
      });
    }

    // Sắp xếp kết quả theo relevance
    results.sort((a, b) => (b.score || 0) - (a.score || 0));
    
    return results;
  }

  // Tạo highlight đơn giản
  private createSimpleHighlight(text: string, query: string): string {
    if (!text || !query) return text;
    
    try {
      const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`(${escapedQuery})`, 'gi');
      return text.replace(regex, '<mark class="search-highlight">$1</mark>');
    } catch (error) {
      console.error('Error creating highlight:', error);
      return text;
    }
  }

  // Kiểm tra xem text có khớp với query không
  private matchesQuery(text: string, query: string): boolean {
    if (!text || !query) return false;
    
    const normalizedText = text.toLowerCase();
    const queryWords = query.split(/\s+/);
    
    return queryWords.every(word => 
      normalizedText.includes(word) || 
      this.fuzzyMatch(normalizedText, word)
    );
  }

  // Fuzzy matching đơn giản
  private fuzzyMatch(text: string, query: string): boolean {
    if (query.length < 3) return text.includes(query);
    
    let queryIndex = 0;
    for (let i = 0; i < text.length && queryIndex < query.length; i++) {
      if (text[i] === query[queryIndex]) {
        queryIndex++;
      }
    }
    
    return queryIndex === query.length;
  }

  // Lấy dữ liệu từ cache
  private getFromCache(userId: string): UserData | null {
    const entry = this.cache.get(userId);
    
    if (!entry) return null;
    
    if (Date.now() > entry.expiresAt) {
      // Cache đã hết hạn
      this.cache.delete(userId);
      return null;
    }
    
    return entry.data;
  }

  // Set cache
  private setCache(userId: string, data: UserData): void {
    // Xóa cache cũ nếu đã đầy
    if (this.cache.size >= this.MAX_CACHE_SIZE) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }
    
    const entry: CacheEntry = {
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + this.CACHE_DURATION
    };
    
    this.cache.set(userId, entry);
  }

  // Xóa cache cho user cụ thể
  clearUserCache(userId: string): void {
    this.cache.delete(userId);
  }

  // Xóa tất cả cache
  clearAllCache(): void {
    this.cache.clear();
  }

  // Lấy thống kê cache
  getCacheStats(): any {
    const now = Date.now();
    let validEntries = 0;
    let expiredEntries = 0;
    
    this.cache.forEach(entry => {
      if (now > entry.expiresAt) {
        expiredEntries++;
      } else {
        validEntries++;
      }
    });
    
    return {
      totalEntries: this.cache.size,
      validEntries,
      expiredEntries,
      maxSize: this.MAX_CACHE_SIZE,
      cacheDuration: this.CACHE_DURATION
    };
  }

  // Dữ liệu fallback khi API lỗi
  private getFallbackData(): UserData {
    return {
      profile: null,
      apartments: [],
      announcements: [
        {
          id: 'fallback-1',
          title: 'Thông báo hệ thống',
          content: 'Hệ thống đang hoạt động bình thường',
          category: 'Hệ thống',
          status: 'Hoạt động'
        }
      ],
      events: [
        {
          id: 'fallback-1',
          title: 'Tiệc Giáng sinh 2025 - Gala Dinner',
          description: 'Tiệc Giáng sinh sang trọng cho cư dân',
          location: 'Hội trường chính',
          status: 'Sắp diễn ra'
        }
      ],
      facilities: [
        {
          id: 'fallback-1',
          name: 'Phòng tập Gym cao cấp',
          description: 'Phòng tập thể dục với đầy đủ thiết bị',
          facilityType: 'Thể thao',
          status: 'Hoạt động'
        }
      ],
      invoices: [
        {
          id: 'fallback-1',
          billingPeriod: '12/2024',
          status: 'Chưa thanh toán',
          totalAmount: 1500000
        }
      ],
      supportRequests: [],
      feedback: [],
      notifications: []
    };
  }
}

// Export instance singleton
export const userDataService = UserDataService.getInstance();
