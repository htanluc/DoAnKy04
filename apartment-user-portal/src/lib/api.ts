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
  if (!res.ok) throw new Error('Đăng ký thất bại');
  return res.json();
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