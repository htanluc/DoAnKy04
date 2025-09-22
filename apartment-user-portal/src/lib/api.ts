// --- Helper: fetch and cache current user info (from /api/auth/me) ---
let cachedCurrentUser: any = null;
let cachedCurrentUserPromise: Promise<any> | null = null;

export async function fetchCurrentUser(forceRefresh = false) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (!token) return null;
  if (cachedCurrentUser && !forceRefresh) return cachedCurrentUser;
  if (cachedCurrentUserPromise && !forceRefresh) return cachedCurrentUserPromise;
  cachedCurrentUserPromise = (async () => {
    try {
      const res = await fetch('http://localhost:8080/api/auth/me', {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!res.ok) {
        cachedCurrentUser = null;
        return null;
      }
      const data = await res.json();
      cachedCurrentUser = data.success && data.data ? data.data : null;
      return cachedCurrentUser;
    } catch {
      cachedCurrentUser = null;
      return null;
    } finally {
      cachedCurrentUserPromise = null;
    }
  })();
  return cachedCurrentUserPromise;
}

// Lấy thông tin cá nhân resident hiện tại (đầy đủ user, resident, apartment, apartmentResident)
export async function fetchCurrentResident(forceRefresh = false) {
  // Alias for fetchCurrentUser
  return fetchCurrentUser(forceRefresh);
}

// Lấy thông tin căn hộ của resident hiện tại
export async function fetchMyApartment(forceRefresh = false) {
  const user = await fetchCurrentUser(forceRefresh);
  if (!user) return {};
  const apartment = user.apartment;
  return {
    apartmentNumber: apartment?.unitNumber || '',
    buildingName: apartment?.buildingId ? `Tòa ${apartment.buildingId}` : '',
    area: apartment?.area,
    bedrooms: apartment?.bedrooms,
    floor: apartment?.floorNumber
  };
}

export async function fetchUserProfile(forceRefresh = false) {
  const user = await fetchCurrentUser(forceRefresh);
  if (!user) throw new Error('Không thể lấy thông tin user');
  return user;
}

export async function fetchInvoices() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (!token) throw new Error('Chưa đăng nhập');
  
  const res = await fetch('http://localhost:8080/api/invoices/my', {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error('Failed to fetch invoices');
  return res.json();
}

export async function loginUser(credentials: { phoneNumber: string; password: string }) {
  const res = await fetch('http://localhost:8080/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });
  if (!res.ok) throw new Error('Sai tài khoản hoặc mật khẩu');
  // Xóa cache user khi login
  cachedCurrentUser = null;
  cachedCurrentUserPromise = null;
  return res.json();
}

export async function registerUser(data: any) {
  const res = await fetch('http://localhost:8080/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const result = await res.json();
  if (!res.ok) {
    const error: any = new Error(result.message || 'Đăng ký thất bại');
    error.response = { data: result };
    throw error;
  }
  return result;
}

export async function resendVerification(emailOrPhone: string) {
  const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3001'
  const res = await fetch('http://localhost:8080/api/auth/resend-verification', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      // Hint for backend to build correct verification link for User Portal
      'X-Frontend-Origin': origin,
      'X-Client-App': 'resident-portal'
    },
    // Prefer an explicit base URL field in the request body for backend to use
    body: JSON.stringify({ emailOrPhone, callbackBaseUrl: origin }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Gửi lại email xác thực thất bại');
  return data;
}

// Cập nhật thông tin cá nhân resident hiện tại
export async function updateCurrentResident(update: any) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (!token) throw new Error('Chưa đăng nhập');
  const res = await fetch('http://localhost:8080/api/residents/me', {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(update),
  });
  if (!res.ok) throw new Error('Cập nhật thất bại');
  // Cập nhật lại cache user sau khi update
  cachedCurrentUser = null;
  cachedCurrentUserPromise = null;
  return res.json();
}

// Đổi mật khẩu - theo đúng format API backend
export async function changePassword(data: { oldPassword: string; newPassword: string }) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (!token) throw new Error('Chưa đăng nhập');
  
  try {
    console.log('Đang gọi API đổi mật khẩu với format:', {
      oldPassword: data.oldPassword,
      newPassword: data.newPassword,
      confirmNewPassword: data.newPassword
    });
    
    const res = await fetch('http://localhost:8080/api/auth/change-password', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        oldPassword: data.oldPassword,
        newPassword: data.newPassword,
        confirmNewPassword: data.newPassword // Thêm trường này theo API doc
      }),
    });
    
    const result = await res.json();
    console.log('Response từ backend:', result);
    
    if (!res.ok) {
      throw new Error(result.message || `HTTP ${res.status}: Đổi mật khẩu thất bại`);
    }
    
    if (result.success === false) {
      throw new Error(result.message || 'Đổi mật khẩu thất bại');
    }
    
    return result;
  } catch (error: any) {
    console.error('Change password error:', error);
    if (error.message) {
      throw error;
    }
    throw new Error('Không thể kết nối đến máy chủ. Vui lòng thử lại.');
  }
}

// Lấy lịch sử đặt tiện ích của resident hiện tại
export async function fetchMyFacilityBookings() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (!token) throw new Error('Chưa đăng nhập');
  const res = await fetch('http://localhost:8080/api/facility-bookings/my', {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Không lấy được lịch sử đặt tiện ích');
  return res.json();
}

// Đặt tiện ích
export async function createFacilityBooking(data: any) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (!token) throw new Error('Chưa đăng nhập');
  const res = await fetch('http://localhost:8080/api/facility-bookings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Đặt tiện ích thất bại');
  return res.json();
}

// Hủy đặt tiện ích
export async function cancelFacilityBooking(id: string) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (!token) throw new Error('Chưa đăng nhập');
  const res = await fetch(`http://localhost:8080/api/facility-bookings/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Hủy đặt tiện ích thất bại');
  return true;
}

// Đăng ký sự kiện
export async function registerEvent(data: any) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (!token) throw new Error('Chưa đăng nhập');
  
  const res = await fetch('http://localhost:8080/api/event-registrations/register', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error('Đăng ký sự kiện thất bại: ' + errorText);
  }
  return res.json();
}

// Hủy đăng ký sự kiện
export async function cancelEventRegistration(registrationId: string) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (!token) throw new Error('Chưa đăng nhập');
  const res = await fetch(`http://localhost:8080/api/event-registrations/${registrationId}/cancel`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Hủy đăng ký sự kiện thất bại');
  return true;
}

// Hủy đăng ký sự kiện theo event ID
export async function cancelEventRegistrationByEventId(eventId: string) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (!token) throw new Error('Chưa đăng nhập');
  const res = await fetch(`http://localhost:8080/api/event-registrations/cancel/${eventId}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Hủy đăng ký sự kiện thất bại');
  return true;
}

// Gửi yêu cầu hỗ trợ
export async function createSupportRequest(data: any) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (!token) throw new Error('Chưa đăng nhập');
  const res = await fetch('http://localhost:8080/api/support-requests', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP ${res.status}: Gửi yêu cầu hỗ trợ thất bại`);
  }
  return res.json();
}

// Lấy lịch sử yêu cầu hỗ trợ
export async function fetchMySupportRequests() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (!token) throw new Error('Chưa đăng nhập');
  const res = await fetch('http://localhost:8080/api/support-requests/my', {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Không lấy được lịch sử yêu cầu hỗ trợ');
  return res.json();
}

// Gửi phản hồi
export async function createFeedback(data: any) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (!token) throw new Error('Chưa đăng nhập');
  const res = await fetch('http://localhost:8080/api/feedback', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Gửi phản hồi thất bại');
  return res.json();
}

// Lấy lịch sử phản hồi
export async function fetchMyFeedback() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (!token) throw new Error('Chưa đăng nhập');
  const res = await fetch('http://localhost:8080/api/feedback/my', {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Không lấy được lịch sử phản hồi');
  return res.json();
}

// Lấy danh sách thông báo
export async function fetchAnnouncements() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (!token) throw new Error('Chưa đăng nhập');
  const res = await fetch('http://localhost:8080/api/announcements', {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Không lấy được thông báo');
  return res.json();
}

// Lấy danh sách sự kiện
export async function fetchEvents() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (!token) throw new Error('Chưa đăng nhập');
  const res = await fetch('http://localhost:8080/api/events', {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Không lấy được sự kiện');
  return res.json();
}

// Lấy danh sách tiện ích
export async function fetchFacilities() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (!token) throw new Error('Chưa đăng nhập');
  const res = await fetch('http://localhost:8080/api/facilities', {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Không lấy được danh sách tiện ích');
  return res.json();
}

// Lấy hóa đơn của tôi
export async function fetchMyInvoices() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (!token) throw new Error('Chưa đăng nhập');
  const res = await fetch('http://localhost:8080/api/invoices/my', {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Không lấy được hóa đơn');
  // Nếu backend trả về object { data: [...] } thì return (await res.json()).data;
  // Nếu backend trả về trực tiếp mảng thì return await res.json();
  const data = await res.json();
  return Array.isArray(data) ? data : data.data;
}

// Lấy chi tiết một hóa đơn (bao gồm các khoản phí/items)
export async function fetchInvoiceDetail(invoiceId: string | number) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (!token) throw new Error('Chưa đăng nhập');
  try {
    const res = await fetch(`http://localhost:8080/api/invoices/${invoiceId}`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data?.data || data;
  } catch (e) {
    // Fallback: nhiều API trả 500/404. Thử lấy từ /api/invoices/my rồi tìm theo id
    try {
      const list = await fetchMyInvoices();
      const normalizedId = Number(invoiceId);
      const found = (list || []).find((iv: any) => Number(iv.id) === normalizedId);
      if (found) return found;
    } catch {}
    throw new Error('Không lấy được chi tiết hóa đơn');
  }
}

// Lấy thanh toán theo hóa đơn
export async function fetchPaymentsByInvoice(invoiceId: string) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (!token) throw new Error('Chưa đăng nhập');
  const res = await fetch(`http://localhost:8080/api/payments/invoice/${invoiceId}`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Không lấy được lịch sử thanh toán');
  return res.json();
}

// Thanh toán qua cổng thanh toán
export async function createPaymentViaGateway(data: any) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (!token) throw new Error('Chưa đăng nhập');
  const res = await fetch('http://localhost:8080/api/payments/gateway', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Tạo thanh toán thất bại');
  return res.json();
}

// Thanh toán qua MoMo
export async function createMoMoPayment(invoiceId: number, amount: number, orderInfo: string) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (!token) throw new Error('Chưa đăng nhập');
  
  const params = new URLSearchParams({
    invoiceId: invoiceId.toString(),
    amount: amount.toString(),
    orderInfo: orderInfo
  });
  
  const res = await fetch(`http://localhost:8080/api/payments/momo?${params}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  if (!res.ok) throw new Error('Tạo thanh toán MoMo thất bại');
  return res.json();
}

// Thanh toán qua VNPay
export async function createVNPayPayment(invoiceId: number, amount: number, orderInfo: string) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (!token) throw new Error('Chưa đăng nhập');
  
  // Tạo request body theo format mà backend mới mong đợi
  const requestBody = {
    orderId: invoiceId.toString(),
    amount: amount,
    orderInfo: orderInfo
  };
  
  const res = await fetch('http://localhost:8080/api/payments/vnpay', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });
  if (!res.ok) throw new Error('Tạo thanh toán VNPay thất bại');
  return res.json();
}

// Thanh toán qua ZaloPay
export async function createZaloPayPayment(invoiceId: number, amount: number, orderInfo: string) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (!token) throw new Error('Chưa đăng nhập');
  const params = new URLSearchParams({
    invoiceId: invoiceId.toString(),
    amount: amount.toString(),
    orderInfo: orderInfo
  });
  const res = await fetch(`http://localhost:8080/api/payments/zalopay?${params}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
      // KHÔNG set Content-Type nếu không có body
    },
  });
  if (!res.ok) throw new Error('Tạo thanh toán ZaloPay thất bại');
  return res.json();
}

// Thanh toán qua Visa/Mastercard
export async function createVisaPayment(invoiceId: number, amount: number, orderInfo: string) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (!token) throw new Error('Chưa đăng nhập');
  
  const params = new URLSearchParams({
    invoiceId: invoiceId.toString(),
    amount: amount.toString(),
    orderInfo: orderInfo
  });
  
  const res = await fetch(`http://localhost:8080/api/payments/stripe?${params}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
  });
  if (!res.ok) throw new Error('Tạo thanh toán thẻ quốc tế thất bại');
  return res.json();
}

// Thiết lập thanh toán tự động
export async function setupAutoPayment(data: any) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (!token) throw new Error('Chưa đăng nhập');
  const res = await fetch('http://localhost:8080/api/payments/auto/setup', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Thiết lập thanh toán tự động thất bại');
  return res.json();
}

// Hủy thanh toán tự động
export async function cancelAutoPayment() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (!token) throw new Error('Chưa đăng nhập');
  const res = await fetch('http://localhost:8080/api/payments/auto/cancel', {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Hủy thanh toán tự động thất bại');
  return res.json();
}

// Lấy cài đặt thanh toán tự động
export async function fetchAutoPaymentSettings() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (!token) throw new Error('Chưa đăng nhập');
  const res = await fetch('http://localhost:8080/api/payments/auto/settings', {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Không lấy được cài đặt thanh toán tự động');
  return res.json();
}

// Liên kết căn hộ với cư dân (Admin only)
export async function linkApartmentResident(data: any) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (!token) throw new Error('Chưa đăng nhập');
  const res = await fetch('http://localhost:8080/api/apartment-residents/link', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Liên kết căn hộ thất bại');
  return res.json();
}

// Hủy liên kết căn hộ với cư dân (Admin only)
export async function unlinkApartmentResident(apartmentId: string, residentId: string) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (!token) throw new Error('Chưa đăng nhập');
  const res = await fetch(`http://localhost:8080/api/apartment-residents/unlink/${apartmentId}/${residentId}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Hủy liên kết căn hộ thất bại');
  return res.json();
}

// Hỏi AI
export async function askAI(question: string) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (!token) throw new Error('Chưa đăng nhập');
  const res = await fetch('http://localhost:8080/api/ai/qa', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ question }),
  });
  if (!res.ok) throw new Error('Không thể kết nối với AI');
  return res.json();
}

// Lấy lịch sử hỏi đáp AI
export async function fetchAIHistory() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (!token) throw new Error('Chưa đăng nhập');
  const res = await fetch('http://localhost:8080/api/ai/qa/history', {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Không lấy được lịch sử hỏi đáp');
  return res.json();
}

// Lấy thống kê dashboard
export async function fetchDashboardStats() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (!token) throw new Error('Chưa đăng nhập');
  
  try {
    const res = await fetch('http://localhost:8080/api/dashboard/stats', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!res.ok) throw new Error('Không lấy được thống kê dashboard');
    return res.json();
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    // Trả về dữ liệu mặc định nếu API lỗi
    return {
      totalInvoices: 0,
      pendingInvoices: 0,
      overdueInvoices: 0,
      totalAmount: 0,
      unreadAnnouncements: 0,
      upcomingEvents: 0,
      activeBookings: 0,
      supportRequests: 0
    };
  }
}

// Lấy hoạt động gần đây
export async function fetchRecentActivities() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (!token) throw new Error('Chưa đăng nhập');
  
  try {
    const res = await fetch('http://localhost:8080/api/dashboard/recent-activities', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!res.ok) throw new Error('Không lấy được hoạt động gần đây');
    return res.json();
  } catch (error) {
    console.error('Error fetching recent activities:', error);
    // Trả về mảng rỗng nếu API lỗi
    return [];
  }
}

export async function markAnnouncementAsRead(id: string) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (!token) throw new Error('Chưa đăng nhập');
  
  const res = await fetch(`http://localhost:8080/api/announcements/${id}/read`, {
    method: 'PUT',
    headers: { 'Authorization': `Bearer ${token}` },
  });
  
  if (!res.ok) throw new Error('Không thể đánh dấu đã đọc');
  return res.ok;
}

export async function markAllAnnouncementsAsRead(ids: string[]) {
  // Nếu backend có API PUT /api/announcements/read-all thì dùng, nếu không thì tuần tự từng cái
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (!token) throw new Error('Chưa đăng nhập');
  // Nếu có API batch, ưu tiên dùng
  // const res = await fetch('http://localhost:8080/api/announcements/read-all', {
  //   method: 'PUT',
  //   headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ ids }),
  // });
  // if (!res.ok) throw new Error('Không thể đánh dấu tất cả đã đọc');
  // return res.ok;
  // Nếu không có API batch, gọi từng cái
  for (const id of ids) {
    await markAnnouncementAsRead(id);
  }
  return true;
} 