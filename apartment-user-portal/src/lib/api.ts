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
  const res = await fetch('http://localhost:8080/api/admin/invoices/api/invoices');
  if (!res.ok) throw new Error('Failed to fetch invoices');
  return res.json();
}

export async function loginUser(credentials: { username: string; password: string }) {
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

// Lấy thông tin cá nhân resident hiện tại
export async function fetchCurrentResident() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (!token) return null;
  try {
    const res = await fetch('http://localhost:8080/api/residents/me', {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data;
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

// Lấy hóa đơn của resident hiện tại
export async function fetchMyInvoices() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (!token) throw new Error('Chưa đăng nhập');
  const res = await fetch('http://localhost:8080/api/admin/invoices/my', {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Không lấy được hóa đơn');
  return res.json();
}

// Lấy thanh toán theo hóa đơn
export async function fetchPaymentsByInvoice(invoiceId: string) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (!token) throw new Error('Chưa đăng nhập');
  const res = await fetch(`http://localhost:8080/api/payments/invoice/${invoiceId}`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Không lấy được thanh toán');
  return res.json();
}

// Tạo thanh toán qua cổng thanh toán
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
  return true;
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

// Liên kết căn hộ (gắn resident với apartment)
export async function linkApartmentResident(data: any) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (!token) throw new Error('Chưa đăng nhập');
  const res = await fetch('http://localhost:8080/api/apartment-residents', {
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

// Hủy liên kết căn hộ
export async function unlinkApartmentResident(apartmentId: string, residentId: string) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (!token) throw new Error('Chưa đăng nhập');
  const res = await fetch(`http://localhost:8080/api/apartment-residents/${apartmentId}/${residentId}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Hủy liên kết căn hộ thất bại');
  return true;
} 