// Authentication utilities
export interface LoginRequest {
  phoneNumber: string;
  password: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  phoneNumber: string;
  roles: Array<{
    id: number;
    name: string;
  }>;
  status: string;
  lockReason?: string;
}

// Backend response format
export interface JwtResponse {
  token: string;
  type: string;
  phoneNumber: string;
  roles: string[];
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    refreshToken?: string;
    type: string;
    id: number;
    username: string;
    email: string;
    phoneNumber: string;
    roles: Array<{
      id: number;
      name: string;
    }>;
    status: string;
    lockReason?: string;
  } | null;
}

export const API_BASE_URL = 'http://localhost:8080';

// Helpers for token management
export const setToken = (token: string) => localStorage.setItem('token', token);
export const setRefreshToken = (refreshToken: string) => localStorage.setItem('refreshToken', refreshToken);
export const getToken = (): string | null => (typeof window === 'undefined' ? null : localStorage.getItem('token'));
export const getRefreshToken = (): string | null => (typeof window === 'undefined' ? null : localStorage.getItem('refreshToken'));
export const removeTokens = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
};

// Hàm đăng nhập
export const login = async (credentials: LoginRequest): Promise<AuthResponse> => {
  try {
    console.log('🚀 Sending login request to:', `${API_BASE_URL}/api/auth/login`);
    console.log('📦 Request body:', credentials);
    
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      mode: 'cors',
      credentials: 'omit',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Origin': window.location.origin,
      },
      body: JSON.stringify(credentials)
    });

    console.log('📡 Response status:', response.status);
    console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      let message = errorText;
      try {
        const errorJson = JSON.parse(errorText);
        if (errorJson.message) message = errorJson.message;
      } catch {}
      return {
        success: false,
        message: message || `HTTP ${response.status}: ${response.statusText}`,
        data: null
      };
    }

    const jwtData: any = await response.json();
    console.log('✅ Response data:', jwtData);
    
    // Lấy đúng các trường từ jwtData.data
    const userData = jwtData.data?.jwt || jwtData.data || {};
    const authResponse: AuthResponse = {
      success: jwtData.success,
      message: jwtData.message,
      data: userData ? {
        token: userData.token,
        type: userData.type,
        id: userData.id,
        username: userData.username,
        email: userData.email,
        phoneNumber: userData.phoneNumber,
        roles: Array.isArray(userData.roles) ? userData.roles.map((role: any) => {
          // Nếu role là string, chuyển thành object
          if (typeof role === 'string') {
            return { id: 0, name: role };
          }
          // Nếu role là object, giữ nguyên
          return role;
        }) : [],
        status: userData.status,
        lockReason: userData.lockReason
      } : null
    };    
    // Lưu token, refreshToken và thông tin user
    if (userData.token) setToken(userData.token);
    if (userData.refreshToken) setRefreshToken(userData.refreshToken);
    if (authResponse.data) {
      localStorage.setItem('user', JSON.stringify(authResponse.data));
    }
    console.log('💾 Token & refreshToken saved to localStorage');
    
    return authResponse;
  } catch (error) {
    console.error('❌ Login error:', error);
    if (error instanceof TypeError && error.message.includes('fetch')) {
      console.error('🌐 Network error - Backend might not be running or CORS issue');
      console.error('💡 Solution: Check if backend is running on http://localhost:8080 and CORS is configured');
    }
    throw error;
  }
};

// Hàm đăng ký
export const register = async (userData: RegisterRequest): Promise<AuthResponse> => {
  try {
    console.log('🚀 Sending register request to:', `${API_BASE_URL}/api/auth/register`);
    console.log('📦 Request body:', userData);
    
    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      mode: 'cors',
      credentials: 'omit',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Origin': window.location.origin,
      },
      body: JSON.stringify(userData)
    });

    console.log('📡 Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      let message = errorText;
      try {
        const errorJson = JSON.parse(errorText);
        if (errorJson.message) message = errorJson.message;
      } catch {}
      return {
        success: false,
        message: message || `HTTP ${response.status}: ${response.statusText}`,
        data: null
      };
    }

    const data = await response.json();
    return data;
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
      data: null
    };
  }
};

// Hàm kiểm tra token
export const validateToken = async (): Promise<boolean> => {
  let token = getToken();
  if (!token) return false;
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/validate`, {
      mode: 'cors',
      credentials: 'omit',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      }
    });
    if (response.ok) return true;
    // Nếu token hết hạn, thử refresh
    if (response.status === 401) {
      const refreshed = await refreshToken();
      if (refreshed && refreshed.token) {
        token = refreshed.token;
        // Thử validate lại với token mới
        const retry = await fetch(`${API_BASE_URL}/api/auth/validate`, {
          mode: 'cors',
          credentials: 'omit',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          }
        });
        return retry.ok;
      } else {
        removeTokens();
        return false;
      }
    }
    return false;
  } catch (error) {
    return false;
  }
};

// Hàm lấy thông tin user hiện tại
export const getCurrentUser = (): User | null => {
  if (typeof window === 'undefined') return null;
  
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  
  try {
    return JSON.parse(userStr);
  } catch (error) {
    return null;
  }
};

// Hàm logout
export const logout = (): void => {
  removeTokens();
};

export async function fetchRoles(): Promise<{id: number, name: string, description?: string}[]> {
  const token = getToken();
  const res = await fetch(`${API_BASE_URL}/api/admin/roles`, {
    headers: {
      'Authorization': token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json',
    },
    credentials: 'include', // hoặc 'omit' nếu không cần cookie
  });
  if (!res.ok) throw new Error('Failed to fetch roles');
  return res.json();
}

// Chuẩn hóa user.roles là mảng object {id, name, ...}
export function getRoleNames(user: any): string[] {
  if (!user?.roles) return [];
  // Nếu là mảng string
  if (Array.isArray(user.roles) && user.roles.every((r: any) => typeof r === 'string')) {
    return user.roles.map((r: string) => r.trim());
  }
  // Nếu là mảng object có trường name
  if (Array.isArray(user.roles) && user.roles.every((r: any) => typeof r === 'object' && r !== null && 'name' in r)) {
    return user.roles.map((r: any) => String(r.name).trim());
  }
  
  // Nếu là mảng hỗn hợp (string và object)
  if (Array.isArray(user.roles)) {
    return user.roles.map((r: any) => {
      if (typeof r === 'string') {
        return r.trim();
      }
      if (typeof r === 'object' && r !== null && 'name' in r) {
        return String(r.name).trim();
      }
      return String(r).trim();
    });
  }
  
  return [];
}

export function hasRole(user: any, role: string): boolean {
  return getRoleNames(user).includes(role);
}

export function isAdmin(user: any): boolean {
  return hasRole(user, 'ADMIN');
}

export function isResident(user: any): boolean {
  return hasRole(user, 'RESIDENT');
}

export function isStaff(user: any): boolean {
  return hasRole(user, 'STAFF');
}

// Hàm refresh token
export const refreshToken = async (): Promise<{ token: string; refreshToken: string } | null> => {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/refresh-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ refreshToken })
    });
    if (!response.ok) return null;
    const data = await response.json();
    if (data.success && data.data && data.data.token) {
      setToken(data.data.token);
      if (data.data.refreshToken) setRefreshToken(data.data.refreshToken);
      return { token: data.data.token, refreshToken: data.data.refreshToken };
    }
    return null;
  } catch (error) {
    return null;
  }
};

// Gửi lại email xác thực
export const resendVerification = async (emailOrPhone: string): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/resend-verification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ emailOrPhone })
    });
    const data = await response.json();
    return { success: data.success, message: data.message };
  } catch (error) {
    return { success: false, message: 'Có lỗi xảy ra khi gửi lại email xác thực.' };
  }
}; 