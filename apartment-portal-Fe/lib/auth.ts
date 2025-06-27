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
    const userData = jwtData.data || {};
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
        roles: Array.isArray(userData.roles)
          ? userData.roles
          : [],
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
      console.error('❌ HTTP Error:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('❌ Error response:', errorText);
      
      // Handle CORS errors specifically
      if (response.status === 0 || response.status === 403) {
        throw new Error('CORS Error: Backend is not configured to allow requests from this origin. Please check CORS configuration.');
      }
      
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('✅ Response data:', data);
    return data;
  } catch (error) {
    console.error('❌ Register error:', error);
    if (error instanceof TypeError && error.message.includes('fetch')) {
      console.error('🌐 Network error - Backend might not be running or CORS issue');
      console.error('💡 Solution: Check if backend is running on http://localhost:8080 and CORS is configured');
    }
    throw error;
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

// Hàm kiểm tra user có role ADMIN không
export const isAdmin = (): boolean => {
  const user = getCurrentUser();
  if (!user?.roles) return false;
  // Hỗ trợ cả dạng object và string
  return user.roles.some(
    (role: any) =>
      (typeof role === "string" && role === "ADMIN") ||
      (typeof role === "object" && role.name === "ADMIN")
  );
};

// Hàm kiểm tra user có role RESIDENT không
export const isResident = (): boolean => {
  const user = getCurrentUser();
  return user?.roles.some(role => role.name === 'RESIDENT') || false;
};

// Hàm kiểm tra user có role STAFF không
export const isStaff = (): boolean => {
  const user = getCurrentUser();
  return user?.roles.some(role => role.name === 'STAFF') || false;
};

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