// TypeScript Interfaces cho Apartment Portal Frontend

// ===== AUTH TYPES =====

export interface LoginRequest {
  phoneNumber: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  phoneNumber: string;
  password: string;
}

export interface Role {
  id: number;
  name: 'ADMIN' | 'RESIDENT' | 'STAFF';
}

export interface User {
  id: number;
  username: string;
  email: string;
  phoneNumber: string;
  status: 'ACTIVE' | 'INACTIVE';
  roles: Role[];
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    type: string;
    id: number;
    username: string;
    email: string;
    phoneNumber: string;
    roles: Role[];
  } | null;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  data: {
    id: number;
    username: string;
    email: string;
    phoneNumber: string;
    status: string;
  } | null;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T | null;
}

// ===== AUTH SERVICE =====

export interface AuthService {
  login(credentials: LoginRequest): Promise<LoginResponse>;
  register(userData: RegisterRequest): Promise<RegisterResponse>;
  logout(): void;
  getToken(): string | null;
  isAuthenticated(): boolean;
  getUser(): User | null;
}

// ===== REACT HOOKS =====

export interface UseAuthReturn {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
  register: (userData: RegisterRequest) => Promise<void>;
}

// ===== CONTEXT TYPES =====

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
  register: (userData: RegisterRequest) => Promise<void>;
}

// ===== COMPONENT PROPS =====

export interface LoginFormProps {
  onSubmit: (credentials: LoginRequest) => Promise<void>;
  isLoading?: boolean;
  error?: string;
}

export interface RegisterFormProps {
  onSubmit: (userData: RegisterRequest) => Promise<void>;
  isLoading?: boolean;
  error?: string;
}

// ===== UTILITY TYPES =====

export type RoleType = 'ADMIN' | 'RESIDENT' | 'STAFF';

export interface ProtectedRouteProps {
  children: any; // React.ReactNode
  requiredRoles?: RoleType[];
}

// ===== API CONFIG =====

export interface ApiConfig {
  baseURL: string;
  timeout: number;
  headers: Record<string, string>;
}

// ===== ERROR TYPES =====

export interface ApiError {
  success: false;
  message: string;
  data: null;
}

export interface ValidationError {
  field: string;
  message: string;
}

// ===== STORAGE KEYS =====

export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user',
  REFRESH_TOKEN: 'refreshToken'
} as const;

// ===== CONSTANTS =====

export const API_ENDPOINTS = {
  LOGIN: '/api/auth/login',
  REGISTER: '/api/auth/register',
  VALIDATE: '/api/auth/validate',
  LOGOUT: '/api/auth/logout'
} as const;

export const ROLES = {
  ADMIN: 'ADMIN',
  RESIDENT: 'RESIDENT',
  STAFF: 'STAFF'
} as const;

// ===== HELPER FUNCTIONS =====

export const hasRole = (user: User | null, role: RoleType): boolean => {
  if (!user) return false;
  return user.roles.some(userRole => userRole.name === role);
};

export const hasAnyRole = (user: User | null, roles: RoleType[]): boolean => {
  if (!user) return false;
  return user.roles.some(userRole => roles.includes(userRole.name));
};

export const isAdmin = (user: User | null): boolean => {
  return hasRole(user, 'ADMIN');
};

export const isResident = (user: User | null): boolean => {
  return hasRole(user, 'RESIDENT');
};

export const isStaff = (user: User | null): boolean => {
  return hasRole(user, 'STAFF');
}; 