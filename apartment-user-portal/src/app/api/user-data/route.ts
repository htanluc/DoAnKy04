import { NextRequest, NextResponse } from 'next/server';
import { 
  fetchAnnouncements, 
  fetchEvents, 
  fetchFacilities, 
  fetchInvoices, 
  fetchMySupportRequests,
  fetchMyFeedback,
  fetchUserProfile,
  fetchUserApartments,
  fetchUserNotifications
} from '../../../lib/api';

// Cache interface
interface UserDataCache {
  userId: string;
  timestamp: number;
  data: {
    profile: any;
    apartments: any[];
    announcements: any[];
    events: any[];
    facilities: any[];
    invoices: any[];
    supportRequests: any[];
    feedback: any[];
    notifications: any[];
  };
}

// In-memory cache (trong production nên dùng Redis hoặc database)
const userDataCache = new Map<string, UserDataCache>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 phút

// Helper function để kiểm tra cache còn hạn không
function isCacheValid(cache: UserDataCache): boolean {
  return Date.now() - cache.timestamp < CACHE_DURATION;
}

// Helper function để xử lý API response
function processApiResponse(data: any): any[] {
  if (Array.isArray(data)) return data;
  if (data?.success?.data) return data.success.data;
  if (data?.content) return data.content;
  if (data?.data) return data.data;
  return [];
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const forceRefresh = searchParams.get('refresh') === 'true';
    
    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    // Kiểm tra cache
    const cachedData = userDataCache.get(userId);
    if (!forceRefresh && cachedData && isCacheValid(cachedData)) {
      console.log(`📦 Returning cached data for user ${userId}`);
      return NextResponse.json({
        success: true,
        message: 'Data retrieved from cache',
        data: cachedData.data,
        cached: true,
        cacheAge: Date.now() - cachedData.timestamp
      });
    }

    console.log(`🔄 Fetching fresh data for user ${userId}`);

    // Fetch tất cả dữ liệu liên quan đến user
    const [
      profile,
      apartments,
      announcements,
      events,
      facilities,
      invoices,
      supportRequests,
      feedback,
      notifications
    ] = await Promise.all([
      fetchUserProfile().catch(() => null),
      fetchUserApartments().then(processApiResponse).catch(() => []),
      fetchAnnouncements().then(processApiResponse).catch(() => []),
      fetchEvents().then(processApiResponse).catch(() => []),
      fetchFacilities().then(processApiResponse).catch(() => []),
      fetchInvoices().then(processApiResponse).catch(() => []),
      fetchMySupportRequests().then(processApiResponse).catch(() => []),
      fetchMyFeedback().then(processApiResponse).catch(() => []),
      fetchUserNotifications().then(processApiResponse).catch(() => [])
    ]);

    // Tạo dữ liệu tổng hợp
    const userData = {
      profile,
      apartments,
      announcements,
      events,
      facilities,
      invoices,
      supportRequests,
      feedback,
      notifications
    };

    // Cache dữ liệu
    const cacheEntry: UserDataCache = {
      userId,
      timestamp: Date.now(),
      data: userData
    };
    
    userDataCache.set(userId, cacheEntry);
    console.log(`💾 Cached data for user ${userId}`);

    // Tính toán thống kê
    const stats = {
      totalAnnouncements: announcements.length,
      totalEvents: events.length,
      totalFacilities: facilities.length,
      totalInvoices: invoices.length,
      totalSupportRequests: supportRequests.length,
      totalFeedback: feedback.length,
      totalNotifications: notifications.length,
      lastUpdated: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      message: 'User data fetched successfully',
      data: userData,
      stats,
      cached: false,
      cacheAge: 0
    });

  } catch (error) {
    console.error('Error fetching user data:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch user data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// POST method để cập nhật cache
export async function POST(request: NextRequest) {
  try {
    const { userId, dataType, data } = await request.json();
    
    if (!userId || !dataType) {
      return NextResponse.json(
        { error: 'userId and dataType are required' },
        { status: 400 }
      );
    }

    const cachedData = userDataCache.get(userId);
    if (cachedData) {
      // Cập nhật dữ liệu cụ thể trong cache
      if (dataType in cachedData.data) {
        (cachedData.data as any)[dataType] = data;
        cachedData.timestamp = Date.now();
        console.log(`🔄 Updated cache for user ${userId}, type: ${dataType}`);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Cache updated successfully'
    });

  } catch (error) {
    console.error('Error updating cache:', error);
    return NextResponse.json(
      { error: 'Failed to update cache' },
      { status: 500 }
    );
  }
}

// DELETE method để xóa cache
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (userId) {
      userDataCache.delete(userId);
      console.log(`🗑️ Cleared cache for user ${userId}`);
    } else {
      // Xóa tất cả cache
      userDataCache.clear();
      console.log('🗑️ Cleared all cache');
    }

    return NextResponse.json({
      success: true,
      message: 'Cache cleared successfully'
    });

  } catch (error) {
    console.error('Error clearing cache:', error);
    return NextResponse.json(
      { error: 'Failed to clear cache' },
      { status: 500 }
    );
  }
}
