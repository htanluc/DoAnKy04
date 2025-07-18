export async function fetchCurrentUser() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (!token) return null;
  try {
    const res = await fetch('http://localhost:8080/api/auth/validate', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    const data = await res.json();
    if (res.ok && data.success && data.data) {
      return data.data;
    }
    return null;
  } catch (err) {
    return null;
  }
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
  const res = await fetch('http://localhost:8080/api/auth/resend-verification', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ emailOrPhone }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Gửi lại email xác thực thất bại');
  return data;
}

// Lấy thông tin cá nhân resident hiện tại (đầy đủ user, resident, apartment, apartmentResident)
export async function fetchCurrentResident() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (!token) return null;
  try {
    const res = await fetch('http://localhost:8080/api/auth/me', {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!res.ok) return null;
    const data = await res.json();
    // Trả về data.data vì /api/auth/me có format {success: true, message: "...", data: {...}}
    return data.success && data.data ? data.data : null;
  } catch {
    return null;
  }
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
  return res.json();
}

// Đổi mật khẩu
export async function changePassword(data: { oldPassword: string; newPassword: string }) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (!token) throw new Error('Chưa đăng nhập');
  const res = await fetch('http://localhost:8080/api/auth/change-password', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  const result = await res.json();
  if (!res.ok || !result.success) throw new Error(result.message || 'Đổi mật khẩu thất bại');
  return result;
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
  if (!res.ok) throw new Error('Đăng ký sự kiện thất bại');
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
  if (!res.ok) throw new Error('Gửi yêu cầu hỗ trợ thất bại');
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
  const vnp_TmnCode = 'XHXOSV1S';
  const vnp_Amount = (amount * 100).toString();
  const vnp_Command = 'pay';
  const vnp_CreateDate = new Date().toISOString().replace(/[-:T.Z]/g, '').slice(0, 14); // yyyyMMddHHmmss
  const vnp_CurrCode = 'VND';
  const vnp_IpAddr = typeof window !== 'undefined' ? window.location.hostname : '127.0.0.1';
  const vnp_Locale = 'vn';
  const vnp_OrderInfo = orderInfo;
  const vnp_OrderType = 'other';
  const vnp_ReturnUrl = 'http://localhost:3001/payment/vnpay-result';
  const vnp_TxnRef = invoiceId.toString() + '-' + Date.now();
  const formData = new URLSearchParams();
  formData.append('vnp_TmnCode', vnp_TmnCode);
  formData.append('vnp_Amount', vnp_Amount);
  formData.append('vnp_Command', vnp_Command);
  formData.append('vnp_CreateDate', vnp_CreateDate);
  formData.append('vnp_CurrCode', vnp_CurrCode);
  formData.append('vnp_IpAddr', vnp_IpAddr);
  formData.append('vnp_Locale', vnp_Locale);
  formData.append('vnp_OrderInfo', vnp_OrderInfo);
  formData.append('vnp_OrderType', vnp_OrderType);
  formData.append('vnp_ReturnUrl', vnp_ReturnUrl);
  formData.append('vnp_TxnRef', vnp_TxnRef);
  const res = await fetch('http://localhost:8080/api/payments/vnpay', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: formData.toString(),
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
  
  const res = await fetch(`http://localhost:8080/api/payments/visa?${params}`, {
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

// Lấy thông tin căn hộ của resident hiện tại
export async function fetchMyApartment() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (!token) throw new Error('Chưa đăng nhập');
  try {
    const res = await fetch('http://localhost:8080/api/auth/me', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!res.ok) throw new Error('Không lấy được thông tin căn hộ');
    const data = await res.json();
    const apartment = data?.data?.apartment;
    return {
      apartmentNumber: apartment?.unitNumber || '',
      buildingName: apartment?.buildingId ? `Tòa ${apartment.buildingId}` : '',
      area: apartment?.area,
      bedrooms: apartment?.bedrooms, // Có thể undefined nếu backend không trả về
      floor: apartment?.floorNumber
    };
  } catch (error) {
    console.error('Error fetching apartment info:', error);
    // Trả về object rỗng nếu API lỗi
    return {};
  }
}

export async function fetchUserProfile() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (!token) throw new Error('Chưa đăng nhập');
  const res = await fetch('http://localhost:8080/api/auth/me', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.message || 'Không thể lấy thông tin user');
  return data.data;
} 